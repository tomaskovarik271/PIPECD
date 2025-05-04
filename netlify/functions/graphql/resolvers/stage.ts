import type { GraphQLContext } from '../helpers';
import { requireAuthentication, processZodError, getAccessToken } from '../helpers';
import { GraphQLError } from 'graphql';
import * as pipelineService from '../../../../lib/pipelineService';

export const Stage = {
  pipeline: async (parent: { pipeline_id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context); // Check auth first
    const accessToken = getAccessToken(context)!; // Then get token
    
    try {
      // Fetch the pipeline using the pipeline_id from the parent Stage object
      const pipeline = await pipelineService.getPipelineById(accessToken, parent.pipeline_id);
      if (!pipeline) {
         // This case should ideally not happen if data integrity is maintained,
         // but handle it defensively.
         console.error(`Pipeline ${parent.pipeline_id} not found for stage.`);
         throw new GraphQLError(`Pipeline associated with this stage not found.`, { extensions: { code: 'NOT_FOUND' } });
      }
      return pipeline;
    } catch (e) {
      // Log and re-throw errors, processing them consistently
      console.error(`Error fetching pipeline ${parent.pipeline_id} for stage:`, e);
      throw processZodError(e, `fetching pipeline ${parent.pipeline_id}`);
    }
  }
}; 