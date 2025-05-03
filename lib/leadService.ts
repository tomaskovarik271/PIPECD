import { createClient, SupabaseClient, PostgrestError, User } from '@supabase/supabase-js';
// Remove direct import of the global client
// import { supabase } from './supabaseClient';

// Define the structure of a Lead record in the database
export interface LeadRecord {
    id: string; // UUID
    created_at: string; // ISO 8601 DateTime String
    updated_at: string; // ISO 8601 DateTime String
    user_id: string; // UUID of the owner
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company_name?: string | null;
    source?: string | null;
    status: string; // e.g., 'New', 'Contacted'
    notes?: string | null;
}

// Define the structure for creating a new lead (user_id is handled internally)
export interface LeadInput {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company_name?: string | null;
    source?: string | null;
    status?: string; // Defaults to 'New' in DB if not provided
    notes?: string | null;
}

// Define the structure for updating a lead (all fields optional)
export type LeadUpdateInput = Partial<LeadInput>;

/**
 * Handles Supabase errors by logging them and throwing a standardized error.
 * @param {PostgrestError | null} error - The error object from Supabase.
 * @param {string} operation - The name of the service operation where the error occurred.
 * @throws {Error} Throws a standardized error message.
 */
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
            if (operation === 'deleteLead') {
                 console.warn(`RLS prevented delete operation for lead.`);
                 // Don't throw for delete RLS, let the caller handle 'false' return
                 // Instead, we throw a specific error that the caller can check
                 // throw new Error(errorMessage); // Original throw
                 // Let's keep returning void here for deleteLead RLS, as the service expects it
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

// --- Service Functions (Refactored) ---

/**
 * Fetches all leads belonging to the specified user.
 * Accepts supabaseClient instance.
 */
async function getLeads(supabaseClient: SupabaseClient, userId: string): Promise<LeadRecord[]> {
    console.info('[leadService.getLeads] Attempting to fetch leads...');
    // Removed accessToken check - should be done in resolver

    console.info('[leadService.getLeads] Calling Supabase select...');
    const { data: leads, error: selectError } = await supabaseClient // Use passed client
        .from('leads')
        .select('*')
        .eq('user_id', userId) // RLS should also enforce this
        .order('created_at', { ascending: false });
    console.info('[leadService.getLeads] Supabase select returned.');

    handleSupabaseError(selectError, 'getLeads');
    const resultData = leads || [];
    console.info(`[leadService.getLeads] Successfully fetched ${resultData.length} leads.`);
    return resultData;
}

/**
 * Fetches a single lead by its ID, ensuring it belongs to the specified user.
 * Accepts supabaseClient instance.
 */
async function getLeadById(supabaseClient: SupabaseClient, userId: string, leadId: string): Promise<LeadRecord | null> {
   // Removed accessToken check - should be done in resolver

    const { data: lead, error: selectError } = await supabaseClient // Use passed client
        .from('leads')
        .select('*')
        .eq('user_id', userId) // Filter by user ID for ownership check BEFORE RLS
        .eq('id', leadId)
        .maybeSingle(); // Returns single record or null

    handleSupabaseError(selectError, 'getLeadById');
    // Note: The resolver should verify ownership if lead is found
    return lead;
}

/**
 * Creates a new lead for the specified user.
 * Accepts supabaseClient instance.
 */
async function createLead(supabaseClient: SupabaseClient, userId: string, input: LeadInput): Promise<LeadRecord> {
    // Removed accessToken check - should be done in resolver

    const leadData = {
        ...input,
        user_id: userId,
        status: input.status || 'New',
    };

    const { data: newLead, error: insertError } = await supabaseClient // Use passed client
        .from('leads')
        .insert(leadData)
        .select()
        .single();

    handleSupabaseError(insertError, 'createLead');
    if (!newLead) {
        throw new Error('Failed to create lead, no data returned.');
    }
    return newLead;
}

/**
 * Updates an existing lead for a specific user.
 * Input object should contain only the fields to be updated.
 * Performs validation on the input object.
 * Authorization (ensuring user owns the lead) should be done in the resolver.
 * Accepts supabaseClient instance.
 * @throws {Error} Throws an error if the database operation fails or input is invalid.
 */
async function updateLead(
  client: SupabaseClient, // Use the SupabaseClient type
  userId: string, // Add userId parameter
  leadId: string,
  input: LeadUpdateInput
): Promise<LeadRecord> { // Return the updated record
   if (Object.keys(input).length === 0) {
    throw new Error('Update input cannot be empty.');
  }

  // Input validation is now handled by the GraphQL resolver's Zod schema

  const { data, error } = await client
    .from('leads')
    .update(input) // Pass the input object directly
    .eq('user_id', userId) // Add user_id check for RLS/security
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Supabase error in updateLead:', error); // Log the specific Supabase error
    handleSupabaseError(error, 'updateLead'); // Throw standardized error
  }

  if (!data) {
      throw new Error('Failed to update lead or lead not found.');
    }
   return data;
  }

/**
 * Deletes a lead.
 * Authorization (ensuring user owns the lead) should be done in the resolver.
 * Accepts supabaseClient instance.
 * Returns true if deletion was successful (affected 1 row).
 */
async function deleteLead(supabaseClient: SupabaseClient, leadId: string): Promise<boolean> {
   // Removed accessToken check - ownership check done in resolver

    const { error: deleteError, count } = await supabaseClient // Use passed client
        .from('leads')
        .delete({ count: 'exact' })
        // Rely on RLS for authorization, checked in resolver before calling this
        .eq('id', leadId);

    // Check for errors other than RLS violations (which might be expected if ID doesn't match user)
    if (deleteError && !deleteError.message.includes('Row level security policy violation')) {
        handleSupabaseError(deleteError, 'deleteLead');
    }

    // Return true only if exactly 1 row was deleted
    return count === 1;
}

// Export the service functions individually or as an object
export {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
}; 