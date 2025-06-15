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
   * Search and filter deals using GraphQL query with populated relationships
   * This provides Claude with full context (organization names, contact names) instead of just IDs
   */
  async searchDeals(
    params: AIDealSearchParams,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return DealAdapter.createErrorResult('search_deals', new Error('Authentication required'), params);
      }

      // Use GraphQL query to get deals with populated relationships
      // This gives Claude the full context it needs (organization names, contact names)
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

      const result = await this.graphqlClient.execute(query, {}, context.authToken);
      
      if (!result.deals) {
        return DealAdapter.createErrorResult('search_deals', new Error('No deals found'), params);
      }

      // Apply AI-specific filters to the full Deal objects
      const filteredDeals = DealAdapter.applySearchFiltersToFullDeals(result.deals, params);

      return DealAdapter.createSearchResultWithFullContext(filteredDeals, params);
    } catch (error) {
      console.error('Error in searchDeals:', error);
      return DealAdapter.createErrorResult('search_deals', error as Error, params);
    }
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