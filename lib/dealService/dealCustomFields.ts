import type { CustomFieldValueInput } from '../generated/graphql';
import { CustomFieldEntityType } from '../generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';
import { processCustomFieldsForCreate as sharedProcessCreate, processCustomFieldsForUpdate as sharedProcessUpdate } from '../customFieldUtils';

/**
 * Processes custom field inputs for deal creation.
 * @param customFieldsInput Array of custom field value inputs.
 * @param supabaseClient Authenticated Supabase client instance.
 * @returns A record of custom field names to their values, or empty object if no valid custom fields processed.
 */
export const processCustomFieldsForCreate = async (
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<Record<string, any>> => {
  const result = await sharedProcessCreate(customFieldsInput, supabaseClient, CustomFieldEntityType.Deal, true);
  return result || {};
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
  return await sharedProcessUpdate(currentDbCustomFieldValues, customFieldsInput, supabaseClient, CustomFieldEntityType.Deal, true);
}; 