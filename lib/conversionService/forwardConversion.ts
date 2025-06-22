import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { BaseConversionInput, BaseConversionResult, ConversionType } from './index';
import { validateConversion } from './conversionValidation';
import { recordConversionHistory } from './conversionHistory';
import { dealService } from '../dealService';
import { personService } from '../personService';
import { organizationService } from '../organizationService';
import { leadService, updateLead } from '../leadService';

export interface LeadToDealConversionInput extends BaseConversionInput {
  leadId: string;
  dealData?: {
    name?: string;
    amount?: number;
    currency?: string;
    expected_close_date?: string;
    deal_specific_probability?: number;
    wfmProjectTypeId?: string;
  };
  personData?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  organizationData?: {
    name?: string;
    address?: string;
    notes?: string;
  };
  wfmProjectTypeId?: string; // Override default Sales Deal project type
  targetWfmStepId?: string; // Override automatic step mapping
}

export interface LeadToDealConversionResult extends BaseConversionResult {
  dealId?: string;
  personId?: string;
  organizationId?: string;
  wfmProjectId?: string;
  wfmTransitionPlan?: any;
}

/**
 * Convert a lead to a deal with intelligent entity creation and WFM transitions
 */
export async function convertLeadToDeal(
  input: LeadToDealConversionInput,
  userId: string,
  supabase: ReturnType<typeof createClient<Database>>,
  accessToken: string
): Promise<LeadToDealConversionResult> {
  try {
    // 1. Validation Phase
    console.log(`Starting lead to deal conversion for lead ${input.leadId}`);
    
    const validationResult = await validateConversion({
      sourceType: 'lead',
      sourceId: input.leadId,
      targetType: 'deal',
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

    const lead = validationResult.sourceEntity as any;

    // 2. Entity Creation Phase
    let personId: string | undefined;
    let organizationId: string | undefined;

    // Create or find Person from lead contact data
    if (lead.contact_name || lead.contact_email) {
      try {
        // Check if person already exists by email
        if (lead.contact_email) {
          const existingPersons = await personService.getPeople(userId, accessToken);
          const personWithMatchingEmail = existingPersons.find(p => p.email === lead.contact_email);
          
          if (personWithMatchingEmail) {
            personId = personWithMatchingEmail.id;
            console.log(`Found existing person: ${personId}`);
          }
        }

        // Create new person if not found
        if (!personId) {
          const nameParts = (lead.contact_name || '').split(' ');
          const personData = {
            first_name: input.personData?.first_name || nameParts[0] || '',
            last_name: input.personData?.last_name || nameParts.slice(1).join(' ') || '',
            email: input.personData?.email || lead.contact_email || '',
            phone: input.personData?.phone || lead.contact_phone || '',
            notes: `Created from lead conversion: ${lead.name}`,
            customFields: []
          };

          const createdPerson = await personService.createPerson(userId, personData, accessToken);
          personId = createdPerson.id;
          console.log(`Created new person: ${personId}`);
        }
      } catch (error) {
        console.error('Error creating/finding person:', error);
        // Continue without person - not a blocking error
      }
    }

    // Create or find Organization from lead company data
    if (lead.company_name) {
      try {
        // Check if organization already exists by name
        const existingOrgs = await organizationService.getOrganizations(userId, accessToken);
        const orgWithMatchingName = existingOrgs.find(org => org.name === lead.company_name);

        if (orgWithMatchingName) {
          organizationId = orgWithMatchingName.id;
          console.log(`Found existing organization: ${organizationId}`);
        } else {
          // Create new organization
          const orgData = {
            name: input.organizationData?.name || lead.company_name,
            address: input.organizationData?.address || '',
            notes: input.organizationData?.notes || `Created from lead conversion: ${lead.name}`,
            customFields: []
          };

          const createdOrg = await organizationService.createOrganization(userId, orgData, accessToken);
          organizationId = createdOrg.id;
          console.log(`Created new organization: ${organizationId}`);
        }

        // Link person to organization if both exist
        if (personId && organizationId) {
          await personService.updatePerson(userId, personId, {
            organization_id: organizationId
          }, accessToken);
          console.log(`Linked person ${personId} to organization ${organizationId}`);
        }
      } catch (error) {
        console.error('Error creating/finding organization:', error);
        // Continue without organization - not a blocking error
      }
    }

    // 3. Simplified WFM handling - just pass the project type ID
    // The deal creation service will automatically create the WFM project and set the initial step
    const wfmProjectTypeId = input.dealData?.wfmProjectTypeId || input.wfmProjectTypeId;
    
    if (!wfmProjectTypeId) {
      throw new Error('wfmProjectTypeId is required for deal creation');
    }

    // 4. Create Deal
    const dealData = {
      name: input.dealData?.name || lead.name,
      amount: input.dealData?.amount || lead.estimated_value || 0,
      currency: input.dealData?.currency || 'USD',
      expected_close_date: input.dealData?.expected_close_date || lead.estimated_close_date,
      person_id: personId,
      organization_id: organizationId,
      deal_specific_probability: input.dealData?.deal_specific_probability,
      wfmProjectTypeId: wfmProjectTypeId,
      assignedToUserId: lead.assigned_to_user_id || userId,
      customFields: []
    };

    const createdDeal = await dealService.createDeal(userId, dealData, accessToken);
    console.log(`Created deal: ${createdDeal.id}`);

    // 5. Data Migration Phase
    if (input.preserveActivities !== false) {
      // Transfer activities from lead to deal
      try {
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .eq('lead_id', input.leadId);

        if (activities && activities.length > 0) {
          const activityUpdates = activities.map(activity => ({
            ...activity,
            deal_id: createdDeal.id,
            lead_id: null,
            notes: `${activity.notes || ''}\n[Transferred from lead: ${lead.name}]`.trim()
          }));

          await supabase
            .from('activities')
            .upsert(activityUpdates);

          console.log(`Transferred ${activities.length} activities to deal`);
        }
      } catch (error) {
        console.error('Error transferring activities:', error);
        // Non-blocking error
      }
    }

    // 6. Update Lead Status and WFM Status
    await updateLead(userId, input.leadId, {
      converted_at: new Date().toISOString(),
      converted_to_deal_id: createdDeal.id,
      converted_to_person_id: personId,
      converted_to_organization_id: organizationId,
      converted_by_user_id: userId
    }, accessToken);

    // Update Lead WFM Status to "Converted to Deal"
    let leadStatusUpdated = false;
    try {
      // Get the "Converted to Deal" status ID
      const { data: convertedStatus } = await supabase
        .from('statuses')
        .select('id')
        .eq('name', 'Converted to Deal')
        .single();

      if (convertedStatus) {
        // Get the workflow step for this status in the lead's workflow
        const { data: workflowStep } = await supabase
          .from('workflow_steps')
          .select('id')
          .eq('status_id', convertedStatus.id)
          .single();

        if (workflowStep) {
          // Update the lead's WFM project to the "Converted to Deal" status
          const { error: updateError } = await supabase
            .from('wfm_projects')
            .update({
              current_step_id: workflowStep.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', lead.wfm_project_id);

          if (!updateError) {
            leadStatusUpdated = true;
            console.log(`Updated lead WFM status to "Converted to Deal"`);
          } else {
            console.error('Error updating lead WFM status:', updateError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating lead status to converted:', error);
      // Continue - status update failure shouldn't block conversion
    }

    // 7. Record Conversion History
    const conversionId = await recordConversionHistory({
      conversionType: ConversionType.LEAD_TO_DEAL,
      sourceEntityType: 'lead',
      sourceEntityId: input.leadId,
      targetEntityType: 'deal',
      targetEntityId: createdDeal.id,
      conversionReason: 'QUALIFIED',
      conversionData: {
        personCreated: !!personId,
        organizationCreated: !!organizationId,
        activitiesTransferred: input.preserveActivities !== false,
        leadStatusUpdated,
        wfmTransitionExecuted: true // Deal creation handles WFM automatically
      },
      wfmTransitionPlan: null, // Not using complex transition planning
      convertedByUserId: userId,
      supabase
    });

    // 8. Create Conversion Activity
    if (input.createConversionActivity !== false) {
      try {
        await supabase
          .from('activities')
          .insert({
            subject: `Lead converted to deal: ${createdDeal.name}`,
            type: 'LEAD_CONVERSION',
            status: 'COMPLETED',
            deal_id: createdDeal.id,
            person_id: personId,
            organization_id: organizationId,
            user_id: userId,
            due_date: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            notes: `Lead "${lead.name}" successfully converted to deal with ${personId ? 'person' : 'no person'} and ${organizationId ? 'organization' : 'no organization'}.${input.notes ? `\n\nNotes: ${input.notes}` : ''}`
          });
        console.log('Created conversion activity');
      } catch (error) {
        console.error('Error creating conversion activity:', error);
        // Non-blocking error
      }
    }

    return {
      success: true,
      conversionId,
      message: `Successfully converted lead "${lead.name}" to deal "${createdDeal.name}"`,
      dealId: createdDeal.id,
      personId,
      organizationId,
      wfmProjectId: createdDeal.wfm_project_id,
      wfmTransitionPlan: null // Not using complex transition planning
    };

  } catch (error) {
    console.error('Lead to deal conversion failed:', error);
    return {
      success: false,
      conversionId: '',
      message: 'Conversion failed due to unexpected error',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
} 