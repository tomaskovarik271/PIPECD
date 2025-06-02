/**
 * Deals Domain Module for PipeCD AI Agent (Refactored)
 * 
 * Uses existing dealService instead of direct GraphQL operations
 * Provides AI-optimized interface while maintaining business logic consistency
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { DealAdapter } from '../../adapters/DealAdapter';
import type { 
  AIDealSearchParams, 
  AICreateDealParams, 
  AIUpdateDealParams 
} from '../../adapters/DealAdapter';
import { dealService } from '../../../dealService';
import { GraphQLClient } from '../../utils/GraphQLClient';

export class DealsModule {
  private graphqlClient: GraphQLClient;

  constructor(graphqlClient: GraphQLClient) {
    this.graphqlClient = graphqlClient;
  }

  /**
   * Search and filter deals using GraphQL to get full data including WFM status
   */
  async searchDeals(
    params: AIDealSearchParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return DealAdapter.createErrorResult('search_deals', new Error('Authentication required'), params);
      }

      // Use GraphQL query to get full deal data including currentWfmStatus
      const query = `
        query GetDealsForAI {
          deals {
            id
            name
            amount
            expected_close_date
            created_at
            updated_at
            person_id
            user_id
            assigned_to_user_id
            deal_specific_probability
            weighted_amount
            wfm_project_id
            organization_id
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
            currentWfmStatus {
              id
              name
              color
            }
            currentWfmStep {
              id
              stepOrder
              isInitialStep
              isFinalStep
              status {
                id
                name
                color
              }
            }
          }
        }
      `;

      const result = await this.graphqlClient.execute(query, {}, context.authToken);
      const allDeals = result.deals || [];

      // Apply AI-specific filters (update DealAdapter to handle GraphQL Deal objects)
      const filteredDeals = this.applyAISearchFilters(allDeals, params);

      return this.createSearchResult(filteredDeals, params);

    } catch (error) {
      return DealAdapter.createErrorResult('search_deals', error, params);
    }
  }

  /**
   * Apply search filters to GraphQL Deal objects
   */
  private applyAISearchFilters(deals: any[], params: AIDealSearchParams): any[] {
    const { limit = 20 } = params;
    let filtered = deals;

    if (params.search_term) {
      const searchTerm = params.search_term.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.name?.toLowerCase().includes(searchTerm) ||
        deal.organization?.name?.toLowerCase().includes(searchTerm)
      );
    }

    if (params.assigned_to) {
      filtered = filtered.filter(deal => deal.assigned_to_user_id === params.assigned_to);
    }

    if (params.min_amount !== undefined) {
      filtered = filtered.filter(deal => 
        deal.amount !== null && deal.amount !== undefined && deal.amount >= params.min_amount!
      );
    }

    if (params.max_amount !== undefined) {
      filtered = filtered.filter(deal => 
        deal.amount !== null && deal.amount !== undefined && deal.amount <= params.max_amount!
      );
    }

    // Sort by updated_at descending and limit
    filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return filtered.slice(0, limit);
  }

  /**
   * Create search result with properly formatted data
   */
  private createSearchResult(deals: any[], params: AIDealSearchParams): ToolResult {
    const dealList = deals.map((deal: any) => {
      const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
      const orgInfo = deal.organization?.name ? ` (${deal.organization.name})` : '';
      const status = deal.currentWfmStatus?.name || 'No status';
      
      return `• **${deal.name}** - ${amount}${orgInfo}\n  Status: ${status}\n  ID: ${deal.id}`;
    }).join('\n\n');

    const message = `✅ Found ${deals.length} deal${deals.length === 1 ? '' : 's'}${params.search_term ? ` matching "${params.search_term}"` : ''}\n\n${dealList}`;

    return {
      success: true,
      data: deals,
      message,
      metadata: {
        toolName: 'search_deals',
        parameters: params,
        timestamp: new Date().toISOString(),
        executionTime: 0,
      },
    };
  }

  /**
   * Get deal details using existing dealService
   */
  async getDealDetails(
    params: { deal_id: string },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return DealAdapter.createErrorResult('get_deal_details', new Error('Authentication required'), params);
      }

      // Use existing dealService to get deal details
      const deal = await dealService.getDealById(context.userId, params.deal_id, context.authToken);

      if (!deal) {
        return DealAdapter.createErrorResult(
          'get_deal_details', 
          new Error(`Deal with ID ${params.deal_id} not found`), 
          params
        );
      }

      return DealAdapter.createDetailsResult(deal, params);

    } catch (error) {
      return DealAdapter.createErrorResult('get_deal_details', error, params);
    }
  }

  /**
   * Create a new deal using existing dealService with validation and events
   */
  async createDeal(
    params: AICreateDealParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return DealAdapter.createErrorResult('create_deal', new Error('Authentication required'), params);
      }

      // Convert AI parameters to service format
      const dealInput = DealAdapter.toDealInput(params);

      // Use existing dealService (includes validation, auth, events, WFM project creation)
      const newDeal = await dealService.createDeal(
        context.userId,
        dealInput,
        context.authToken
      );

      return DealAdapter.createCreateResult(newDeal, params);

    } catch (error) {
      return DealAdapter.createErrorResult('create_deal', error, params);
    }
  }

  /**
   * Update existing deal using existing dealService with validation and events
   */
  async updateDeal(
    params: AIUpdateDealParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return DealAdapter.createErrorResult('update_deal', new Error('Authentication required'), params);
      }

      // Convert AI parameters to service format
      const dealUpdateInput = DealAdapter.toDealUpdateInput(params);

      // Use existing dealService (includes validation, auth, events, permission checks)
      const updatedDeal = await dealService.updateDeal(
        context.userId,
        params.deal_id,
        dealUpdateInput,
        context.authToken
      );

      if (!updatedDeal) {
        return DealAdapter.createErrorResult(
          'update_deal', 
          new Error('Deal not found or no permission to update'), 
          params
        );
      }

      return DealAdapter.createUpdateResult(updatedDeal, params);

    } catch (error) {
      return DealAdapter.createErrorResult('update_deal', error, params);
    }
  }

  /**
   * Delete a deal using existing dealService with validation and events
   */
  async deleteDeal(
    params: { deal_id: string },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return DealAdapter.createErrorResult('delete_deal', new Error('Authentication required'), params);
      }

      // Use existing dealService (includes validation, auth, events, history recording)
      const success = await dealService.deleteDeal(
        context.userId,
        params.deal_id,
        context.authToken
      );

      if (!success) {
        return DealAdapter.createErrorResult(
          'delete_deal', 
          new Error('Deal not found or no permission to delete'), 
          params
        );
      }

      const successMessage = `✅ Deal deleted successfully

**Deleted Deal ID:** ${params.deal_id}

The deal has been permanently removed from the system.`;

      return {
        success: true,
        data: { deleted: true, dealId: params.deal_id },
        message: successMessage,
        metadata: {
          toolName: 'delete_deal',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };

    } catch (error) {
      return DealAdapter.createErrorResult('delete_deal', error, params);
    }
  }
} 