import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError, convertToDateOrNull } from '../../helpers';
import { DealCreateSchema, DealUpdateSchema } from '../../validators';
import { inngest } from '../../../../../lib/inngestClient';
import { dealService } from '../../../../../lib/dealService';
import * as wfmProjectService from '../../../../../lib/wfmProjectService';
import { wfmWorkflowService } from '../../../../../lib/wfmWorkflowService';
import { wfmStatusService } from '../../../../../lib/wfmStatusService';
import { calculateDealProbabilityFields } from '../../../../../lib/dealService/dealProbability';
import type { MutationResolvers, Deal as GraphQLDeal, DealInput as GraphQLDealInput, DealUpdateInput as GraphQLDealUpdateInput, WfmWorkflowStep, User as GraphQLUser } from '../../../../../lib/generated/graphql';
import type { DealServiceUpdateData } from '../../../../../lib/dealService/dealCrud';
import { recordEntityHistory, getAuthenticatedClient } from '../../../../../lib/serviceUtils';

export const dealMutations: Pick<MutationResolvers<GraphQLContext>, 'createDeal' | 'updateDeal' | 'deleteDeal' | 'updateDealWFMProgress'> = {
    createDeal: async (_parent, args, context) => {
      const action = 'creating deal';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          const validatedInput = DealCreateSchema.parse(args.input);

          if (!context.userPermissions?.includes('deal:create')) {
               throw new GraphQLError('Forbidden: You do not have permission to create deals.', { extensions: { code: 'FORBIDDEN' } });
          }

          // Prepare the input for dealService.createDeal, ensuring types match GraphQLDealInput
          const serviceInput: GraphQLDealInput = {
            name: validatedInput.name!,
            amount: validatedInput.amount,
            expected_close_date: convertToDateOrNull(validatedInput.expected_close_date),
            wfmProjectTypeId: validatedInput.wfmProjectTypeId!, // Schema ensures it's present
            person_id: validatedInput.person_id,
            organization_id: validatedInput.organization_id,
            deal_specific_probability: validatedInput.deal_specific_probability,
            customFields: Array.isArray(validatedInput.customFields) ? validatedInput.customFields : undefined,
            assignedToUserId: validatedInput.assignedToUserId,
          };
          
          const newDealRecord = await dealService.createDeal(userId, serviceInput, accessToken);
          
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDealRecord as any }, 
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send deal.created event to Inngest:', err));

          return {
            id: newDealRecord.id,
            created_at: newDealRecord.created_at, 
            updated_at: newDealRecord.updated_at, 
            name: newDealRecord.name!,
            amount: newDealRecord.amount,
            expected_close_date: newDealRecord.expected_close_date, 
            deal_specific_probability: newDealRecord.deal_specific_probability,
            user_id: newDealRecord.user_id!, 
            assigned_to_user_id: newDealRecord.assigned_to_user_id,
            person_id: newDealRecord.person_id, 
            organization_id: newDealRecord.organization_id,
            project_id: newDealRecord.project_id,
            wfm_project_id: newDealRecord.wfm_project_id,
          } as unknown as GraphQLDeal; 
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
          const dealId = args.id;

          if (Object.keys(validatedInput).length === 0) {
            throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // Fetch existing deal for permission checks
          const existingDeal = await dealService.getDealById(userId, dealId, accessToken);
          if (!existingDeal) {
              throw new GraphQLError('Deal not found for update.', { extensions: { code: 'NOT_FOUND' } });
          }

          const canUpdateAny = context.userPermissions?.includes('deal:update_any') || false;
          const canUpdateOwn = context.userPermissions?.includes('deal:update_own') || false;
          const canAssignAnyPerm = context.userPermissions?.includes('deal:assign_any') || false;

          let authorizedToUpdateThisDeal = false;
          if (canUpdateAny) {
            authorizedToUpdateThisDeal = true;
          } else if (canUpdateOwn) {
            const isCreator = existingDeal.user_id === userId;
            const isCurrentAssignee = existingDeal.assigned_to_user_id === userId;
            if (isCreator || isCurrentAssignee) {
                authorizedToUpdateThisDeal = true;
            }
          }

          if (!authorizedToUpdateThisDeal) {
            throw new GraphQLError('Forbidden: You do not have permission to update this deal.', { extensions: { code: 'FORBIDDEN' } });
          }

          // If we reach here, user is authorized for general updates to this deal.
          // Now, specifically check assignment change permissions if assignment is being changed.
          const changingAssignment = Object.prototype.hasOwnProperty.call(args.input, 'assignedToUserId');
          if (changingAssignment) {
            let authorizedToChangeAssignment = false;
            if (canAssignAnyPerm) { // Admin with 'deal:assign_any' can always change assignment
                authorizedToChangeAssignment = true;
            } else {
                // For non-admins (who don't have 'deal:assign_any'):
                // If they were authorizedToUpdateThisDeal (meaning they are creator or current assignee and have 'deal:update_own'),
                // they are allowed to change the assignment freely on this specific deal.
                if (authorizedToUpdateThisDeal) {
                    authorizedToChangeAssignment = true;
                }
            }
            if (!authorizedToChangeAssignment) {
                throw new GraphQLError('Forbidden: You do not have permission to change the assignment for this deal.', { extensions: { code: 'FORBIDDEN' } });
            }
          }

          const { customFields, expected_close_date, assignedToUserId, ...otherValidatedDataForService } = validatedInput;
          const customFieldsForService = Array.isArray(customFields) ? customFields : undefined;

          const serviceInput: DealServiceUpdateData = {
            ...otherValidatedDataForService,
            expected_close_date: validatedInput.expected_close_date,
            customFields: customFieldsForService, 
          };

          // Only include assigned_to_user_id if it was actually provided in the input
          if (Object.prototype.hasOwnProperty.call(args.input, 'assignedToUserId')) {
            serviceInput.assigned_to_user_id = assignedToUserId;
          }

          const updatedDealRecord = await dealService.updateDeal(userId, dealId, serviceInput, accessToken);
          
          // If the service returns null (e.g., user lost access after update), propagate null to GraphQL response
          if (!updatedDealRecord) {
            return null;
          }

          // Otherwise, map the DbDeal to GraphQLDeal
          return {
            id: updatedDealRecord.id,
            created_at: updatedDealRecord.created_at, 
            updated_at: updatedDealRecord.updated_at, 
            name: updatedDealRecord.name!, // Assuming name is non-null on DbDeal if deal exists
            amount: updatedDealRecord.amount,
            expected_close_date: updatedDealRecord.expected_close_date, 
            deal_specific_probability: updatedDealRecord.deal_specific_probability,
            // weighted_amount is resolved by a field resolver, not directly mapped here from DbDeal
            user_id: updatedDealRecord.user_id!, // Assuming user_id is non-null
            assigned_to_user_id: updatedDealRecord.assigned_to_user_id,
            person_id: updatedDealRecord.person_id, 
            organization_id: updatedDealRecord.organization_id,
            project_id: updatedDealRecord.project_id,
            wfm_project_id: updatedDealRecord.wfm_project_id,
            // Fields like createdBy, assignedToUser, activities, customFieldValues (as array), history, currentWfmStep, currentWfmStatus
            // are typically handled by their own field resolvers on the Deal type and don't need to be explicitly returned here.
            // The `as unknown as GraphQLDeal` cast is used because we are returning a partial representation that the field resolvers will complete.
          } as unknown as GraphQLDeal; 
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

          // RLS policy will enforce delete permissions (deal:delete_any or deal:delete_own for creator/assignee).
          // The service call dealService.deleteDeal will return false or throw an error if RLS fails.
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
    updateDealWFMProgress: async (_parent, args, context) => {
      const action = 'updating deal WFM progress';
      const { dealId, targetWfmWorkflowStepId } = args;
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context)!;
        const supabase = context.supabaseClient;
        const supabaseAuthenticated = getAuthenticatedClient(accessToken);

        const dealRecord = await dealService.getDealById(userId, dealId, accessToken);
        if (!dealRecord || !dealRecord.wfm_project_id) {
          throw new GraphQLError(`Deal ${dealId} not found or not associated with a WFM project.`, { extensions: { code: 'NOT_FOUND' } });
        }
        const wfmProjectId = dealRecord.wfm_project_id;

        const wfmProjectRecord = await wfmProjectService.getWFMProjectById(wfmProjectId, context);
        const rawWfmProjectData = wfmProjectRecord as any;

        if (!rawWfmProjectData || !rawWfmProjectData.workflow_id || !rawWfmProjectData.current_step_id) {
          throw new GraphQLError(`WFM Project ${wfmProjectId} not found or incomplete (missing workflow_id or current_step_id).`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const workflowId = rawWfmProjectData.workflow_id;
        const currentStepId = rawWfmProjectData.current_step_id;

        const currentStepDetails = await wfmWorkflowService.getStepById(currentStepId, context);
        if (!currentStepDetails || !currentStepDetails.status_id) {
          throw new GraphQLError(`Could not retrieve details or status_id for current step ${currentStepId}.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const oldStatus = await wfmStatusService.getById(currentStepDetails.status_id, context);
        const oldStatusName = oldStatus?.name || 'Unknown Status';

        await wfmWorkflowService.validateTransition(
          workflowId, 
          currentStepId,
          targetWfmWorkflowStepId,
          context
        );

        await wfmProjectService.updateWFMProjectStep(wfmProjectId, targetWfmWorkflowStepId, userId, context);

        const targetStepDetails = await wfmWorkflowService.getStepById(targetWfmWorkflowStepId, context);
        if (!targetStepDetails || !targetStepDetails.status_id) { 
          throw new GraphQLError(`Could not retrieve details or status_id for target step ${targetWfmWorkflowStepId}.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const newStatus = await wfmStatusService.getById(targetStepDetails.status_id, context);
        const newStatusName = newStatus?.name || 'Unknown Status';
        
        const historyChanges = {
          old_wfm_status: { id: currentStepDetails.status_id, name: oldStatusName, step_id: currentStepId },
          new_wfm_status: { id: targetStepDetails.status_id, name: newStatusName, step_id: targetWfmWorkflowStepId },
          wfm_project_id: wfmProjectId,
          workflow_id: workflowId,
        };

        await recordEntityHistory(
          supabaseAuthenticated,
          'deal_history',
          'deal_id',
          dealId,
          userId,
          'DEAL_WFM_STATUS_CHANGED',
          historyChanges
        );
        console.log(`[Mutation.updateDealWFMProgress] Recorded DEAL_WFM_STATUS_CHANGED event for deal ${dealId}`);

        if (typeof targetStepDetails.metadata !== 'object' || targetStepDetails.metadata === null) {
          throw new GraphQLError(`Target WFM step ${targetWfmWorkflowStepId} has invalid/missing metadata.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const metadata = targetStepDetails.metadata as any;
        const targetStepMetadata = {
          name: 'Unnamed Step',
          probability: typeof metadata.deal_probability === 'number' ? metadata.deal_probability : null,
          outcome: metadata.outcome_type as 'OPEN' | 'WON' | 'LOST' | null || 'OPEN',
        };

        const oldDealDataForCalc = await dealService.getDealById(userId, dealId, accessToken);
        if (!oldDealDataForCalc) { 
            throw new GraphQLError('Failed to re-fetch deal data for probability calculation.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }

        const probabilityUpdates = await calculateDealProbabilityFields(
          {}, 
          oldDealDataForCalc, 
          supabase,
          targetStepMetadata
        );

        const updatePayloadForService: Partial<DealServiceUpdateData> = {};
        let needsDBUpdate = false;
        if (probabilityUpdates.deal_specific_probability_to_set !== undefined) {
          updatePayloadForService.deal_specific_probability = probabilityUpdates.deal_specific_probability_to_set;
          needsDBUpdate = true;
        }
        
        let finalDealRecord: GraphQLDeal;
        if (needsDBUpdate) {
          finalDealRecord = await dealService.updateDeal(userId, dealId, updatePayloadForService, accessToken);
        } else {
          const refetchedDeal = await dealService.getDealById(userId, dealId, accessToken);
          if (!refetchedDeal) { 
             throw new GraphQLError('Failed to fetch deal after WFM progress update and no probability changes.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
          }
          finalDealRecord = refetchedDeal;
        }
        
        return finalDealRecord;

      } catch (error) {
        console.error(`[Mutation.updateDealWFMProgress] Error:`, error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(action + ' failed.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    }
}; 