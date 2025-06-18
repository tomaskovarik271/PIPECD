import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface SearchOrganizationsParameters {
  search_term: string;
  limit?: number;
}

export interface OrganizationSearchResult {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deals_count?: number;
  people_count?: number;
}

export class SearchOrganizationsTool extends GraphQLTool {
  protected name = 'search_organizations';
  protected description = 'Search for organizations by name to find existing companies before creating deals or contacts. Always use this before creating new organizations to prevent duplicates.';
  
  protected parameters = {
    type: 'object',
    properties: {
      search_term: {
        type: 'string',
        description: 'Organization name or partial name to search for. Examples: "Acme", "Microsoft", "Google Inc"'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return. Default is 20.',
        default: 20
      }
    },
    required: ['search_term']
  };

  protected requiredPermissions = ['organization:read_any'];

  async execute(
    parameters: SearchOrganizationsParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Validate required parameters
      const validationErrors = this.validateRequiredParams(parameters, ['search_term']);
      if (validationErrors.length > 0) {
        return this.createErrorResult(
          new Error(validationErrors.join(', ')),
          parameters
        );
      }

      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to search organizations'),
          parameters
        );
      }

      // Sanitize search term
      const searchTerm = parameters.search_term.trim();
      if (searchTerm.length < 2) {
        return this.createErrorResult(
          new Error('Search term must be at least 2 characters long'),
          parameters
        );
      }

      const limit = Math.min(parameters.limit || 20, 100); // Cap at 100

      // Execute GraphQL query
      const query = `
        query SearchOrganizations($searchTerm: String!, $limit: Int!) {
          organizations {
            id
            name
            address
            notes
            created_at
            updated_at
            deals {
              id
            }
            people {
              id
            }
          }
        }
      `;

      const result = await this.executeGraphQL(query, {
        searchTerm: searchTerm,
        limit: limit
      }, context);

      // Filter results based on search term (would be done in GraphQL resolver in real implementation)
      const filteredOrganizations = this.filterOrganizations(
        result.organizations || [],
        searchTerm
      );

      // Limit results
      const limitedResults = filteredOrganizations.slice(0, limit);

      // Format results for AI agent
      const formattedResults: OrganizationSearchResult[] = limitedResults.map(org => ({
        id: org.id,
        name: org.name,
        address: org.address,
        notes: org.notes,
        created_at: org.created_at,
        updated_at: org.updated_at,
        deals_count: org.deals?.length || 0,
        people_count: org.people?.length || 0
      }));

      // Generate AI-friendly message
      const message = this.generateSearchResultMessage(formattedResults, searchTerm);

      return this.createSuccessResult(
        {
          organizations: formattedResults,
          total_found: formattedResults.length,
          search_term: searchTerm,
          search_suggestions: this.generateSearchSuggestions(formattedResults, searchTerm)
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
   * Filter organizations based on search term
   * In real implementation, this would be done in GraphQL resolver with database query
   */
  private filterOrganizations(organizations: any[], searchTerm: string): any[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return organizations.filter(org => {
      const name = (org.name || '').toLowerCase();
      const address = (org.address || '').toLowerCase();
      
      return name.includes(lowerSearchTerm) || 
             address.includes(lowerSearchTerm) ||
             name.startsWith(lowerSearchTerm) ||
             this.fuzzyMatch(name, lowerSearchTerm);
    });
  }

  /**
   * Simple fuzzy matching for organization names
   */
  private fuzzyMatch(text: string, search: string): boolean {
    // Remove common words and punctuation for better matching
    const cleanText = text.replace(/\b(inc|corp|corporation|ltd|llc|co|company)\b/g, '').replace(/[^\w\s]/g, '');
    const cleanSearch = search.replace(/\b(inc|corp|corporation|ltd|llc|co|company)\b/g, '').replace(/[^\w\s]/g, '');
    
    return cleanText.includes(cleanSearch) || cleanSearch.includes(cleanText);
  }

  /**
   * Generate AI-friendly search result message
   */
  private generateSearchResultMessage(
    results: OrganizationSearchResult[],
    searchTerm: string
  ): string {
    if (results.length === 0) {
      return `🔍 **No organizations found for "${searchTerm}"**

No existing organizations match your search. You may need to:
- Try a different search term or partial name
- Create a new organization if this is a new company
- Check spelling or try alternative company names

💡 **Next steps:**
- Use \`create_organization\` to add this as a new company
- Try searching with just the company name without "Inc", "Corp", etc.`;
    }

         if (results.length === 1) {
       const org = results[0]!;
       return `✅ **Found 1 organization matching "${searchTerm}"**

**${org.name}** (ID: ${org.id})
${org.address ? `📍 ${org.address}` : ''}
📊 ${org.deals_count} deals, ${org.people_count} contacts
🗓️ Created: ${new Date(org.created_at).toLocaleDateString()}

💡 **Use this organization ID** (\`${org.id}\`) when creating deals or contacts for ${org.name}.`;
    }

    const topResults = results.slice(0, 5);
    let message = `🔍 **Found ${results.length} organizations matching "${searchTerm}"**\n\n`;
    
    topResults.forEach((org, index) => {
      message += `**${index + 1}. ${org.name}** (ID: ${org.id})\n`;
      if (org.address) message += `   📍 ${org.address}\n`;
      message += `   📊 ${org.deals_count} deals, ${org.people_count} contacts\n\n`;
    });

    if (results.length > 5) {
      message += `... and ${results.length - 5} more organizations.\n\n`;
    }

    message += `💡 **Use the organization ID** when creating deals or contacts for the specific company.`;

    return message;
  }

  /**
   * Generate search suggestions for better results
   */
  private generateSearchSuggestions(
    results: OrganizationSearchResult[],
    searchTerm: string
  ): string[] {
    const suggestions: string[] = [];

    if (results.length === 0) {
      // Suggest variations when no results found
      const cleanTerm = searchTerm.replace(/\b(inc|corp|corporation|ltd|llc|co|company)\b/gi, '').trim();
      if (cleanTerm !== searchTerm) {
        suggestions.push(`Try searching for "${cleanTerm}" without company suffix`);
      }
      
      if (searchTerm.includes(' ')) {
        const words = searchTerm.split(' ');
        suggestions.push(`Try searching for "${words[0]}" (first word only)`);
      }
    } else if (results.length > 10) {
      // Suggest more specific search when too many results
      suggestions.push(`Try a more specific search term to narrow down results`);
      suggestions.push(`Include city or location if you know it`);
    }

    return suggestions;
  }
} 