import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';

// Load env vars for URL (Anon key is not needed globally anymore for RLS writes)
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set.');
}

// Helper to get a request-specific Supabase client instance authenticated with JWT
function getAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl) throw new Error('Supabase URL is not configured.'); // Should not happen due to check above
  // Use the user's access token to make the request, RLS policies using auth.uid() will work
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, { // Need anon key for the connection itself
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    // auth: { persistSession: false } // Ensure no session persistence on server
  });
}

// Define the shape of the contact data (matches DB and GraphQL type)
// Consider using Zod for schema definition and validation later
interface ContactInput {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
}

// Helper function to handle Supabase errors
function handleSupabaseError(error: any, context: string) {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    // Consider more specific error handling based on Supabase error codes if needed
    throw new GraphQLError(`Database error during ${context}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error.message },
    });
  }
}

// --- Contact Service --- 
export const contactService = {
  // Get all contacts - Uses global client as RLS SELECT policy uses auth.uid() derived from JWT via middleware
  async getContacts(userId: string, accessToken: string) { // Pass token for consistency, though SELECT might work via middleware auth
    console.log('[contactService.getContacts] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('contacts')
      .select('*') 
      // .eq('user_id', userId) // RLS should handle this, redundant
      .order('created_at', { ascending: false }); 

    handleSupabaseError(error, 'fetching contacts');
    return data || [];
  },

  // Get a single contact by ID - Uses global client as RLS SELECT policy uses auth.uid() derived from JWT via middleware
  async getContactById(userId: string, id: string, accessToken: string) { // Pass token for consistency
    console.log('[contactService.getContactById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      // .eq('user_id', userId) // RLS should handle this
      .eq('id', id) // Still need to filter by specific ID
      .single(); 

    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching contact by ID');
    }
    return data; 
  },

  // Create a new contact - Needs authenticated client for INSERT RLS policy
  async createContact(userId: string, input: ContactInput, accessToken: string) {
    console.log('[contactService.createContact] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...input, user_id: userId }) // RLS CHECK (auth.uid() = user_id) needs authenticated client
      .select() 
      .single(); 

    handleSupabaseError(error, 'creating contact');
    if (!data) {
        throw new GraphQLError('Failed to create contact, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data; 
  },

  // Update an existing contact - Needs authenticated client for UPDATE RLS policy
  async updateContact(userId: string, id: string, input: ContactInput, accessToken: string) {
    console.log('[contactService.updateContact] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('contacts')
      .update(input) 
      // .eq('user_id', userId) // RLS handles the check (auth.uid() = user_id)
      .eq('id', id) // Target the specific contact ID
      .select() 
      .single(); 

    handleSupabaseError(error, 'updating contact');
     if (!data) {
        throw new GraphQLError('Contact not found or update failed', { extensions: { code: 'NOT_FOUND' } });
    }
    return data; 
  },

  // Delete a contact - Needs authenticated client for DELETE RLS policy
  async deleteContact(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[contactService.deleteContact] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { error, count } = await supabase
      .from('contacts')
      .delete()
      // .eq('user_id', userId) // RLS handles the check (auth.uid() = user_id)
      .eq('id', id); // Target the specific contact ID

    handleSupabaseError(error, 'deleting contact');
    console.log('Deleted count:', count);
    return count !== null && count > 0; 
  },
}; 