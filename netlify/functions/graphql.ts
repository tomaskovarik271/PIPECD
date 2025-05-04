import { createYoga, createSchema } from 'graphql-yoga';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { inngest } from './inngest'; // Import the Inngest client (if used elsewhere, e.g. mutations)
import fs from 'fs';
import path from 'path';

// Import helpers and context type
import {
  GraphQLContext, 
  getAccessToken, 
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
import { Query } from './graphql/resolvers/query';
import { Mutation } from './graphql/resolvers/mutation';
import { Person } from './graphql/resolvers/person';
import { Deal } from './graphql/resolvers/deal';
import { Organization } from './graphql/resolvers/organization';
import { Stage } from './graphql/resolvers/stage';

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
  } catch (error: any) {
      console.error("Failed to load GraphQL schema files:", error);
      throw new Error(`Failed to load GraphQL schema files: ${error.message}`);
  }
};

const loadedTypeDefs = loadTypeDefs();

// Export context type for testing
export type { GraphQLContext };

// Export combined resolvers object
export const resolvers = {
  Query,
  Mutation,
  Person,
  Deal,
  Organization,
  Stage,
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
    // Use getAccessToken helper from './graphql/helpers'
    const token = getAccessToken({ 
        request: initialContext.request, 
        event: initialContext.event as HandlerEvent, 
        context: initialContext.context as HandlerContext, 
        currentUser: null // Placeholder, will be replaced
    });

    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
          // Consider more robust error handling or logging
          console.warn('Error fetching user from token:', error.message);
        } else {
          currentUser = user;
        }
      } catch (err) {
        console.error('Unexpected error during supabase.auth.getUser:', err);
        // Potentially throw or handle this error more gracefully
      }
    }

    // Return the context object for GraphQL resolvers
    return {
      currentUser,
      event: initialContext.event as HandlerEvent,
      context: initialContext.context as HandlerContext,
      request: initialContext.request,
      // Optionally include inngest client if needed globally
      // inngest, 
    };
  },
  graphqlEndpoint: '/.netlify/functions/graphql',
  healthCheckEndpoint: '/.netlify/functions/graphql/health',
  landingPage: process.env.NODE_ENV !== 'production', // Enable landing page in dev
});

// Netlify Function handler
export const handler: Handler = async (event, context) => {
  try {
    const response = await yoga.fetch(
      // Ensure the path is correctly passed for Yoga routing
      event.path, 
      {
        method: event.httpMethod,
        headers: event.headers as HeadersInit,
        body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
      },
      // Pass Netlify context and event for use in the Yoga context factory
      { event, context }
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
  } catch (error) {
      console.error("Error in GraphQL handler:", error);
      return {
          statusCode: 500,
          body: JSON.stringify({ message: "Internal Server Error" }),
          headers: { "Content-Type": "application/json" },
      };
  }
}; 