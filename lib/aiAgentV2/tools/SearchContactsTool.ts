import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface SearchContactsParameters {
  search_term?: string;
  organization_id?: string;
  email?: string;
  phone?: string;
  limit?: number;
}

export interface ContactSearchResult {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
  };
  deals?: Array<{
    id: string;
    name: string;
    amount?: number;
  }>;
}

export class SearchContactsTool extends GraphQLTool {
  protected name = 'search_contacts';
  protected description = 'Search for existing contacts/people in the CRM system. Use this to find contacts by name, email, phone, or organization before creating new contacts or when looking for deal contacts.';
  
  protected parameters = {
    type: 'object',
    properties: {
      search_term: {
        type: 'string',
        description: 'Search term to find contacts by name. Examples: "John Smith", "Sarah", "Johnson"'
      },
      organization_id: {
        type: 'string',
        description: 'Organization ID to filter contacts by company. Examples: "org_456"'
      },
      email: {
        type: 'string',
        description: 'Email address to search for specific contact. Examples: "john@example.com"'
      },
      phone: {
        type: 'string',
        description: 'Phone number to search for specific contact. Examples: "+1234567890", "555-1234"'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return. Default is 30.',
        default: 30
      }
    },
    required: []
  };

  protected requiredPermissions = ['person:read_any'];

  async execute(
    parameters: SearchContactsParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to search contacts'),
          parameters
        );
      }

      const limit = Math.min(parameters.limit || 30, 100); // Cap at 100

      // Use the same GraphQL query structure as frontend
      const query = `
        query SearchContacts {
          people {
            id
            first_name
            last_name
            email
            phone
            notes
            created_at
            updated_at
            organization_id
            organization {
              id
              name
            }
            deals {
              id
              name
              amount
            }
            customFieldValues {
              stringValue
              numberValue
              booleanValue
              dateValue
              selectedOptionValues
              definition {
                id
                fieldName
                fieldLabel
                fieldType
              }
            }
          }
        }
      `;

      const result = await this.executeGraphQL(query, {}, context);

      if (!result.people) {
        return this.createSuccessResult(
          {
            contacts: [],
            total_found: 0,
            filters_applied: parameters,
            search_suggestions: ['Try different search terms or check if contacts exist']
          },
          '🔍 **No contacts found**\n\nNo contacts match your search criteria. Try adjusting your search terms.',
          parameters,
          Date.now() - startTime
        );
      }

      // Apply client-side filtering
      const filteredContacts = this.applyFilters(result.people, parameters);

      // Limit results
      const limitedResults = filteredContacts.slice(0, limit);

      // Format results for AI agent
      const formattedResults: ContactSearchResult[] = limitedResults.map(person => ({
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        phone: person.phone,
        notes: person.notes,
        created_at: person.created_at,
        updated_at: person.updated_at,
        organization_id: person.organization_id,
        organization: person.organization,
        deals: person.deals
      }));

      // Generate AI-friendly message
      const message = this.generateSearchResultMessage(formattedResults, parameters);

      return this.createSuccessResult(
        {
          contacts: formattedResults,
          total_found: formattedResults.length,
          total_available: filteredContacts.length,
          filters_applied: parameters,
          search_suggestions: this.generateSearchSuggestions(formattedResults, parameters)
        },
        message,
        parameters,
        Date.now() - startTime
      );

    } catch (error: any) {
      return this.createErrorResult(error, parameters);
    }
  }

  /**
   * Apply search filters to contacts
   */
  private applyFilters(people: any[], parameters: SearchContactsParameters): any[] {
    let filtered = [...people];

    // Search term filter (name search)
    if (parameters.search_term) {
      const searchTerm = parameters.search_term.toLowerCase();
      filtered = filtered.filter(person => {
        const firstName = (person.first_name || '').toLowerCase();
        const lastName = (person.last_name || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = (person.email || '').toLowerCase();
        
        return firstName.includes(searchTerm) ||
               lastName.includes(searchTerm) ||
               fullName.includes(searchTerm) ||
               email.includes(searchTerm);
      });
    }

    // Organization filter
    if (parameters.organization_id) {
      filtered = filtered.filter(person => person.organization_id === parameters.organization_id);
    }

    // Email filter (exact match)
    if (parameters.email) {
      const emailSearch = parameters.email.toLowerCase();
      filtered = filtered.filter(person => 
        (person.email || '').toLowerCase() === emailSearch ||
        (person.email || '').toLowerCase().includes(emailSearch)
      );
    }

    // Phone filter (flexible matching)
    if (parameters.phone) {
      const phoneSearch = parameters.phone.replace(/\D/g, ''); // Remove non-digits
      filtered = filtered.filter(person => {
        const personPhone = (person.phone || '').replace(/\D/g, '');
        return personPhone.includes(phoneSearch) || phoneSearch.includes(personPhone);
      });
    }

    return filtered;
  }

  /**
   * Generate AI-friendly search result message
   */
  private generateSearchResultMessage(
    results: ContactSearchResult[],
    parameters: SearchContactsParameters
  ): string {
    if (results.length === 0) {
      return `🔍 **No contacts found**

No contacts match your search criteria. You may need to:
- Try different search terms or partial names
- Check spelling of names or email addresses
- Remove specific filters
- Check if the contact exists in the system

💡 **Next steps:**
- Use \`create_contact\` to add a new contact
- Try searching by organization instead
- Use partial names or email domains`;
    }

    let message = `🔍 **Found ${results.length} contact${results.length === 1 ? '' : 's'}**\n\n`;

    // Show applied filters
    const appliedFilters = this.getAppliedFiltersText(parameters);
    if (appliedFilters) {
      message += `**Filters applied:** ${appliedFilters}\n\n`;
    }

    // Show top results
    const topResults = results.slice(0, 5);
    topResults.forEach((contact, index) => {
      const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'No name';
      
      message += `**${index + 1}. ${fullName}** (ID: ${contact.id})\n`;
      
      if (contact.email) {
        message += `   📧 ${contact.email}\n`;
      }
      
      if (contact.phone) {
        message += `   📞 ${contact.phone}\n`;
      }
      
      if (contact.organization) {
        message += `   🏢 ${contact.organization.name}\n`;
      }
      
      if (contact.deals && contact.deals.length > 0) {
        message += `   💼 ${contact.deals.length} deal${contact.deals.length === 1 ? '' : 's'}\n`;
      }
      
      message += `   🗓️ Created: ${new Date(contact.created_at).toLocaleDateString()}\n\n`;
    });

    if (results.length > 5) {
      message += `... and ${results.length - 5} more contacts.\n\n`;
    }

    message += `💡 **Use contact IDs** for \`create_deal\`, \`get_contact_details\`, or other contact operations.`;

    return message;
  }

  /**
   * Get text description of applied filters
   */
  private getAppliedFiltersText(parameters: SearchContactsParameters): string {
    const filters: string[] = [];

    if (parameters.search_term) {
      filters.push(`Name: "${parameters.search_term}"`);
    }
    if (parameters.email) {
      filters.push(`Email: "${parameters.email}"`);
    }
    if (parameters.phone) {
      filters.push(`Phone: "${parameters.phone}"`);
    }
    if (parameters.organization_id) {
      filters.push(`Organization ID: ${parameters.organization_id}`);
    }

    return filters.join(', ');
  }

  /**
   * Generate search suggestions for better results
   */
  private generateSearchSuggestions(
    results: ContactSearchResult[],
    parameters: SearchContactsParameters
  ): string[] {
    const suggestions: string[] = [];

    if (results.length === 0) {
      suggestions.push('Try partial names instead of full names');
      suggestions.push('Search by email domain (e.g., "@company.com")');
      suggestions.push('Remove specific filters to see more results');
      if (parameters.search_term) {
        suggestions.push('Try first name or last name separately');
      }
    } else if (results.length > 15) {
      suggestions.push('Add organization filter to narrow down results');
      suggestions.push('Use more specific search terms');
    }

    if (parameters.organization_id) {
      suggestions.push('Try searching without organization filter');
    }

    return suggestions;
  }
} 