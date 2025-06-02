/**
 * Person Adapter for PipeCD AI Agent
 * 
 * Converts between AI Agent contact/person tool parameters and
 * existing PipeCD personService interface
 */

import type { Person, PersonInput } from '../../generated/graphql';
import type { ToolResult } from '../types/tools';
import { BaseAdapter } from './BaseAdapter';

// AI Agent parameter types
export interface AIContactSearchParams {
  search_term?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  organization_id?: string;
  limit?: number;
}

export interface AICreateContactParams {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string; // Not used in personService but included for compatibility
  organization_id?: string;
  custom_fields?: Array<{
    definitionId: string;
    stringValue?: string;
    numberValue?: number;
    booleanValue?: boolean;
    dateValue?: string;
    selectedOptionValues?: string[];
  }>;
}

export interface AIUpdateContactParams {
  contact_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string; // Not used in personService but included for compatibility
  organization_id?: string;
}

export class PersonAdapter extends BaseAdapter {
  /**
   * Convert AI search parameters to service filters and apply filtering
   */
  static applySearchFilters(people: Person[], params: AIContactSearchParams): Person[] {
    const { limit = 20 } = params;

    const filterMappings = {
      search_term: (person: Person, term: string) => {
        const searchTerm = term.toLowerCase();
        return (
          person.first_name?.toLowerCase().includes(searchTerm) ||
          person.last_name?.toLowerCase().includes(searchTerm) ||
          person.email?.toLowerCase().includes(searchTerm) ||
          false
        );
      },
      first_name: (person: Person, name: string) =>
        person.first_name?.toLowerCase().includes(name.toLowerCase()) || false,
      last_name: (person: Person, name: string) =>
        person.last_name?.toLowerCase().includes(name.toLowerCase()) || false,
      email: (person: Person, emailSearch: string) =>
        person.email?.toLowerCase().includes(emailSearch.toLowerCase()) || false,
      organization_id: (person: Person, orgId: string) =>
        person.organization_id === orgId,
    };

    const filtered = this.applyFilters(people, params, filterMappings);
    return this.sortAndLimit(filtered, 'updated_at', limit, false);
  }

  /**
   * Convert AI create contact parameters to PersonInput for personService
   */
  static toPersonInput(params: AICreateContactParams): PersonInput {
    return this.cleanInput({
      first_name: params.first_name,
      last_name: params.last_name,
      email: params.email,
      phone: params.phone,
      organization_id: params.organization_id,
      customFields: params.custom_fields?.map(cf => ({
        definitionId: cf.definitionId,
        stringValue: cf.stringValue,
        numberValue: cf.numberValue,
        booleanValue: cf.booleanValue,
        dateValue: cf.dateValue ? new Date(cf.dateValue) : undefined,
        selectedOptionValues: cf.selectedOptionValues,
      })),
    }) as PersonInput;
  }

  /**
   * Convert AI update contact parameters to PersonInput for personService
   */
  static toPersonUpdateInput(params: AIUpdateContactParams): Partial<PersonInput> {
    return this.cleanInput({
      first_name: params.first_name,
      last_name: params.last_name,
      email: params.email,
      phone: params.phone,
      organization_id: params.organization_id,
    });
  }

  /**
   * Format a list of Person records for AI response
   */
  static formatContactsList(people: Person[], searchTerm?: string): string {
    const contactList = people.map((person: Person) => {
      const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
      
      // Try to get organization info from populated relationship or organization_id
      let orgInfo = '';
      if ((person as any).organization?.name) {
        orgInfo = ` at ${(person as any).organization.name}`;
      } else if (person.organization_id) {
        orgInfo = ` (Org: ${person.organization_id.substring(0, 8)}...)`;
      }
      
      return `• **${name}** - ${person.email || 'No email'}${orgInfo}`;
    }).join('\n');

    return `✅ Found ${people.length} contact${people.length === 1 ? '' : 's'}${searchTerm ? ` matching "${searchTerm}"` : ''}\n\n${contactList}`;
  }

  /**
   * Format a single Person record for AI response
   */
  static formatContactDetails(person: Person): string {
    const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
    
    // Try to get organization name from populated relationship, fallback to organization_id
    let orgDisplay = 'None';
    if ((person as any).organization?.name) {
      orgDisplay = (person as any).organization.name;
    } else if (person.organization_id) {
      orgDisplay = `Linked (ID: ${person.organization_id})`;
    }
    
    return `✅ Contact details retrieved

**Contact Information:**
- **Name:** ${name}
- **Email:** ${person.email || 'Not provided'}
- **Phone:** ${person.phone || 'Not provided'}
- **Organization:** ${orgDisplay}
- **Notes:** ${person.notes || 'None'}
- **Created:** ${new Date(person.created_at).toLocaleDateString()}
- **Last Updated:** ${new Date(person.updated_at).toLocaleDateString()}
- **Contact ID:** ${person.id}`;
  }

  /**
   * Format contact creation success for AI response
   */
  static formatContactCreated(person: Person): string {
    const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
    
    // Try to get organization name from populated relationship, fallback to organization_id
    let orgDisplay = 'None';
    if ((person as any).organization?.name) {
      orgDisplay = (person as any).organization.name;
    } else if (person.organization_id) {
      orgDisplay = `Linked (ID: ${person.organization_id})`;
    }
    
    return `✅ Contact created successfully!

**Contact Details:**
- **Name:** ${name}
- **Email:** ${person.email || 'Not provided'}
- **Phone:** ${person.phone || 'Not provided'}
- **Organization:** ${orgDisplay}
- **Created:** ${new Date(person.created_at).toLocaleDateString()}
- **Contact ID:** ${person.id}`;
  }

  /**
   * Format contact update success for AI response
   */
  static formatContactUpdated(person: Person): string {
    const name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
    
    return `✅ Contact updated successfully!

**Updated Contact:**
- **Name:** ${name}
- **Email:** ${person.email || 'Not provided'}
- **Phone:** ${person.phone || 'Not provided'}
- **Last Updated:** ${new Date(person.updated_at).toLocaleDateString()}
- **Contact ID:** ${person.id}`;
  }

  /**
   * Create a successful search result
   */
  static createSearchResult(
    people: Person[],
    params: AIContactSearchParams
  ): ToolResult {
    return this.createSuccessResult(
      'search_contacts',
      this.formatContactsList(people, params.search_term),
      people,
      params
    );
  }

  /**
   * Create a successful create result
   */
  static createCreateResult(
    person: Person,
    params: AICreateContactParams
  ): ToolResult {
    return this.createSuccessResult(
      'create_contact',
      this.formatContactCreated(person),
      person,
      params
    );
  }

  /**
   * Create a successful update result
   */
  static createUpdateResult(
    person: Person,
    params: AIUpdateContactParams
  ): ToolResult {
    return this.createSuccessResult(
      'update_contact',
      this.formatContactUpdated(person),
      person,
      params
    );
  }

  /**
   * Create a successful details result
   */
  static createDetailsResult(
    person: Person,
    params: { contact_id: string }
  ): ToolResult {
    return this.createSuccessResult(
      'get_contact_details',
      this.formatContactDetails(person),
      person,
      params
    );
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