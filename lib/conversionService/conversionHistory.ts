import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { ConversionType } from './index';

export interface ConversionHistoryEntry {
  id: string;
  conversionType: ConversionType;
  sourceEntityType: 'lead' | 'deal';
  sourceEntityId: string;
  targetEntityType: 'deal' | 'lead';
  targetEntityId: string;
  conversionReason?: string;
  conversionData: any;
  wfmTransitionPlan: any;
  convertedByUserId: string;
  convertedAt: string;
  createdAt: string;
}

export interface RecordConversionHistoryInput {
  conversionType: ConversionType;
  sourceEntityType: 'lead' | 'deal';
  sourceEntityId: string;
  targetEntityType: 'deal' | 'lead';
  targetEntityId: string;
  conversionReason?: string;
  conversionData: any;
  wfmTransitionPlan: any;
  convertedByUserId: string;
  supabase: ReturnType<typeof createClient<Database>>;
}

/**
 * Record a conversion in the audit trail
 */
export async function recordConversionHistory(
  input: RecordConversionHistoryInput
): Promise<string> {
  try {
    const { data, error } = await input.supabase
      .from('conversion_history')
      .insert({
        conversion_type: input.conversionType,
        source_entity_type: input.sourceEntityType,
        source_entity_id: input.sourceEntityId,
        target_entity_type: input.targetEntityType,
        target_entity_id: input.targetEntityId,
        conversion_reason: input.conversionReason,
        conversion_data: input.conversionData,
        wfm_transition_plan: input.wfmTransitionPlan,
        converted_by_user_id: input.convertedByUserId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error recording conversion history:', error);
      throw new Error('Failed to record conversion history');
    }

    return data.id;
  } catch (error) {
    console.error('Failed to record conversion history:', error);
    throw error;
  }
}

/**
 * Get conversion history for an entity
 */
export async function getConversionHistory(
  entityType: 'lead' | 'deal',
  entityId: string,
  supabase: ReturnType<typeof createClient<Database>>
): Promise<ConversionHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('conversion_history')
      .select('*')
      .or(`source_entity_id.eq.${entityId},target_entity_id.eq.${entityId}`)
      .order('converted_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversion history:', error);
      return [];
    }

    return data.map(record => ({
      id: record.id,
      conversionType: record.conversion_type as ConversionType,
      sourceEntityType: record.source_entity_type as 'lead' | 'deal',
      sourceEntityId: record.source_entity_id,
      targetEntityType: record.target_entity_type as 'deal' | 'lead',
      targetEntityId: record.target_entity_id,
      conversionReason: record.conversion_reason || undefined,
      conversionData: record.conversion_data,
      wfmTransitionPlan: record.wfm_transition_plan,
      convertedByUserId: record.converted_by_user_id || '',
      convertedAt: record.converted_at || '',
      createdAt: record.created_at || ''
    }));
  } catch (error) {
    console.error('Failed to fetch conversion history:', error);
    return [];
  }
} 