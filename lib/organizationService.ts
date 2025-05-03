import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';

// Load env vars (consider moving to a shared config loader later)
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set.');
}
if (!supabaseAnonKey) {
  console.warn('SUPABASE_ANON_KEY environment variable is not set. Client creation might fail.');
  // Potentially throw if strictly required
}

// --- Helper Functions (Refactor Candidate: Move to shared lib/utils/supabaseHelpers.ts) ---

function getAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is not configured.');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    // auth: { persistSession: false } // Ensure no session persistence on server
  });
}

function handleSupabaseError(error: PostgrestError | null, context: string) {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message);
    // Consider mapping specific error codes (e.g., unique constraints) if needed
    throw new GraphQLError(`Database error during ${context}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error.message },
    });
  }
}

// --- Organization Data Shape ---

// Input for creating/updating organizations
interface OrganizationInput {
  name: string; // Assuming name is required
  address?: string | null;
  notes?: string | null;
  // Add other fields from schema as needed (e.g., website)
}

// Shape returned by the database (includes id, timestamps, user_id)
interface OrganizationRecord extends OrganizationInput {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// --- Organization Service ---

export const organizationService = {

  // Get all organizations for the authenticated user (RLS handles filtering)
  async getOrganizations(userId: string, accessToken: string): Promise<OrganizationRecord[]> {
    console.log('[organizationService.getOrganizations] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('organizations')
      .select('*') // RLS filters by user_id
      .order('name', { ascending: true });

    handleSupabaseError(error, 'fetching organizations');
    return data || [];
  },

  // Get a single organization by ID (RLS handles filtering)
  async getOrganizationById(userId: string, id: string, accessToken: string): Promise<OrganizationRecord | null> {
    console.log('[organizationService.getOrganizationById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id) // Filter by specific ID (RLS ensures user access)
      .single();

    // Ignore 'PGRST116' error (No rows found), return null in that case
    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'fetching organization by ID');
    }
    return data;
  },

  // Create a new organization (RLS requires authenticated client)
  async createOrganization(userId: string, input: OrganizationInput, accessToken: string): Promise<OrganizationRecord> {
    console.log('[organizationService.createOrganization] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('organizations')
      .insert({ ...input, user_id: userId }) // RLS CHECK (auth.uid() = user_id)
      .select()
      .single();

    handleSupabaseError(error, 'creating organization');
    if (!data) {
      // This case might indicate a different issue if no DB error occurred
      throw new GraphQLError('Failed to create organization, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data;
  },

  // Update an existing organization (RLS requires authenticated client)
  async updateOrganization(userId: string, id: string, input: Partial<OrganizationInput>, accessToken: string): Promise<OrganizationRecord> {
    console.log('[organizationService.updateOrganization] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    const { data, error } = await supabase
      .from('organizations')
      .update(input) // Pass partial input for update
      .eq('id', id) // Target the specific organization ID (RLS checks user_id)
      .select()
      .single();

    // Handle not found error specifically
    if (error && error.code === 'PGRST116') { // 'PGRST116' No rows found
      throw new GraphQLError('Organization not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating organization');
    if (!data) { // Should be redundant if error handling is correct, but good failsafe
      throw new GraphQLError('Organization update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data;
  },

  // Delete an organization (RLS requires authenticated client)
  async deleteOrganization(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[organizationService.deleteOrganization] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); // Use authenticated client
    // Note: Deleting an organization might fail if people still reference it, unless ON DELETE is configured differently
    // Current setup for people.organization_id is ON DELETE SET NULL, so deletion should proceed.
    const { error, count } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id); // Target the specific organization ID (RLS checks user_id)

    handleSupabaseError(error, 'deleting organization');

    console.log('[organizationService.deleteOrganization] Deleted count (informational):', count);
    return !error; // Return true if no database error occurred
  },
}; 