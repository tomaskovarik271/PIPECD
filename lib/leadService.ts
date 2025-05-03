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

// Helper function to handle Supabase errors
function handleSupabaseError(error: PostgrestError | null, context: string): void {
    if (error) {
        console.error(`Supabase error in ${context}:`, error);
        throw new Error(`Database operation failed in ${context}: ${error.message}`);
    }
}

// --- Service Functions (Refactored) ---

/**
 * Fetches all leads belonging to the specified user.
 * Accepts supabaseClient instance.
 */
async function getLeads(supabaseClient: SupabaseClient, userId: string): Promise<LeadRecord[]> {
    // Removed accessToken check - should be done in resolver

    const { data: leads, error: selectError } = await supabaseClient // Use passed client
        .from('leads')
        .select('*')
        .eq('user_id', userId) // RLS should also enforce this
        .order('created_at', { ascending: false });

    handleSupabaseError(selectError, 'getLeads');
    return leads || [];
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
 * Updates an existing lead.
 * Authorization (ensuring user owns the lead) should be done in the resolver.
 * Accepts supabaseClient instance.
 */
async function updateLead(supabaseClient: SupabaseClient, leadId: string, input: LeadUpdateInput): Promise<LeadRecord> {
    // Removed accessToken check - ownership check done in resolver

    // Prevent updating user_id (safety measure)
    const { user_id, ...updateData } = input as any; 

    if (Object.keys(updateData).length === 0) {
        throw new Error('No fields provided for update'); // Or fetch/return current if preferred
    }

    const { data: updatedLead, error: updateError } = await supabaseClient // Use passed client
        .from('leads')
        .update(updateData)
        // Rely on RLS for authorization, checked in resolver before calling this
        .eq('id', leadId)
        .select()
        .single();

    handleSupabaseError(updateError, 'updateLead');
    if (!updatedLead) {
        throw new Error('Failed to update lead or lead not found.');
    }
    return updatedLead;
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