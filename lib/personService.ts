import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
// import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';

// Load env vars (Refactor Candidate: Move to shared config)
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set.');
}
if (!supabaseAnonKey) {
    console.warn('SUPABASE_ANON_KEY environment variable is not set. Client creation might fail.');
}

// --- Helper Functions (Refactor Candidate: Move to shared lib/utils/supabaseHelpers.ts) ---

function getAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is not configured.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    // auth: { persistSession: false }
  });
}

function handleSupabaseError(error: PostgrestError | null, context: string) {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    throw new GraphQLError(`Database error during ${context}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error.message },
    });
  }
}

// --- Person Data Shape ---

interface PersonInput {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null; // Keep for now, maybe map to org later?
  notes?: string | null;
  organization_id?: string | null; // Added field
}

// Define the shape returned by the database
interface PersonRecord extends PersonInput {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    // Ensure organization_id is included here if selected
}


// --- Person Service --- 
export const personService = {
  // Get all people - Uses authenticated client as RLS SELECT policy uses auth.uid()
  async getPeople(userId: string, accessToken: string): Promise<PersonRecord[]> {
    console.log('[personService.getPeople] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('people') // Updated table name
      .select('*') 
      // RLS should handle user_id filtering
      .order('created_at', { ascending: false }); 

    handleSupabaseError(error, 'fetching people');
    return data || [];
  },

  // Get a single person by ID - Uses authenticated client
  async getPersonById(userId: string, id: string, accessToken: string): Promise<PersonRecord | null> {
    console.log('[personService.getPersonById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('people') // Updated table name
      .select('*')
      // RLS handles user_id filtering
      .eq('id', id) // Filter by specific ID
      .single(); 

    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching person by ID');
    }
    return data; 
  },

  // Create a new person - Needs authenticated client for INSERT RLS policy
  async createPerson(userId: string, input: PersonInput, accessToken: string): Promise<PersonRecord> {
    console.log('[personService.createPerson] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('people') // Updated table name
      .insert({ ...input, user_id: userId }) // RLS CHECK (auth.uid() = user_id) needs authenticated client
      .select() 
      .single(); 

    handleSupabaseError(error, 'creating person');
    if (!data) {
        throw new GraphQLError('Failed to create person, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data; 
  },

  // Update an existing person - Needs authenticated client for UPDATE RLS policy
  async updatePerson(userId: string, id: string, input: Partial<PersonInput>, accessToken: string): Promise<PersonRecord> {
    console.log('[personService.updatePerson] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('people') // Updated table name
      .update(input) // Pass partial input
      // RLS handles the user_id check
      .eq('id', id) // Target the specific person ID
      .select() 
      .single(); 

    // Handle not found error specifically
    if (error && error.code === 'PGRST116') { 
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating person');
     if (!data) { // Failsafe
        throw new GraphQLError('Person update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data; 
  },

  // Delete a person - Needs authenticated client for DELETE RLS policy
  async deletePerson(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[personService.deletePerson] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { error, count } = await supabase
      .from('people') // Updated table name
      .delete()
      // RLS handles the user_id check
      .eq('id', id); // Target the specific person ID

    handleSupabaseError(error, 'deleting person');
    console.log('[personService.deletePerson] Deleted count (informational):', count);
    return !error; 
  },
  
  // Consider re-adding getPersonListForUser later if needed for dropdowns
  // It would need to fetch from 'people' table and construct names similarly.
}; 