/**
 * Lead Custom Fields Processing
 * 
 * Handles custom field validation, processing, and storage for leads
 * Follows exact patterns from dealCustomFields.ts
 */

import type { CustomFieldValueInput } from '../generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Process custom fields for lead creation
 */
export async function processCustomFieldsForCreate(
  customFields: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<Record<string, any>> {
  if (!customFields || customFields.length === 0) {
    return {};
  }

  const processedFields: Record<string, any> = {};

  for (const field of customFields) {
    if (!field.definitionId) continue;

    // Get field definition to validate type
    const { data: definition, error } = await supabaseClient
      .from('custom_field_definitions')
      .select('field_name, field_type, is_required')
      .eq('id', field.definitionId)
      .eq('entity_type', 'LEAD')
      .single();

    if (error || !definition) {
      console.warn(`Custom field definition not found: ${field.definitionId}`);
      continue;
    }

    // Process field value based on type
    let processedValue: any = null;
    
    switch (definition.field_type) {
      case 'TEXT':
      case 'TEXT_AREA':
        processedValue = field.stringValue || null;
        break;
      case 'NUMBER':
        processedValue = field.numberValue || null;
        break;
      case 'BOOLEAN':
        processedValue = field.booleanValue !== undefined ? field.booleanValue : null;
        break;
      case 'DATE':
        processedValue = field.dateValue || null;
        break;
      case 'DROPDOWN':
        processedValue = field.selectedOptionValues?.[0] || null;
        break;
      case 'MULTI_SELECT':
        processedValue = field.selectedOptionValues || [];
        break;
      default:
        processedValue = field.stringValue || null;
    }

    // Validate required fields
    if (definition.is_required && (processedValue === null || processedValue === undefined)) {
      throw new Error(`Required custom field '${definition.field_name}' is missing`);
    }

    processedFields[definition.field_name] = processedValue;
  }

  return processedFields;
}

/**
 * Process custom fields for lead updates
 */
export async function processCustomFieldsForUpdate(
  customFields: CustomFieldValueInput[],
  supabaseClient: SupabaseClient
): Promise<Record<string, any>> {
  return processCustomFieldsForCreate(customFields, supabaseClient);
} 