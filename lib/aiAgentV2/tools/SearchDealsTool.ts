import { ToolResult, ToolExecutionContext } from '../types/tools';
import { GraphQLTool } from './GraphQLTool';
import { GraphQLClient } from '../../aiAgent/utils/GraphQLClient';  // Use V1's working GraphQLClient

export interface SearchDealsParameters {
  search_term?: string;
  assigned_to?: string;
  organization_id?: string;
  min_amount?: number;
  max_amount?: number;
  amount_min?: number;  // Support Claude's format
  amount_max?: number;  // Support Claude's format
  stage?: string;
  priority?: string;
  currency?: string;
  limit?: number;
  filters?: {           // Support Claude's nested format
    search_term?: string;
    assigned_to?: string;
    organization_id?: string;
    amount_min?: number;
    amount_max?: number;
    min_amount?: number;
    max_amount?: number;
    stage?: string;
    priority?: string;
    currency?: string;
  };
}

/**
 * V2 SearchDealsTool using V1's proven GraphQL pattern
 * This uses the EXACT same approach as V1's DealsModule.searchDeals
 */
export class SearchDealsTool extends GraphQLTool {
  protected name = 'search_deals';
  protected description = 'Search and filter deals using V1 proven GraphQL pattern';
  protected parameters = {
    type: 'object',
    properties: {
      search_term: { type: 'string', description: 'Search term for deal names' },
      amount_min: { type: 'number', description: 'Minimum deal amount' },
      amount_max: { type: 'number', description: 'Maximum deal amount' },
      organization_id: { type: 'string', description: 'Filter by organization ID' },
      assigned_to: { type: 'string', description: 'Filter by assigned user ID' },
      currency: { type: 'string', description: 'Filter by currency' },
      limit: { type: 'number', description: 'Maximum number of results', default: 50 },
      filters: {
        type: 'object',
        description: 'Nested filters object (Claude format)',
        properties: {
          amount_min: { type: 'number' },
          amount_max: { type: 'number' }
        }
      }
    }
  };
  protected requiredPermissions = ['deal:read_all'];

  private graphqlClient: GraphQLClient;

  constructor() {
    super();
    // Initialize V1's GraphQLClient with the same config as V1
    this.graphqlClient = new GraphQLClient({
      endpoint: process.env.GRAPHQL_ENDPOINT || 'http://localhost:8888/.netlify/functions/graphql',
      defaultTimeout: 120000,
      retryAttempts: 2,
      retryDelay: 1000
    });
  }

  async execute(
    parameters: SearchDealsParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();
    console.log('[SearchDealsTool V2] Starting execution with V1 pattern');
    console.log('[SearchDealsTool V2] Parameters:', JSON.stringify(parameters, null, 2));

    try {
      // Check authentication (same as V1)
      if (!context.userId || !context.authToken) {
        console.log('[SearchDealsTool V2] Authentication required');
        return this.createErrorResult(
          new Error('Authentication required'),
          parameters as Record<string, any>
        );
      }

      // Normalize parameters (handle Claude's nested format)
      const normalizedParams = this.normalizeParameters(parameters);
      console.log('[SearchDealsTool V2] Normalized params:', JSON.stringify(normalizedParams, null, 2));

      // Use the EXACT SAME GraphQL query as V1's DealsModule.searchDeals
      const query = `
        query GetDealsForAI {
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
            assigned_to_user_id
            person {
              id
              first_name
              last_name
              email
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
          }
        }
      `;

      console.log('[SearchDealsTool V2] Executing GraphQL query with V1 client...');

      // Use V1's GraphQLClient.execute method with authToken (EXACT same as V1)
      const result = await this.graphqlClient.execute(query, {}, context.authToken);
      
      console.log('[SearchDealsTool V2] GraphQL query completed, deals found:', result.deals?.length || 0);

      if (!result.deals) {
        console.log('[SearchDealsTool V2] No deals found in result');
        return this.createSuccessResult(
          [], 
          'No deals found', 
          parameters as Record<string, any>, 
          Date.now() - startTime
        );
      }

      // Apply filters (similar to V1's DealAdapter.applySearchFiltersToFullDeals)
      const filteredDeals = this.applyFilters(result.deals, normalizedParams);
      console.log('[SearchDealsTool V2] After filtering:', filteredDeals.length, 'deals');

      // Apply limit
      const limit = Math.min(normalizedParams.limit || 50, 100);
      const limitedDeals = filteredDeals.slice(0, limit);
      console.log('[SearchDealsTool V2] After limit:', limitedDeals.length, 'deals');

      const executionTime = Date.now() - startTime;
      const summary = this.formatResultSummary(limitedDeals, normalizedParams);

      console.log('[SearchDealsTool V2] Success! Summary:', summary);

      return {
        success: true,
        data: limitedDeals,
        message: summary,
        metadata: {
          executionTime,
          dataSourcesUsed: ['graphql_v1_pattern'],
          confidenceScore: 0.95
        },
      };

    } catch (error: any) {
      console.error('[SearchDealsTool V2] Error occurred:', error.message);
      console.error('[SearchDealsTool V2] Stack trace:', error.stack);
      return this.createErrorResult(error, parameters as Record<string, any>);
    }
  }

  /**
   * Normalize parameters to handle Claude's nested filters format
   */
  private normalizeParameters(parameters: SearchDealsParameters): SearchDealsParameters {
    if (parameters.filters) {
      const normalized = { ...parameters };
      
      // Merge filters into top-level parameters
      Object.entries(parameters.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          (normalized as any)[key] = value;
        }
      });
      
      // Handle both amount_min/amount_max and min_amount/max_amount
      if (parameters.filters.amount_min !== undefined) {
        normalized.amount_min = parameters.filters.amount_min;
      }
      if (parameters.filters.amount_max !== undefined) {
        normalized.amount_max = parameters.filters.amount_max;
      }
      
      return normalized;
    }
    
    return parameters;
  }

  /**
   * Apply filters to deals (similar to V1's DealAdapter.applySearchFiltersToFullDeals)
   */
  private applyFilters(deals: any[], params: SearchDealsParameters): any[] {
    let filtered = [...deals];

    // Apply amount filters
    if (params.amount_min || params.min_amount) {
      const minAmount = params.amount_min || params.min_amount || 0;
      filtered = filtered.filter(deal => deal.amount >= minAmount);
    }

    if (params.amount_max || params.max_amount) {
      const maxAmount = params.amount_max || params.max_amount || Infinity;
      filtered = filtered.filter(deal => deal.amount <= maxAmount);
    }

    // Apply search term filter
    if (params.search_term) {
      const searchTerm = params.search_term.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.name?.toLowerCase().includes(searchTerm) ||
        deal.id?.toString().toLowerCase().includes(searchTerm)
      );
    }

    // Apply assigned_to filter
    if (params.assigned_to) {
      filtered = filtered.filter(deal => deal.assigned_to_user_id === params.assigned_to);
    }

    // Apply organization_id filter
    if (params.organization_id) {
      filtered = filtered.filter(deal => deal.organization_id === params.organization_id);
    }

    // Apply currency filter
    if (params.currency) {
      filtered = filtered.filter(deal => deal.currency === params.currency);
    }

    return filtered;
  }

  /**
   * Format a summary of the search results
   */
  private formatResultSummary(deals: any[], params: SearchDealsParameters): string {
    const count = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    
    let summary = `Found ${count} deal${count !== 1 ? 's' : ''}`;
    
    const minAmount = params.amount_min || params.min_amount;
    if (minAmount !== undefined) {
      summary += ` worth more than $${minAmount.toLocaleString()}`;
    }
    
    if (count > 0) {
      summary += ` with total value of $${totalValue.toLocaleString()}`;
    }
    
    return summary;
  }
}