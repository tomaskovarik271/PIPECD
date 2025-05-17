import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../../helpers';
import { PipelineInputSchema } from '../../validators';
import * as pipelineService from '../../../../../lib/pipelineService';
import type { MutationResolvers, Pipeline as GraphQLPipeline } from '../../../../../lib/generated/graphql';

export const pipelineMutations: Pick<MutationResolvers<GraphQLContext>, 'createPipeline' | 'updatePipeline' | 'deletePipeline'> = {
    createPipeline: async (_parent, args, context) => {
      const action = 'creating pipeline';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = PipelineInputSchema.parse(args.input);
        if (!context.userPermissions?.includes('pipeline:create')) {
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        const newPipeline = await pipelineService.createPipeline(accessToken, validatedInput);
            return {
                id: newPipeline.id,
                user_id: newPipeline.user_id,
                name: newPipeline.name,
                created_at: newPipeline.created_at,
                updated_at: newPipeline.updated_at,
            } as GraphQLPipeline;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updatePipeline: async (_parent, args, context) => {
      const action = `updating pipeline ${args.id}`;
      try {
        console.log(`[Mutation.updatePipeline] Attempting to update pipeline ID: ${args.id}`);
        console.log(`[Mutation.updatePipeline] Input:`, args.input);
        console.log(`[Mutation.updatePipeline] Context User ID: ${context.currentUser?.id}`);
        console.log(`[Mutation.updatePipeline] User Permissions from context:`, context.userPermissions);

        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = PipelineInputSchema.parse(args.input);

         if (!context.userPermissions?.includes('pipeline:update_any')) {
          console.error(`[Mutation.updatePipeline] FORBIDDEN: User ${context.currentUser?.id} does NOT have 'pipeline:update_any' permission.`);
          throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        
        console.log(`[Mutation.updatePipeline] User ${context.currentUser?.id} HAS 'pipeline:update_any' permission. Proceeding with service call.`);
        const updatedPipeline = await pipelineService.updatePipeline(accessToken, args.id, validatedInput);
        
        return {
          id: updatedPipeline.id,
          name: updatedPipeline.name,
        } as GraphQLPipeline;
      } catch (error) {
        console.error(`[Mutation.updatePipeline] Error in resolver for pipeline ${args.id}:`, error);
        if (error instanceof GraphQLError && error.extensions?.code === 'FORBIDDEN') {
            throw error;
        }
        throw processZodError(error, action);
      }
    },
    deletePipeline: async (_parent, args, context) => {
        const action = `deleting pipeline ${args.id}`;
      try {
        console.log(`[Mutation.deletePipeline] Attempting to delete pipeline ID: ${args.id}`);
        console.log(`[Mutation.deletePipeline] Context User ID: ${context.currentUser?.id}`);
        console.log(`[Mutation.deletePipeline] User Permissions from context:`, context.userPermissions);

        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;

        if (!context.userPermissions?.includes('pipeline:delete_any')) {
          console.error(`[Mutation.deletePipeline] FORBIDDEN: User ${context.currentUser?.id} does NOT have 'pipeline:delete_any' permission.`);
          throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        
        console.log(`[Mutation.deletePipeline] User ${context.currentUser?.id} HAS 'pipeline:delete_any' permission. Proceeding with service call.`);
        return await pipelineService.deletePipeline(accessToken, args.id);
      } catch (error) {
        console.error(`[Mutation.deletePipeline] Error in resolver for pipeline ${args.id}:`, error);
        if (error instanceof GraphQLError && error.extensions?.code === 'FORBIDDEN') {
            throw error;
        }
        throw processZodError(error, action);
      }
    },
}; 