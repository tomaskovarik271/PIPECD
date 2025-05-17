import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../../helpers';
import { StageCreateSchema, StageUpdateSchema } from '../../validators';
import * as stageService from '../../../../../lib/stageService';
import type { MutationResolvers, Stage as GraphQLStage, StageType as GeneratedStageType } from '../../../../../lib/generated/graphql';

export const stageMutations: Pick<MutationResolvers<GraphQLContext>, 'createStage' | 'updateStage' | 'deleteStage'> = {
    createStage: async (_parent, args, context) => {
      const action = 'creating stage';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = StageCreateSchema.parse(args.input);
        if (!context.userPermissions?.includes('stage:create')) {
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        const serviceInput = {
          ...validatedInput,
          stage_type: validatedInput.stage_type as GeneratedStageType | undefined,
        };
        const newStage = await stageService.createStage(accessToken, serviceInput as any);
            return {
                id: newStage.id,
                user_id: newStage.user_id,
                pipeline_id: newStage.pipeline_id,
                name: newStage.name,
                order: newStage.order,
                deal_probability: newStage.deal_probability,
                stage_type: newStage.stage_type,
                created_at: newStage.created_at,
                updated_at: newStage.updated_at,
            } as GraphQLStage;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updateStage: async (_parent, args, context) => {
      const action = `updating stage ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const validatedInput = StageUpdateSchema.parse(args.input);
            if (!context.userPermissions?.includes('stage:update_any')) {
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
        const serviceInput = {
            ...validatedInput,
            stage_type: validatedInput.stage_type as GeneratedStageType | undefined,
        };
        const updatedStage = await stageService.updateStage(accessToken, args.id, serviceInput as any);
            return {
                id: updatedStage.id,
                user_id: updatedStage.user_id,
                pipeline_id: updatedStage.pipeline_id,
                name: updatedStage.name,
                order: updatedStage.order,
                deal_probability: updatedStage.deal_probability,
                stage_type: updatedStage.stage_type,
                created_at: updatedStage.created_at,
                updated_at: updatedStage.updated_at,
            } as GraphQLStage;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    deleteStage: async (_parent, args, context) => {
        const action = `deleting stage ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
            if (!context.userPermissions?.includes('stage:delete_any')) {
                throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
        }
            return await stageService.deleteStage(accessToken, args.id);
      } catch (error) {
        throw processZodError(error, action);
      }
    },
}; 