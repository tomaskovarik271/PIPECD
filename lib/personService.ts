import { supabase } from './supabaseClient'; // Import the shared client for type info if needed
// import { handleSupabaseError } from './utils/handleSupabaseError'; // Remove this incorrect import
import { GraphQLError } from 'graphql'; // Needed for handleSupabaseError
import { createClient, type SupabaseClient, type PostgrestError } from '@supabase/supabase-js'; 

// --- Helper Functions (Refactor Candidate: Move to shared lib/utils/supabaseHelpers.ts) ---

// REMOVED: Top-level environment variable checks
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// if (!supabaseUrl) { ... }
// if (!supabaseAnonKey) { ... }

// REMOVED: Unused helper function
// function getAuthenticatedClient(accessToken: string): SupabaseClient { ... }

// --- Person Data Shape ---

// Interface for the structure of data returned from the 'people' table
export interface PersonRecord {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
    organization_id: string | null;
}

// Interface for the input data when creating a person
export interface PersonInput {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    organization_id?: string | null;
}

// Interface for the input data when updating a person (all fields optional)
export type PersonUpdateInput = Partial<PersonInput>;

// Restore handleSupabaseError locally for now
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
            if (operation === 'deletePerson') { // Check specific operation name
                 console.warn(`RLS prevented delete operation for person.`);
                 // Keep returning void here for deletePerson RLS
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

// Explicitly remove any lingering reference if the linter is confused
// const tempClient = createClient(...); // Ensure no such line exists

// --- Person Service --- 
export const personService = {
    /**
     * Retrieves all people for the authenticated user.
     * Relies on RLS policy for user filtering.
     */
    async getPeople(supabaseClient: SupabaseClient): Promise<PersonRecord[]> {
        console.info('[personService.getPeople] Attempting to fetch people...');
        console.info('[personService.getPeople] Calling Supabase select...');
        const { data, error } = await supabaseClient
            .from('people')
            .select('*')
            // .eq('user_id', userId) // Rely on RLS
            .order('created_at', { ascending: false });
        console.info('[personService.getPeople] Supabase select returned.');

        if (error) handleSupabaseError(error, 'getPeople');
        const resultData = data || []; // Return empty array if data is null
        console.info(`[personService.getPeople] Successfully fetched ${resultData.length} people.`);
        return resultData;
    },

    /**
     * Retrieves a specific person by ID for the authenticated user.
     * Relies on RLS policy for user filtering.
     */
    async getPersonById(supabaseClient: SupabaseClient, personId: string): Promise<PersonRecord | null> {
         if (!personId) {
            console.warn('getPersonById called with null or undefined id');
            return null;
        }
        const { data, error } = await supabaseClient
            .from('people')
            .select('*')
            // .eq('user_id', userId) // Rely on RLS
            .eq('id', personId)
            .maybeSingle(); // Use maybeSingle to return null if not found

        if (error) handleSupabaseError(error, 'getPersonById');
        return data;
    },

    /**
     * Creates a new person record for the specified user.
     * RLS policy ('INSERT WITH CHECK (auth.uid() = user_id)') enforces ownership.
     */
    async createPerson(supabaseClient: SupabaseClient, userId: string, input: PersonInput): Promise<PersonRecord> {
        const personData = {
            ...input,
            user_id: userId, // Include user_id for the INSERT check
        };

        const { data, error } = await supabaseClient
            .from('people')
            .insert(personData)
            .select()
            .single(); // Use single() as insert should return the created row

        if (error) handleSupabaseError(error, 'createPerson');
        if (!data) throw new Error('Failed to create person, no data returned.'); // Should not happen on success

        return data;
    },

    /**
     * Updates an existing person record.
     * Relies on RLS policy for filtering/checking ownership.
     */
    async updatePerson(supabaseClient: SupabaseClient, personId: string, input: PersonUpdateInput): Promise<PersonRecord | null> {
        if (Object.keys(input).length === 0) {
             console.warn('updatePerson called with empty input, returning current record.');
             // Optionally, fetch and return the existing record or throw an error
             // Fetching requires another call:
             const existing = await this.getPersonById(supabaseClient, personId);
             if (!existing) {
                throw new Error('Person not found or access denied for update check.');
             }
             return existing;
             // Or simply throw:
             // throw new Error("Update input cannot be empty.");
        }

        const { data, error } = await supabaseClient
            .from('people')
            .update(input)
            // .eq('user_id', userId) // Rely on RLS
            .eq('id', personId)
            .select()
            .single(); // Use single to ensure one record was updated and return it

        if (error) handleSupabaseError(error, 'updatePerson');
        // If RLS prevents the update or the ID doesn't exist for the user,
        // 'data' might be null and 'error' might also be null or an RLS error.
        // Check data explicitly.
        if (!data) {
             console.warn(`updatePerson query succeeded but returned no data for id: ${personId}. Might be RLS or not found.`);
             // Decide return strategy: null or throw? Returning null indicates not found/not updated.
             return null;
             // throw new Error('Failed to update person or person not found.');
        }

        return data;
    },

    /**
     * Deletes a person record.
     * Relies on RLS policy for filtering ownership.
     */
    async deletePerson(supabaseClient: SupabaseClient, personId: string): Promise<boolean> {
        const { error, count } = await supabaseClient
            .from('people')
            .delete({ count: 'exact' }) // Request count for better feedback
            // .eq('user_id', userId) // Rely on RLS
            .eq('id', personId);

        // Don't throw RLS specific errors, just return false or handle other errors
        if (error && error.code !== '42501') { // 42501 is RLS violation
            handleSupabaseError(error, 'deletePerson');
        }

        // Return true if deletion happened (count > 0) or if RLS prevented it but no other DB error occurred.
        // Return false only if count is explicitly 0 (meaning not found for the user).
        return count !== 0;
    },

    // TODO: Implement getPeopleByOrganizationId(supabaseClient: SupabaseClient, orgId: string)
    // async getPeopleByOrganizationId(supabaseClient: SupabaseClient, orgId: string): Promise<PersonRecord[]> { ... }
}; 