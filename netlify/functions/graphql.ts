import { createYoga, createSchema } from 'graphql-yoga';
import type { Handler, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

import {
  GraphQLContext, 
} from './graphql/helpers'; 

import { 
} from './graphql/validators';

import { Query as BaseQuery } from './graphql/resolvers/query';
import { Mutation as BaseMutation } from './graphql/resolvers/mutation';
import { Person } from './graphql/resolvers/person';
import { Deal } from './graphql/resolvers/deal';
import { Organization } from './graphql/resolvers/organization';
import { Stage } from './graphql/resolvers/stage';
import {
  Activity,
  Query as ActivityQuery,
  Mutation as ActivityMutation
} from './graphql/resolvers/activity';

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

export type { GraphQLContext };

export const resolvers = {
  Query: {
    ...BaseQuery,
    ...ActivityQuery,
  },
  Mutation: {
    ...BaseMutation,
    ...ActivityMutation,
  },
  Person,
  Deal,
  Organization,
  Stage,
  Activity,
}; 

const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs: loadedTypeDefs,
    resolvers,
  }),
  context: async (initialContext): Promise<GraphQLContext> => {
    let currentUser: User | null = null;
    let token: string | null = null;
    let userPermissions: string[] | null = null;
    
    const authHeader = initialContext.request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.warn('Error fetching user from token:', userError.message);
        } else if (user) {
          currentUser = user;
          
          const authenticatedSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
              global: { headers: { Authorization: `Bearer ${token}` } },
          });
          
          const { data: permissionsData, error: permissionsError } = await authenticatedSupabase.rpc('get_my_permissions');

          if (permissionsError) {
            console.error('Error fetching user permissions:', permissionsError.message);
            userPermissions = null; 
          } else {
            userPermissions = Array.isArray(permissionsData) && permissionsData.every(p => typeof p === 'string') 
              ? permissionsData 
              : [];
          }
        }
      } catch (err) {
        console.error('Unexpected error during user/permission fetching:', err);
        currentUser = null;
        userPermissions = null;
      }
    }

    return {
      ...initialContext, 
      currentUser,
      token,
      userPermissions,
    };
  },
  graphqlEndpoint: '/.netlify/functions/graphql',
  healthCheckEndpoint: '/.netlify/functions/graphql/health',
  landingPage: process.env.NODE_ENV !== 'production',
});

export const handler: Handler = async (event, _: HandlerContext) => {
  try {
    const url = new URL(event.path, `http://${event.headers.host || 'localhost'}`);

  const response = await yoga.fetch(
      url,
    {
      method: event.httpMethod,
      headers: event.headers as HeadersInit,
      body: event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined,
      }
  );

  const responseHeaders: { [key: string]: string } = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: await response.text(),
      isBase64Encoded: false,
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