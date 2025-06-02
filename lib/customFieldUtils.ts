import type { CustomFieldValueInput, CustomFieldEntityType } from './generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCustomFieldDefinitionsByIds, getCustomFieldDefinitionById } from './customFieldDefinitionService';

/**
 * Shared utility for processing custom field inputs for entity creation.
 * @param customFieldsInput Array of custom field value inputs.
 * @param supabaseClient Authenticated Supabase client instance.
 * @param entityType The entity type to validate against (PERSON, DEAL, ORGANIZATION).
 * @param useBulkFetch Whether to use bulk fetching for better performance (default: true).
 * @returns A record of custom field names to their values, or null if no valid custom fields processed.
 */
export const processCustomFieldsForCreate = async (
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient,
  entityType: CustomFieldEntityType,
  useBulkFetch: boolean = true
): Promise<Record<string, any> | null> => {
  if (!customFieldsInput || customFieldsInput.length === 0) {
    return null;
  }

  const dbCustomFieldValues: Record<string, any> = {};

  if (useBulkFetch) {
    // Use bulk fetching for better performance (deals pattern)
    const definitionIds = customFieldsInput.map(cf => cf.definitionId);
    let definitions = [];
    try {
      definitions = await getCustomFieldDefinitionsByIds(supabaseClient, definitionIds);
    } catch (defError: any) {
      console.error(`[customFieldUtils.processCustomFieldsForCreate] Error fetching definitions in bulk:`, defError.message);
      return null; // Return null if bulk fetch fails
    }

    const definitionsMap = new Map(definitions.map(def => [def.id, def]));

    for (const cfInput of customFieldsInput) {
      const definition = definitionsMap.get(cfInput.definitionId);
      if (definition && definition.entityType === entityType && definition.isActive) {
        const fieldName = definition.fieldName;
        const valueToStore = extractCustomFieldValue(cfInput);
        
        if (valueToStore !== undefined) {
          dbCustomFieldValues[fieldName] = valueToStore;
          console.log(`[customFieldUtils.processCustomFieldsForCreate] Storing for ${fieldName}:`, valueToStore);
        } else {
          console.log(`[customFieldUtils.processCustomFieldsForCreate] No value provided for custom field ${fieldName}, skipping.`);
        }
      } else if (definition && (definition.entityType !== entityType || !definition.isActive)) {
        console.warn(`[customFieldUtils.processCustomFieldsForCreate] Custom field definition ${cfInput.definitionId} (${definition.fieldName}) is not for ${entityType} or not active. Skipping.`);
      } else {
        console.warn(`[customFieldUtils.processCustomFieldsForCreate] Custom field definition ${cfInput.definitionId} not found. Skipping.`);
      }
    }
  } else {
    // Use individual fetching (person/organization pattern)
    for (const cfInput of customFieldsInput) {
      try {
        const definition = await getCustomFieldDefinitionById(supabaseClient, cfInput.definitionId);
        if (definition && definition.entityType === entityType && definition.isActive) {
          const fieldName = definition.fieldName;
          const valueToStore = extractCustomFieldValue(cfInput);
          
          if (valueToStore !== undefined) {
            dbCustomFieldValues[fieldName] = valueToStore;
          }
        } else if (definition && (definition.entityType !== entityType || !definition.isActive)) {
          console.warn(`[customFieldUtils.processCustomFieldsForCreate] Custom field definition ${cfInput.definitionId} (${definition.fieldName}) is not for ${entityType} or not active. Skipping.`);
        } else {
          console.warn(`[customFieldUtils.processCustomFieldsForCreate] Custom field definition ${cfInput.definitionId} not found. Skipping.`);
        }
      } catch (defError: any) {
        console.error(`[customFieldUtils.processCustomFieldsForCreate] Error fetching/processing definition ${cfInput.definitionId}:`, defError.message);
      }
    }
  }

  return Object.keys(dbCustomFieldValues).length > 0 ? dbCustomFieldValues : null;
};

/**
 * Shared utility for processing custom field inputs for entity updates.
 * @param currentDbCustomFieldValues The existing custom field values from the database.
 * @param customFieldsInput Array of custom field value inputs for update.
 * @param supabaseClient Authenticated Supabase client instance.
 * @param entityType The entity type to validate against (PERSON, DEAL, ORGANIZATION).
 * @param useBulkFetch Whether to use bulk fetching for better performance (default: true).
 * @returns An object containing the final custom field values to be stored in the database.
 */
export const processCustomFieldsForUpdate = async (
  currentDbCustomFieldValues: Record<string, any> | null,
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient,
  entityType: CustomFieldEntityType,
  useBulkFetch: boolean = true
): Promise<{ finalCustomFieldValues: Record<string, any> | null }> => {
  let finalCustomFieldValues: Record<string, any> | null = currentDbCustomFieldValues || {};

  if (!customFieldsInput || customFieldsInput.length === 0) {
    return { finalCustomFieldValues: finalCustomFieldValues }; 
  }
  
  const customFieldsToUpdate: Record<string, any> = {};

  if (useBulkFetch) {
    // Use bulk fetching for better performance (deals pattern)
    const definitionIds = customFieldsInput.map(cf => cf.definitionId);
    let definitions = [];
    try {
      definitions = await getCustomFieldDefinitionsByIds(supabaseClient, definitionIds);
    } catch (defError: any) {
      console.error(`[customFieldUtils.processCustomFieldsForUpdate] Error fetching definitions in bulk:`, defError.message);
      return { finalCustomFieldValues }; // Return current values if bulk fetch fails
    }

    const definitionsMap = new Map(definitions.map(def => [def.id, def]));

    for (const cfInput of customFieldsInput) {
      const definition = definitionsMap.get(cfInput.definitionId);
      if (definition && definition.entityType === entityType && definition.isActive) {
        const fieldName = definition.fieldName;
        const valueToStore = extractCustomFieldValueForUpdate(cfInput);
        
        customFieldsToUpdate[fieldName] = valueToStore;
        console.log(`[customFieldUtils.processCustomFieldsForUpdate] Queuing update for custom field ${fieldName}:`, valueToStore);
      } else if (definition && (definition.entityType !== entityType || !definition.isActive)) {
        console.warn(`[customFieldUtils.processCustomFieldsForUpdate] Custom field definition ${cfInput.definitionId} (${definition.fieldName}) is not for ${entityType} or not active. Skipping.`);
      } else {
        console.warn(`[customFieldUtils.processCustomFieldsForUpdate] Custom field definition ${cfInput.definitionId} not found. Skipping.`);
      }
    }
  } else {
    // Use individual fetching (person/organization pattern)
    for (const cfInput of customFieldsInput) {
      try {
        const definition = await getCustomFieldDefinitionById(supabaseClient, cfInput.definitionId);
        if (definition && definition.entityType === entityType && definition.isActive) {
          const fieldName = definition.fieldName;
          const valueToStore = extractCustomFieldValueForUpdate(cfInput);
          
          customFieldsToUpdate[fieldName] = valueToStore;
        } else if (definition && (definition.entityType !== entityType || !definition.isActive)) {
          console.warn(`[customFieldUtils.processCustomFieldsForUpdate] Custom field definition ${cfInput.definitionId} (${definition.fieldName}) is not for ${entityType} or not active. Skipping update for this field.`);
        } else {
          console.warn(`[customFieldUtils.processCustomFieldsForUpdate] Custom field definition ${cfInput.definitionId} not found. Skipping update for this field.`);
        }
      } catch (defError: any) {
        console.error(`[customFieldUtils.processCustomFieldsForUpdate] Error fetching/processing definition ${cfInput.definitionId}:`, defError.message);
      }
    }
  }
  
  finalCustomFieldValues = { ...(currentDbCustomFieldValues || {}), ...customFieldsToUpdate };
  
  return { finalCustomFieldValues };
};

/**
 * Extracts the value from a custom field input for creation (undefined values are skipped).
 */
function extractCustomFieldValue(cfInput: CustomFieldValueInput): any {
  if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
  if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
  if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
  if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
  if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
  return undefined;
}

/**
 * Extracts the value from a custom field input for updates (null values are allowed for clearing).
 */
function extractCustomFieldValueForUpdate(cfInput: CustomFieldValueInput): any {
  if ('stringValue' in cfInput) return cfInput.stringValue;
  if ('numberValue' in cfInput) return cfInput.numberValue;
  if ('booleanValue' in cfInput) return cfInput.booleanValue;
  if ('dateValue' in cfInput) return cfInput.dateValue;
  if ('selectedOptionValues' in cfInput) return cfInput.selectedOptionValues;
  return null;
} 