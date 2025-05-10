import type { GraphQLContext } from '../helpers';
import { requireAuthentication, processZodError, getAccessToken } from '../helpers';
import { GraphQLError } from 'graphql';
import * as pipelineService from '../../../../lib/pipelineService';

export const Stage = {
  pipeline: async (parent: { pipeline_id: string }, _args: unknown, context: GraphQLContext) => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context)!;
    
    try {
      const pipeline = await pipelineService.getPipelineById(accessToken, parent.pipeline_id);
      if (!pipeline) {
         console.error(`Pipeline ${parent.pipeline_id} not found for stage.`);
         throw new GraphQLError(`Pipeline associated with this stage not found.`, { extensions: { code: 'NOT_FOUND' } });
      }
      return pipeline;
    } catch (e) {
      console.error(`Error fetching pipeline ${parent.pipeline_id} for stage:`, e);
      throw processZodError(e, `fetching pipeline ${parent.pipeline_id}`);
    }
  }
}; 