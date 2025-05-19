import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError, recordEntityHistory } from '../serviceUtils';
import type { Deal, DealInput, CustomFieldValueInput } from '../generated/graphql';
import { inngest } from '../inngestClient';

import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './dealCustomFields';
import { calculateDealProbabilityFields } from './dealProbability';
import { generateDealChanges } from './dealHistory';

// Define a more specific type for the update payload, similar to original dealService.ts
interface DealUpdatePayload extends Partial<DealInput> {
  user_id?: string; 
  weighted_amount?: number | null;
  custom_field_values?: Record<string, any> | null;
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
  console.log('[dealCrud.createDeal] called for user:', userId, 'input:', JSON.stringify(input, null, 2));
  const supabase = getAuthenticatedClient(accessToken);
  
  const { pipeline_id, customFields, ...dealCoreData } = input; // pipeline_id is part of DealInput, used by schema/Zod, but not directly on 'deals' table
  
  const processedCustomFields = await processCustomFieldsForCreate(customFields, supabase);
  
  const insertPayload: any = { 
    ...dealCoreData, 
    user_id: userId,
    // Ensure pipeline_id is not in insertPayload if it's not a direct column on 'deals' table
    // It's used for validation/association elsewhere, not part of the direct deals table schema usually.
    // If pipeline_id IS a direct column, this can be adjusted.
    // Based on current DealInput, pipeline_id and stage_id are required.
    // stage_id is on deals table, pipeline_id might be for stage validation.
    // Assuming pipeline_id is not directly inserted into deals table from here.
  };
  // Remove pipeline_id if it was destructured into dealCoreData and is not a direct column.
  // It's safer to explicitly build the payload if there's ambiguity.
  // Let's rebuild dealCoreData for insert to be explicit:
  const explicitDealCoreData: Partial<DealInput> = {
    name: input.name,
    stage_id: input.stage_id, // This is on deals table
    amount: input.amount,
    expected_close_date: input.expected_close_date,
    person_id: input.person_id,
    organization_id: input.organization_id,
    deal_specific_probability: input.deal_specific_probability,
    // Do NOT include pipeline_id here if it's not a direct column of 'deals' table
  };

  const finalInsertPayload: any = {
    ...explicitDealCoreData,
    user_id: userId,
    custom_field_values: processedCustomFields, // This can be null
  };

  console.log('[dealCrud.createDeal] Final insert payload for Supabase:', JSON.stringify(finalInsertPayload, null, 2));

  const { data: newDealRecord, error } = await supabase
    .from('deals')
    .insert(finalInsertPayload)
    .select()
    .single();

  handleSupabaseError(error, 'creating deal');
  if (!newDealRecord) {
      throw new GraphQLError('Failed to create deal, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  const initialChanges: Record<string, any> = {};
  const relevantFieldsForCreate: (keyof Deal)[] = ['name', 'stage_id', 'amount', 'expected_close_date', 'person_id', 'organization_id', 'deal_specific_probability'];
  relevantFieldsForCreate.forEach(key => {
    if (newDealRecord[key] !== undefined && newDealRecord[key] !== null) {
      initialChanges[key] = newDealRecord[key];
    }
  });
  // Also consider adding created custom fields to initialChanges if needed.
  if (newDealRecord.custom_field_values) {
    initialChanges.custom_field_values = newDealRecord.custom_field_values;
  }

  await recordEntityHistory(
    supabase,
    'deal_history',
    'deal_id',
    newDealRecord.id,
    userId,
    'DEAL_CREATED',
    initialChanges
  );
  return newDealRecord as Deal;
}

export async function updateDeal(userId: string, id: string, input: Partial<DealInput>, accessToken: string): Promise<Deal> {
  console.log('[dealCrud.updateDeal] called for user:', userId, 'id:', id, 'input:', JSON.stringify(input, null, 2));
  const supabase = getAuthenticatedClient(accessToken); 
  
  const { customFields: inputCustomFields, ...coreInput } = input;

  // Initial check: if coreInput is empty AND there are no customFields to process, then it's an empty update.
  if (Object.keys(coreInput).length === 0 && (inputCustomFields === undefined || (Array.isArray(inputCustomFields) && inputCustomFields.length === 0))) {
      throw new GraphQLError('No fields provided for deal update.', { extensions: { code: 'BAD_USER_INPUT' } });
  }

  const oldDealData = await getDealById(userId, id, accessToken);
  if (!oldDealData) {
      throw new GraphQLError('Deal not found for update', { extensions: { code: 'NOT_FOUND' } });
  }

  // Start with coreInput. Supabase client will ignore undefined fields.
  const dbUpdatePayload: DealUpdatePayload = { ...coreInput }; 
  
  // Process custom fields if the key 'customFields' was provided in the input
  if (inputCustomFields !== undefined) { 
      const { finalCustomFieldValues } = await processCustomFieldsForUpdate(
          (oldDealData as any).custom_field_values || null,
          inputCustomFields, // can be null or empty array if key was present
          supabase
      );
      // Assign regardless of whether finalCustomFieldValues is null, to allow clearing custom fields.
      dbUpdatePayload.custom_field_values = finalCustomFieldValues;
  }
  
  // Calculate and add probability fields
  const probabilityUpdates = await calculateDealProbabilityFields(
      coreInput, // Contains potential stage_id or amount changes
      oldDealData,
      supabase
  );
  if (probabilityUpdates.deal_specific_probability_to_set !== undefined) {
      dbUpdatePayload.deal_specific_probability = probabilityUpdates.deal_specific_probability_to_set;
  }
  if (probabilityUpdates.weighted_amount_to_set !== undefined) {
      dbUpdatePayload.weighted_amount = probabilityUpdates.weighted_amount_to_set;
  }

  // Ensure pipeline_id is not part of the direct update payload to 'deals' table
  if ('pipeline_id' in dbUpdatePayload) {
      delete (dbUpdatePayload as any).pipeline_id;
  }

  // Check if there's anything to update after all processing.
  // We need to be careful: dbUpdatePayload might contain only { custom_field_values: null }
  // which IS an update. Or { deal_specific_probability: null } which is also an update.
  // An empty object {} means no fields are being explicitly changed.
  let hasActualUpdate = false;
  for (const _key in dbUpdatePayload) {
      hasActualUpdate = true;
      break;
  }

  if (!hasActualUpdate) {
    console.log('[dealCrud.updateDeal] No actual fields to update in DB payload after processing. Returning old deal data.');
    return oldDealData; 
  }

  console.log('[dealCrud.updateDeal] Final DB update payload:', JSON.stringify(dbUpdatePayload, null, 2));
  const { data: updatedDeal, error } = await supabase
    .from('deals')
    .update(dbUpdatePayload) // Pass dbUpdatePayload directly
    .eq('id', id)
    .select()
    .single();

  handleSupabaseError(error, 'updating deal');
   if (!updatedDeal) { 
      throw new GraphQLError('Deal update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  const actualChanges = generateDealChanges(oldDealData, updatedDeal as Deal);
  
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

  return updatedDeal as Deal;
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