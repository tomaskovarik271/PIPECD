import { SupabaseClient, createClient } from '@supabase/supabase-js';
import {
  createYoga,
  // useErrorHandler, // No longer explicitly used
  // Remove these as they caused errors and are not used with plugins: []
  // useRequestParser,
  // useValidate,
  // useExecute,
  // useGraphiQL,
} from 'graphql-yoga';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import path from 'node:path';
import { getUserPermissions } from './helpers'; // Import the new helper

// --- Centralized GraphQL Context Definition ---
export interface GraphQLContext {
  supabase: SupabaseClient;
  currentUser?: { 
    id: string; 
    email?: string; 
    user_id?: string; // Often same as id for Supabase
    aud?: string; // Audience, typically 'authenticated'
    role?: string; // Example: 'admin', usually from custom claims
    app_metadata?: any;
    user_metadata?: any;
    [key: string]: any; 
  };
  token?: string | null; // Added token
  userPermissions?: string[] | null; // Added userPermissions
  event: any; 
  netlifyContext: any; 
}

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
}
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// --- Path Helpers (assuming __dirname is available in Netlify environment) ---
// const __filename = fileURLToPath(import.meta.url); // Removed for CommonJS compatibility
// const __dirname = path.dirname(__filename); // __dirname should be globally available or polyfilled by Netlify

// --- Load Type Definitions ---
const typeDefs = loadFilesSync(path.join(__dirname, 'schema', '**/*.graphql'));

// --- Import Resolvers ---
// Base Query/Mutation
import { Query as baseQuery } from './resolvers/query';
import { Mutation as baseMutation } from './resolvers/mutation';

// Domain-specific resolvers (importing what they actually export)
import { Activity, Query as activityQueryParts, Mutation as activityMutationParts } from './resolvers/activity';
import { queryResolvers as cfQueryParts, mutationResolvers as cfMutationParts } from './resolvers/customFields'; // Exports queryResolvers, mutationResolvers
import { Deal } from './resolvers/deal'; // Exports Deal type resolver
import { Organization } from './resolvers/organization'; // Exports Organization type resolver
import { Person } from './resolvers/person'; // Exports Person type resolver
import { Stage } from './resolvers/stage'; // Exports Stage type resolver
import { Query as pricingQueryParts, PriceQuoteResolver } from './resolvers/pricing'; // Exports Query parts and PriceQuote type resolver
import { DealHistoryEntry } from './resolvers/history'; // Corrected import

// New resolvers for Teams and Followers
import { teamResolvers } from './resolvers/teamResolvers'; 
import { dealFollowerResolvers } from './resolvers/dealFollowerResolvers'; 
import { userResolvers } from './resolvers/userResolvers'; 

// --- Construct final resolver map ---
const resolvers = {
  Query: mergeResolvers([
    baseQuery,
    activityQueryParts || {},
    cfQueryParts || {},
    pricingQueryParts || {},
    teamResolvers.Query || {},
  ]),
  Mutation: mergeResolvers([
    baseMutation,
    activityMutationParts || {},
    cfMutationParts || {},
    teamResolvers.Mutation || {},
    dealFollowerResolvers.Mutation || {},
  ]),
  // Type-specific resolvers
  Activity,
  Deal: mergeResolvers([Deal || {}, dealFollowerResolvers.Deal || {}]),
  DealHistoryEntry,
  Organization,
  Person,
  PriceQuote: PriceQuoteResolver,
  Stage,
  Team: teamResolvers.Team,
  User: userResolvers.User,
  // Ensure any other TypeName resolvers are added here if they exist
  // e.g., CustomFieldDefinition if it had its own type resolver object
  // e.g., Pipeline if it had its own type resolver object
};

// --- Create Executable Schema ---
const schema = makeExecutableSchema({
  typeDefs,
  resolvers: resolvers as any, // Using 'as any' to bypass complex intermediate type issues with mergeResolvers if they persist
});

// --- Create Yoga Server ---
const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: '/.netlify/functions/graphql',
  logging: true,
  context: async ({ request, ...rest }) => {
    let authUser: GraphQLContext['currentUser'] = undefined;
    let tokenToSet: GraphQLContext['token'] = null;
    let permissionsList: string[] | null = null;
    let authorization: string | null = null;

    if (request.headers && typeof request.headers.get === 'function') {
      authorization = request.headers.get('authorization');
    } else {
      console.warn('Warning: request.headers.get was not a function in context creation.');
    }

    if (authorization?.startsWith('Bearer ')) {
      try {
        const token = authorization.substring(7);
        if (token) {
          tokenToSet = token;
          console.log("Found bearer token. Attempting to fetch user from Supabase...");
          const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

          if (getUserError) {
            console.error("Error fetching user from Supabase:", getUserError.message);
          } else if (user) {
            console.log("Successfully fetched user from Supabase:", JSON.stringify(user, null, 2));
            authUser = {
              id: user.id,
              email: user.email,
              user_id: user.id,
              aud: user.aud,
              role: user.role,
              app_metadata: user.app_metadata,
              user_metadata: user.user_metadata,
            };
            console.log("Populated context.currentUser with:", JSON.stringify(authUser, null, 2));
            
            // Fetch user permissions
            permissionsList = await getUserPermissions(supabase, user.id);

          } else {
            console.log("No user fetched from Supabase with the provided token, but no error either.");
          }
        }
      } catch (e) {
        console.error('Error processing auth token or fetching user/permissions:', e);
      }
    }
    return {
      supabase,
      currentUser: authUser,
      token: tokenToSet,
      userPermissions: permissionsList, // Pass the fetched permissions to context
      event: (rest as any).event,
      netlifyContext: (rest as any).context,
    };
  },
});

// --- Export Netlify Handler ---
// export const handler = yoga; // Old way

export const handler: import('@netlify/functions').Handler = async (event, netlifyContext) => {
  // Construct the URL for the Request object
  // Ensure `event.rawUrl` is used if available and suitable, or construct carefully.
  // Defaulting to a common pattern, but this might need adjustment based on Netlify's exact event structure.
  const scheme = event.headers?.['x-forwarded-proto'] || 'http';
  const host = event.headers?.host || 'localhost';
  const path = event.path || '';
  const fullUrl = event.rawUrl || `${scheme}://${host}${path}${event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0 ? '?' + new URLSearchParams(event.queryStringParameters as Record<string, string>).toString() : ''}`;

  const request = new Request(fullUrl, {
    method: event.httpMethod,
    headers: new Headers(event.headers as HeadersInit),
    body: event.isBase64Encoded ? Buffer.from(event.body || '', 'base64') : event.body,
  });

  try {
    const response = await yoga.fetch(
      new URL(request.url),
      {
        method: request.method,
        headers: request.headers,
        body: request.body,
      },
      { // Third argument for server context / pass-throughs
        event, // This will become rest.event in the context function
        netlifyContext, // This will become rest.netlifyContext in the context function
      }
    );

    const responseBody = await response.text();
    const singleValueHeaders: { [header: string]: string } = {};
    const multiValueHeaders: { [header: string]: string[] } = {};

    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'set-cookie') {
        if (!multiValueHeaders[key]) {
          multiValueHeaders[key] = [];
        }
        multiValueHeaders[key].push(value);
      } else {
        singleValueHeaders[key] = value; // Last one wins for simple case
      }
    });

    return {
      statusCode: response.status,
      body: responseBody,
      headers: singleValueHeaders,
      multiValueHeaders: multiValueHeaders,
      isBase64Encoded: false, 
    };
  } catch (error) {
    console.error('Error in GraphQL handler:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error in GraphQL handler.',
    };
  }
}; 