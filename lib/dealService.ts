import { supabase } from './supabaseClient';
// import { handleSupabaseError } from './utils/handleSupabaseError'; // Assume shared util exists
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql'; // Might be needed if handleSupabaseError throws it


// --- Deal Data Shape ---
export interface DealRecord {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    name: string;
    stage: string;
    amount: number | null;
    person_id: string | null; // Renamed from contact_id
}

export interface DealInput {
    name: string;
    stage: string;
    amount?: number | null;
    person_id?: string | null; // Renamed from contact_id
}

export type DealUpdateInput = Partial<DealInput>;

// Re-add handleSupabaseError locally until shared util is confirmed/created
function handleSupabaseError(error: PostgrestError | null, operation: string): void {
    if (error) {
        console.error(`Supabase error during ${operation}:`, error);
        let errorCode = 'INTERNAL_SERVER_ERROR'; // Default code
        let errorMessage = `Database operation failed in ${operation}: ${error.message}`;

        // Customize message and code based on common error codes
        if (error.code === '23505') { // Unique constraint violation
            errorCode = 'CONFLICT';
            errorMessage = `Database operation failed in ${operation}: Duplicate value detected.`;
        }
        if (error.code === '42501') { // RLS violation
            errorCode = 'FORBIDDEN';
             // For deletes, we might just want to return false instead of throwing
            if (operation === 'deleteDeal') { // Check specific operation name
                 console.warn(`RLS prevented delete operation for deal.`);
                 // Keep returning void here for deleteDeal RLS
                 return;
            }
             errorMessage = `Database operation failed in ${operation}: Permission denied (RLS). ${error.message}`;
        }

        // Throw an error with a code property
        const customError = new Error(errorMessage);
        (customError as any).code = errorCode; // Add code property
        throw customError;
    }
}


// --- Deal Service ---
export const dealService = {
    /**
     * Retrieves all deals for the authenticated user.
     * Relies on RLS.
     */
    async getDeals(supabaseClient: SupabaseClient): Promise<DealRecord[]> {
        console.log('[dealService.getDeals] Attempting to fetch deals...'); // Log Start
        const { data, error } = await supabaseClient
            .from('deals')
            .select('*')
            // .eq('user_id', userId) // Rely on RLS
            .order('created_at', { ascending: false });

        if (error) {
             console.error('[dealService.getDeals] Supabase error occurred:', error); // Log Error
             handleSupabaseError(error, 'getDeals');
             // handleSupabaseError throws, so this part is unreachable if error occurs
             return []; // Return empty array on error (though unreachable)
        }
        
        console.log(`[dealService.getDeals] Successfully fetched ${data?.length ?? 0} deals.`); // Log Success
        // Optional: Log the actual data if needed for deep debugging (can be verbose)
        // console.log('[dealService.getDeals] Fetched data:', JSON.stringify(data)); 
        
        return data || [];
    },

    /**
     * Retrieves a specific deal by ID.
     * Relies on RLS.
     */
    async getDealById(supabaseClient: SupabaseClient, dealId: string): Promise<DealRecord | null> {
         if (!dealId) {
            console.warn('getDealById called with null or undefined id');
            return null;
        }
        const { data, error } = await supabaseClient
            .from('deals')
            .select('*')
            // .eq('user_id', userId) // Rely on RLS
            .eq('id', dealId)
            .maybeSingle();

        if (error) handleSupabaseError(error, 'getDealById');
        return data;
    },

    /**
     * Creates a new deal.
     * RLS policy enforces ownership.
     */
    async createDeal(supabaseClient: SupabaseClient, userId: string, input: DealInput): Promise<DealRecord> {
        const dealData = {
            ...input,
            user_id: userId,
        };
        const { data, error } = await supabaseClient
            .from('deals')
            .insert(dealData)
            .select()
            .single();

        if (error) handleSupabaseError(error, 'createDeal');
        if (!data) throw new Error('Failed to create deal, no data returned.');

        return data;
    },

    /**
     * Updates an existing deal.
     * Relies on RLS.
     */
    async updateDeal(supabaseClient: SupabaseClient, dealId: string, input: DealUpdateInput): Promise<DealRecord | null> {
         if (Object.keys(input).length === 0) {
            // throw new Error("Update input cannot be empty.");
            console.warn('updateDeal called with empty input, returning current record.');
            const existing = await this.getDealById(supabaseClient, dealId);
            if (!existing) {
               throw new Error('Deal not found or access denied for update check.');
            }
            return existing;
        }

        const { data, error } = await supabaseClient
            .from('deals')
            .update(input)
            // .eq('user_id', userId) // Rely on RLS
            .eq('id', dealId)
            .select()
            .single();

        if (error) handleSupabaseError(error, 'updateDeal');
         if (!data) {
             console.warn(`updateDeal query succeeded but returned no data for id: ${dealId}. Might be RLS or not found.`);
             return null;
        }
        return data;
    },

    /**
     * Deletes a deal.
     * Relies on RLS.
     */
    async deleteDeal(supabaseClient: SupabaseClient, dealId: string): Promise<boolean> {
        const { error, count } = await supabaseClient
            .from('deals')
            .delete({ count: 'exact' })
            // .eq('user_id', userId) // Rely on RLS
            .eq('id', dealId);

         if (error && error.code !== '42501') { // Ignore RLS error for return value
            handleSupabaseError(error, 'deleteDeal');
        }

        return count !== 0;
    },

    // TODO: Implement getDealsByPersonId(supabaseClient: SupabaseClient, personId: string)
    // async getDealsByPersonId(supabaseClient: SupabaseClient, personId: string): Promise<DealRecord[]> { ... }
}; 