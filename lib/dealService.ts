import { /* createClient, SupabaseClient, PostgrestError */ } from '@supabase/supabase-js';
// import type { User } from '@supabase/supabase-js'; // Keep User type if needed later (Commented out)
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError, recordEntityHistory } from './serviceUtils'; // Import shared helpers
import type { Deal, DealInput } from './generated/graphql'; // Changed to DealInput for both create and update
import { diff, Diff } from 'deep-diff';
import { inngest } from './inngestClient'; // Import the shared Inngest client

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

    const { data: newDealRecord, error } = await supabase
      .from('deals')
      .insert({ ...dealDataForDbInsert, user_id: userId }) // Use the destructured object
      .select() 
      .single();

    handleSupabaseError(error, 'creating deal'); // USE IMPORTED HELPER
    if (!newDealRecord) {
        throw new GraphQLError('Failed to create deal, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }

    // Record history
    const initialChanges: Record<string, any> = {};
    const relevantFieldsForCreate: (keyof Deal)[] = ['name', 'stage_id', 'amount', 'expected_close_date', 'person_id', 'organization_id', 'deal_specific_probability'];
    relevantFieldsForCreate.forEach(key => {
      if (newDealRecord[key] !== undefined && newDealRecord[key] !== null) {
        initialChanges[key] = newDealRecord[key];
      }
    });

    await recordEntityHistory(
      supabase,
      'deal_history',
      'deal_id',
      newDealRecord.id,
      userId,
      'DEAL_CREATED',
      initialChanges
    );

    return newDealRecord as Deal; // Cast to Deal
  },

  // Update an existing deal (RLS requires authenticated client)
  async updateDeal(userId: string, id: string, input: Partial<DealInput>, accessToken: string): Promise<Deal> { // CHANGED: input type to Partial<DealInput>
    console.log('[dealService.updateDeal] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 
    // Ensure there's something to update if input is Partial
    if (Object.keys(input).length === 0) {
        throw new GraphQLError('No fields provided for deal update.', { extensions: { code: 'BAD_USER_INPUT' } });
    }

    // 1. Fetch Old State
    const oldDealData = await this.getDealById(userId, id, accessToken);
    if (!oldDealData) {
        throw new GraphQLError('Deal not found for history tracking', { extensions: { code: 'NOT_FOUND' } });
    }

    // Destructure pipeline_id from input if present, as it's not directly part of the 'deals' table
    const { pipeline_id, ...dealDataForUpdate } = input;

    const { data: updatedDealRecord, error } = await supabase
      .from('deals')
      .update(dealDataForUpdate) // Pass Partial<DealInput> without pipeline_id
      .eq('id', id) 
      .select() 
      .single();

    // Handle not found error specifically
     if (error && error.code === 'PGRST116') { // 'PGRST116' No rows found
         throw new GraphQLError('Deal not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating deal'); // USE IMPORTED HELPER
     if (!updatedDealRecord) { // Should be redundant if error handling is correct, but good failsafe
        throw new GraphQLError('Deal update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }

    // 3. Calculate Diff & Record History
    const differences: Diff<any, any>[] | undefined = diff(oldDealData, updatedDealRecord); // Compare old with the fully returned new state
    const actualChanges: Record<string, { oldValue: any; newValue: any }> = {};
    const trackedFields: (keyof Deal)[] = ['name', 'stage_id', 'amount', 'expected_close_date', 'person_id', 'organization_id', 'deal_specific_probability'];

    if (differences) {
      differences.forEach(d => {
        if (d.path && d.path.length === 1) { 
          const key = d.path[0] as keyof Deal;
          if (trackedFields.includes(key)) {
            // `d` itself tells us there's a change.
            // `oldDealData[key]` is the old value, `updatedDealRecord[key]` is the new value.
            // We need to ensure they are actually different to avoid logging no-ops if diff is too sensitive.
            // This also handles cases where a value changes from/to null or undefined.
            if (JSON.stringify(oldDealData[key]) !== JSON.stringify(updatedDealRecord[key])) {
              actualChanges[key] = { oldValue: oldDealData[key], newValue: updatedDealRecord[key] };
            }
          }
        }
      });
    }
    
    // The previous logic for explicit nullification checks is likely covered by comparing oldDealData[key] and updatedDealRecord[key]
    // as long as the diff algorithm correctly identifies paths that have changed, including to/from null/undefined.

    if (Object.keys(actualChanges).length > 0) {
      await recordEntityHistory(
        supabase,
        'deal_history',
        'deal_id',
        id,
        userId,
        'DEAL_UPDATED',
        actualChanges
      );

      // Send Inngest event for deal update
      try {
        await inngest.send({
          name: 'crm/deal.updated',
          user: { id: userId }, // Pass user information if available and relevant
          data: {
            dealId: id,
            updatedFields: Object.keys(actualChanges),
            changes: actualChanges, // Full changes might be too verbose for event, consider summarizing
            // previousValues: oldDealData, // Potentially useful, but large
            // newValues: updatedDealRecord    // Potentially useful, but large
          },
        });
        console.log(`[dealService.updateDeal] Sent 'crm/deal.updated' event for deal ID: ${id}`);
      } catch (eventError) {
        console.error(`[dealService.updateDeal] Failed to send 'crm/deal.updated' event for deal ID: ${id}:`, eventError);
        // Decide if this error should be re-thrown or just logged
      }
    }

    return updatedDealRecord as Deal; // Cast to Deal
  },

  // Delete a deal (RLS requires authenticated client)
  async deleteDeal(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[dealService.deleteDeal] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // USE IMPORTED HELPER
    
    // Fetch the deal data BEFORE deleting to have it for history, if needed (though plan says minimal object for delete)
    // const dealToDelete = await this.getDealById(userId, id, accessToken); 
    // Not strictly needed if we only log the ID, but useful if we wanted to log more details.

    const { error, count } = await supabase
      .from('deals')
      .delete()
      .eq('id', id); // Target the specific deal ID (RLS checks user_id)

    handleSupabaseError(error, 'deleting deal'); // USE IMPORTED HELPER
    
    if (!error) {
      await recordEntityHistory(
        supabase,
        'deal_history',
        'deal_id',
        id, // The ID of the deal being deleted
        userId,
        'DEAL_DELETED',
        { deleted_deal_id: id } // Minimal object as per plan
      );
    }
    
    console.log('Deleted count (informational):', count);
    return !error; // Return true if no error was passed to handleSupabaseError
  },
}; 