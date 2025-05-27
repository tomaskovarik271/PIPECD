import type { Deal } from '../generated/graphql';
import { diff, Diff } from 'deep-diff';

// Define which fields are tracked for history purposes.
// Add 'custom_field_values' as it's a special case handled in diffing.
export const TRACKED_DEAL_FIELDS: (keyof Deal | 'custom_field_values' | 'assigned_to_user_id')[] = [
  'name', 
  'amount', 
  'expected_close_date', 
  'person_id', 
  'organization_id', 
  'deal_specific_probability',
  'custom_field_values',
  'assigned_to_user_id' // Added for tracking assignment changes
];

/**
 * Generates a structured diff of changes between old and new deal data.
 * @param oldDealData The original deal data.
 * @param updatedDealData The new deal data after updates.
 * @returns A record of actual changes, or an empty object if no tracked changes are found.
 */
export const generateDealChanges = (
  oldDealData: Deal, 
  updatedDealData: Deal
): Record<string, { oldValue: any; newValue: any }> => {
  const oldDealForDiff = oldDealData as any; // Cast to handle custom_field_values
  const updatedDealForDiff = updatedDealData as any; // Cast to handle custom_field_values

  const differences: Diff<any, any>[] | undefined = diff(oldDealForDiff, updatedDealForDiff);
  const actualChanges: Record<string, { oldValue: any; newValue: any }> = {};

  if (differences) {
    differences.forEach(d => {
      if (d.path && d.path.length > 0) {
        const key = d.path[0] as keyof Deal | 'custom_field_values';
        
        if (TRACKED_DEAL_FIELDS.includes(key)) {
          if (key === 'custom_field_values') {
            // Handle changes within the custom_field_values JSON object
            if (d.path.length === 2) { // e.g., ['custom_field_values', 'fieldName']
              const customFieldName = d.path[1] as string;
              const oldValue = oldDealForDiff.custom_field_values ? oldDealForDiff.custom_field_values[customFieldName] : undefined;
              const newValue = updatedDealForDiff.custom_field_values ? updatedDealForDiff.custom_field_values[customFieldName] : undefined;
              
              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                actualChanges[`custom_field_values.${customFieldName}`] = { oldValue, newValue };
              }
            } else if (d.kind === 'A' && d.item && d.item.kind) { 
              // This handles changes to array elements within custom_field_values (e.g. for MULTI_SELECT)
              // For simplicity, we'll record the whole custom_field_values object if an array within it changes.
              const fullOldCFValues = oldDealForDiff.custom_field_values || {};
              const fullNewCFValues = updatedDealForDiff.custom_field_values || {};
              if (JSON.stringify(fullOldCFValues) !== JSON.stringify(fullNewCFValues) && !actualChanges['custom_field_values']) { // Avoid overwriting granular changes if already recorded
                  actualChanges['custom_field_values'] = { oldValue: fullOldCFValues, newValue: fullNewCFValues };
              }
            } else if (d.kind === 'N' || d.kind === 'D' || d.kind === 'E') {
              // This handles cases where the entire custom_field_values object is new, deleted, or edited 
              // Or a top-level key within custom_field_values is added/deleted/edited.
               const fullOldCFValues = oldDealForDiff.custom_field_values || {};
               const fullNewCFValues = updatedDealForDiff.custom_field_values || {};
               if (JSON.stringify(fullOldCFValues) !== JSON.stringify(fullNewCFValues)) {
                  actualChanges['custom_field_values'] = { oldValue: fullOldCFValues, newValue: fullNewCFValues };
               }
            }
          } else {
            // Standard flat field change
            const oldValue = oldDealForDiff[key];
            const newValue = updatedDealForDiff[key];
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
              actualChanges[key as string] = { oldValue, newValue };
            }
          }
        }
      }
    });
  }
  return actualChanges;
}; 