import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface SearchDealsParameters {
  search_term?: string;
  assigned_to?: string;
  organization_id?: string;
  min_amount?: number;
  max_amount?: number;
  stage?: string;
  priority?: string;
  currency?: string;
  limit?: number;
}

export interface DealSearchResult {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  expected_close_date?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  person_id?: string;
  organization_id?: string;
  user_id: string;
  assigned_to_user_id?: string;
  deal_specific_probability?: number;
  weighted_amount?: number;
  wfm_project_id?: string;
  organization?: {
    id: string;
    name: string;
  };
  person?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  assignedToUser?: {
    id: string;
    display_name?: string;
    email?: string;
  };
  currentWfmStep?: {
    id: string;
    stepOrder: number;
    isInitialStep: boolean;
    isFinalStep: boolean;
    status: {
      id: string;
      name: string;
      color: string;
    };
  };
  currentWfmStatus?: {
    id: string;
    name: string;
    color: string;
  };
}

export class SearchDealsTool extends GraphQLTool {
  protected name = 'search_deals';
  protected description = 'Search for existing deals in the CRM system. Use this to find deals by name, organization, amount, stage, or other criteria before creating new deals or when analyzing existing opportunities.';
  
  protected parameters = {
    type: 'object',
    properties: {
      search_term: {
        type: 'string',
        description: 'Search term to find deals by name or description. Examples: "Acme", "Software License", "Q2 2024"'
      },
      assigned_to: {
        type: 'string',
        description: 'User ID to filter deals by assigned user. Examples: "user_123"'
      },
      organization_id: {
        type: 'string',
        description: 'Organization ID to filter deals by company. Examples: "org_456"'
      },
      min_amount: {
        type: 'number',
        description: 'Minimum deal amount for filtering. Examples: 1000, 50000'
      },
      max_amount: {
        type: 'number',
        description: 'Maximum deal amount for filtering. Examples: 100000, 500000'
      },
      stage: {
        type: 'string',
        description: 'Deal stage ID to filter by. Use get_dropdown_data to see available stages.'
      },
      priority: {
        type: 'string',
        description: 'Deal priority to filter by. Examples: "HIGH", "MEDIUM", "LOW"'
      },
      currency: {
        type: 'string',
        description: 'Currency code to filter by. Examples: "USD", "EUR", "GBP"'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return. Default is 50.',
        default: 50
      }
    },
    required: []
  };

  protected requiredPermissions = ['deal:read_any', 'deal:read_own'];

  async execute(
    parameters: SearchDealsParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to search deals'),
          parameters
        );
      }

      const limit = Math.min(parameters.limit || 50, 100); // Cap at 100

      // Use the EXACT SAME GraphQL query as the frontend for consistency
      const query = `
        query SearchDeals {
          deals {
            id
            name
            amount
            currency
            expected_close_date
            created_at
            updated_at
            person_id
            organization_id
            project_id
            user_id
            assigned_to_user_id
            deal_specific_probability
            weighted_amount
            wfm_project_id
            person {
              id
              first_name
              last_name
              email
              phone
            }
            organization {
              id
              name
            }
            assignedToUser {
              id
              display_name
              email
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
            activities {
              id
              subject
              type
              is_done
              due_date
            }
            currentWfmStep {
              id
              stepOrder
              isInitialStep
              isFinalStep
              metadata
              status {
                id
                name
                color
              }
            }
            currentWfmStatus {
              id
              name
              color
            }
          }
        }
      `;

      const result = await this.executeGraphQL(query, {}, context);

      if (!result.deals) {
        return this.createSuccessResult(
          {
            deals: [],
            total_found: 0,
            filters_applied: parameters,
            search_suggestions: ['Try different search terms or remove filters']
          },
          '🔍 **No deals found**\n\nNo deals match your search criteria. Try adjusting your search terms or filters.',
          parameters,
          Date.now() - startTime
        );
      }

      // Apply client-side filtering (in real implementation, this would be done in GraphQL resolver)
      const filteredDeals = this.applyFilters(result.deals, parameters);

      // Limit results
      const limitedResults = filteredDeals.slice(0, limit);

      // Format results for AI agent
      const formattedResults: DealSearchResult[] = limitedResults.map(deal => ({
        id: deal.id,
        name: deal.name,
        amount: deal.amount,
        currency: deal.currency,
        expected_close_date: deal.expected_close_date,
        project_id: deal.project_id,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        person_id: deal.person_id,
        organization_id: deal.organization_id,
        user_id: deal.user_id,
        assigned_to_user_id: deal.assigned_to_user_id,
        deal_specific_probability: deal.deal_specific_probability,
        weighted_amount: deal.weighted_amount,
        wfm_project_id: deal.wfm_project_id,
        organization: deal.organization,
        person: deal.person,
        assignedToUser: deal.assignedToUser,
        currentWfmStep: deal.currentWfmStep,
        currentWfmStatus: deal.currentWfmStatus
      }));

      // Generate AI-friendly message
      const message = this.generateSearchResultMessage(formattedResults, parameters);

      return this.createSuccessResult(
        {
          deals: formattedResults,
          total_found: formattedResults.length,
          total_available: filteredDeals.length,
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
   * Apply search filters to deals (in real implementation, this would be in GraphQL resolver)
   */
  private applyFilters(deals: any[], parameters: SearchDealsParameters): any[] {
    let filtered = [...deals];

    // Search term filter
    if (parameters.search_term) {
      const searchTerm = parameters.search_term.toLowerCase();
      filtered = filtered.filter(deal => {
        const name = (deal.name || '').toLowerCase();
        const description = (deal.description || '').toLowerCase();
        const orgName = (deal.organization?.name || '').toLowerCase();
        
        return name.includes(searchTerm) ||
               description.includes(searchTerm) ||
               orgName.includes(searchTerm);
      });
    }

    // Organization filter
    if (parameters.organization_id) {
      filtered = filtered.filter(deal => deal.organization_id === parameters.organization_id);
    }

    // Assigned user filter
    if (parameters.assigned_to) {
      filtered = filtered.filter(deal => deal.assigned_to_user_id === parameters.assigned_to);
    }

    // Amount filters
    if (parameters.min_amount !== undefined) {
      filtered = filtered.filter(deal => (deal.amount || 0) >= parameters.min_amount!);
    }

    if (parameters.max_amount !== undefined) {
      filtered = filtered.filter(deal => (deal.amount || 0) <= parameters.max_amount!);
    }

    // Currency filter
    if (parameters.currency) {
      filtered = filtered.filter(deal => (deal.currency || 'USD') === parameters.currency);
    }

    return filtered;
  }

  /**
   * Generate AI-friendly search result message
   */
  private generateSearchResultMessage(
    results: DealSearchResult[],
    parameters: SearchDealsParameters
  ): string {
    if (results.length === 0) {
      return `🔍 **No deals found**

No deals match your search criteria. You may need to:
- Try different search terms
- Adjust amount filters
- Remove specific filters
- Check if deals exist in the system

💡 **Next steps:**
- Use \`create_deal\` if you need to create a new deal
- Try broader search terms
- Check organization and contact filters`;
    }

    let message = `🔍 **Found ${results.length} deal${results.length === 1 ? '' : 's'}**\n\n`;

    // Show applied filters
    const appliedFilters = this.getAppliedFiltersText(parameters);
    if (appliedFilters) {
      message += `**Filters applied:** ${appliedFilters}\n\n`;
    }

    // Show top results
    const topResults = results.slice(0, 5);
    topResults.forEach((deal, index) => {
      const amountStr = deal.amount ? 
        `💰 ${deal.currency || 'USD'} ${deal.amount.toLocaleString()}` : 
        '💰 Amount not set';
      
      const stageStr = deal.currentWfmStep ? 
        `📈 ${deal.currentWfmStep.status.name}` : 
        '📈 Stage not set';

      const assigneeStr = deal.assignedToUser ? 
        `👤 ${deal.assignedToUser.display_name || deal.assignedToUser.email}` : 
        '👤 Unassigned';

      message += `**${index + 1}. ${deal.name}** (ID: ${deal.id})\n`;
      message += `   🏢 ${deal.organization?.name || 'Unknown Organization'}\n`;
      if (deal.person) {
        message += `   👤 ${deal.person.first_name} ${deal.person.last_name}\n`;
      }
      message += `   ${amountStr}\n`;
      message += `   ${stageStr}\n`;
      message += `   ${assigneeStr}\n`;
      message += `   🗓️ Created: ${new Date(deal.created_at).toLocaleDateString()}\n\n`;
    });

    if (results.length > 5) {
      message += `... and ${results.length - 5} more deals.\n\n`;
    }

    message += `💡 **Use deal IDs** for \`get_deal_details\`, \`update_deal\`, or other deal operations.`;

    return message;
  }

  /**
   * Get text description of applied filters
   */
  private getAppliedFiltersText(parameters: SearchDealsParameters): string {
    const filters: string[] = [];

    if (parameters.search_term) {
      filters.push(`Search: "${parameters.search_term}"`);
    }
    if (parameters.min_amount || parameters.max_amount) {
      const min = parameters.min_amount ? `$${parameters.min_amount.toLocaleString()}` : '0';
      const max = parameters.max_amount ? `$${parameters.max_amount.toLocaleString()}` : '∞';
      filters.push(`Amount: ${min} - ${max}`);
    }
    if (parameters.currency) {
      filters.push(`Currency: ${parameters.currency}`);
    }

    return filters.join(', ');
  }

  /**
   * Generate search suggestions for better results
   */
  private generateSearchSuggestions(
    results: DealSearchResult[],
    parameters: SearchDealsParameters
  ): string[] {
    const suggestions: string[] = [];

    if (results.length === 0) {
      suggestions.push('Try removing some filters to see more results');
      suggestions.push('Check if the organization or contact exists in the system');
      if (parameters.search_term) {
        suggestions.push('Try partial names or different keywords');
      }
    } else if (results.length > 20) {
      suggestions.push('Add more specific filters to narrow down results');
      suggestions.push('Use organization_id or assigned_to filters');
    }

    if (parameters.min_amount || parameters.max_amount) {
      suggestions.push('Adjust amount range if results seem limited');
    }

    return suggestions;
  }
} 