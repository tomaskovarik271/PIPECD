import { YogaInitialContext } from 'graphql-yoga';
import { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

// Environment variables (ensure they are loaded, e.g., via netlify dev)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables.');
}

// Define context extending Yoga's base
export interface GraphQLContext extends YogaInitialContext {
  currentUser: User | null;
  token: string | null;
  userPermissions: string[] | null;
  request: Request; // Made non-optional to match YogaInitialContext
  // Add other potential context fields if needed (e.g., event, context from Netlify func?)
}

/**
 * Middleware or helper to extract JWT from Authorization header.
 */
export function getAccessToken(context: GraphQLContext): string | null {
    return context.token;
}

/**
 * Checks if the user is authenticated. Throws GraphQLError if not.
 */
export function requireAuthentication(context: GraphQLContext): void {
  if (!context.currentUser || !context.token) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
}

/**
 * Processes Zod validation errors and other errors into a GraphQLError.
 */
export function processZodError(error: unknown, actionDescription: string): GraphQLError {
  console.error(`Error during ${actionDescription}:`, error); 

  if (error instanceof ZodError) {
    // Combine Zod issues into a single message
    const message = `Input validation failed: ${error.errors.map(e => `${e.path.join('.')} (${e.message})`).join(', ')}`;
    return new GraphQLError(message, {
      originalError: error,
      extensions: { code: 'BAD_USER_INPUT', validationErrors: error.flatten() },
    });
  }
  if (error instanceof GraphQLError) {
      // If it's already a GraphQLError (e.g., from handleSupabaseError or auth), re-throw it
      return error;
  }
  
  // Handle other unexpected errors
  return new GraphQLError(`An unexpected error occurred while ${actionDescription}.`, {
    originalError: error instanceof Error ? error : undefined,
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  });
} 