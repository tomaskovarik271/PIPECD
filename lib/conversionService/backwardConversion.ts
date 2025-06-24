import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { BaseConversionInput, BaseConversionResult, ConversionType } from './index';
import { validateConversion } from './conversionValidation';
import { recordConversionHistory } from './conversionHistory';
import { leadService } from '../leadService';
import { dealService } from '../dealService';
import { LeadInput } from '../generated/graphql';

export interface DealToLeadConversionInput extends BaseConversionInput {
  dealId: string;
  conversionReason: string;
  leadData?: {
    name?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    company_name?: string;
    estimated_value?: number;
    estimated_close_date?: string;
    source?: string;
    description?: string;
  };
  archiveDeal?: boolean;
}

export interface DealToLeadConversionResult extends BaseConversionResult {
  leadId?: string;
  dealStatusUpdated?: boolean;
}

/**
 * Convert a deal to a lead with intelligent data migration
 */
export async function convertDealToLead(
  input: DealToLeadConversionInput,
  userId: string,
  supabase: ReturnType<typeof createClient<Database>>,
  accessToken: string
): Promise<DealToLeadConversionResult> {
  try {
    // 1. Validation Phase
    console.log(`Starting deal to lead conversion for deal ${input.dealId}`);
    
    const validationResult = await validateConversion({
      sourceType: 'deal',
      sourceId: input.dealId,
      targetType: 'lead',
      userId,
      supabase,
      accessToken
    });

    if (!validationResult.isValid) {
      return {
        success: false,
        conversionId: '',
        message: 'Conversion validation failed',
        errors: validationResult.errors
      };
    }

    const deal = validationResult.sourceEntity as any;

    // 2. Get the default lead project type ID
    let leadProjectTypeId: string | undefined;
    try {
      const { data: projectTypes } = await supabase
        .from('project_types')
        .select('id, name')
        .ilike('name', '%lead%')
        .limit(1);
      
      if (projectTypes && projectTypes.length > 0) {
        leadProjectTypeId = projectTypes[0]!.id;
        console.log(`Using lead project type: ${projectTypes[0]!.name} (${leadProjectTypeId})`);
      } else {
        // Fallback: get any project type if no lead-specific one found
        const { data: fallbackTypes } = await supabase
          .from('project_types')
          .select('id, name')
          .limit(1);
        
        if (fallbackTypes && fallbackTypes.length > 0) {
          leadProjectTypeId = fallbackTypes[0]!.id;
          console.log(`Using fallback project type: ${fallbackTypes[0]!.name} (${leadProjectTypeId})`);
        }
      }
    } catch (error) {
      console.error('Error fetching project types:', error);
    }

    if (!leadProjectTypeId) {
      throw new Error('No project type available for lead creation');
    }

    console.log(`🔍 DEBUG: About to create lead with wfmProjectTypeId: ${leadProjectTypeId}`);

    // 3. Create Lead from Deal data
    const leadData: LeadInput = {
      name: input.leadData?.name || deal.name,
      contactName: input.leadData?.contact_name || '',
      contactEmail: input.leadData?.contact_email || '',
      contactPhone: input.leadData?.contact_phone || '',
      companyName: input.leadData?.company_name || '',
      estimatedValue: input.leadData?.estimated_value || deal.amount || 0,
      estimatedCloseDate: input.leadData?.estimated_close_date || deal.expected_close_date,
      source: input.leadData?.source || 'deal_conversion',
      description: input.leadData?.description || `Converted from deal: ${deal.name}`,
      assignedToUserId: deal.assigned_to_user_id || userId,
      wfmProjectTypeId: leadProjectTypeId,
      customFields: []
    };

    console.log(`🔍 DEBUG: leadData structure:`, JSON.stringify(leadData, null, 2));

    // Get person and organization data if they exist
    if (deal.person_id) {
      try {
        const { data: person } = await supabase
          .from('people')
          .select('first_name, last_name, email, phone')
          .eq('id', deal.person_id)
          .single();
        
        if (person) {
          leadData.contactName = `${person.first_name} ${person.last_name}`.trim();
          leadData.contactEmail = person.email || '';
          leadData.contactPhone = person.phone || '';
        }
      } catch (error) {
        console.error('Error fetching person data:', error);
      }
    }

    if (deal.organization_id) {
      try {
        const { data: organization } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', deal.organization_id)
          .single();
        
        if (organization) {
          leadData.companyName = organization.name;
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    }

    const createdLead = await leadService.createLead(userId, leadData, accessToken);
    console.log(`Created lead: ${createdLead.id}`);

    // 4. Data Migration Phase - Activities removed (using Google Calendar integration)

    // 5. Update Deal WFM Status to "Converted to Lead"
    let dealStatusUpdated = false;
    try {
      console.log(`🔍 DEBUG: Updating deal WFM status for deal ${input.dealId} with wfm_project_id: ${deal.wfm_project_id}`);
      
      // Get the deal's current WFM project to find its workflow
      const { data: wfmProject } = await supabase
        .from('wfm_projects')
        .select('workflow_id')
        .eq('id', deal.wfm_project_id)
        .single();

      if (!wfmProject) {
        console.error('WFM project not found for deal');
      } else {
        console.log(`🔍 DEBUG: Deal's workflow_id: ${wfmProject.workflow_id}`);

        // Get the "Converted to Lead" status first
        const { data: convertedStatus } = await supabase
          .from('statuses')
          .select('id')
          .eq('name', 'Converted to Lead')
          .single();

        if (convertedStatus) {
          console.log(`🔍 DEBUG: Found "Converted to Lead" status: ${convertedStatus.id}`);
          
          // Find the workflow step for this status in the deal's workflow
          const { data: workflowStep } = await supabase
            .from('workflow_steps')
            .select('id')
            .eq('status_id', convertedStatus.id)
            .eq('workflow_id', wfmProject.workflow_id)
            .single();

          if (workflowStep) {
            console.log(`🔍 DEBUG: Found workflow step: ${workflowStep.id}`);
            
            // Update the deal's WFM project to the "Converted to Lead" status
            const { error: updateError } = await supabase
              .from('wfm_projects')
              .update({
                current_step_id: workflowStep.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', deal.wfm_project_id);

            if (!updateError) {
              dealStatusUpdated = true;
              console.log(`✅ Successfully updated deal WFM status to "Converted to Lead"`);
            } else {
              console.error('❌ Error updating deal WFM status:', updateError);
            }
          } else {
            console.error('❌ Workflow step for "Converted to Lead" not found in deal\'s workflow');
          }
        } else {
          console.error('❌ "Converted to Lead" status not found in database');
        }
      }
    } catch (error) {
      console.error('❌ Error updating deal status to converted:', error);
      // Continue - status update failure shouldn't block conversion
    }

    // 6. Record Conversion History
    const conversionId = await recordConversionHistory({
      conversionType: ConversionType.DEAL_TO_LEAD,
      sourceEntityType: 'deal',
      sourceEntityId: input.dealId,
      targetEntityType: 'lead',
      targetEntityId: createdLead.id,
      conversionReason: input.conversionReason,
      conversionData: {
        dealStatusUpdated,
        originalDealValue: deal.amount
      },
      wfmTransitionPlan: null,
      convertedByUserId: userId,
      supabase
    });

    // 7. Activity creation removed - using Google Calendar integration instead

    return {
      success: true,
      conversionId,
      message: `Successfully converted deal "${deal.name}" to lead "${createdLead.name}"`,
      leadId: createdLead.id,
      dealStatusUpdated
    };

  } catch (error) {
    console.error('Deal to lead conversion failed:', error);
    return {
      success: false,
      conversionId: '',
      message: 'Conversion failed due to unexpected error',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
} 