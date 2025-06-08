/**
 * Lead Adapter for PipeCD AI Agent
 * 
 * Transforms between AI tool parameters and leadService input formats
 * Provides consistent result formatting for lead-related operations
 */

import type { ToolResult } from '../types/tools';
import { BaseAdapter } from './BaseAdapter';
import type { DbLead } from '../../leadService/leadCrud';
import type { LeadInput, LeadUpdateInput } from '../../generated/graphql';

// ================================
// AI Tool Parameter Types for Leads
// ================================

export interface AILeadSearchParams {
  search_term?: string;
  source?: string;
  is_qualified?: boolean;
  assigned_to_user_id?: string;
  min_score?: number;
  max_score?: number;
  limit?: number;
}

export interface AICreateLeadParams {
  name: string;
  source?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  estimated_value?: number;
  estimated_close_date?: string;
  assigned_to_user_id?: string;
  wfm_project_type_id?: string;
  custom_fields?: Record<string, any>;
  description?: string;
}

export interface AIUpdateLeadParams {
  lead_id: string;
  name?: string;
  source?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  estimated_value?: number;
  estimated_close_date?: string;
  assigned_to_user_id?: string;
  description?: string;
}

export interface AIQualifyLeadParams {
  lead_id: string;
  is_qualified?: boolean;
  qualification_notes?: string;
}

export interface AIConvertLeadParams {
  lead_id: string;
  target_type: 'DEAL' | 'PERSON' | 'ORGANIZATION' | 'ALL';
  deal_data?: Record<string, any>;
  person_data?: Record<string, any>;
  organization_data?: Record<string, any>;
  preserve_activities?: boolean;
}

export interface AIUpdateLeadScoreParams {
  lead_id: string;
  scoring_factors?: Record<string, any>;
}

// ================================
// Lead Adapter Implementation
// ================================

export class LeadAdapter extends BaseAdapter {
  /**
   * Helper to compute qualification status from WFM metadata (following GraphQL resolver pattern)
   */
  private static computeQualificationFromWFM(_lead: any): boolean {
    // This is a simplified version - in practice, we'd need access to the WFM project data
    // For now, we'll default to false since we can't access the WFM metadata here
    // The AI tools should use GraphQL queries to get properly computed qualification status
    return false;
  }

  /**
   * Convert AI create parameters to leadService LeadInput format
   */
  static toLeadInput(params: AICreateLeadParams): LeadInput {
    return {
      name: params.name,
      source: params.source,
      description: params.description,
      contactName: params.contact_name,
      contactEmail: params.contact_email,
      contactPhone: params.contact_phone,
      companyName: params.company_name,
      estimatedValue: params.estimated_value,
      estimatedCloseDate: params.estimated_close_date ? new Date(params.estimated_close_date) : undefined,
      assignedToUserId: params.assigned_to_user_id,
      wfmProjectTypeId: params.wfm_project_type_id || 'AUTO_DEFAULT_LEAD_QUALIFICATION',
      customFields: params.custom_fields ? Object.entries(params.custom_fields).map(([key, value]) => ({
        definitionId: key,
        stringValue: typeof value === 'string' ? value : undefined,
        numberValue: typeof value === 'number' ? value : undefined,
        booleanValue: typeof value === 'boolean' ? value : undefined,
        dateValue: value instanceof Date ? value : undefined,
        selectedOptionValues: Array.isArray(value) ? value : undefined,
      })) : undefined,
    };
  }

  /**
   * Convert AI update parameters to leadService LeadUpdateInput format
   */
  static toLeadUpdateInput(params: AIUpdateLeadParams): LeadUpdateInput {
    const updateInput: LeadUpdateInput = {};
    
    if (params.name !== undefined) updateInput.name = params.name;
    if (params.source !== undefined) updateInput.source = params.source;
    if (params.contact_name !== undefined) updateInput.contactName = params.contact_name;
    if (params.contact_email !== undefined) updateInput.contactEmail = params.contact_email;
    if (params.contact_phone !== undefined) updateInput.contactPhone = params.contact_phone;
    if (params.company_name !== undefined) updateInput.companyName = params.company_name;
    if (params.estimated_value !== undefined) updateInput.estimatedValue = params.estimated_value;
    if (params.estimated_close_date !== undefined) updateInput.estimatedCloseDate = params.estimated_close_date ? new Date(params.estimated_close_date) : undefined;
    if (params.assigned_to_user_id !== undefined) updateInput.assignedToUserId = params.assigned_to_user_id;
    if (params.description !== undefined) updateInput.description = params.description;

    return updateInput;
  }

  /**
   * Convert AI qualify parameters to qualification input
   */
  static toQualifyInput(params: AIQualifyLeadParams): { isQualified: boolean; qualificationNotes: string } {
    return {
      isQualified: params.is_qualified || false,
      qualificationNotes: params.qualification_notes || 'AI qualification',
    };
  }

  /**
   * Convert AI conversion parameters to conversion input
   */
  static toConversionInput(params: AIConvertLeadParams): any {
    return {
      target_type: params.target_type,
      deal_data: params.deal_data,
      person_data: params.person_data,
      organization_data: params.organization_data,
      preserve_activities: params.preserve_activities !== false, // Default to true
    };
  }

  // ================================
  // Result Formatters (Used by LeadsModule)
  // ================================

  /**
   * Format search results for AI consumption
   */
  static formatSearchResults(leads: DbLead[]): string {
    if (leads.length === 0) {
      return 'No leads found matching the search criteria.';
    }

    const leadList = leads.map((lead: DbLead) => {
      const score = lead.lead_score || 0;
      const qualified = this.computeQualificationFromWFM(lead) ? '✅ Qualified' : '⏳ Not Qualified';
      const company = lead.company_name ? ` (${lead.company_name})` : '';
      const value = lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : 'No value';
      
      return `• **${lead.name}** - Score: ${score}/100, ${qualified}${company}\n  ${value}\n  ID: ${lead.id}`;
    }).join('\n\n');

    return `Found ${leads.length} lead${leads.length === 1 ? '' : 's'}:\n\n${leadList}`;
  }

  /**
   * Format lead details for AI consumption
   */
  static formatLeadDetails(lead: DbLead): string {
    const score = lead.lead_score || 0;
    const qualified = this.computeQualificationFromWFM(lead) ? '✅ Qualified' : '⏳ Not Qualified';
    const value = lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : 'Not specified';
    const company = lead.company_name || 'Not specified';
    const contact = lead.contact_name || 'Not specified';
    const email = lead.contact_email || 'Not specified';
    const phone = lead.contact_phone || 'Not specified';
    const source = lead.source || 'Not specified';
    const closeDate = lead.estimated_close_date || 'Not specified';

    return `🎯 **Lead Details: ${lead.name}**

**📊 Lead Metrics:**
• Lead Score: ${score}/100
• Qualification Status: ${qualified}
• Estimated Value: ${value}
• Source: ${source}

**👤 Contact Information:**
• Contact Name: ${contact}
• Email: ${email}
• Phone: ${phone}
• Company: ${company}

**📅 Timeline:**
• Estimated Close Date: ${closeDate}
• Created: ${new Date(lead.created_at).toLocaleDateString()}

**📝 Notes:**
${lead.description || 'No additional notes available.'}

**🔗 Lead ID:** ${lead.id}`;
  }

  /**
   * Format multiple leads as a list
   */
  static formatLeadsList(leads: DbLead[], searchTerm?: string): string {
    if (leads.length === 0) {
      return searchTerm 
        ? `No leads found matching "${searchTerm}".`
        : 'No leads found.';
    }

    const leadList = leads.map((lead: DbLead) => {
      const score = lead.lead_score || 0;
      const qualified = this.computeQualificationFromWFM(lead) ? '✅' : '⏳';
      const value = lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : 'No value';
      
      return `${qualified} **${lead.name}** (Score: ${score}) - ${value}`;
    }).join('\n');

    const title = searchTerm 
      ? `Leads matching "${searchTerm}" (${leads.length}):`
      : `All Leads (${leads.length}):`;

    return `${title}\n\n${leadList}`;
  }

  /**
   * Format lead creation result
   */
  static formatLeadCreated(lead: DbLead): string {
    const score = lead.lead_score || 0;
    const value = lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : 'No value set';
    
    return `🎉 **Lead Created Successfully!**

**Lead Name:** ${lead.name}
**Initial Score:** ${score}/100
**Estimated Value:** ${value}
**Source:** ${lead.source || 'Not specified'}
**Lead ID:** ${lead.id}

The lead has been created with initial qualification status and is ready for progression through the qualification workflow.`;
  }

  /**
   * Format lead qualification result
   */
  static formatLeadQualified(lead: any, wasQualified: boolean): string {
    const action = wasQualified ? 'qualified' : 'disqualified';
    const emoji = wasQualified ? '✅' : '❌';
    const score = lead.lead_score || 0;
    
    return `${emoji} **Lead ${action.charAt(0).toUpperCase() + action.slice(1)} Successfully!**

**Lead Name:** ${lead.name}
**Current Score:** ${score}/100
**Status:** ${wasQualified ? 'Qualified for conversion' : 'Needs further nurturing'}
**Lead ID:** ${lead.id}

The lead qualification status has been updated and recorded in the workflow history.`;
  }

  /**
   * Format lead conversion result
   */
  static formatLeadConverted(result: any): string {
    const targetTypes = Array.isArray(result.target_types) ? result.target_types.join(', ') : result.target_type;
    
    return `🔄 **Lead Conversion Initiated Successfully!**

**Lead:** ${result.lead_name || 'Unknown'}
**Converting To:** ${targetTypes}
**Status:** Conversion process started
**Conversion ID:** ${result.conversion_id || 'Generated'}

The lead has been marked for conversion and the appropriate entities will be created in the target modules.`;
  }

  /**
   * Format lead score update result
   */
  static formatLeadScoreUpdated(lead: any): string {
    const score = lead.lead_score || 0;
    const factors = lead.lead_score_factors || {};
    const factorCount = Object.keys(factors).length;
    
    return `📊 **Lead Score Updated Successfully!**

**Lead Name:** ${lead.name}
**New Score:** ${score}/100
**Scoring Factors:** ${factorCount} factors evaluated
**Lead ID:** ${lead.id}

The lead score has been recalculated based on current data and engagement patterns.`;
  }

  // ================================
  // ToolResult Creators
  // ================================

  static createSearchResult(
    leads: DbLead[],
    params: AILeadSearchParams
  ): ToolResult {
    return {
      success: true,
      message: this.formatSearchResults(leads),
      data: leads,
      metadata: {
        toolName: 'search_leads',
        parameters: params,
        timestamp: new Date().toISOString(),
        recordsFound: leads.length,
      },
    };
  }

  static createDetailsResult(
    lead: DbLead,
    params: { lead_id: string }
  ): ToolResult {
    return {
      success: true,
      message: this.formatLeadDetails(lead),
      data: lead,
      metadata: {
        toolName: 'get_lead_details',
        parameters: params,
        timestamp: new Date().toISOString(),
      },
    };
  }

  static createCreateResult(
    lead: DbLead,
    params: AICreateLeadParams
  ): ToolResult {
    return {
      success: true,
      message: this.formatLeadCreated(lead),
      data: lead,
      metadata: {
        toolName: 'create_lead',
        parameters: params,
        timestamp: new Date().toISOString(),
        leadId: lead.id,
      },
    };
  }

  static createQualifyResult(
    lead: any,
    params: AIQualifyLeadParams
  ): ToolResult {
    return {
      success: true,
      message: this.formatLeadQualified(lead, params.is_qualified || false),
      data: lead,
      metadata: {
        toolName: 'qualify_lead',
        parameters: params,
        timestamp: new Date().toISOString(),
        leadId: lead.id,
        qualified: params.is_qualified || false,
      },
    };
  }

  static createConversionResult(
    result: any,
    params: AIConvertLeadParams
  ): ToolResult {
    return {
      success: true,
      message: this.formatLeadConverted(result),
      data: result,
      metadata: {
        toolName: 'convert_lead',
        parameters: params,
        timestamp: new Date().toISOString(),
        targetType: params.target_type,
      },
    };
  }

  static createScoreUpdateResult(
    lead: any,
    params: AIUpdateLeadScoreParams
  ): ToolResult {
    return {
      success: true,
      message: this.formatLeadScoreUpdated(lead),
      data: lead,
      metadata: {
        toolName: 'update_lead_score',
        parameters: params,
        timestamp: new Date().toISOString(),
        leadId: lead.id,
      },
    };
  }
} 