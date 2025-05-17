import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError, convertToDateOrNull } from '../../helpers'; // convertToDateOrNull imported here
import { DealCreateSchema, DealUpdateSchema } from '../../validators';
import { inngest } from '../../../../../lib/inngestClient';
import { dealService } from '../../../../../lib/dealService';
import type { MutationResolvers, Deal as GraphQLDeal, DealInput as GraphQLDealInput, DealUpdateInput as GraphQLDealUpdateInput } from '../../../../../lib/generated/graphql';

export const dealMutations: Pick<MutationResolvers<GraphQLContext>, 'createDeal' | 'updateDeal' | 'deleteDeal'> = {
    createDeal: async (_parent, args, context) => {
      const action = 'creating deal';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = DealCreateSchema.parse(args.input);
          if (!context.userPermissions?.includes('deal:create')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          // Ensure customFields is an array or undefined before passing to service
          const customFieldsForService = Array.isArray(validatedInput.customFields) 
            ? validatedInput.customFields 
            : undefined;

          const serviceInput = {
            ...validatedInput,
            expected_close_date: convertToDateOrNull(validatedInput.expected_close_date),
            customFields: customFieldsForService, // Use the processed customFields
          };

          const newDealRecord = await dealService.createDeal(userId, serviceInput as GraphQLDealInput, accessToken); // Cast to GraphQLDealInput
          
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDealRecord as any }, 
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send deal.created event to Inngest:', err));

          return {
            id: newDealRecord.id,
            user_id: newDealRecord.user_id!,
            created_at: newDealRecord.created_at,
            updated_at: newDealRecord.updated_at,
            name: newDealRecord.name!,
            amount: newDealRecord.amount,
            expected_close_date: newDealRecord.expected_close_date instanceof Date 
              ? newDealRecord.expected_close_date.toISOString() 
              : newDealRecord.expected_close_date,
            stage_id: newDealRecord.stage_id!,
            person_id: newDealRecord.person_id,
            organization_id: newDealRecord.organization_id,
            deal_specific_probability: newDealRecord.deal_specific_probability,
          } as GraphQLDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    updateDeal: async (_parent, args, context) => {
      const action = 'updating deal';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = DealUpdateSchema.parse(args.input);
          if (!context.userPermissions?.includes('deal:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          if (Object.keys(validatedInput).length === 0) {
            throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          const { pipeline_id, ...dealDataFromZod } = validatedInput;
          
          // Ensure customFields is an array or undefined
          const customFieldsForService = Array.isArray(dealDataFromZod.customFields) 
            ? dealDataFromZod.customFields 
            : undefined;

          const serviceInput = {
            ...dealDataFromZod,
            expected_close_date: convertToDateOrNull(dealDataFromZod.expected_close_date),
            customFields: customFieldsForService, // Use the processed customFields
          };

          const updatedDealRecord = await dealService.updateDeal(userId, args.id, serviceInput as Partial<GraphQLDealInput>, accessToken); // Changed cast
          
          return {
            id: updatedDealRecord.id,
            user_id: updatedDealRecord.user_id!,
            created_at: updatedDealRecord.created_at,
            updated_at: updatedDealRecord.updated_at,
            name: updatedDealRecord.name!,
            amount: updatedDealRecord.amount,
            expected_close_date: updatedDealRecord.expected_close_date instanceof Date 
              ? updatedDealRecord.expected_close_date.toISOString() 
              : updatedDealRecord.expected_close_date,
            stage_id: updatedDealRecord.stage_id!,
            person_id: updatedDealRecord.person_id,
            organization_id: updatedDealRecord.organization_id,
            deal_specific_probability: updatedDealRecord.deal_specific_probability,
          } as GraphQLDeal;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
    deleteDeal: async (_parent, args, context) => {
      const action = `deleting deal ${args.id}`;
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const userId = context.currentUser!.id;
          if (!context.userPermissions?.includes('deal:delete_any')) {
              throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          const success = await dealService.deleteDeal(userId, args.id, accessToken);

          if (success) {
            inngest.send({
              name: 'crm/deal.deleted',
              data: { dealId: args.id },
              user: { id: userId, email: context.currentUser!.email! }
            }).catch((err: unknown) => console.error('Failed to send deal.deleted event to Inngest:', err));
          }
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },
}; 