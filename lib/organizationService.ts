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
import { CustomFieldEntityType, CustomFieldType } from './generated/graphql'; // Import enums
import * as customFieldDefinitionService from './customFieldDefinitionService'; // For fetching definitions
import { SupabaseClient } from '@supabase/supabase-js'; // Ensure SupabaseClient is imported for type hints


// --- Organization Service ---

// Helper to process custom fields for creation
const processCustomFieldsForOrganizationCreate = async (
  supabase: SupabaseClient,
  inputCustomFields: CustomFieldValueInput[] | undefined | null,
): Promise<Record<string, any> | undefined> => {
  if (!inputCustomFields || inputCustomFields.length === 0) {
    return undefined; // No custom fields to process
  }

  const definitions = await customFieldDefinitionService.getCustomFieldDefinitions(
    supabase, 
    CustomFieldEntityType.Organization, 
    false // only active
  );

  if (!definitions || definitions.length === 0) {
    // If there are no definitions, but custom fields were provided, this is a mismatch.
    // Depending on strictness, could throw an error or just ignore the input.
    // For now, let's log and ignore, effectively clearing them if no definitions match.
    console.warn('[processCustomFieldsForOrganizationCreate] Custom fields provided, but no active definitions found for Organization.');
    return {}; // Return empty object to signify processing occurred but yielded no values
  }

  const newCustomFieldValues: Record<string, any> = {};
  const definitionMap = new Map(definitions.map(def => [def.id, def]));

  for (const cfInput of inputCustomFields) {
    const definition = definitionMap.get(cfInput.definitionId);
    if (!definition) {
      console.warn(`[processCustomFieldsForOrganizationCreate] No definition found for ID: ${cfInput.definitionId}. Skipping.`);
      continue;
    }
    if (definition.entityType !== CustomFieldEntityType.Organization) {
      console.warn(`[processCustomFieldsForOrganizationCreate] Definition ${definition.fieldName} is not for Organization entity. Skipping.`);
      continue;
    }
    if (!definition.isActive) {
      console.warn(`[processCustomFieldsForOrganizationCreate] Definition ${definition.fieldName} is not active. Skipping.`);
      continue;
    }

    let valueToStore: any = null;
    switch (definition.fieldType) {
      case CustomFieldType.Text: valueToStore = cfInput.stringValue; break;
      case CustomFieldType.Number: valueToStore = cfInput.numberValue; break;
      case CustomFieldType.Boolean: valueToStore = cfInput.booleanValue; break;
      case CustomFieldType.Date: valueToStore = cfInput.dateValue; break; // Assuming dateValue is string/Date
      case CustomFieldType.Dropdown:
        // Use stringValue for dropdown (correct format), with backward compatibility for selectedOptionValues
        valueToStore = cfInput.stringValue || 
          (cfInput.selectedOptionValues && cfInput.selectedOptionValues.length > 0 
            ? cfInput.selectedOptionValues[0] 
            : null);
        break;
      case CustomFieldType.MultiSelect:
        valueToStore = cfInput.selectedOptionValues;
        break;
      default:
        console.warn(`[processCustomFieldsForOrganizationCreate] Unknown field type ${definition.fieldType} for ${definition.fieldName}`);
        continue;
    }
    
    // Only store if a value is actually provided (not undefined)
    // Null is a valid value to store (e.g., explicitly clearing a field)
    if (valueToStore !== undefined) {
         newCustomFieldValues[definition.fieldName] = valueToStore;
    }
  }
  return newCustomFieldValues;
};

// Helper to process custom fields for update
const processCustomFieldsForOrganizationUpdate = async (
  supabase: SupabaseClient,
  existingCustomFieldValues: Record<string, any> | undefined | null,
  inputCustomFields: CustomFieldValueInput[] | undefined | null,
): Promise<Record<string, any> | undefined> => {
  if (inputCustomFields === undefined) {
    return undefined; // No change requested for custom fields
  }
  if (inputCustomFields === null || inputCustomFields.length === 0) {
    return {}; // Request to clear all custom fields or set to empty
  }

  // If inputCustomFields is provided (and not empty), it implies a full replacement of relevant fields.
  // We build the new set based on input, similar to create.
  const definitions = await customFieldDefinitionService.getCustomFieldDefinitions(
    supabase, 
    CustomFieldEntityType.Organization, 
    false // only active
  );

  if (!definitions || definitions.length === 0) {
    console.warn('[processCustomFieldsForOrganizationUpdate] Custom fields provided for update, but no active definitions found for Organization.');
    return {}; // Effectively clears custom fields if no definitions match input
  }

  const updatedCustomFieldValues: Record<string, any> = { ...existingCustomFieldValues }; // Start with existing
  const definitionMap = new Map(definitions.map(def => [def.id, def]));

  // Create a set of fieldNames that are explicitly managed by the inputCustomFields
  const inputFieldNames = new Set<string>();

  for (const cfInput of inputCustomFields) {
    const definition = definitionMap.get(cfInput.definitionId);
    if (!definition) {
      console.warn(`[processCustomFieldsForOrganizationUpdate] No definition found for ID: ${cfInput.definitionId}. Skipping.`);
      continue;
    }
    if (definition.entityType !== CustomFieldEntityType.Organization || !definition.isActive) {
      console.warn(`[processCustomFieldsForOrganizationUpdate] Definition ${definition.fieldName} invalid or not for Organization. Skipping.`);
      continue;
    }

    inputFieldNames.add(definition.fieldName); // Mark this field as managed by input

    let valueToStore: any = null;
    // Check which value field is set in the input, similar to Zod refinement
    const valueFields = [cfInput.stringValue, cfInput.numberValue, cfInput.booleanValue, cfInput.dateValue, cfInput.selectedOptionValues];
    const providedValueFields = valueFields.filter(v => v !== undefined);

    if (providedValueFields.length > 0) {
        // If any value is explicitly provided (even if null), use it.
        switch (definition.fieldType) {
            case CustomFieldType.Text: valueToStore = cfInput.stringValue; break;
            case CustomFieldType.Number: valueToStore = cfInput.numberValue; break;
            case CustomFieldType.Boolean: valueToStore = cfInput.booleanValue; break;
            case CustomFieldType.Date: valueToStore = cfInput.dateValue; break;
            case CustomFieldType.Dropdown:
                // Use stringValue for dropdown (correct format), with backward compatibility for selectedOptionValues
                valueToStore = cfInput.stringValue || 
                  (cfInput.selectedOptionValues && cfInput.selectedOptionValues.length > 0 
                    ? cfInput.selectedOptionValues[0] 
                    : null);
                break;
            case CustomFieldType.MultiSelect:
                valueToStore = cfInput.selectedOptionValues;
                break;
            default:
                console.warn(`[processCustomFieldsForOrganizationUpdate] Unknown field type ${definition.fieldType} for ${definition.fieldName}`);
                continue;
        }
        updatedCustomFieldValues[definition.fieldName] = valueToStore;
    } else {
        // If no value field is provided for this cfInput (e.g. just definitionId), it means we should remove this field if it exists
        // Or, if cfInput implies setting to null, it might already be null above.
        // This case handles removing a field if the input for it has no value part.
        // However, typical GQL input will send null for the value part to clear it.
        // Let's ensure that if a field was in inputCustomFields but had no value, it gets cleared.
        delete updatedCustomFieldValues[definition.fieldName];
    }
  }
  
  // For any fields *not* in inputCustomFields but present in existingCustomFieldValues,
  // and for which there *is* an active Organization definition, we should retain them.
  // The current loop already starts with `...existingCustomFieldValues` and only overwrites or deletes fields specified in the input.
  // However, if a definition was DEACTIVATED, and a value exists, this logic won't remove it unless the client sends an explicit update for it.
  // This is generally fine; stale data for deactivated fields is a separate cleanup concern.

  return updatedCustomFieldValues;
};

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
    
    const customFieldValues = await processCustomFieldsForOrganizationCreate(
      supabase, 
      input.customFields
    );

    const orgDataToInsert: any = { 
      name: input.name,
      address: input.address,
      notes: input.notes,
      user_id: userId 
    };

    if (customFieldValues !== undefined) {
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
    
    const customFieldValues = await processCustomFieldsForOrganizationUpdate(
      supabase,
      (existingOrg as any).custom_field_values, // Pass existing values
      input.customFields // Pass input from mutation
    );

    const orgDataToUpdate: any = { ...input };
    delete orgDataToUpdate.customFields; // Remove customFields from top-level update object, it's processed separately

    if (customFieldValues !== undefined) { // only update custom_field_values if processCustomFieldsForOrganizationUpdate didn't return undefined
        orgDataToUpdate.custom_field_values = customFieldValues;
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