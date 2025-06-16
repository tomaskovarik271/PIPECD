/**
 * Lead Custom Fields Processing
 * 
 * Now uses the shared optimized custom field utilities for better performance
 */

import { processCustomFieldsForCreate as sharedProcessCreate, processCustomFieldsForUpdate as sharedProcessUpdate } from '../customFieldUtils';
import { CustomFieldEntityType } from '../generated/graphql';
import type { CustomFieldValueInput } from '../generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Process custom fields for lead creation - now uses optimized bulk fetch
 */
export async function processCustomFieldsForCreate(
  customFields: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<Record<string, any> | null> {
  return await sharedProcessCreate(
    customFields,
    supabaseClient,
    CustomFieldEntityType.Lead,
    true // Enable bulk fetch for performance
  );
}

/**
 * Process custom fields for lead updates - now uses optimized bulk fetch
 */
export async function processCustomFieldsForUpdate(
  existingCustomFields: Record<string, any> | null,
  customFields: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<{ finalCustomFieldValues: Record<string, any> | null }> {
  return await sharedProcessUpdate(
    existingCustomFields,
    customFields,
    supabaseClient,
    CustomFieldEntityType.Lead,
    true // Enable bulk fetch for performance
  );
} 