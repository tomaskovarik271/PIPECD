/**
 * Lead History Tracking
 * 
 * Tracks changes to lead entities for audit and history purposes
 * Follows exact patterns from dealHistory.ts
 */

import type { DbLead } from './leadCrud';

// Fields that should be tracked for changes
export const TRACKED_LEAD_FIELDS = [
  'name',
  'source',
  'description',
  'contact_name',
  'contact_email',
  'contact_phone',
  'company_name',
  'estimated_value',
  'estimated_close_date',
  'lead_score',
  'assigned_to_user_id',
  'custom_field_values'
] as const;

/**
 * Generate change tracking data for lead updates
 */
export function generateLeadChanges(
  oldLead: DbLead,
  newLead: DbLead
): Record<string, { from: any; to: any }> | null {
  const changes: Record<string, { from: any; to: any }> = {};

  for (const field of TRACKED_LEAD_FIELDS) {
    const oldValue = oldLead[field];
    const newValue = newLead[field];

    // Deep comparison for objects
    if (field === 'custom_field_values') {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[field] = { from: oldValue, to: newValue };
      }
      continue;
    }

    // Simple comparison for primitive values
    if (oldValue !== newValue) {
      changes[field] = { from: oldValue, to: newValue };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Format lead changes for human-readable history
 */
export function formatLeadChanges(changes: Record<string, { from: any; to: any }>): string[] {
  const descriptions: string[] = [];

  for (const [field, change] of Object.entries(changes)) {
    switch (field) {
      case 'name':
        descriptions.push(`Name changed from "${change.from}" to "${change.to}"`);
        break;
      case 'source':
        descriptions.push(`Source changed from "${change.from || 'None'}" to "${change.to || 'None'}"`);
        break;
      case 'contact_email':
        descriptions.push(`Contact email changed from "${change.from || 'None'}" to "${change.to || 'None'}"`);
        break;
      case 'contact_phone':
        descriptions.push(`Contact phone changed from "${change.from || 'None'}" to "${change.to || 'None'}"`);
        break;
      case 'company_name':
        descriptions.push(`Company changed from "${change.from || 'None'}" to "${change.to || 'None'}"`);
        break;
      case 'estimated_value':
        const oldValue = change.from ? `$${change.from.toLocaleString()}` : 'None';
        const newValue = change.to ? `$${change.to.toLocaleString()}` : 'None';
        descriptions.push(`Estimated value changed from ${oldValue} to ${newValue}`);
        break;
      case 'lead_score':
        descriptions.push(`Lead score changed from ${change.from || 0} to ${change.to || 0}`);
        break;
      case 'assigned_to_user_id':
        if (change.to && !change.from) {
          descriptions.push('Lead assigned to user');
        } else if (!change.to && change.from) {
          descriptions.push('Lead unassigned');
        } else {
          descriptions.push('Lead reassigned to different user');
        }
        break;
      default:
        descriptions.push(`${field} updated`);
    }
  }

  return descriptions;
} 