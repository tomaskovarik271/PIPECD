/**
 * Deal Adapter for PipeCD AI Agent
 * 
 * Converts between AI Agent deal tool parameters and
 * existing PipeCD dealService interface
 */

import type { DealInput } from '../../generated/graphql';
import type { DealServiceUpdateData, DbDeal } from '../../../lib/dealService/dealCrud';
import type { ToolResult } from '../types/tools';
import { BaseAdapter } from './BaseAdapter';

// AI Agent parameter types
export interface AIDealSearchParams {
  search_term?: string;
  assigned_to?: string;
  min_amount?: number;
  max_amount?: number;
  limit?: number;
}

export interface AICreateDealParams {
  name: string;
  organization_id?: string;
  primary_contact_id?: string;
  value?: number;
  stage?: string;
  priority?: string;
  description?: string;
  source?: string;
  deal_type?: string;
  close_date?: string;
  custom_fields?: Array<{
    definitionId: string;
    stringValue?: string;
    numberValue?: number;
    booleanValue?: boolean;
    dateValue?: string;
    selectedOptionValues?: string[];
  }>;
}

export interface AIUpdateDealParams {
  deal_id: string;
  name?: string;
  amount?: number;
  person_id?: string;
  organization_id?: string;
  expected_close_date?: string;
  assigned_to_user_id?: string;
}

export class DealAdapter extends BaseAdapter {
  /**
   * Convert AI search parameters to service filters and apply filtering
   */
  static applySearchFilters(deals: DbDeal[], params: AIDealSearchParams): DbDeal[] {
    const { limit = 20 } = params;

    const filterMappings = {
      search_term: (deal: DbDeal, term: string) => {
        const searchTerm = term.toLowerCase();
        return deal.name?.toLowerCase().includes(searchTerm) || false;
      },
      assigned_to: (deal: DbDeal, userId: string) =>
        deal.assigned_to_user_id === userId,
      min_amount: (deal: DbDeal, minAmount: number) =>
        deal.amount !== null && deal.amount !== undefined && deal.amount >= minAmount,
      max_amount: (deal: DbDeal, maxAmount: number) =>
        deal.amount !== null && deal.amount !== undefined && deal.amount <= maxAmount,
    };

    const filtered = this.applyFilters(deals, params, filterMappings);
    return this.sortAndLimit(filtered, 'updated_at', limit, false);
  }

  /**
   * Convert AI create deal parameters to DealInput for dealService
   */
  static toDealInput(params: AICreateDealParams): DealInput {
    // Filter custom fields to only include valid UUIDs (not field names)
    const validCustomFields = params.custom_fields?.filter(cf => {
      // Check if definitionId looks like a UUID (basic validation)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(cf.definitionId);
      
      if (!isValidUuid) {
        console.warn(`[DealAdapter] Skipping custom field with invalid UUID: ${cf.definitionId}`);
      }
      
      return isValidUuid;
    });

    return this.cleanInput({
      name: params.name,
      organization_id: params.organization_id,
      person_id: params.primary_contact_id,
      amount: params.value,
      deal_specific_probability: undefined, // Not provided by AI params
      expected_close_date: params.close_date ? new Date(params.close_date) : undefined,
      // Use a special marker that the service will recognize to auto-select default project type
      wfmProjectTypeId: 'AUTO_DEFAULT_SALES_DEAL', // Service will resolve to actual Sales Deal project type
      assignedToUserId: undefined, // Not provided in create params
      customFields: validCustomFields?.map(cf => ({
        definitionId: cf.definitionId,
        stringValue: cf.stringValue,
        numberValue: cf.numberValue,
        booleanValue: cf.booleanValue,
        dateValue: cf.dateValue ? new Date(cf.dateValue) : undefined,
        selectedOptionValues: cf.selectedOptionValues,
      })),
    }) as DealInput;
  }

  /**
   * Convert AI update deal parameters to DealServiceUpdateData for dealService
   */
  static toDealUpdateInput(params: AIUpdateDealParams): DealServiceUpdateData {
    return this.cleanInput({
      name: params.name,
      amount: params.amount,
      person_id: params.person_id,
      organization_id: params.organization_id,
      expected_close_date: params.expected_close_date,
      assigned_to_user_id: params.assigned_to_user_id,
    });
  }

  /**
   * Format a list of DbDeal records for AI response
   */
  static formatDealsList(deals: DbDeal[], searchTerm?: string): string {
    const dealList = deals.map((deal: DbDeal) => {
      const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
      // Note: DbDeal doesn't include populated relationships, so we show IDs when available
      const orgInfo = deal.organization_id 
        ? ` (Org: ${deal.organization_id.substring(0, 8)}...)` 
        : '';
      const contactInfo = deal.person_id 
        ? ` (Contact: ${deal.person_id.substring(0, 8)}...)`
        : '';
      
      return `• **${deal.name}** - ${amount}${orgInfo}${contactInfo}\nID: ${deal.id}`;
    }).join('\n\n');

    return `✅ Found ${deals.length} deal${deals.length === 1 ? '' : 's'}${searchTerm ? ` matching "${searchTerm}"` : ''}\n\n${dealList}`;
  }

  /**
   * Format a single DbDeal record for AI response
   */
  static formatDealDetails(deal: DbDeal): string {
    const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'Not specified';
    const closeDate = deal.expected_close_date 
      ? new Date(deal.expected_close_date).toLocaleDateString()
      : 'Not set';
    
    // DbDeal only has IDs, not populated relationships
    let orgDisplay = 'None';
    if (deal.organization_id) {
      orgDisplay = `Linked (ID: ${deal.organization_id})`;
    }

    let contactDisplay = 'None';
    if (deal.person_id) {
      contactDisplay = `Linked (ID: ${deal.person_id})`;
    }

    let assigneeDisplay = 'Not assigned';
    if (deal.assigned_to_user_id) {
      assigneeDisplay = `Assigned (ID: ${deal.assigned_to_user_id})`;
    }
    
    return `✅ Deal details retrieved

**Deal Information:**
- **Name:** ${deal.name}
- **Amount:** ${amount}
- **Expected Close Date:** ${closeDate}
- **Organization:** ${orgDisplay}
- **Primary Contact:** ${contactDisplay}
- **Assigned To:** ${assigneeDisplay}
- **Created:** ${new Date(deal.created_at).toLocaleDateString()}
- **Last Updated:** ${new Date(deal.updated_at).toLocaleDateString()}
- **Deal ID:** ${deal.id}`;
  }

  /**
   * Format deal creation success for AI response
   */
  static formatDealCreated(deal: DbDeal): string {
    const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount specified';
    
    // DbDeal only has IDs, not populated relationships
    let orgDisplay = 'None';
    if (deal.organization_id) {
      orgDisplay = `Linked (ID: ${deal.organization_id})`;
    }

    let contactDisplay = 'None';
    if (deal.person_id) {
      contactDisplay = `Linked (ID: ${deal.person_id})`;
    }
    
    return `✅ Deal created successfully!

**Deal Details:**
- **Name:** ${deal.name}
- **Amount:** ${amount}
- **Organization:** ${orgDisplay}
- **Primary Contact:** ${contactDisplay}
- **Expected Close Date:** ${deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
- **Created:** ${new Date(deal.created_at).toLocaleDateString()}
- **Deal ID:** ${deal.id}`;
  }

  /**
   * Format deal update success for AI response
   */
  static formatDealUpdated(deal: DbDeal): string {
    const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount specified';
    
    return `✅ Deal updated successfully!

**Updated Deal:**
- **Name:** ${deal.name}
- **Amount:** ${amount}
- **Expected Close Date:** ${deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
- **Last Updated:** ${new Date(deal.updated_at).toLocaleDateString()}
- **Deal ID:** ${deal.id}`;
  }

  /**
   * Create a successful search result
   */
  static createSearchResult(
    deals: DbDeal[],
    params: AIDealSearchParams
  ): ToolResult {
    return this.createSuccessResult(
      'search_deals',
      this.formatDealsList(deals, params.search_term),
      deals,
      params
    );
  }

  /**
   * Create a successful create result
   */
  static createCreateResult(
    deal: DbDeal,
    params: AICreateDealParams
  ): ToolResult {
    return this.createSuccessResult(
      'create_deal',
      this.formatDealCreated(deal),
      deal,
      params
    );
  }

  /**
   * Create a successful update result
   */
  static createUpdateResult(
    deal: DbDeal,
    params: AIUpdateDealParams
  ): ToolResult {
    return this.createSuccessResult(
      'update_deal',
      this.formatDealUpdated(deal),
      deal,
      params
    );
  }

  /**
   * Create a successful details result
   */
  static createDetailsResult(
    deal: DbDeal,
    params: { deal_id: string }
  ): ToolResult {
    return this.createSuccessResult(
      'get_deal_details',
      this.formatDealDetails(deal),
      deal,
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