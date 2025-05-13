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

    // Handle unique constraint violation (PostgreSQL error code 23505)
    if (error.code === '23505') {
      let userMessage = `A unique value is required for ${context}, but a duplicate was provided. Please check your input.`;
      // Try to make the message more specific if it's our known stage order or name constraint
      if (error.message && error.message.includes('stages_pipeline_id_order_key')) {
        userMessage = `The 'order' number is already in use for this pipeline. Please choose a different order.`;
      } else if (error.message && error.message.includes('stages_pipeline_id_name_key')) {
        userMessage = `The stage 'name' is already in use for this pipeline. Please choose a different name.`;
      } else if (error.message && error.message.includes('pipelines_user_id_name_key')) {
        userMessage = `The pipeline 'name' is already in use. Please choose a different name.`;
      }
      // Add more specific checks for other known unique constraints as needed:
      // else if (error.message && error.message.includes('some_other_key_constraint_name')) {
      //   userMessage = `Specific message for some_other_key_constraint_name.`;
      // }

      throw new GraphQLError(userMessage, {
        extensions: { 
          code: 'BAD_USER_INPUT', 
          originalError: { message: error.message, code: error.code, details: error.details, hint: error.hint }
        },
      });
    }

    // Fallback for other database errors
    throw new GraphQLError(`Database error during ${context}. Please try again later or contact support.`, {
      extensions: { 
        code: 'INTERNAL_SERVER_ERROR', 
        originalError: { message: error.message, code: error.code, details: error.details, hint: error.hint }
      },
    });
  }
}

export interface HistoryChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
}

export async function recordEntityHistory(
  supabase: SupabaseClient, // Authenticated Supabase client
  entityTable: string, // e.g., \'deal_history\'
  entityIdField: string, // e.g., \'deal_id\'
  entityId: string,
  userId: string | undefined, // User performing the action
  eventType: string,
  changes?: Record<string, { oldValue: any; newValue: any }> | Record<string, any> | null // Flexible changes object
): Promise<void> {
  try {
    const historyRecord: any = {
      [entityIdField]: entityId,
      user_id: userId,
      event_type: eventType,
      changes: changes || null,
    };

    const { error } = await supabase.from(entityTable).insert(historyRecord);
    if (error) {
      console.error(`[recordEntityHistory] Error recording history for ${entityTable} (${entityIdField}: ${entityId}):`, error);
      // Decide if this error should be re-thrown or just logged
      // For now, log and continue to not break main operation
    }
  } catch (err) {
    console.error(`[recordEntityHistory] Exception recording history for ${entityTable}:`, err);
  }
} 