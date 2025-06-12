import type { WfmWorkflowStepResolvers, WfmStatus as GraphQLWfmStatus } from '../../../../lib/generated/graphql';
import type { GraphQLContext } from '../helpers';
import { wfmStatusService } from '../../../../lib/wfmStatusService';
import { GraphQLError } from 'graphql';

// The parent type will be the WFMWorkflowStep object that has status_id but needs status resolved.
// This usually comes from a service call like wfmWorkflowService.getStepsByWorkflowId or getStepById.
interface ParentWfmWorkflowStep {
  id: string; // Step ID
  status_id: string; // The ID of the status to resolve
  // Include other fields from ServiceLayerWfmWorkflowStep if needed for context, though status_id is key here
}

export const WFMWorkflowStep: WfmWorkflowStepResolvers<GraphQLContext> = {
  status: async (parentObj, _args, context): Promise<GraphQLWfmStatus> => {
    const parent = parentObj as unknown as ParentWfmWorkflowStep;
    // console.log(`[Resolver.WFMWorkflowStep.status] for step ID ${parent.id}, resolving status_id: ${parent.status_id}`);
    if (!parent.status_id) {
      const msg = `[Resolver.WFMWorkflowStep.status] status_id missing for WFMWorkflowStep ${parent.id}`;
      console.error(msg);
      throw new GraphQLError(msg, { extensions: { code: 'INTERNAL_SERVER_ERROR'} });
    }
    try {
      const status = await wfmStatusService.getById(parent.status_id, context);
      if (!status) {
        const msg = `[Resolver.WFMWorkflowStep.status] WFMStatus not found for ID: ${parent.status_id} (Step ID: ${parent.id})`;
        console.error(msg);
        throw new GraphQLError(msg, { extensions: { code: 'NOT_FOUND' } });
      }
      return status;
    } catch (error: any) {
      console.error(`[Resolver.WFMWorkflowStep.status] Error fetching WFMStatus ID ${parent.status_id} for step ${parent.id}:`, error);
      throw new GraphQLError(error.message || 'Error fetching status for WFMWorkflowStep', { extensions: { code: 'INTERNAL_SERVER_ERROR' }, originalError: error });
    }
  },
  // Other WFMWorkflowStep fields (like metadata, stepOrder, etc.) are likely scalar
  // and would be resolved by the default resolver if the parent object contains them directly.
}; 