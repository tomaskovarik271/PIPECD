import type { Deal, DealInput, WfmWorkflowStep } from '../generated/graphql';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleSupabaseError } from '../serviceUtils'; // For consistent error handling
import { GraphQLError } from 'graphql';

interface DealProbabilityCalculationResult {
  deal_specific_probability_to_set?: number | null;
  weighted_amount_to_set?: number | null;
}

// New interface for WFM step metadata relevant to probability
interface WfmStepProbabilityContext {
  name: string; // For logging/debugging
  probability: number | null;
  outcome: 'OPEN' | 'WON' | 'LOST' | null; // Assuming these are the possible values in metadata
}

/**
 * Calculates deal probability and weighted amount based on WFM step context or explicit amount/probability changes.
 * @param dealUpdateInput The partial input for the deal update (e.g., new amount or specific probability).
 * @param oldDealData The current state of the deal from the database.
 * @param supabaseClient Authenticated Supabase client instance.
 * @param targetWfmStepMetadata Optional: If provided, this WFM step's metadata is used as the primary context for probability.
 *                              Used when the deal is transitioning to a new WFM step.
 * @returns An object with `deal_specific_probability_to_set` and `weighted_amount_to_set`.
 */
export const calculateDealProbabilityFields = async (
  dealUpdateInput: Partial<Omit<DealInput, 'stage_id' | 'pipeline_id'>>, // stage_id is no longer used here
  oldDealData: Deal, 
  supabaseClient: SupabaseClient,
  targetWfmStepMetadata?: WfmStepProbabilityContext 
): Promise<DealProbabilityCalculationResult> => {
  const result: DealProbabilityCalculationResult = {};
  let currentWfmStepContext: WfmStepProbabilityContext | null = targetWfmStepMetadata || null;

  // 1. Determine the WFM step context if not explicitly provided
  if (!currentWfmStepContext) {
    if (!oldDealData.wfm_project_id) {
      console.warn(`[dealProbability.calculate] Deal ${oldDealData.id} has no wfm_project_id. Cannot determine WFM step for probability.`);
      // Fallback: if amount is changing, but no WFM context, weighted amount will likely be null unless specific probability is set.
    } else {
      const { data: wfmProject, error: projectError } = await supabaseClient
        .from('wfm_projects')
        .select('current_step_id')
        .eq('id', oldDealData.wfm_project_id)
        .single();

      if (projectError || !wfmProject || !wfmProject.current_step_id) {
        handleSupabaseError(projectError, `fetching WFM project ${oldDealData.wfm_project_id} for deal ${oldDealData.id}`);
        throw new GraphQLError(`Failed to fetch WFM project or current step for deal ${oldDealData.id}. Probability calculation depends on it.`);
      }

      const { data: wfmStep, error: stepError } = await supabaseClient
        .from('workflow_steps') 
        .select('metadata') // Select only metadata, as 'name' is not on workflow_steps
        .eq('id', wfmProject.current_step_id)
        .single();
      
      if (stepError || !wfmStep) {
        handleSupabaseError(stepError, `fetching WFM step ${wfmProject.current_step_id} for deal ${oldDealData.id}`);
        throw new GraphQLError(`Failed to fetch WFM step ${wfmProject.current_step_id} for deal ${oldDealData.id}.`);
      }

      // Ensure metadata is an object and has the expected properties
      const metadata = wfmStep.metadata as any;
      if (typeof metadata !== 'object' || metadata === null) {
        // Use current_step_id for error message if name is not available
        throw new GraphQLError(`WFM step ${wfmProject.current_step_id} has invalid or missing metadata.`);
      }

      currentWfmStepContext = {
        name: `StepID: ${wfmProject.current_step_id}`, // Use Step ID for logging if name is not available
        probability: typeof metadata.deal_probability === 'number' ? metadata.deal_probability : null,
        outcome: metadata.outcome_type as WfmStepProbabilityContext['outcome'] || 'OPEN', // Default to OPEN if not specified
      };
      console.log(`[dealProbability.calculate] Fetched current WFM context for deal ${oldDealData.id}:`, currentWfmStepContext);
    }
  }

  // 2. Determine deal_specific_probability_to_set
  // An explicit probability in the input always overrides WFM-derived settings.
  if (typeof dealUpdateInput.deal_specific_probability === 'number' || dealUpdateInput.deal_specific_probability === null) {
    result.deal_specific_probability_to_set = dealUpdateInput.deal_specific_probability;
    console.log(`[dealProbability.calculate] Using explicit deal_specific_probability from input: ${result.deal_specific_probability_to_set}`);
  } else if (currentWfmStepContext) {
    if (currentWfmStepContext.outcome === 'WON') {
      result.deal_specific_probability_to_set = 1.0;
    } else if (currentWfmStepContext.outcome === 'LOST') {
      result.deal_specific_probability_to_set = 0.0;
    } else { // OPEN or other/default
      result.deal_specific_probability_to_set = null; // Indicates system should use stage default, not override
    }
    console.log(`[dealProbability.calculate] Based on WFM context (${currentWfmStepContext.name}, outcome: ${currentWfmStepContext.outcome}), deal_specific_probability_to_set: ${result.deal_specific_probability_to_set}`);
  } else {
    // No explicit input probability, no WFM context found (e.g. deal not linked or WFM data missing)
    // Retain old deal_specific_probability if no other information is available
    result.deal_specific_probability_to_set = oldDealData.deal_specific_probability;
    console.log(`[dealProbability.calculate] No explicit probability input and no WFM context. Retaining old deal_specific_probability: ${result.deal_specific_probability_to_set}`);
  }

  // 3. Calculate weighted_amount_to_set
  const currentAmount = typeof dealUpdateInput.amount === 'number' ? dealUpdateInput.amount : oldDealData.amount;
  let effectiveProbability: number | null = null;

  if (result.deal_specific_probability_to_set !== undefined && result.deal_specific_probability_to_set !== null) {
    // This means an explicit probability is set (either from input or WON/LOST WFM outcome)
    effectiveProbability = result.deal_specific_probability_to_set;
  } else if (currentWfmStepContext && currentWfmStepContext.outcome === 'OPEN') {
    // deal_specific_probability is null (for OPEN stages), so use the WFM step's default probability
    effectiveProbability = currentWfmStepContext.probability;
  } else if (!currentWfmStepContext && result.deal_specific_probability_to_set === null){
    // Edge case: no WFM context, and old specific probability was null. Try to use old stage probability if possible (legacy fallback)
    // This part is tricky without stage_id. If the deal is very old and not WFM-linked, and had no specific probability.
    // For now, if no WFM context and specific probability is null, effective probability remains null.
    console.warn(`[dealProbability.calculate] No WFM context and deal_specific_probability is null. Cannot determine effective probability for weighted amount without legacy stage info.`);
  }

  console.log(`[dealProbability.calculate] Amount for calc: ${currentAmount}, Effective probability for calc: ${effectiveProbability}`);

  if (typeof currentAmount === 'number' && effectiveProbability !== null) {
    result.weighted_amount_to_set = currentAmount * effectiveProbability;
  } else {
    result.weighted_amount_to_set = null; // Set to null if amount or effective probability is missing
  }
  console.log(`[dealProbability.calculate] Final weighted_amount_to_set: ${result.weighted_amount_to_set}, Final deal_specific_probability_to_set: ${result.deal_specific_probability_to_set}`);

  return result;
}; 