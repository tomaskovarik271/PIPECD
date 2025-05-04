import type { HandlerEvent, HandlerContext } from '@netlify/functions';
import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

// Define and export GraphQL Context type
export type GraphQLContext = {
  currentUser: User | null;
  request: Request;
  event: HandlerEvent;
  context: HandlerContext;
};

// Helper to get token from context (or request headers)
// Exported for potential use elsewhere, though requireAuthentication uses it locally.
export function getAccessToken(context: GraphQLContext): string | null {
  const authHeader = context.request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper function to process ZodErrors into GraphQLErrors
export function processZodError(error: unknown, action: string): GraphQLError {
  if (error instanceof ZodError) {
    console.error(`Zod validation error during ${action}:`, error.errors);
    const message = error.errors.map(e => `${e.path.join('.') || 'input'}: ${e.message}`).join(', ');
    return new GraphQLError(`Validation Error: ${message}`, {
      extensions: {
        code: 'BAD_USER_INPUT',
        zodErrors: error.errors
      }
    });
  }

  if (error instanceof GraphQLError) {
    console.error(`GraphQLError during ${action}:`, error.message, error.extensions?.originalError);
    if (error.message.startsWith('An unexpected error occurred')) {
        return error;
    }
    // Return existing GraphQLErrors as they might be already processed
    return error;
  }

  // Handle generic Errors or other unknown throwables
  console.error(`Unexpected error during ${action}:`, error);
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return new GraphQLError(`An unexpected error occurred during ${action}.`, {
      extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          originalError: errorMessage
      }
  });
}

// Helper function for authentication check
export function requireAuthentication(context: GraphQLContext): string /* Returns access token */ {
  if (!context.currentUser) {
    console.warn('Authentication required but currentUser is null.');
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  // Use the local getAccessToken function defined above
  const token = getAccessToken(context);
  if (!token) {
    console.error('Authentication check passed (currentUser exists), but failed to extract token.');
    throw new GraphQLError('Authentication token is missing or invalid.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return token;
} 