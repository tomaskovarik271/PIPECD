/**
 * Leads Domain Module for PipeCD AI Agent
 * 
 * Uses existing leadService instead of direct GraphQL operations
 * Provides AI-optimized interface while maintaining business logic consistency
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { LeadAdapter } from '../../adapters/LeadAdapter';
import type { 
  AILeadSearchParams, 
  AICreateLeadParams, 
  AIQualifyLeadParams,
  AIConvertLeadParams,
  AIUpdateLeadScoreParams
} from '../../adapters/LeadAdapter';
import * as leadService from '../../../leadService';
import { GraphQLClient } from '../../utils/GraphQLClient';

export class LeadsModule {
  private graphqlClient: GraphQLClient;

  constructor(graphqlClient: GraphQLClient) {
    this.graphqlClient = graphqlClient;
  }

  private createErrorResult(toolName: string, error: Error, params: any): ToolResult {
    return {
      success: false,
      message: `⚠️ **${toolName}** error: ${error.message}`,
      metadata: {
        toolName,
        parameters: params,
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    };
  }

  async searchLeads(params: AILeadSearchParams, context: ToolExecutionContext): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return this.createErrorResult('search_leads', new Error('Authentication required'), params);
      }

      // Get all leads first
      const leads = await leadService.getLeads(context.userId, context.authToken);
      
      // Apply filters
      let filteredLeads = leads;
      
      if (params.search_term) {
        const searchTerm = params.search_term.toLowerCase();
        filteredLeads = filteredLeads.filter(lead => 
          lead.name?.toLowerCase().includes(searchTerm) ||
          lead.contact_name?.toLowerCase().includes(searchTerm) ||
          lead.company_name?.toLowerCase().includes(searchTerm) ||
          lead.contact_email?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (params.source) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.source?.toLowerCase() === params.source?.toLowerCase()
        );
      }
      
      if (params.is_qualified !== undefined) {
        // NOTE: Since is_qualified is now computed from WFM metadata, we skip this filter
        // AI tools should use GraphQL queries with proper qualification computation
        console.warn('is_qualified filter skipped - use GraphQL queries for accurate qualification status');
      }
      
      if (params.assigned_to_user_id) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.assigned_to_user_id === params.assigned_to_user_id
        );
      }
      
      if (params.min_score !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          (lead.lead_score || 0) >= params.min_score!
        );
      }
      
      if (params.max_score !== undefined) {
        filteredLeads = filteredLeads.filter(lead => 
          (lead.lead_score || 0) <= params.max_score!
        );
      }
      
      // Apply limit
      if (params.limit) {
        filteredLeads = filteredLeads.slice(0, params.limit);
      }

      return {
        success: true,
        message: LeadAdapter.formatSearchResults(filteredLeads),
        data: filteredLeads,
        metadata: {
          toolName: 'search_leads',
          parameters: params,
          timestamp: new Date().toISOString(),
          recordsFound: filteredLeads.length,
        },
      };
    } catch (error) {
      return this.createErrorResult('search_leads', error as Error, params);
    }
  }

  async getLeadDetails(params: { lead_id: string }, context: ToolExecutionContext): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return this.createErrorResult('get_lead_details', new Error('Authentication required'), params);
      }

      const lead = await leadService.getLeadById(context.userId, params.lead_id, context.authToken);
      
      if (!lead) {
        return this.createErrorResult(
          'get_lead_details', 
          new Error(`Lead with ID ${params.lead_id} not found`), 
          params
        );
      }

      return {
        success: true,
        message: LeadAdapter.formatLeadDetails(lead),
        data: lead,
        metadata: {
          toolName: 'get_lead_details',
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return this.createErrorResult('get_lead_details', error as Error, params);
    }
  }

  async createLead(params: AICreateLeadParams, context: ToolExecutionContext): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return this.createErrorResult('create_lead', new Error('Authentication required'), params);
      }

      const leadInput = LeadAdapter.toLeadInput(params);
      const newLead = await leadService.createLead(
        context.userId, 
        leadInput, 
        context.authToken
      );

      return {
        success: true,
        message: `✅ Lead created successfully: **${newLead.name}**\n\n${LeadAdapter.formatLeadDetails(newLead)}`,
        data: newLead,
        metadata: {
          toolName: 'create_lead',
          parameters: params,
          timestamp: new Date().toISOString(),
          leadId: newLead.id,
        },
      };
    } catch (error) {
      return this.createErrorResult('create_lead', error as Error, params);
    }
  }

  async qualifyLead(params: AIQualifyLeadParams, context: ToolExecutionContext): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return this.createErrorResult('qualify_lead', new Error('Authentication required'), params);
      }

      // The qualifyLead service function is deprecated - qualification should be handled through WFM workflow progression
      return {
        success: false,
        message: `❌ Lead qualification via AI Agent is not yet implemented. 

Lead qualification should be handled through WFM workflow progression:
1. Use the web interface to move leads through workflow steps
2. Qualification status is computed from WFM step metadata

**Lead ID:** ${params.lead_id}
**Requested Status:** ${params.is_qualified ? 'Qualified' : 'Disqualified'}`,
        data: null,
        metadata: {
          toolName: 'qualify_lead',
          parameters: params,
          timestamp: new Date().toISOString(),
          error: 'FUNCTION_DEPRECATED',
        },
      };
    } catch (error) {
      return this.createErrorResult('qualify_lead', error as Error, params);
    }
  }

  async convertLead(params: AIConvertLeadParams, context: ToolExecutionContext): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return this.createErrorResult('convert_lead', new Error('Authentication required'), params);
      }

      // Lead conversion is not yet implemented in the service layer
      return {
        success: false,
        message: `❌ Lead conversion via AI Agent is not yet implemented.

Lead conversion should be handled through the web interface:
1. Ensure the lead is qualified through WFM workflow
2. Use the conversion modal in the leads interface
3. Convert to Deal, Person, or Organization as needed

**Lead ID:** ${params.lead_id}
**Target Type:** ${params.target_type}`,
        data: null,
        metadata: {
          toolName: 'convert_lead',
          parameters: params,
          timestamp: new Date().toISOString(),
          error: 'FUNCTION_NOT_IMPLEMENTED',
        },
      };
    } catch (error) {
      return this.createErrorResult('convert_lead', error as Error, params);
    }
  }

  async updateLeadScore(params: AIUpdateLeadScoreParams, context: ToolExecutionContext): Promise<ToolResult> {
    try {
      if (!context.userId || !context.authToken) {
        return this.createErrorResult('update_lead_score', new Error('Authentication required'), params);
      }

      const updatedLead = await leadService.recalculateLeadScore(
        context.userId,
        params.lead_id,
        context.authToken
      );

      return {
        success: true,
        message: `✅ Lead score updated successfully: **${updatedLead.name}** (Score: ${updatedLead.lead_score})\n\n${LeadAdapter.formatLeadDetails(updatedLead)}`,
        data: updatedLead,
        metadata: {
          toolName: 'update_lead_score',
          parameters: params,
          timestamp: new Date().toISOString(),
          leadId: updatedLead.id,
          newScore: updatedLead.lead_score,
        },
      };
    } catch (error) {
      return this.createErrorResult('update_lead_score', error as Error, params);
    }
  }
} 