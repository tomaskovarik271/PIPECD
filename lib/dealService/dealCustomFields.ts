import type { CustomFieldValueInput } from '../generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCustomFieldDefinitionById } from '../customFieldDefinitionService';

/**
 * Processes custom field inputs for deal creation.
 * @param customFieldsInput Array of custom field value inputs.
 * @param supabaseClient Authenticated Supabase client instance.
 * @returns A record of custom field names to their values, or null if no valid custom fields processed.
 */
export const processCustomFieldsForCreate = async (
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<Record<string, any>> => {
  const dbCustomFieldValues: Record<string, any> = {};

  if (!customFieldsInput || customFieldsInput.length === 0) {
    return dbCustomFieldValues;
  }

  console.log('[dealCustomFields.processCustomFieldsForCreate] Processing customFields input count:', customFieldsInput.length);

  for (const cfInput of customFieldsInput) {
    try {
      const definition = await getCustomFieldDefinitionById(supabaseClient, cfInput.definitionId);
      if (definition) {
        const fieldName = definition.fieldName;
        let valueToStore: any = undefined; 

        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) valueToStore = cfInput.stringValue;
        else if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) valueToStore = cfInput.numberValue;
        else if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) valueToStore = cfInput.booleanValue;
        else if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) valueToStore = cfInput.dateValue; 
        else if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) valueToStore = cfInput.selectedOptionValues;
        
        if (valueToStore !== undefined) {
             dbCustomFieldValues[fieldName] = valueToStore;
             console.log(`[dealCustomFields.processCustomFieldsForCreate] Storing for ${fieldName}:`, valueToStore);
        } else {
             console.log(`[dealCustomFields.processCustomFieldsForCreate] No value provided for custom field based on definition ${definition.id} (${fieldName}), skipping.`);
        }
      } else {
        console.warn(`[dealCustomFields.processCustomFieldsForCreate] Custom field definition ${cfInput.definitionId} not found. Skipping.`);
      }
    } catch (defError: any) {
        console.error(`[dealCustomFields.processCustomFieldsForCreate] Error fetching/processing definition ${cfInput.definitionId}:`, defError.message);
    }
  }
  
  console.log('[dealCustomFields.processCustomFieldsForCreate] Constructed dbCustomFieldValues:', JSON.stringify(dbCustomFieldValues, null, 2));
  return dbCustomFieldValues;
};

/**
 * Processes custom field inputs for deal updates.
 * @param currentDbCustomFieldValues The existing custom field values from the database for the deal.
 * @param customFieldsInput Array of custom field value inputs for update.
 * @param supabaseClient Authenticated Supabase client instance.
 * @returns An object containing the final custom field values to be stored in the database.
 */
export const processCustomFieldsForUpdate = async (
  currentDbCustomFieldValues: Record<string, any> | null,
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<{ finalCustomFieldValues: Record<string, any> | null }> => {
  let finalCustomFieldValues: Record<string, any> | null = currentDbCustomFieldValues || {};

  if (!customFieldsInput || customFieldsInput.length === 0) {
    // If no new input, return current values (could be null if nothing existed)
    return { finalCustomFieldValues: finalCustomFieldValues }; 
  }
  
  console.log('[dealCustomFields.processCustomFieldsForUpdate] Processing customFields input count:', customFieldsInput.length);
  const customFieldsToUpdate: Record<string, any> = {};

  for (const cfInput of customFieldsInput) {
    try {
      const definition = await getCustomFieldDefinitionById(supabaseClient, cfInput.definitionId);
      if (definition) {
        const fieldName = definition.fieldName;
        let valueToStore: any = null; // Default to null for updates, to allow clearing fields

        if ('stringValue' in cfInput) valueToStore = cfInput.stringValue;
        else if ('numberValue' in cfInput) valueToStore = cfInput.numberValue;
        else if ('booleanValue' in cfInput) valueToStore = cfInput.booleanValue;
        else if ('dateValue' in cfInput) valueToStore = cfInput.dateValue;
        else if ('selectedOptionValues' in cfInput) valueToStore = cfInput.selectedOptionValues;
        
        customFieldsToUpdate[fieldName] = valueToStore;
        console.log(`[dealCustomFields.processCustomFieldsForUpdate] Queuing update for custom field ${fieldName}:`, valueToStore);
      } else {
        console.warn(`[dealCustomFields.processCustomFieldsForUpdate] Custom field definition ${cfInput.definitionId} not found. Skipping.`);
      }
    } catch (defError: any) {
        console.error(`[dealCustomFields.processCustomFieldsForUpdate] Error fetching/processing definition ${cfInput.definitionId}:`, defError.message);
    }
  }
  
  finalCustomFieldValues = { ...(currentDbCustomFieldValues || {}), ...customFieldsToUpdate };
  console.log('[dealCustomFields.processCustomFieldsForUpdate] Merged custom_field_values:', JSON.stringify(finalCustomFieldValues, null, 2));
  
  return { finalCustomFieldValues };
}; 