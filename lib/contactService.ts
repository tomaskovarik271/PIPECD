import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';

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

// --- Placeholder Contact Service --- 
// TODO: Implement actual database logic using Supabase client

export const contactService = {
  // Get all contacts for the authenticated user
  async getContacts(userId: string) {
    console.log('[contactService.getContacts] called for user:', userId);
    const { data, error } = await supabase
      .from('contacts')
      .select('*') // Select all columns
      .eq('user_id', userId) // Filter by user ID (redundant with RLS but good practice)
      .order('created_at', { ascending: false }); // Optional: order by creation date

    handleSupabaseError(error, 'fetching contacts');
    return data || []; // Return fetched data or empty array
  },

  // Get a single contact by ID for the authenticated user
  async getContactById(userId: string, id: string) {
    console.log('[contactService.getContactById] called for user:', userId, 'id:', id);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId) // Filter by user ID
      .eq('id', id) // Filter by contact ID
      .single(); // Expect exactly one result or null

    // Don't throw a GraphQLError if not found, just return null as per GQL schema
    if (error && error.code !== 'PGRST116') { // PGRST116 = Row not found
       handleSupabaseError(error, 'fetching contact by ID');
    }
    return data; // Returns the contact or null if not found/error
  },

  // Create a new contact for the authenticated user
  async createContact(userId: string, input: ContactInput) {
    console.log('[contactService.createContact] called for user:', userId, 'input:', input);
    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...input, user_id: userId }) // Insert input data + user_id
      .select() // Select the newly created row
      .single(); // Expect a single row back

    handleSupabaseError(error, 'creating contact');
    if (!data) {
        throw new GraphQLError('Failed to create contact, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data; // Return the newly created contact
  },

  // Update an existing contact by ID for the authenticated user
  async updateContact(userId: string, id: string, input: ContactInput) {
    console.log('[contactService.updateContact] called for user:', userId, 'id:', id, 'input:', input);
    const { data, error } = await supabase
      .from('contacts')
      .update(input) // Update with new input data
      .eq('user_id', userId) // Ensure user owns the record
      .eq('id', id) // Target the specific contact ID
      .select() // Select the updated row
      .single(); // Expect a single row back

    handleSupabaseError(error, 'updating contact');
     if (!data) {
        // This could happen if the ID doesn't exist or RLS prevents update
        throw new GraphQLError('Contact not found or update failed', { extensions: { code: 'NOT_FOUND' } });
    }
    return data; // Return the updated contact
  },

  // Delete a contact by ID for the authenticated user
  async deleteContact(userId: string, id: string): Promise<boolean> {
    console.log('[contactService.deleteContact] called for user:', userId, 'id:', id);
    const { error, count } = await supabase
      .from('contacts')
      .delete()
      .eq('user_id', userId) // Ensure user owns the record
      .eq('id', id); // Target the specific contact ID

    handleSupabaseError(error, 'deleting contact');
    console.log('Deleted count:', count); // Log how many rows were deleted
    return count !== null && count > 0; // Return true if deletion happened
  },
}; 