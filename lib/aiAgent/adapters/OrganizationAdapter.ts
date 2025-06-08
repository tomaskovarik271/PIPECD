/**
 * Organization Adapter for PipeCD AI Agent
 * 
 * Converts between AI Agent organization tool parameters and
 * existing PipeCD organizationService interface
 */

import type { Organization, OrganizationInput } from '../../generated/graphql';
import type { ToolResult } from '../types/tools';
import { BaseAdapter } from './BaseAdapter';

// AI Agent parameter types
export interface AIOrganizationSearchParams {
  search_term?: string;
  industry?: string;
  size?: string;
  limit?: number;
}

export interface AICreateOrganizationParams {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  notes?: string;
  custom_fields?: Array<{
    definitionId: string;
    stringValue?: string;
    numberValue?: number;
    booleanValue?: boolean;
    dateValue?: string;
    selectedOptionValues?: string[];
  }>;
}

export interface AIUpdateOrganizationParams {
  organization_id: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  notes?: string;
  custom_fields?: Array<{
    definitionId: string;
    stringValue?: string;
    numberValue?: number;
    booleanValue?: boolean;
    dateValue?: string;
    selectedOptionValues?: string[];
  }>;
}

export class OrganizationAdapter extends BaseAdapter {
  /**
   * Convert AI create organization parameters to OrganizationInput for organizationService
   */
  static toOrganizationInput(params: AICreateOrganizationParams): OrganizationInput {
    return this.cleanInput({
      name: params.name,
      address: params.address,
      notes: params.notes || params.description, // Map description to notes
      customFields: params.custom_fields?.map(cf => ({
        definitionId: cf.definitionId,
        stringValue: cf.stringValue,
        numberValue: cf.numberValue,
        booleanValue: cf.booleanValue,
        dateValue: cf.dateValue ? new Date(cf.dateValue) : undefined,
        selectedOptionValues: cf.selectedOptionValues,
      })),
    }) as OrganizationInput;
  }

  /**
   * Convert AI search parameters to service filters and apply filtering
   */
  static applySearchFilters(organizations: Organization[], params: AIOrganizationSearchParams): Organization[] {
    const { limit = 20 } = params;

    const filterMappings = {
      search_term: (org: Organization, term: string) => {
        const searchTerm = term.toLowerCase();
        return (
          org.name?.toLowerCase().includes(searchTerm) ||
          org.address?.toLowerCase().includes(searchTerm) ||
          false
        );
      },
      industry: (_org: Organization, _industry: string) => {
        // Since industry is in custom fields, we'd need to check custom_field_values
        // For now, just return true as we don't have direct industry field
        return true;
      },
      size: (_org: Organization, _size: string) => {
        // Similar to industry, would need custom field checking
        return true;
      },
    };

    const filtered = this.applyFilters(organizations, params, filterMappings);

    // Sort by updated_at desc and limit
    filtered.sort((a: Organization, b: Organization) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return filtered.slice(0, limit);
  }

  /**
   * Format organization search results for AI display
   */
  static formatOrganizationList(organizations: Organization[]): string {
    const orgList = organizations.map((org: Organization) => {
      return `• **${org.name}** - ${org.address || 'No address listed'}
ID: ${org.id}`;
    }).join('\n');

    return `✅ Found ${organizations.length} organizations\n\n${orgList}`;
  }

  /**
   * Format organization details for AI display
   */
  static formatOrganizationDetails(org: Organization): string {
    const addressInfo = org.address ? `\n- **Address:** ${org.address}` : '';
    const notesInfo = org.notes ? `\n- **Notes:** ${org.notes}` : '';
    
    // Handle people field (can be null, undefined, or array)
    const peopleArray = Array.isArray(org.people) ? org.people : [];
    const peopleCount = peopleArray.length;

    return `✅ **Organization Details**

**${org.name}**${addressInfo}${notesInfo}
- **Created:** ${new Date(org.created_at).toLocaleDateString()}
- **Last Updated:** ${new Date(org.updated_at).toLocaleDateString()}
- **Associated Contacts:** ${peopleCount}
- **Organization ID:** ${org.id}`;
  }

  /**
   * Format organization creation success message
   */
  static formatCreationSuccess(org: Organization): string {
    const addressInfo = org.address ? ` at ${org.address}` : '';
    
    return `✅ **Organization Created Successfully!**

**${org.name}**${addressInfo}
- **Organization ID:** ${org.id}
- **Created:** ${new Date(org.created_at).toLocaleDateString()}

The organization is now available for linking to contacts and deals.`;
  }

  /**
   * Create an error result for AI tools
   */
  static createErrorResult(
    toolName: string,
    error: unknown,
    parameters: Record<string, any>
  ): ToolResult {
    return super.createErrorResult(toolName, error, parameters);
  }
} 