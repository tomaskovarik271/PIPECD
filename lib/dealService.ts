import { /* createClient, SupabaseClient, PostgrestError */ } from '@supabase/supabase-js';
// import type { User } from '@supabase/supabase-js'; // Keep User type if needed later (Commented out)
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils'; // Import shared helpers
import type { Deal, DealInput } from './generated/graphql'; // Changed to DealInput for both create and update

// REMOVED: Redundant env var loading
// import dotenv from 'dotenv';
// dotenv.config();
// const supabaseUrl = process.env.SUPABASE_URL;
// ... etc ...
// if (!supabaseUrl) { ... }
// if (!supabaseAnonKey) { ... }


// REMOVED: Helper Functions (now in serviceUtils.ts)
// function getAuthenticatedClient(accessToken: string): SupabaseClient { ... }
// function handleSupabaseError(error: any, context: string) { ... }

// --- Deal Data Shape (Placeholder - Define more accurately with schema) ---
// interface DealInput { // REMOVED
//   name?: string | null;
//   // REMOVED: stage?: string | null; // Replaced by stage_id
//   amount?: number | null;
//   person_id?: string | null; // Foreign key to people table
//   stage_id?: string | null;  // Foreign key to stages table
//   // Add other relevant fields like close_date, notes etc.
// }

// Define the shape returned by the database (includes id, timestamps, user_id)
// Ideally, generate this from schema or use a shared type
// interface DealRecord extends Omit<DealInput, 'person_id'> { // REMOVED
//     id: string;
//     created_at: string;
//     updated_at: string;
//     user_id: string;
//     person_id?: string | null; // Ensure person_id is here too
//     stage_id?: string | null;  // Ensure stage_id is here too
// }

// --- Deal Service ---
export const dealService = {

  // Get all deals for the authenticated user (RLS handles filtering)
  async getDeals(userId: string, accessToken: string): Promise<Deal[]> { // Changed DealRecord[] to Deal[]
    console.log('[dealService.getDeals] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken); // USE IMPORTED HELPER
    const { data, error } = await supabase
      .from('deals')
      .select('*') // Selects all columns, including stage_id
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'fetching deals'); // USE IMPORTED HELPER
    return (data || []) as Deal[]; // Cast to Deal[]
  },

  // Get a single deal by ID (RLS handles filtering)
  async getDealById(userId: string, id: string, accessToken:string): Promise<Deal | null> { // Changed DealRecord to Deal
    console.log('[dealService.getDealById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // USE IMPORTED HELPER
    const { data, error } = await supabase
      .from('deals')
      .select('*') // Selects all columns, including stage_id
      .eq('id', id) // Filter by specific ID (RLS ensures user access)
      .single();

    // Ignore 'PGRST116' error (No rows found), return null in that case
    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching deal by ID'); // USE IMPORTED HELPER
    }
    return data as Deal | null; // Cast to Deal | null
  },

  // Create a new deal (RLS requires authenticated client)
  async createDeal(userId: string, input: DealInput, accessToken: string): Promise<Deal> { // Changed to DealInput, DealRecord to Deal
    console.log('[dealService.createDeal] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // USE IMPORTED HELPER
    
    // Destructure pipeline_id from input, as it doesn't belong in the 'deals' table directly.
    // It's part of DealInput for GraphQL layer consistency but handled via stage_id for DB persistence.
    const { pipeline_id, ...dealDataForDbInsert } = input;
    // console.log('[dealService.createDeal] pipeline_id from input (not directly saved to deal):', pipeline_id);

    const { data, error } = await supabase
      .from('deals')
      .insert({ ...dealDataForDbInsert, user_id: userId }) // Use the destructured object
      .select() 
      .single();

    handleSupabaseError(error, 'creating deal'); // USE IMPORTED HELPER
    if (!data) {
        throw new GraphQLError('Failed to create deal, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Deal; // Cast to Deal
  },

  // Update an existing deal (RLS requires authenticated client)
  async updateDeal(userId: string, id: string, input: Partial<DealInput>, accessToken: string): Promise<Deal> { // CHANGED: input type to Partial<DealInput>
    console.log('[dealService.updateDeal] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 
    // Ensure there's something to update if input is Partial
    if (Object.keys(input).length === 0) {
        throw new GraphQLError('No fields provided for deal update.', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const { data, error } = await supabase
      .from('deals')
      .update(input) // Pass Partial<DealInput> directly
      .eq('id', id) 
      .select() 
      .single();

    // Handle not found error specifically
     if (error && error.code === 'PGRST116') { // 'PGRST116' No rows found
         throw new GraphQLError('Deal not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating deal'); // USE IMPORTED HELPER
     if (!data) { // Should be redundant if error handling is correct, but good failsafe
        throw new GraphQLError('Deal update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Deal; // Cast to Deal
  },

  // Delete a deal (RLS requires authenticated client)
  async deleteDeal(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[dealService.deleteDeal] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // USE IMPORTED HELPER
    // Note: We capture error here but let handleSupabaseError throw if it's significant
    const { error, count } = await supabase
      .from('deals')
      .delete()
      .eq('id', id); // Target the specific deal ID (RLS checks user_id)

    // handleSupabaseError will throw if there's a real DB/RLS issue
    handleSupabaseError(error, 'deleting deal'); // USE IMPORTED HELPER
    
    // If handleSupabaseError did NOT throw, we consider the delete successful 
    // from the database perspective, even if count might be 0 or null 
    // (e.g., if the row was already deleted by another request).
    console.log('Deleted count (informational):', count);
    return !error; // Return true if no error was passed to handleSupabaseError
  },
}; 