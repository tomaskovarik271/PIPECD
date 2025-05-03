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

// --- Organization Data Shape ---

// Input for creating/updating organizations
export interface OrganizationInput {
  name: string; // Assuming name is required
  address?: string | null;
  notes?: string | null;
  // Add other fields from schema as needed (e.g., website)
}

// Shape returned by the database (includes id, timestamps, user_id)
export interface OrganizationRecord extends OrganizationInput {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type OrganizationUpdateInput = Partial<OrganizationInput>;

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
            if (operation === 'deleteOrganization') { // Check specific operation name
                 console.warn(`RLS prevented delete operation for organization.`);
                 // Keep returning void here for deleteOrganization RLS
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

// --- Organization Service ---

export const organizationService = {

  // Get all organizations for the authenticated user (RLS handles filtering)
  async getOrganizations(supabaseClient: SupabaseClient): Promise<OrganizationRecord[]> {
    const { data, error } = await supabaseClient
      .from('organizations')
      .select('*')
      // .eq('user_id', userId) // Rely on RLS
      .order('name', { ascending: true });

    if (error) handleSupabaseError(error, 'getOrganizations');
    return data || [];
  },

  // Get a single organization by ID (RLS handles filtering)
  async getOrganizationById(supabaseClient: SupabaseClient, organizationId: string): Promise<OrganizationRecord | null> {
    if (!organizationId) {
      console.warn('getOrganizationById called with null or undefined id');
      return null;
    }
    const { data, error } = await supabaseClient
      .from('organizations')
      .select('*')
      // .eq('user_id', userId) // Rely on RLS
      .eq('id', organizationId)
      .maybeSingle();

    if (error) handleSupabaseError(error, 'getOrganizationById');
    return data;
  },

  // Create a new organization (RLS requires authenticated client)
  async createOrganization(supabaseClient: SupabaseClient, userId: string, input: OrganizationInput): Promise<OrganizationRecord> {
    const orgData = {
      ...input,
      user_id: userId,
    };
    const { data, error } = await supabaseClient
      .from('organizations')
      .insert(orgData)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'createOrganization');
    if (!data) throw new Error('Failed to create organization, no data returned.');

    return data;
  },

  // Update an existing organization (RLS requires authenticated client)
  async updateOrganization(supabaseClient: SupabaseClient, organizationId: string, input: Partial<OrganizationInput>): Promise<OrganizationRecord | null> {
    if (Object.keys(input).length === 0) {
      // throw new Error("Update input cannot be empty.");
      console.warn('updateOrganization called with empty input, returning current record.');
      const existing = await this.getOrganizationById(supabaseClient, organizationId);
      if (!existing) {
        throw new Error('Organization not found or access denied for update check.');
      }
      return existing;
    }

    const { data, error } = await supabaseClient
      .from('organizations')
      .update(input)
      // .eq('user_id', userId) // Rely on RLS
      .eq('id', organizationId)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'updateOrganization');
    if (!data) {
      console.warn(`updateOrganization query succeeded but returned no data for id: ${organizationId}. Might be RLS or not found.`);
      return null;
    }
    return data;
  },

  // Delete an organization (RLS requires authenticated client)
  async deleteOrganization(supabaseClient: SupabaseClient, organizationId: string): Promise<boolean> {
    const { error, count } = await supabaseClient
      .from('organizations')
      .delete({ count: 'exact' })
      // .eq('user_id', userId) // Rely on RLS
      .eq('id', organizationId);

    if (error && error.code !== '42501') { // Ignore RLS error for return value
      handleSupabaseError(error, 'deleteOrganization');
    }

    return count !== 0; // Return true if deleted (or RLS stopped it without DB error)
  },
}; 