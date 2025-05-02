import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js'; // Keep User type if needed later
import { GraphQLError } from 'graphql';

// Load env vars
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set.');
}
// It's generally better to have the anon key available for client creation
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
    console.warn('SUPABASE_ANON_KEY environment variable is not set. Client creation might fail for some operations.');
    // Depending on Supabase config, client creation might still work for auth header usage,
    // but it's safer to have it. Throw error if strictly required.
    // throw new Error('SUPABASE_ANON_KEY environment variable is not set.');
}


// --- Helper Functions (Consider refactoring to a shared file later) ---

// Helper to get a request-specific Supabase client instance authenticated with JWT
function getAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key is not configured.');
  }
  // Use the user's access token to make the request, RLS policies using auth.uid() will work
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    // auth: { persistSession: false } // Ensure no session persistence on server
  });
}

// Helper function to handle Supabase errors
function handleSupabaseError(error: any, context: string) {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    throw new GraphQLError(`Database error during ${context}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error.message },
    });
  }
}

// --- Deal Data Shape (Placeholder - Define more accurately with schema) ---
interface DealInput {
  name?: string | null;
  stage?: string | null; // e.g., 'Lead', 'Proposal', 'Closed Won', 'Closed Lost'
  amount?: number | null;
  contact_id?: string | null; // Foreign key to contacts table
  // Add other relevant fields like close_date, notes etc.
}

// Define the shape returned by the database (includes id, timestamps, user_id)
// Ideally, generate this from schema or use a shared type
interface DealRecord extends DealInput {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}

// --- Deal Service ---
export const dealService = {

  // Get all deals for the authenticated user (RLS handles filtering)
  async getDeals(userId: string, accessToken: string): Promise<DealRecord[]> {
    console.log('[dealService.getDeals] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('deals')
      .select('*') // RLS filters by user_id
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'fetching deals');
    return data || [];
  },

  // Get a single deal by ID (RLS handles filtering)
  async getDealById(userId: string, id: string, accessToken:string): Promise<DealRecord | null> {
    console.log('[dealService.getDealById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id) // Filter by specific ID (RLS ensures user access)
      .single();

    // Ignore 'PGRST116' error (No rows found), return null in that case
    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching deal by ID');
    }
    return data;
  },

  // Create a new deal (RLS requires authenticated client)
  async createDeal(userId: string, input: DealInput, accessToken: string): Promise<DealRecord> {
    console.log('[dealService.createDeal] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('deals')
      .insert({ ...input, user_id: userId }) // RLS CHECK (auth.uid() = user_id)
      .select() 
      .single();

    handleSupabaseError(error, 'creating deal');
    if (!data) {
        throw new GraphQLError('Failed to create deal, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data;
  },

  // Update an existing deal (RLS requires authenticated client)
  async updateDeal(userId: string, id: string, input: DealInput, accessToken: string): Promise<DealRecord> {
    console.log('[dealService.updateDeal] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('deals')
      .update(input) 
      .eq('id', id) // Target the specific deal ID (RLS checks user_id)
      .select() 
      .single();

    // Handle not found error specifically
     if (error && error.code === 'PGRST116') { // 'PGRST116' No rows found
         throw new GraphQLError('Deal not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating deal');
     if (!data) { // Should be redundant if error handling is correct, but good failsafe
        throw new GraphQLError('Deal update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data;
  },

  // Delete a deal (RLS requires authenticated client)
  async deleteDeal(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[dealService.deleteDeal] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    // Note: We capture error here but let handleSupabaseError throw if it's significant
    const { error, count } = await supabase
      .from('deals')
      .delete()
      .eq('id', id); // Target the specific deal ID (RLS checks user_id)

    // handleSupabaseError will throw if there's a real DB/RLS issue
    handleSupabaseError(error, 'deleting deal'); 
    
    // If handleSupabaseError did NOT throw, we consider the delete successful 
    // from the database perspective, even if count might be 0 or null 
    // (e.g., if the row was already deleted by another request).
    console.log('Deleted count (informational):', count);
    return !error; // Return true if no error was passed to handleSupabaseError
  },
}; 