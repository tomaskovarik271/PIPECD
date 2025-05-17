import type { Deal, DealInput } from '../generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleSupabaseError } from '../serviceUtils'; // For consistent error handling
import { GraphQLError } from 'graphql';

interface DealProbabilityCalculationResult {
  deal_specific_probability_to_set?: number | null;
  weighted_amount_to_set?: number | null;
}

/**
 * Calculates deal probability and weighted amount based on stage or amount changes.
 * @param dealUpdateInput The partial input for the deal update.
 * @param oldDealData The current state of the deal from the database.
 * @param supabaseClient Authenticated Supabase client instance.
 * @returns An object with `deal_specific_probability_to_set` and `weighted_amount_to_set`.
 */
export const calculateDealProbabilityFields = async (
  dealUpdateInput: Partial<DealInput>,
  oldDealData: Deal, 
  supabaseClient: SupabaseClient
): Promise<DealProbabilityCalculationResult> => {
  const result: DealProbabilityCalculationResult = {};

  // 1. Handle stage change and associated probability adjustments
  if (dealUpdateInput.stage_id && dealUpdateInput.stage_id !== oldDealData.stage_id) {
    console.log(`[dealProbability.calculate] Stage changed from ${oldDealData.stage_id} to ${dealUpdateInput.stage_id}`);
    const { data: newStage, error: stageError } = await supabaseClient
        .from('stages')
        .select('stage_type, deal_probability') 
        .eq('id', dealUpdateInput.stage_id)
        .single();

    if (stageError) {
        handleSupabaseError(stageError, `fetching new stage ${dealUpdateInput.stage_id} for deal update`);
        // Throwing here ensures the operation stops if the target stage is invalid.
        throw new GraphQLError(`Target stage ${dealUpdateInput.stage_id} not found.`, { extensions: { code: 'BAD_USER_INPUT' } });
    }

    if (newStage) {
        console.log('[dealProbability.calculate] New stage properties:', newStage);
        let effectiveProbability: number | null = null;

        if (newStage.stage_type === 'WON') {
            result.deal_specific_probability_to_set = 1.0;
            effectiveProbability = 1.0;
            console.log('[dealProbability.calculate] Setting deal_specific_probability to 1.0 for WON stage');
        } else if (newStage.stage_type === 'LOST') {
            result.deal_specific_probability_to_set = 0.0;
            effectiveProbability = 0.0;
            console.log('[dealProbability.calculate] Setting deal_specific_probability to 0.0 for LOST stage');
        } else { // OPEN stage
            result.deal_specific_probability_to_set = null; 
            effectiveProbability = newStage.deal_probability; 
            console.log('[dealProbability.calculate] Clearing deal_specific_probability for OPEN stage, effective probability from stage:', effectiveProbability);
        }

        const currentAmount = typeof dealUpdateInput.amount === 'number' ? dealUpdateInput.amount : oldDealData.amount;
        if (typeof currentAmount === 'number' && effectiveProbability !== null) {
            result.weighted_amount_to_set = currentAmount * effectiveProbability;
            console.log('[dealProbability.calculate] Calculated weighted_amount:', result.weighted_amount_to_set);
        } else {
            result.weighted_amount_to_set = null; 
            console.log('[dealProbability.calculate] Setting weighted_amount to null due to missing amount or probability for new stage.');
        }
    } else {
         console.warn(`[dealProbability.calculate] New stage ${dealUpdateInput.stage_id} not found, probability not adjusted. Weighted amount not calculated.`);
    }
  // 2. Handle amount change if stage did not change (or if stage change logic didn't set weighted_amount)
  } else if (typeof dealUpdateInput.amount === 'number' && dealUpdateInput.amount !== oldDealData.amount) {
    console.log('[dealProbability.calculate] Amount changed. Recalculating weighted_amount.');
    let existingEffectiveProbability: number | null = null;

    // Use the probability that would result from the current update input if stage also changed,
    // otherwise use old deal's probability logic.
    if (result.deal_specific_probability_to_set !== undefined) { // Stage change has determined new specific probability
        if (result.deal_specific_probability_to_set === 1.0 || result.deal_specific_probability_to_set === 0.0) {
            existingEffectiveProbability = result.deal_specific_probability_to_set;
        } else { // deal_specific_probability is null (OPEN stage), need stage's default probability
            // This requires fetching the stage if stage_id isn't changing or already fetched. This is complex if stage is not changing.
            // For simplicity, if stage is not changing, use existing oldDealData probability logic.
            // This case is primarily when ONLY amount changes.
            if (oldDealData.deal_specific_probability !== null && oldDealData.deal_specific_probability !== undefined) {
                existingEffectiveProbability = oldDealData.deal_specific_probability;
            } else if (oldDealData.stage_id) {
                const { data: currentStage } = await supabaseClient
                    .from('stages')
                    .select('deal_probability, stage_type') 
                    .eq('id', oldDealData.stage_id)
                    .single(); // Error handling might be needed here too
                if (currentStage) {
                    if (currentStage.stage_type === 'WON') existingEffectiveProbability = 1.0;
                    else if (currentStage.stage_type === 'LOST') existingEffectiveProbability = 0.0;
                    else existingEffectiveProbability = currentStage.deal_probability;
                }
            }
        }
    } else { // Stage is not changing, use old deal's probability context
        if (oldDealData.deal_specific_probability !== null && oldDealData.deal_specific_probability !== undefined) {
            existingEffectiveProbability = oldDealData.deal_specific_probability;
        } else if (oldDealData.stage_id) {
            const { data: currentStage, error: currentStageError } = await supabaseClient
                .from('stages')
                .select('deal_probability, stage_type') 
                .eq('id', oldDealData.stage_id)
                .single();
            
            if (currentStage && !currentStageError) {
                if (currentStage.stage_type === 'WON') existingEffectiveProbability = 1.0;
                else if (currentStage.stage_type === 'LOST') existingEffectiveProbability = 0.0;
                else existingEffectiveProbability = currentStage.deal_probability;
            } else {
                console.warn(`[dealProbability.calculate] Could not fetch current stage ${oldDealData.stage_id} to recalculate weighted_amount.`);
            }
        }
    }

    if (typeof dealUpdateInput.amount === 'number' && existingEffectiveProbability !== null) {
        result.weighted_amount_to_set = dealUpdateInput.amount * existingEffectiveProbability;
        console.log('[dealProbability.calculate] Amount changed, recalculated weighted_amount:', result.weighted_amount_to_set);
    } else {
        result.weighted_amount_to_set = null;
        console.log('[dealProbability.calculate] Amount changed, but weighted_amount set to null due to missing effective probability or new amount.');
    }
  }
  return result;
}; 