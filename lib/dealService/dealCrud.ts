import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError, recordEntityHistory } from '../serviceUtils';
import type { Deal, DealInput, CustomFieldValueInput } from '../generated/graphql';
import { inngest } from '../inngestClient';

import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './dealCustomFields';
import { calculateDealProbabilityFields } from './dealProbability';
import { generateDealChanges } from './dealHistory';
import { createWFMProject } from '../wfmProjectService';
import type { GraphQLContext } from '../../netlify/functions/graphql/helpers';
import type { User } from '@supabase/supabase-js';

// Define a new interface for deal updates at the service layer
export interface DealServiceUpdateData {
  name?: string;
  amount?: number | null;
  expected_close_date?: string | null; // Keep as string | null from input
  person_id?: string | null;
  organization_id?: string | null;
  deal_specific_probability?: number | null;
  assigned_to_user_id?: string | null; // Added to allow updating the assigned user
  customFields?: CustomFieldValueInput[];
}

// --- Deal CRUD Operations ---

export async function getDeals(userId: string, accessToken: string): Promise<Deal[]> {
  console.log('[dealCrud.getDeals] called for user:', userId);
  const supabase = getAuthenticatedClient(accessToken);
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });

  handleSupabaseError(error, 'fetching deals');
  return (data || []) as Deal[];
}

export async function getDealById(userId: string, id: string, accessToken:string): Promise<Deal | null> {
  console.log('[dealCrud.getDealById] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { 
     handleSupabaseError(error, 'fetching deal by ID');
  }
  return data;
}

export async function createDeal(userId: string, input: DealInput, accessToken: string): Promise<Deal> {
  console.log('[dealCrud.createDeal] called for user:', userId /*, 'input:', JSON.stringify(input, null, 2)*/);
  const supabase = getAuthenticatedClient(accessToken);
  
  // Extract assigned_to_user_id along with other fields
  const { customFields, wfmProjectTypeId, assigned_to_user_id, ...dealCoreData } = input; 

  if (!wfmProjectTypeId) {
    throw new GraphQLError('wfmProjectTypeId is required to create a deal.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  
  const processedCustomFields = await processCustomFieldsForCreate(customFields, supabase);
  
  const explicitDealCoreData: any = {
    name: dealCoreData.name,
    amount: dealCoreData.amount,
    expected_close_date: dealCoreData.expected_close_date,
    person_id: dealCoreData.person_id,
    organization_id: dealCoreData.organization_id,
    deal_specific_probability: dealCoreData.deal_specific_probability,
    // assigned_to_user_id is handled below
  };

  const finalDealInsertPayload: any = {
    ...explicitDealCoreData,
    user_id: userId, // The user who created the deal
    assigned_to_user_id: assigned_to_user_id || userId, // Assign to provided user or default to creator
    custom_field_values: processedCustomFields,
    wfm_project_id: null, 
  };

  const { data: newDealRecord, error: dealCreateError } = await supabase
    .from('deals')
    .insert(finalDealInsertPayload)
    .select()
    .single();

  handleSupabaseError(dealCreateError, 'creating deal');
  if (!newDealRecord) {
      throw new GraphQLError('Failed to create deal, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  // ---- WFM Project Creation and Linking ----
  let wfmProjectIdToLink: string | null = null;
  try {
    // console.log(`[dealCrud.createDeal] Preparing to create WFMProject for deal ${newDealRecord.id} with project type ID: ${wfmProjectTypeId}`);

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
    // console.log(`[dealCrud.createDeal] Found default workflow ID: ${defaultWorkflowId} for project type ${projectTypeData.name}`);

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
    // console.log(`[dealCrud.createDeal] Found initial step ID: ${initialStepIdForWfmProject} for workflow ${defaultWorkflowId}`);

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
            name: `WFM for Deal: ${newDealRecord.name}`,
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
    console.log(`[dealCrud.createDeal] WFMProject created with ID: ${wfmProjectIdToLink} for deal ${newDealRecord.id}. Attempting to link.`);

    // 4. Update the deal record with the new wfm_project_id
    const { data: updatedDealWithWfmLink, error: linkError } = await supabase
      .from('deals')
      .update({ wfm_project_id: wfmProjectIdToLink })
      .eq('id', newDealRecord.id)
      .select()
      .single();

    if (linkError) {
      console.error(`[dealCrud.createDeal] Error linking WFMProject ${wfmProjectIdToLink} to deal ${newDealRecord.id}:`, linkError);
      throw new GraphQLError(`Failed to link WFM Project to deal: ${linkError.message}`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    if (!updatedDealWithWfmLink) {
        throw new GraphQLError('Failed to update deal with WFM project link, no data returned.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    
    // console.log(`[dealCrud.createDeal] Deal ${newDealRecord.id} successfully linked to WFMProject ${wfmProjectIdToLink}.`);
    
    // Record history for deal creation (using the *final* updated deal record)
    const initialChangesForHistory: Record<string, { oldValue: any; newValue: any }> = generateDealChanges({} as Deal, updatedDealWithWfmLink as Deal);
    await recordEntityHistory(
        supabase, 
        'deal_history', 
        'deal_id', 
        updatedDealWithWfmLink.id, 
        userId, 
        'DEAL_CREATED', 
        initialChangesForHistory
    );
    
    // Send Inngest event
    try {
        await inngest.send({
            name: 'crm/deal.created',
            user: { id: userId }, 
            data: { dealId: updatedDealWithWfmLink.id, /* other relevant data */ },
        });
        console.log(`[dealCrud.createDeal] Sent 'crm/deal.created' event for deal ID: ${updatedDealWithWfmLink.id}`);
    } catch (eventError: any) {
        console.error(`[dealCrud.createDeal] Failed to send 'crm/deal.created' event for deal ID: ${updatedDealWithWfmLink.id}:`, eventError.message);
        // Do not let Inngest failure roll back the deal creation
    }
        
    return updatedDealWithWfmLink as Deal; // Return the fully updated deal

  } catch (wfmError: any) {
    console.error(`[dealCrud.createDeal] CRITICAL: Failed to create or link WFMProject for deal ${newDealRecord.id}. Error: ${wfmError.message}`, wfmError);
    // Rollback or compensation logic might be needed here if the deal was created but WFM project failed.
    // For now, re-throwing to make the entire mutation fail.
    throw new GraphQLError(`Failed to create/link WFM system for deal: ${wfmError.message}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: wfmError }
    });
  }
}

export async function updateDeal(userId: string, id: string, input: DealServiceUpdateData, accessToken: string): Promise<Deal> {
  console.log('[dealCrud.updateDeal] called for user:', userId, 'id:', id /*, 'input:', JSON.stringify(input, null, 2)*/);
  const supabase = getAuthenticatedClient(accessToken); 
  
  const { customFields: inputCustomFields, ...otherCoreInputFieldsFromInput } = input;

  if (Object.keys(otherCoreInputFieldsFromInput).length === 0 && (inputCustomFields === undefined || (Array.isArray(inputCustomFields) && inputCustomFields.length === 0))) {
    throw new GraphQLError('No fields provided for deal update.', { extensions: { code: 'BAD_USER_INPUT' } });
  }

  const oldDealData = await getDealById(userId, id, accessToken);
  if (!oldDealData) {
      throw new GraphQLError('Deal not found for update', { extensions: { code: 'NOT_FOUND' } });
  }

  // Prepare core data for DB update, converting date string to Date object or null
  const coreDataForDb: any = {};
  if (otherCoreInputFieldsFromInput.name !== undefined) coreDataForDb.name = otherCoreInputFieldsFromInput.name;
  if (otherCoreInputFieldsFromInput.amount !== undefined) coreDataForDb.amount = otherCoreInputFieldsFromInput.amount;
  if (otherCoreInputFieldsFromInput.expected_close_date !== undefined) {
    coreDataForDb.expected_close_date = otherCoreInputFieldsFromInput.expected_close_date 
        ? new Date(otherCoreInputFieldsFromInput.expected_close_date) 
        : null;
  }
  if (otherCoreInputFieldsFromInput.person_id !== undefined) coreDataForDb.person_id = otherCoreInputFieldsFromInput.person_id;
  if (otherCoreInputFieldsFromInput.organization_id !== undefined) coreDataForDb.organization_id = otherCoreInputFieldsFromInput.organization_id;
  if (otherCoreInputFieldsFromInput.deal_specific_probability !== undefined) coreDataForDb.deal_specific_probability = otherCoreInputFieldsFromInput.deal_specific_probability;
  // Add assigned_to_user_id to coreDataForDb if provided in the input
  if (otherCoreInputFieldsFromInput.assigned_to_user_id !== undefined) coreDataForDb.assigned_to_user_id = otherCoreInputFieldsFromInput.assigned_to_user_id;
  
  let dbUpdatePayload: any = { ...coreDataForDb }; 
  
  if (inputCustomFields !== undefined) { 
      const { finalCustomFieldValues } = await processCustomFieldsForUpdate(
          (oldDealData as any).custom_field_values || null,
          inputCustomFields, 
          supabase
      );
      dbUpdatePayload.custom_field_values = finalCustomFieldValues;
  }
  
  // For calculateDealProbabilityFields, pass coreDataForDb which has expected_close_date as Date
  const probabilityUpdates = await calculateDealProbabilityFields(
      coreDataForDb, 
      oldDealData,
      supabase
  );
  if (probabilityUpdates.deal_specific_probability_to_set !== undefined) {
      dbUpdatePayload.deal_specific_probability = probabilityUpdates.deal_specific_probability_to_set;
  }
  if (probabilityUpdates.weighted_amount_to_set !== undefined) {
      dbUpdatePayload.weighted_amount = probabilityUpdates.weighted_amount_to_set;
  }

  // pipeline_id should not be in DealServiceUpdateData, so no need to delete from dbUpdatePayload

  let hasActualUpdate = false;
  for (const _key in dbUpdatePayload) {
      hasActualUpdate = true;
      break;
  }

  if (!hasActualUpdate) {
    console.log('[dealCrud.updateDeal] No actual fields to update in DB payload after processing. Returning old deal data.');
    return oldDealData; 
  }

  console.log('[dealCrud.updateDeal] Final DB update payload for Supabase:', JSON.stringify(dbUpdatePayload, null, 2));
  const { data: updatedDealFromDb, error: dbError } = await supabase
    .from('deals')
    .update(dbUpdatePayload) 
    .eq('id', id)
    .select() 
    .single();

  console.log('[dealCrud.updateDeal] Supabase update result - data:', JSON.stringify(updatedDealFromDb, null, 2), 'error:', JSON.stringify(dbError, null, 2));

  handleSupabaseError(dbError, 'updating deal in DB');
   if (!updatedDealFromDb) { 
      throw new GraphQLError('Deal update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  const actualChanges = generateDealChanges(oldDealData, updatedDealFromDb as Deal);
  
  if (Object.keys(actualChanges).length > 0) {
    console.log('[dealCrud.updateDeal] Recording history with changes:', JSON.stringify(actualChanges, null, 2));
    await recordEntityHistory(
      supabase,
      'deal_history',
      'deal_id',
      id,
      userId,
      'DEAL_UPDATED',
      actualChanges
    );

    try {
      await inngest.send({
        name: 'crm/deal.updated',
        user: { id: userId }, 
        data: {
          dealId: id,
          updatedFields: Object.keys(actualChanges),
          changes: actualChanges, 
        },
      });
      console.log(`[dealCrud.updateDeal] Sent 'crm/deal.updated' event for deal ID: ${id}`);
    } catch (eventError: any) {
      console.error(`[dealCrud.updateDeal] Failed to send 'crm/deal.updated' event for deal ID: ${id}:`, eventError.message);
    }
  } else {
      console.log('[dealCrud.updateDeal] No actual changes detected to record in history.');
  }

  return updatedDealFromDb as Deal;
}

export async function deleteDeal(userId: string, id: string, accessToken: string): Promise<boolean> {
  console.log('[dealCrud.deleteDeal] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  
  const { error, count } = await supabase
    .from('deals')
    .delete()
    .eq('id', id);

  handleSupabaseError(error, 'deleting deal');
  
  if (!error) {
    await recordEntityHistory(
      supabase,
      'deal_history',
      'deal_id',
      id,
      userId,
      'DEAL_DELETED',
      { deleted_deal_id: id }
    );
  }
  
  console.log('[dealCrud.deleteDeal] Deleted count (informational):', count);
  return !error;
} 