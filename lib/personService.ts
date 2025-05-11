import { /* createClient, SupabaseClient, */ } from '@supabase/supabase-js'; // Keep PostgrestError if used directly, remove others
// import { supabase } from './supabaseClient'; // Removed unused import
// import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils'; // Import shared helpers
import type { Person, PersonInput } from './generated/graphql'; // ADDED: Import generated types

// REMOVED: Redundant env var loading
// import dotenv from 'dotenv';
// dotenv.config();
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// if (!supabaseUrl) { ... }
// if (!supabaseAnonKey) { ... }

// REMOVED: Helper Functions (now in serviceUtils.ts)
// function getAuthenticatedClient(accessToken: string): SupabaseClient { ... }
// function handleSupabaseError(error: PostgrestError | null, context: string) { ... }

// --- Person Data Shape ---

// REMOVED: Old PersonInput interface
// interface PersonInput {
//   first_name?: string | null;
//   last_name?: string | null;
//   email?: string | null;
//   phone?: string | null;
//   company?: string | null; 
//   notes?: string | null;
//   organization_id?: string | null; 
// }

// REMOVED: Old PersonRecord interface
// export interface PersonRecord extends PersonInput {
//     id: string;
//     created_at: string;
//     updated_at: string;
//     user_id: string;
// }


// --- Person Service --- 
export const personService = {
  // Get all people - Uses authenticated client as RLS SELECT policy uses auth.uid()
  async getPeople(userId: string, accessToken: string): Promise<Person[]> { // CHANGED: Return type to Person[]
    console.log('[personService.getPeople] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .select('*') 
      .order('created_at', { ascending: false }); 

    handleSupabaseError(error, 'fetching people'); 
    return (data || []) as Person[]; // CHANGED: Cast to Person[]
  },

  // Get a single person by ID - Uses authenticated client
  async getPersonById(userId: string, id: string, accessToken: string): Promise<Person | null> { // CHANGED: Return type to Person | null
    console.log('[personService.getPersonById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .select('*')
      .eq('id', id) 
      .single(); 

    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching person by ID'); 
    }
    return data as Person | null; // CHANGED: Cast to Person | null
  },

  // Create a new person - Needs authenticated client for INSERT RLS policy
  async createPerson(userId: string, input: PersonInput, accessToken: string): Promise<Person> { // CHANGED: input type to PersonInput, return type to Person
    console.log('[personService.createPerson] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .insert({ ...input, user_id: userId }) 
      .select() 
      .single(); 

    handleSupabaseError(error, 'creating person'); 
    if (!data) {
        throw new GraphQLError('Failed to create person, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Person; // CHANGED: Cast to Person
  },

  // Update an existing person - Needs authenticated client for UPDATE RLS policy
  async updatePerson(userId: string, id: string, input: Partial<PersonInput>, accessToken: string): Promise<Person> { // CHANGED: input type to Partial<PersonInput>, return type to Person
    console.log('[personService.updatePerson] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .update(input) 
      .eq('id', id) 
      .select() 
      .single(); 

    if (error && error.code === 'PGRST116') { 
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating person'); 
     if (!data) { 
        throw new GraphQLError('Person update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Person; // CHANGED: Cast to Person
  },

  // Delete a person - Needs authenticated client for DELETE RLS policy
  async deletePerson(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[personService.deletePerson] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { error, count } = await supabase
      .from('people') 
      .delete()
      .eq('id', id); 

    handleSupabaseError(error, 'deleting person'); 
    console.log('[personService.deletePerson] Deleted count (informational):', count);
    return !error; 
  },
  
  // Consider re-adding getPersonListForUser later if needed for dropdowns
  // It would need to fetch from 'people' table and construct names similarly.
}; 