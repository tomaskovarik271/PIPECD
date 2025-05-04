import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';

// --- Helper Functions ---

/**
 * Creates a Supabase client instance authenticated with the provided user access token.
 * This ensures RLS policies relying on auth.uid() are correctly enforced.
 * Reads Supabase URL and Anon Key from environment variables.
 * @param accessToken - The user's JWT.
 * @returns An authenticated SupabaseClient instance.
 * @throws Error if SUPABASE_URL or SUPABASE_ANON_KEY are not set.
 */
export function getAuthenticatedClient(accessToken: string): SupabaseClient {
  console.log('[getAuthenticatedClient] AccessToken:', accessToken); // DEBUG LOG
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Throw a configuration error if essential env vars are missing
    throw new Error('Server configuration error: Supabase URL or Anon Key is not set.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    // auth: { persistSession: false } // Ensure no session persistence on server-side clients
  });
}

/**
 * Handles potential errors from Supabase operations.
 * Logs the error and throws a formatted GraphQLError.
 * @param error - The error object from a Supabase client call (or null).
 * @param context - A string describing the operation context (e.g., 'fetching people').
 * @throws GraphQLError if error is not null.
 */
export function handleSupabaseError(error: PostgrestError | null, context: string): void {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message, error.details, error.hint);
    // Consider mapping specific error codes (e.g., unique constraints '23505') to specific GQL errors if needed
    // if (error.code === '23505') {
    //   throw new GraphQLError(`Database error: Duplicate value for unique constraint during ${context}.`, {
    //     extensions: { code: 'BAD_USER_INPUT', originalError: error.message }, // Or CONFLICT?
    //   });
    // }
    throw new GraphQLError(`Database error during ${context}. Please try again later.`, { // User-friendly message
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: { message: error.message, code: error.code } }, // Include original code
    });
  }
} 