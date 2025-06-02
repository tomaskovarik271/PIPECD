import { YogaInitialContext } from 'graphql-yoga';
import { User, SupabaseClient } from '@supabase/supabase-js';
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
  supabaseClient: SupabaseClient<any, "public", any>;
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
 * Returns an object with userId and accessToken if authenticated.
 */
export function requireAuthentication(context: GraphQLContext): { userId: string; accessToken: string } {
  if (!context.currentUser || !context.token) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return { userId: context.currentUser.id, accessToken: context.token };
}

/**
 * Checks if the authenticated user has the required permission.
 * Must be called after requireAuthentication.
 * @param context - GraphQL context
 * @param permission - Permission string to check (e.g., 'custom_fields:manage_definitions')
 * @throws GraphQLError if user doesn't have the required permission
 */
export function requirePermission(context: GraphQLContext, permission: string): void {
  if (!context.currentUser) {
    throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  
  if (!context.userPermissions || !context.userPermissions.includes(permission)) {
    throw new GraphQLError(`Permission denied. Required permission: ${permission}`, { 
      extensions: { code: 'FORBIDDEN', requiredPermission: permission } 
    });
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

// Helper function to convert string to Date or null
export const convertToDateOrNull = (dateStr: string | null | undefined): Date | null => {
  if (dateStr && typeof dateStr === 'string' && dateStr.trim() !== '') {
    const date = new Date(dateStr);
    // Check if the date is valid; Invalid Date getTime() returns NaN
    return isNaN(date.getTime()) ? null : date;
  }
  return null; // Return null for empty strings, null, undefined, or invalid date strings
}; 