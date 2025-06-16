import { /* createClient, SupabaseClient, */ } from '@supabase/supabase-js';
// import { supabase } from './supabaseClient'; // Removed unused import
// import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils'; // Import shared helpers
import type { 
  Organization, 
  OrganizationInput, 
  CustomFieldValueInput
} from './generated/graphql';
import { CustomFieldEntityType } from './generated/graphql'; // Import enums
import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './customFieldUtils';
import { SupabaseClient } from '@supabase/supabase-js'; // Ensure SupabaseClient is imported for type hints


// --- Organization Service ---

// Organization service now uses the shared optimized custom field utilities

export const organizationService = {

  // Get all organizations for the authenticated user (RLS handles filtering)
  async getOrganizations(userId: string, accessToken: string): Promise<Organization[]> { 
    // console.log('[organizationService.getOrganizations] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('organizations')
      .select('*, custom_field_values') // Ensure custom_field_values is selected
      .order('name', { ascending: true });

    handleSupabaseError(error, 'fetching organizations'); 
    return (data || []) as Organization[]; 
  },

  // Get a single organization by ID (RLS handles filtering)
  async getOrganizationById(userId: string, id: string, accessToken: string): Promise<Organization | null> { 
    // console.log('[organizationService.getOrganizationById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('organizations')
      .select('*, custom_field_values') // Ensure custom_field_values is selected
      .eq('id', id) 
      .single();

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'fetching organization by ID'); 
    }
    return data; 
  },

  // Create a new organization (RLS requires authenticated client)
  async createOrganization(userId: string, input: OrganizationInput, accessToken: string): Promise<Organization> { 
    // console.log('[organizationService.createOrganization] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken);
    
    const customFieldValues = await processCustomFieldsForCreate(
      input.customFields,
      supabase, 
      CustomFieldEntityType.Organization,
      true // Enable bulk fetch for performance
    );

    const orgDataToInsert: any = { 
      name: input.name,
      address: input.address,
      notes: input.notes,
      user_id: userId 
    };

    if (customFieldValues !== null) {
      orgDataToInsert.custom_field_values = customFieldValues;
    }
    
    const { data, error } = await supabase
      .from('organizations')
      .insert(orgDataToInsert) 
      .select('*, custom_field_values') // Ensure custom_field_values is selected on return
      .single();

    handleSupabaseError(error, 'creating organization'); 
    if (!data) {
      throw new GraphQLError('Failed to create organization, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Organization; 
  },

  // Update an existing organization (RLS requires authenticated client)
  async updateOrganization(userId: string, id: string, input: Partial<OrganizationInput>, accessToken: string): Promise<Organization> { 
    // console.log('[organizationService.updateOrganization] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 

    // Fetch existing organization to get current custom_field_values if needed
    const existingOrg = await this.getOrganizationById(userId, id, accessToken);
    if (!existingOrg) {
        throw new GraphQLError('Organization not found for update', { extensions: { code: 'NOT_FOUND' } });
    }
    
    const { finalCustomFieldValues } = await processCustomFieldsForUpdate(
      (existingOrg as any).custom_field_values, // Pass existing values
      input.customFields, // Pass input from mutation
      supabase,
      CustomFieldEntityType.Organization,
      true // Enable bulk fetch for performance
    );

    const orgDataToUpdate: any = { ...input };
    delete orgDataToUpdate.customFields; // Remove customFields from top-level update object, it's processed separately

    if (finalCustomFieldValues !== null) { // only update custom_field_values if processCustomFieldsForUpdate didn't return null
        orgDataToUpdate.custom_field_values = finalCustomFieldValues;
    }

    const { data, error } = await supabase
      .from('organizations')
      .update(orgDataToUpdate) 
      .eq('id', id) 
      .select('*, custom_field_values') // Ensure custom_field_values is selected on return
      .single();

    if (error && error.code === 'PGRST116') { 
      throw new GraphQLError('Organization not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating organization'); 
    if (!data) { 
      throw new GraphQLError('Organization update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Organization; 
  },

  // Delete an organization (RLS requires authenticated client)
  async deleteOrganization(userId: string, id: string, accessToken: string): Promise<boolean> {
    // console.log('[organizationService.deleteOrganization] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { error, count } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id); 

    handleSupabaseError(error, 'deleting organization'); 

    // console.log('[organizationService.deleteOrganization] Deleted count (informational):', count);
    return !error; 
  },
}; 