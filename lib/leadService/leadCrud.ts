import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError, recordEntityHistory } from '../serviceUtils';
import type { Lead, LeadInput, LeadUpdateInput, CustomFieldValueInput } from '../generated/graphql';
import { inngest } from '../inngestClient';

import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './leadCustomFields';
import { calculateLeadScoreFields } from './leadScoring';
import { generateLeadChanges, TRACKED_LEAD_FIELDS } from './leadHistory';
import { createWFMProject } from '../wfmProjectService';
import type { GraphQLContext } from '../../netlify/functions/graphql/helpers';
import type { User } from '@supabase/supabase-js';

// Interface for the raw lead data selected from the database
export interface DbLead {
  id: string;
  user_id: string;
  name: string;
  source?: string | null;
  description?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  company_name?: string | null;
  estimated_value?: number | null;
  estimated_close_date?: string | null;
  lead_score: number;
  lead_score_factors?: Record<string, any> | null;
  assigned_to_user_id?: string | null;
  assigned_at?: string | null;
  converted_at?: string | null;
  converted_to_deal_id?: string | null;
  converted_to_person_id?: string | null;
  converted_to_organization_id?: string | null;
  converted_by_user_id?: string | null;
  wfm_project_id?: string | null;
  custom_field_values?: Record<string, any> | null;
  last_activity_at: string;
  automation_score_factors?: Record<string, any> | null;
  ai_insights?: Record<string, any> | null;
  created_by_user_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Define interface for lead updates at the service layer
export interface LeadServiceUpdateData {
  name?: string;
  source?: string | null;
  description?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  company_name?: string | null;
  estimated_value?: number | null;
  estimated_close_date?: string | null;
  lead_score?: number | null;
  assigned_to_user_id?: string | null;
  customFields?: CustomFieldValueInput[];
}

// --- Lead CRUD Operations ---

export async function getLeads(userId: string, accessToken: string): Promise<DbLead[]> {
  console.log('[leadCrud.getLeads] called for user:', userId);
  const supabase = getAuthenticatedClient(accessToken);
  const { data, error } = await supabase
    .from('leads')
    .select(`
      id, user_id, name, source, description, contact_name, contact_email, 
      contact_phone, company_name, estimated_value, estimated_close_date,
      lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
      converted_at, converted_to_deal_id, converted_to_person_id, 
      converted_to_organization_id, converted_by_user_id, wfm_project_id,
      custom_field_values, last_activity_at, automation_score_factors,
      ai_insights, created_by_user_id, created_at, updated_at
    `)
    .order('created_at', { ascending: false });

  handleSupabaseError(error, 'fetching leads');
  return (data || []) as DbLead[];
}

export async function getLeadById(userId: string, id: string, accessToken: string): Promise<DbLead | null> {
  console.log('[leadCrud.getLeadById] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  const { data, error } = await supabase
    .from('leads')
    .select(`
      id, user_id, name, source, description, contact_name, contact_email, 
      contact_phone, company_name, estimated_value, estimated_close_date,
      lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
      converted_at, converted_to_deal_id, converted_to_person_id, 
      converted_to_organization_id, converted_by_user_id, wfm_project_id,
      custom_field_values, last_activity_at, automation_score_factors,
      ai_insights, created_by_user_id, created_at, updated_at
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { 
     handleSupabaseError(error, 'fetching lead by ID');
  }
  return data as DbLead | null;
}

export async function createLead(userId: string, input: LeadInput, accessToken: string): Promise<DbLead> {
  console.log('[leadCrud.createLead] called for user:', userId);
  const supabase = getAuthenticatedClient(accessToken);
  
  let { customFields, wfmProjectTypeId, assignedToUserId, ...leadCoreData } = input; 

  // Handle auto-default project type resolution for AI-created leads
  if (wfmProjectTypeId === 'AUTO_DEFAULT_LEAD_QUALIFICATION') {
    console.log('[leadCrud.createLead] Resolving AUTO_DEFAULT_LEAD_QUALIFICATION to actual project type...');
    const { data: leadProjectType, error: projectTypeLookupError } = await supabase
      .from('project_types')
      .select('id')
      .eq('name', 'Lead Qualification and Conversion Process')
      .single();
    
    if (projectTypeLookupError || !leadProjectType) {
      console.error('[leadCrud.createLead] Failed to find Lead Qualification project type:', projectTypeLookupError);
      throw new GraphQLError('Default Lead Qualification project type not found. Please contact administrator.', { extensions: { code: 'CONFIGURATION_ERROR' } });
    }
    
    wfmProjectTypeId = leadProjectType.id;
    console.log(`[leadCrud.createLead] Resolved AUTO_DEFAULT_LEAD_QUALIFICATION to: ${wfmProjectTypeId}`);
  }

  if (!wfmProjectTypeId) {
    throw new GraphQLError('wfmProjectTypeId is required to create a lead.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  
  const processedCustomFields = await processCustomFieldsForCreate(customFields, supabase);
  
  const explicitLeadCoreData: any = {
    name: leadCoreData.name,
    source: leadCoreData.source,
    description: leadCoreData.description,
    contact_name: leadCoreData.contactName,
    contact_email: leadCoreData.contactEmail,
    contact_phone: leadCoreData.contactPhone,
    company_name: leadCoreData.companyName,
    estimated_value: leadCoreData.estimatedValue,
    estimated_close_date: leadCoreData.estimatedCloseDate,
  };

  // Calculate initial lead score
  const initialScore = calculateLeadScoreFields(explicitLeadCoreData);

  const finalLeadInsertPayload: any = {
    ...explicitLeadCoreData,
    user_id: userId,
    assigned_to_user_id: assignedToUserId || null,
    assigned_at: assignedToUserId ? new Date().toISOString() : null,
    lead_score: initialScore.score,
    lead_score_factors: initialScore.factors,
    custom_field_values: processedCustomFields,
    wfm_project_id: null,
    last_activity_at: new Date().toISOString(),
    created_by_user_id: userId,
  };

  const { data: newLeadRecord, error: leadCreateError } = await supabase
    .from('leads')
    .insert(finalLeadInsertPayload)
    .select(`
      id, user_id, name, source, description, contact_name, contact_email, 
      contact_phone, company_name, estimated_value, estimated_close_date,
      lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
      converted_at, converted_to_deal_id, converted_to_person_id, 
      converted_to_organization_id, converted_by_user_id, wfm_project_id,
      custom_field_values, last_activity_at, automation_score_factors,
      ai_insights, created_by_user_id, created_at, updated_at
    `)
    .single();

  handleSupabaseError(leadCreateError, 'creating lead');
  if (!newLeadRecord) {
      throw new GraphQLError('Failed to create lead, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  // ---- WFM Project Creation and Linking ----
  let wfmProjectIdToLink: string | null = null;
  try {
    // 1. Fetch the WFMProjectType to get its default workflow_id
    const { data: projectTypeData, error: projectTypeError } = await supabase
        .from('project_types')
        .select('id, name, default_workflow_id')
        .eq('id', wfmProjectTypeId)
        .single();

    handleSupabaseError(projectTypeError, `fetching WFM project type ${wfmProjectTypeId}`);
    if (!projectTypeData || !projectTypeData.default_workflow_id) {
        throw new GraphQLError(`WFM Project Type ${wfmProjectTypeId} not found or has no default workflow.`, { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const defaultWorkflowId = projectTypeData.default_workflow_id;

    // 2. Fetch the initial step for that workflow
    const { data: initialStepData, error: initialStepError } = await supabase
        .from('workflow_steps')
        .select('id, step_order')
        .eq('workflow_id', defaultWorkflowId)
        .eq('is_initial_step', true)
        .order('step_order', { ascending: true })
        .limit(1)
        .single();

    handleSupabaseError(initialStepError, `fetching initial step for workflow ${defaultWorkflowId}`);
    if (!initialStepData || !initialStepData.id) {
        throw new GraphQLError(`No initial step found for workflow ${defaultWorkflowId}. Cannot create WFM Project.`, { extensions: { code: 'CONFIGURATION_ERROR' } });
    }
    const initialStepIdForWfmProject = initialStepData.id;

    // 3. Create the WFMProject
    const placeholderUser: User = {
        id: userId,
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
    };

    const gqlContextForService = {
        supabaseClient: supabase, 
        currentUser: placeholderUser,
        token: accessToken, 
        userPermissions: [], 
        request: new Request('http://localhost'),
        params: {},
        waitUntil: (() => {}) as any,
    } as GraphQLContext;

    const newWfmProject = await createWFMProject(
        {
            name: `Lead Qualification: ${newLeadRecord.name}`,
            projectTypeId: wfmProjectTypeId, 
            workflowId: defaultWorkflowId,
            initialStepId: initialStepIdForWfmProject,
            createdByUserId: userId,
        },
        gqlContextForService
    );

    if (!newWfmProject || !newWfmProject.id) {
        throw new Error('WFM Project creation did not return an ID.');
    }
    wfmProjectIdToLink = newWfmProject.id;
    console.log(`[leadCrud.createLead] WFMProject created with ID: ${wfmProjectIdToLink} for lead ${newLeadRecord.id}. Attempting to link.`);

    // 4. Update the lead with the WFM project ID
    const { data: updatedLeadWithWfmLink, error: linkError } = await supabase
        .from('leads')
        .update({ wfm_project_id: wfmProjectIdToLink })
        .eq('id', newLeadRecord.id)
        .select(`
          id, user_id, name, source, description, contact_name, contact_email, 
          contact_phone, company_name, estimated_value, estimated_close_date,
          lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
          converted_at, converted_to_deal_id, converted_to_person_id, 
          converted_to_organization_id, converted_by_user_id, wfm_project_id,
          custom_field_values, last_activity_at, automation_score_factors,
          ai_insights, created_by_user_id, created_at, updated_at
        `)
        .single();

    if (linkError) {
      console.error(`[leadCrud.createLead] Error linking WFMProject ${wfmProjectIdToLink} to lead ${newLeadRecord.id}:`, linkError);
      throw new GraphQLError(`Failed to link WFM Project to lead: ${linkError.message}`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    if (!updatedLeadWithWfmLink) {
        throw new GraphQLError('Failed to update lead with WFM project link, no data returned.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }

    console.log(`[leadCrud.createLead] Successfully linked WFM project ${wfmProjectIdToLink} to lead ${newLeadRecord.id}`);

    // Record lead creation in history (using the FINAL updated lead record)
    try {
      await recordEntityHistory(
        supabase,
        'lead_history',
        'lead_id',
        updatedLeadWithWfmLink.id,
        userId,
        'CREATED',
        { 
          lead_name: updatedLeadWithWfmLink.name,
          lead_score: updatedLeadWithWfmLink.lead_score,
          source: updatedLeadWithWfmLink.source
        }
      );
    } catch (historyError) {
      console.error('[leadCrud.createLead] Failed to record lead creation history:', historyError);
      // Continue - history failure shouldn't block lead creation
    }

    return updatedLeadWithWfmLink as DbLead;

  } catch (wfmError: any) {
    console.error(`[leadCrud.createLead] CRITICAL: Failed to create or link WFMProject for lead ${newLeadRecord.id}. Error: ${wfmError.message}`, wfmError);
    // Rollback or compensation logic might be needed here if the lead was created but WFM project failed.
    // For now, re-throwing to make the entire mutation fail.
    throw new GraphQLError(`Failed to create/link WFM system for lead: ${wfmError.message}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: wfmError }
    });
  }
}

export async function updateLead(userId: string, id: string, input: LeadServiceUpdateData, accessToken: string): Promise<DbLead | null> {
  console.log('[leadCrud.updateLead] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  
  // Get current lead data for change tracking
  const currentLead = await getLeadById(userId, id, accessToken);
  if (!currentLead) {
    throw new GraphQLError('Lead not found', { extensions: { code: 'NOT_FOUND' } });
  }

  let { customFields, ...leadUpdateData } = input;
  
  // Process custom fields if provided
  const processedCustomFields = customFields ? 
    await processCustomFieldsForUpdate(customFields, supabase) : undefined;

  // Handle contact field mapping
  const mappedUpdateData: any = {
    ...leadUpdateData,
    contact_name: leadUpdateData.contact_name,
    contact_email: leadUpdateData.contact_email,
    contact_phone: leadUpdateData.contact_phone,
    company_name: leadUpdateData.company_name,
    estimated_value: leadUpdateData.estimated_value,
    estimated_close_date: leadUpdateData.estimated_close_date,
    lead_score: leadUpdateData.lead_score,
    assigned_to_user_id: leadUpdateData.assigned_to_user_id,
  };

  // Update assigned_at if assignment is changing
  if (leadUpdateData.assigned_to_user_id !== undefined && 
      leadUpdateData.assigned_to_user_id !== currentLead.assigned_to_user_id) {
    mappedUpdateData.assigned_at = leadUpdateData.assigned_to_user_id ? new Date().toISOString() : null;
  }

  // Add custom fields if processed
  if (processedCustomFields !== undefined) {
    mappedUpdateData.custom_field_values = processedCustomFields;
  }

  // Filter out undefined values
  const finalUpdatePayload = Object.fromEntries(
    Object.entries(mappedUpdateData).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(finalUpdatePayload).length === 0) {
    console.log('[leadCrud.updateLead] No fields to update, returning current lead');
    return currentLead;
  }

  const { data: updatedLeadRecord, error: updateError } = await supabase
    .from('leads')
    .update(finalUpdatePayload)
    .eq('id', id)
    .select(`
      id, user_id, name, source, description, contact_name, contact_email, 
      contact_phone, company_name, estimated_value, estimated_close_date,
      lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
      converted_at, converted_to_deal_id, converted_to_person_id, 
      converted_to_organization_id, converted_by_user_id, wfm_project_id,
      custom_field_values, last_activity_at, automation_score_factors,
      ai_insights, created_by_user_id, created_at, updated_at
    `)
    .single();

  handleSupabaseError(updateError, 'updating lead');
  if (!updatedLeadRecord) {
    throw new GraphQLError('Failed to update lead', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  // Record changes in history
  try {
    const changes = generateLeadChanges(currentLead, updatedLeadRecord);
    if (changes && Object.keys(changes).length > 0) {
      await recordEntityHistory(
        supabase,
        'lead_history',
        'lead_id',
        id,
        userId,
        'UPDATED',
        changes
      );
    }
  } catch (historyError) {
    console.error('[leadCrud.updateLead] Failed to record lead update history:', historyError);
    // Continue - history failure shouldn't block update
  }

  // Trigger lead score recalculation if relevant fields changed
  const scoreRelevantFields = ['source', 'estimated_value', 'contact_email', 'company_name'];
  const hasScoreRelevantChanges = scoreRelevantFields.some(field => 
    finalUpdatePayload.hasOwnProperty(field.replace('_', ''))
  );

  if (hasScoreRelevantChanges) {
    try {
      await inngest.send({
        name: 'lead.score.recalculate',
        data: {
          leadId: id,
          userId: userId,
          reason: 'field_update'
        }
      });
    } catch (inngestError) {
      console.error('[leadCrud.updateLead] Failed to trigger lead score recalculation:', inngestError);
      // Continue - background job failure shouldn't block update
    }
  }

  return updatedLeadRecord as DbLead;
}

export async function deleteLead(userId: string, id: string, accessToken: string): Promise<boolean> {
  console.log('[leadCrud.deleteLead] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  
  // Get lead data before deletion for history
  const leadToDelete = await getLeadById(userId, id, accessToken);
  if (!leadToDelete) {
    throw new GraphQLError('Lead not found', { extensions: { code: 'NOT_FOUND' } });
  }

  // Check if lead is converted - prevent deletion of converted leads
  if (leadToDelete.converted_at) {
    throw new GraphQLError('Cannot delete converted leads. Archive or update status instead.', { 
      extensions: { code: 'BUSINESS_RULE_VIOLATION' } 
    });
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  handleSupabaseError(error, 'deleting lead');

  // Record deletion in history
  try {
    await recordEntityHistory(
      supabase,
      'lead_history',
      'lead_id',
      id,
      userId,
      'DELETED',
      {
        lead_name: leadToDelete.name,
        deleted_at: new Date().toISOString()
      }
    );
  } catch (historyError) {
    console.error('[leadCrud.deleteLead] Failed to record lead deletion history:', historyError);
    // Continue - history failure shouldn't block deletion
  }

  return true;
}

// Helper function to get user permissions
async function getUserPermissions(userId: string, supabaseClient: any): Promise<string[]> {
  const { data } = await supabaseClient
    .from('user_permissions_view')
    .select('permission')
    .eq('user_id', userId);
  
  return data?.map((p: any) => p.permission) || [];
}

// Helper function to convert date strings
function convertToDateOrNull(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString();
  } catch {
    return null;
  }
}

/**
 * Qualify a lead with qualification notes (DEPRECATED - Use WFM workflow progression instead)
 * This function is kept for backwards compatibility but leads should be qualified
 * by progressing through WFM workflow steps with appropriate metadata.
 */
export async function qualifyLead(
  userId: string,
  leadId: string,
  isQualified: boolean,
  qualificationNotes: string,
  accessToken: string
): Promise<DbLead> {
  // This function is deprecated - qualification should be handled through WFM metadata
  throw new Error('Lead qualification should be handled through WFM workflow progression. Use updateLeadWFMProgress instead.');
}

/**
 * Recalculate lead score based on current data
 */
export async function recalculateLeadScore(
  userId: string,
  leadId: string,
  accessToken: string
): Promise<DbLead> {
  const supabaseClient = getAuthenticatedClient(accessToken);

  try {
    // Get current lead data
    const { data: lead, error: fetchError } = await supabaseClient
      .from('leads')
      .select(`
        id, user_id, name, source, description, contact_name, contact_email, 
        contact_phone, company_name, estimated_value, estimated_close_date,
        lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
        converted_at, converted_to_deal_id, converted_to_person_id, 
        converted_to_organization_id, converted_by_user_id, wfm_project_id,
        custom_field_values, last_activity_at, automation_score_factors,
        ai_insights, created_by_user_id, created_at, updated_at
      `)
      .eq('id', leadId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw handleSupabaseError(fetchError, 'Failed to fetch lead for scoring');
    }

    if (!lead) {
      throw new Error('Lead not found or access denied');
    }

    // Calculate new score using the scoring engine
    const scoreFields = calculateLeadScoreFields(lead);
    
    // Update lead with new score
    const { data: updatedLead, error: updateError } = await supabaseClient
      .from('leads')
      .update({
        lead_score: scoreFields.totalScore,
        lead_score_factors: scoreFields.factors,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('user_id', userId)
      .select(`
        id, user_id, name, source, description, contact_name, contact_email, 
        contact_phone, company_name, estimated_value, estimated_close_date,
        lead_score, lead_score_factors, assigned_to_user_id, assigned_at,
        converted_at, converted_to_deal_id, converted_to_person_id, 
        converted_to_organization_id, converted_by_user_id, wfm_project_id,
        custom_field_values, last_activity_at, automation_score_factors,
        ai_insights, created_by_user_id, created_at, updated_at
      `)
      .single();

    if (updateError) {
      throw handleSupabaseError(updateError, 'Failed to update lead score');
    }

    if (!updatedLead) {
      throw new Error('Failed to update lead score');
    }

    // Record history
    await recordEntityHistory(
      supabaseClient,
      'lead_history',
      'lead_id',
      leadId,
      userId,
      'score_updated',
      {
        old_score: lead.lead_score,
        new_score: scoreFields.totalScore,
        score_factors: scoreFields.factors,
      }
    );

    return updatedLead;
  } catch (error) {
    console.error('Error recalculating lead score:', error);
    throw error;
  }
} 