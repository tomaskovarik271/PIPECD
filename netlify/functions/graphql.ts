import { createYoga, createSchema } from 'graphql-yoga';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js'; // Import User type
import { supabase } from '../../lib/supabaseClient'; // Import Supabase client
import { GraphQLError } from 'graphql'; // Import GraphQLError
import { contactService } from '../../lib/contactService'; // Import the actual service

// Define GraphQL types related to User
type GraphQLContext = {
  currentUser: User | null;
  event: HandlerEvent;
  context: HandlerContext;
};

// Placeholder service functions (REMOVED)
// const contactService = {
//   async getContacts(userId: string) { ... },
//   ...
// };

// Define GraphQL Schema
const typeDefs = /* GraphQL */ `
  scalar DateTime

  type Query {
    health: String!
    supabaseConnectionTest: String!
    me: UserInfo 
    contacts: [Contact!]!      # Get all contacts for the user
    contact(id: ID!): Contact  # Get a specific contact by ID
  }

  type Mutation {
    createContact(input: ContactInput!): Contact!          # Create a new contact
    updateContact(id: ID!, input: ContactInput!): Contact # Update a contact
    deleteContact(id: ID!): Boolean                      # Delete a contact
  }

  type UserInfo {
    id: ID!
    email: String
  }

  type Contact {
    id: ID!
    created_at: DateTime!
    updated_at: DateTime!
    user_id: ID! # Belongs to user
    first_name: String
    last_name: String
    email: String
    phone: String
    company: String
    notes: String
  }

  input ContactInput {
    first_name: String
    last_name: String
    email: String
    phone: String
    company: String
    notes: String
  }
`;

// Define Resolvers
const resolvers = {
  Query: {
    health: () => 'Ok',
    supabaseConnectionTest: async () => {
      try {
        // Attempt a simple read operation (e.g., get session)
        // This doesn't require a specific table to exist yet.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase connection error:', error.message);
          // Don't expose detailed errors to the client
          return `Connection Error: ${error.message}`;
        }

        console.log('Supabase getSession data:', data); // Log session data (will likely be null)
        return 'Successfully connected to Supabase (getSession succeeded)';
      } catch (err: any) {
        console.error('Unexpected error during Supabase test:', err);
        return `Unexpected Error: ${err.message}`;
      }
    },
    // Resolver for the 'me' query
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      // Return minimal user info from context
      if (!context.currentUser) {
        return null; // Or throw an AuthenticationError
      }
      return {
        id: context.currentUser.id,
        email: context.currentUser.email,
        // Map other fields if needed
      };
    },

    // --- Contact Resolvers ---
    contacts: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return contactService.getContacts(context.currentUser.id);
    },
    contact: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return contactService.getContactById(context.currentUser.id, args.id);
    },
  },

  Mutation: {
    createContact: async (_parent: unknown, args: { input: any }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      // TODO: Add input validation (e.g., using Zod)
      return contactService.createContact(context.currentUser.id, args.input);
    },
    updateContact: async (_parent: unknown, args: { id: string; input: any }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      // TODO: Add input validation
      return contactService.updateContact(context.currentUser.id, args.id, args.input);
    },
    deleteContact: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.currentUser) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return contactService.deleteContact(context.currentUser.id, args.id);
    },
  },
};

// Create GraphQL Yoga instance with context factory
const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  // Context factory to inject user info
  context: async ({ request }) => {
    let currentUser: User | null = null;
    const authHeader = request.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
          console.warn('JWT verification error:', error.message);
        } else {
          currentUser = user;
        }
      } catch (err) {
        console.error('Unexpected error during token verification:', err);
      }
    }
    
    // Return the context object, including the Netlify event/context if needed later
    // The request object itself gives access to headers, body etc.
    return {
      currentUser,
      // We might not need to pass event/context explicitly here anymore
      // as they are usually derivable from the `request` object if needed by Yoga plugins
      // event: ? 
      // context: ? 
    };
  },
  // Enable/disable GraphiQL interface
  graphiql: process.env.NODE_ENV !== 'production', // Disable in production
  // Set the endpoint path for the GraphQL server
  graphqlEndpoint: '/.netlify/functions/graphql',
});

// Netlify Function Handler
export const handler: Handler = async (event, context) => {
  // Construct the URL for the Request object
  // Use x-forwarded-host/proto or fallback to Netlify env vars or defaults
  const protocol = event.headers['x-forwarded-proto'] || 'http';
  const host = event.headers['x-forwarded-host'] || event.headers.host || 'localhost';
  const url = new URL(yoga.graphqlEndpoint, `${protocol}://${host}`);

  // Create a standard Request object from the Netlify event
  const request = new Request(url.toString(), {
    method: event.httpMethod,
    headers: event.headers as HeadersInit, // Type assertion might be needed
    body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
  });

  // Use yoga.fetch to handle the request
  const response = await yoga.fetch(
    request,
    // Pass Netlify event/context here; context factory might access them if needed
    // Note: Yoga's context factory primarily uses the standard Request object
    {
      event,
      context,
    }
  );

  // Prepare Netlify response headers
  const headers: { [key: string]: string } = {};
  const multiValueHeaders: { [key: string]: string[] } = {};

  response.headers.forEach((value, key) => {
    const lowerCaseKey = key.toLowerCase();
    if (lowerCaseKey === 'set-cookie') {
      // Use getSetCookie to handle multiple Set-Cookie headers correctly
      multiValueHeaders[key] = response.headers.getSetCookie();
    } else {
      // Assign single value headers
      headers[key] = value;
    }
  });

  // Convert Response back to Netlify format
  return {
    statusCode: response.status,
    body: await response.text(),
    headers: headers, // Use the single-value headers
    multiValueHeaders: multiValueHeaders, // Use the multi-value headers
  };
}; 