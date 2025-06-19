/**
 * Search Deals Tool for AI Agent V2
 * Uses existing dealService for data access instead of circular GraphQL calls
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { dealService } from '../../dealService';

export interface SearchDealsInput {
  search_term?: string;
  assigned_to?: string; 
  min_amount?: number;
  max_amount?: number;
  stage?: string;
  limit?: number;
}

export interface SearchDealsResult {
  deals: any[];
  total_count: number;
  filters_applied: SearchDealsInput;
  message: string;
}

export class SearchDealsTool implements ToolExecutor {
  private supabaseClient: SupabaseClient;
  private conversationId: string;

  constructor(supabaseClient: SupabaseClient, conversationId: string) {
    this.supabaseClient = supabaseClient;
    this.conversationId = conversationId;
  }

  static definition: ToolDefinition = {
    name: 'search_deals',
    description: 'Search and filter deals in the CRM system. Use this when users ask about finding deals, checking deal status, analyzing deal pipelines, or getting deal overviews. Essential for understanding the current deal landscape before taking actions.',
    input_schema: {
      type: 'object',
      properties: {
        search_term: { 
          type: 'string', 
          description: 'Search term to filter deals by name, description, or organization name. Supports partial matching. Leave empty to get all deals. Examples: "Acme Corp", "Q1 2024", "Enterprise License"'
        },
        assigned_to: { 
          type: 'string', 
          description: 'User ID, email, or display name to filter deals assigned to specific person. Use "current_user" for deals assigned to the authenticated user. Examples: "current_user", "user_123", "john.doe@company.com", "John Smith"'
        },
        min_amount: { 
          type: 'number', 
          description: 'Minimum deal value. Use for queries like "deals over $10k" or "high-value opportunities". Examples: 1000, 10000, 50000'
        },
        max_amount: { 
          type: 'number', 
          description: 'Maximum deal value. Use for queries like "small deals under $5k". Examples: 5000, 25000, 100000'
        },
        stage: {
          type: 'string',
          description: 'Deal stage/status to filter by. Common stages: "Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost". Examples: "Prospecting", "Proposal", "Closed Won"'
        },
        limit: { 
          type: 'number', 
          description: 'Maximum number of deals to return. Default is 20. Use higher values for comprehensive analysis. Examples: 10, 50, 100',
          default: 20
        }
      }
    }
  };

  async execute(input: SearchDealsInput, context?: ToolExecutionContext): Promise<SearchDealsResult> {
    try {
      // Check for authentication
      if (!context?.authToken || !context?.userId) {
        throw new Error('Authentication required - please log in to search deals');
      }
      
      // Use existing dealService to get deals data directly (avoids circular GraphQL calls)
      console.log('🔍 SearchDealsTool: Calling dealService.getDeals for user:', context.userId);
      const deals = await dealService.getDeals(context.userId, context.authToken);
      console.log('🔍 SearchDealsTool: Got deals from service:', deals?.length || 0, 'deals');

      if (!deals || deals.length === 0) {
        console.log('🔍 SearchDealsTool: No deals found, returning empty result');
        return {
          deals: [],
          total_count: 0,
          filters_applied: input,
          message: "No deals found in the system."
        };
      }

      let filteredDeals = deals;

      // Apply search filters
      if (input.search_term) {
        const searchTerm = input.search_term.toLowerCase();
        filteredDeals = filteredDeals.filter((deal: any) => 
          deal.name?.toLowerCase().includes(searchTerm) ||
          deal.description?.toLowerCase().includes(searchTerm) ||
          deal.organization?.name?.toLowerCase().includes(searchTerm) ||
          deal.person?.first_name?.toLowerCase().includes(searchTerm) ||
          deal.person?.last_name?.toLowerCase().includes(searchTerm)
        );
      }

      if (input.assigned_to) {
        // Handle special case of "current_user" - convert to actual user ID
        let targetUserId = input.assigned_to;
        if (input.assigned_to === "current_user" && context?.userId) {
          targetUserId = context.userId;
        }
        
        const assignedTo = targetUserId.toLowerCase();
        filteredDeals = filteredDeals.filter((deal: any) => 
          deal.assignedToUser?.id === targetUserId ||
          deal.assignedToUser?.email?.toLowerCase().includes(assignedTo) ||
          deal.assignedToUser?.display_name?.toLowerCase().includes(assignedTo) ||
          deal.assigned_to_user_id === targetUserId
        );
      }

      if (input.min_amount !== undefined) {
        filteredDeals = filteredDeals.filter((deal: any) => 
          (deal.amount || 0) >= input.min_amount!
        );
      }

      if (input.max_amount !== undefined) {
        filteredDeals = filteredDeals.filter((deal: any) => 
          (deal.amount || 0) <= input.max_amount!
        );
      }

      if (input.stage) {
        const stage = input.stage.toLowerCase();
        filteredDeals = filteredDeals.filter((deal: any) => 
          deal.currentWfmStep?.name?.toLowerCase().includes(stage) ||
          deal.currentWfmStatus?.name?.toLowerCase().includes(stage)
        );
      }

      // Apply limit
      const totalCount = filteredDeals.length;
      const limit = input.limit || 20;
      filteredDeals = filteredDeals.slice(0, limit);

      // Format results for Claude
      const message = this.formatDealsMessage(filteredDeals, totalCount, input);
      
      console.log('🔍 SearchDealsTool: Returning result with', filteredDeals.length, 'deals');
      console.log('🔍 SearchDealsTool: Message length:', message.length, 'characters');

      return {
        deals: filteredDeals,
        total_count: totalCount,
        filters_applied: input,
        message
      };

    } catch (error) {
      console.error('SearchDealsTool execution error:', error);
      throw new Error(`Failed to search deals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatDealsMessage(deals: any[], totalCount: number, filters: SearchDealsInput): string {
    if (deals.length === 0) {
      return "No deals found matching the search criteria.";
    }

    const summary = `Found ${deals.length} deal${deals.length === 1 ? '' : 's'}${totalCount > deals.length ? ` (showing first ${deals.length} of ${totalCount})` : ''}`;
    
    const appliedFilters = [];
    if (filters.search_term) appliedFilters.push(`search: "${filters.search_term}"`);
    if (filters.assigned_to) appliedFilters.push(`assigned to: "${filters.assigned_to}"`);
    if (filters.min_amount) appliedFilters.push(`min amount: $${filters.min_amount.toLocaleString()}`);
    if (filters.max_amount) appliedFilters.push(`max amount: $${filters.max_amount.toLocaleString()}`);
    if (filters.stage) appliedFilters.push(`stage: "${filters.stage}"`);

    let message = summary;
    if (appliedFilters.length > 0) {
      message += ` with filters: ${appliedFilters.join(', ')}`;
    }

    message += "\n\n**Deal Summary:**\n";

    deals.forEach((deal, index) => {
      const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
      const currency = deal.currency && deal.currency !== 'USD' ? ` ${deal.currency}` : '';
      const organization = deal.organization?.name || 'No organization';
      const assignee = deal.assignedToUser?.display_name || 'Unassigned';
      const stage = deal.currentWfmStep?.name || deal.currentWfmStatus?.name || 'No stage';
      const closeDate = deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'No close date';

      message += `\n${index + 1}. **${deal.name}**\n`;
      message += `   • Value: ${amount}${currency}\n`;
      message += `   • Organization: ${organization}\n`;
      message += `   • Assigned to: ${assignee}\n`;
      message += `   • Stage: ${stage}\n`;
      message += `   • Expected close: ${closeDate}\n`;
      if (deal.description) {
        message += `   • Description: ${deal.description.substring(0, 100)}${deal.description.length > 100 ? '...' : ''}\n`;
      }
    });

    // Add statistics
    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const averageValue = deals.length > 0 ? totalValue / deals.length : 0;
    const weightedValue = deals.reduce((sum, deal) => sum + ((deal.weighted_amount || deal.amount || 0)), 0);

    message += `\n**Pipeline Statistics:**\n`;
    message += `• Total value: $${totalValue.toLocaleString()}\n`;
    message += `• Average deal size: $${Math.round(averageValue).toLocaleString()}\n`;
    message += `• Weighted pipeline value: $${Math.round(weightedValue).toLocaleString()}\n`;

    return message;
  }
} 