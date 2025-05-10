import { createYoga, createSchema } from 'graphql-yoga';
import type { Handler, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Import helpers and context type
import {
  GraphQLContext, 
  // processZodError, // Likely only needed in resolvers now
  // requireAuthentication // Likely only needed in resolvers now
} from './graphql/helpers'; 

// Import validators (needed for mutations/queries)
import { 
  // Keep only validators potentially used by Query/Mutation in this file if those stay
  // PersonCreateSchema, 
  // PersonUpdateSchema, 
  // OrganizationInputSchema,
  // DealCreateSchema,
  // DealUpdateSchema,
  // PipelineInputSchema,
  // StageCreateSchema,
  // StageUpdateSchema
} from './graphql/validators'; // Consider moving validator imports to respective resolver files

// Import Resolver Modules
import { Query as BaseQuery } from './graphql/resolvers/query';
import { Mutation as BaseMutation } from './graphql/resolvers/mutation';
import { Person } from './graphql/resolvers/person';
import { Deal } from './graphql/resolvers/deal';
import { Organization } from './graphql/resolvers/organization';
import { Stage } from './graphql/resolvers/stage';
// Import Activity resolvers (using aliases for Query/Mutation)
import {
  Activity,
  Query as ActivityQuery,
  Mutation as ActivityMutation
} from './graphql/resolvers/activity';

// --- Load Schema from Files ---
const loadTypeDefs = (): string => {
  const schemaDir = path.join(process.cwd(), 'netlify/functions/graphql/schema');
  try {
    const files = fs.readdirSync(schemaDir);
    let typeDefs = '';
    files.forEach(file => {
      if (file.endsWith('.graphql')) {
        typeDefs += fs.readFileSync(path.join(schemaDir, file), 'utf-8') + '\n';
      }
    });
    return typeDefs;
  } catch (error: unknown) {
      console.error("Failed to load GraphQL schema files:", error);
      let message = "Unknown error loading schema";
      if (error instanceof Error) {
        message = error.message;
      }
      throw new Error(`Failed to load GraphQL schema files: ${message}`);
  }
};

const loadedTypeDefs = loadTypeDefs();

// Export context type for testing
export type { GraphQLContext };

// Export combined resolvers object
export const resolvers = {
  // Merge Query fields from base and activity resolvers
  Query: {
    ...BaseQuery,
    ...ActivityQuery,
  },
  // Merge Mutation fields from base and activity resolvers
  Mutation: {
    ...BaseMutation,
    ...ActivityMutation,
  },
  // Include type resolvers
  Person,
  Deal,
  Organization,
  Stage,
  Activity, // Add Activity type resolver
}; 

// Create the Yoga instance
const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs: loadedTypeDefs,
    resolvers,
  }),
  // Define the context factory
  context: async (initialContext): Promise<GraphQLContext> => {
    let currentUser: User | null = null;
    let token: string | null = null;
    let userPermissions: string[] | null = null;
    
    // Extract token from Authorization header (common pattern)
    const authHeader = initialContext.request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      try {
        // 1. Verify token and get user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.warn('Error fetching user from token:', userError.message);
        } else if (user) {
          currentUser = user;
          
          // 2. Fetch user permissions using the function
          // We need an authenticated client to call the RPC function
          const authenticatedSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
              global: { headers: { Authorization: `Bearer ${token}` } },
          });
          
          const { data: permissionsData, error: permissionsError } = await authenticatedSupabase.rpc('get_my_permissions');

          if (permissionsError) {
            console.error('Error fetching user permissions:', permissionsError.message);
            // Decide handling: null permissions? Throw? Log only?
            // For now, log and set to null, resolvers should handle null permissions cautiously.
            userPermissions = null; 
          } else {
            // Ensure data is an array of strings, default to empty array if not
            userPermissions = Array.isArray(permissionsData) && permissionsData.every(p => typeof p === 'string') 
              ? permissionsData 
              : [];
          }
        }
      } catch (err) {
        console.error('Unexpected error during user/permission fetching:', err);
        currentUser = null; // Ensure user is null on unexpected error
        userPermissions = null; // Ensure permissions are null
      }
    }

    // Return the context object for GraphQL resolvers
    // Spread initialContext to include base Yoga properties like request
    return {
      ...initialContext, 
      currentUser,
      token,
      userPermissions, // Add permissions to context
    };
  },
  graphqlEndpoint: '/.netlify/functions/graphql',
  healthCheckEndpoint: '/.netlify/functions/graphql/health',
  landingPage: process.env.NODE_ENV !== 'production', // Enable landing page in dev
});

// Netlify Function handler
export const handler: Handler = async (event, _: HandlerContext) => {
  try {
    // Construct a URL object for yoga.fetch
    const url = new URL(event.path, `http://${event.headers.host || 'localhost'}`);

  const response = await yoga.fetch(
      url, // Pass the URL object directly
    {
      method: event.httpMethod,
      headers: event.headers as HeadersInit,
      body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
      }
  );

    // Convert Fetch API Response back to Netlify Handler Response format
  const responseHeaders: { [key: string]: string } = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
      isBase64Encoded: false, // Assuming text response
    };
  } catch (error: unknown) {
    console.error("Error in GraphQL handler:", error);
    let message = "Internal Server Error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as {message: unknown}).message === 'string') {
      message = (error as {message: string}).message;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ message }),
      headers: { "Content-Type": "application/json" },
    };
  }
}; 