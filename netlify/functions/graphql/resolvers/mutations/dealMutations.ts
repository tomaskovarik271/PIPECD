import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError, convertToDateOrNull } from '../../helpers';
import { DealCreateSchema, DealUpdateSchema } from '../../validators';
import { inngest } from '../../../../../lib/inngestClient';
import { dealService } from '../../../../../lib/dealService';
import * as wfmProjectService from '../../../../../lib/wfmProjectService';
import { wfmWorkflowService } from '../../../../../lib/wfmWorkflowService';
import { wfmStatusService } from '../../../../../lib/wfmStatusService';
import { calculateDealProbabilityFields } from '../../../../../lib/dealService/dealProbability';
import type { MutationResolvers, Deal as GraphQLDeal, DealInput as GraphQLDealInput, DealUpdateInput as GraphQLDealUpdateInput, WfmWorkflowStep, AssignDealMutationArgs } from '../../../../../lib/generated/graphql'; // Added AssignDealMutationArgs
import type { DealServiceUpdateData } from '../../../../../lib/dealService/dealCrud';
import { recordEntityHistory, getAuthenticatedClient } from '../../../../../lib/serviceUtils';

// Extend the Pick to include 'assignDeal'
export const dealMutations: Pick<MutationResolvers<GraphQLContext>, 'createDeal' | 'updateDeal' | 'deleteDeal' | 'updateDealWFMProgress' | 'assignDeal'> = {
    createDeal: async (_parent, args, context) => {
      const action = 'creating deal';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          // The DealCreateSchema will need to be updated to expect wfmProjectTypeId
          // and not pipeline_id/stage_id. For now, we cast and manually handle.
          const validatedInput = DealCreateSchema.parse(args.input);
          // pipeline_id and stage_id are not part of DealCreateSchema anymore.
          // assignedToUserId should be part of args.input if the schema was updated.
          const { pipeline_id, stage_id, assignedToUserId, ...restOfValidatedInput } = validatedInput as any; // assignedToUserId might be undefined if optional
          const wfmProjectTypeIdFromInput = (args.input as any).wfmProjectTypeId;

          if (!wfmProjectTypeIdFromInput) {
             throw new GraphQLError('wfmProjectTypeId is required.', { extensions: { code: 'BAD_USER_INPUT'} });
          }

          if (!context.userPermissions?.includes('deal:create')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }

          const customFieldsForService = Array.isArray(restOfValidatedInput.customFields) 
            ? restOfValidatedInput.customFields 
            : undefined;

          const serviceInput = {
            ...restOfValidatedInput,
            wfmProjectTypeId: wfmProjectTypeIdFromInput, // Add wfmProjectTypeId
            expected_close_date: convertToDateOrNull(restOfValidatedInput.expected_close_date),
            customFields: customFieldsForService,
            assignedToUserId: args.input.assignedToUserId, // Pass assignedToUserId to the service
          };
          // Remove pipeline_id and stage_id explicitly if they are still present from spread
          delete (serviceInput as any).pipeline_id;
          delete (serviceInput as any).stage_id;

          // The service's DealInput type should now accept assignedToUserId.
          // Ensure GraphQLDealInput (from generated types) also reflects this if used for casting.
          const newDealRecord = await dealService.createDeal(userId, serviceInput as GraphQLDealInput, accessToken);
          
          inngest.send({
            name: 'crm/deal.created',
            data: { deal: newDealRecord as any }, 
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send deal.created event to Inngest:', err));

          // newDealRecord from dealService should now be closely aligned with GraphQLDeal 
          // due to mapDbDealToGraphqlDealShell in dealCrud.ts
          return {
            id: newDealRecord.id,
            created_at: newDealRecord.created_at, 
            updated_at: newDealRecord.updated_at, 
            name: newDealRecord.name!,
            amount: newDealRecord.amount,
            expected_close_date: newDealRecord.expected_close_date, 
            deal_specific_probability: newDealRecord.deal_specific_probability,
            user_id: newDealRecord.user_id!, 
            person_id: newDealRecord.person_id, 
            organization_id: newDealRecord.organization_id,
            assignedToUserId: newDealRecord.assigned_to_user_id, // Ensure this is returned from service and mapped
            // pipeline_id: newDealRecord.pipeline_id, // Legacy, now should be null from service
            // stage_id: newDealRecord.stage_id!, // Legacy, now should be null from service
            wfm_project_id: newDealRecord.wfm_project_id,
            // Complex fields (createdBy, history, activities, wfmProject etc.) are resolved by Deal field resolvers.
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
          if (!context.userPermissions?.includes('deal:update_any')) {
               throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
          }
          if (Object.keys(validatedInput).length === 0) {
            throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // pipeline_id and stage_id are no longer in DealUpdateSchema / validatedInput
          const dealDataFromZod = { ...validatedInput };
          
          // Ensure customFields is an array or undefined
          const customFieldsForService = Array.isArray(dealDataFromZod.customFields) 
            ? dealDataFromZod.customFields 
            : undefined;

          // stage_id is not part of dealDataFromZod anymore.
          // The warning for stage_id is removed as it is not expected from validatedInput.
          // assignedToUserId should be available on dealDataFromZod if included in DealUpdateSchema and GraphQL input
          const finalServiceCoreData = { ...dealDataFromZod };
          delete (finalServiceCoreData as any).customFields; // customFields are handled separately for service input

          const serviceInput: DealServiceUpdateData = { // Explicitly type for clarity
            ...finalServiceCoreData, 
            expected_close_date: convertToDateOrNull(dealDataFromZod.expected_close_date),
            customFields: customFieldsForService,
            // assigned_to_user_id is snake_case for the service layer
            assigned_to_user_id: args.input.assignedToUserId !== undefined ? args.input.assignedToUserId : undefined,
          };
          
          // Remove properties that are undefined to avoid overwriting existing values with null if not provided
          Object.keys(serviceInput).forEach(key => {
            if (serviceInput[key as keyof DealServiceUpdateData] === undefined) {
              delete serviceInput[key as keyof DealServiceUpdateData];
            }
          });

          const updatedDealRecord = await dealService.updateDeal(userId, args.id, serviceInput, accessToken);
          
          return {
            id: updatedDealRecord.id,
            created_at: updatedDealRecord.created_at, 
            updated_at: updatedDealRecord.updated_at, 
            name: updatedDealRecord.name!,
            amount: updatedDealRecord.amount,
            expected_close_date: updatedDealRecord.expected_close_date, 
            deal_specific_probability: updatedDealRecord.deal_specific_probability,
            weighted_amount: updatedDealRecord.weighted_amount,
            user_id: updatedDealRecord.user_id!, 
            person_id: updatedDealRecord.person_id, 
            organization_id: updatedDealRecord.organization_id,
            assignedToUserId: updatedDealRecord.assigned_to_user_id, // Ensure this is returned from service and mapped
            // pipeline_id: updatedDealRecord.pipeline_id || null, // Legacy field, removed
            // stage_id: updatedDealRecord.stage_id || null,    // Legacy field, removed
            wfm_project_id: updatedDealRecord.wfm_project_id,
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
    updateDealWFMProgress: async (_parent, args, context) => {
      const action = 'updating deal WFM progress';
      const { dealId, targetWfmWorkflowStepId } = args;
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context)!;
        const supabase = context.supabaseClient; // Use the request-scoped client for most ops
        const supabaseAuthenticated = getAuthenticatedClient(accessToken); // For recordEntityHistory

        // 1. Fetch the Deal to get wfm_project_id
        const dealRecord = await dealService.getDealById(userId, dealId, accessToken);
        if (!dealRecord || !dealRecord.wfm_project_id) {
          throw new GraphQLError(`Deal ${dealId} not found or not associated with a WFM project.`, { extensions: { code: 'NOT_FOUND' } });
        }
        const wfmProjectId = dealRecord.wfm_project_id;

        // 2. Fetch the WFMProject (raw data from DB)
        const wfmProjectRecord = await wfmProjectService.getWFMProjectById(wfmProjectId, context);
        const rawWfmProjectData = wfmProjectRecord as any;

        if (!rawWfmProjectData || !rawWfmProjectData.workflow_id || !rawWfmProjectData.current_step_id) {
          throw new GraphQLError(`WFM Project ${wfmProjectId} not found or incomplete (missing workflow_id or current_step_id).`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const workflowId = rawWfmProjectData.workflow_id;
        const currentStepId = rawWfmProjectData.current_step_id;

        // Fetch current step details to get its status_id
        const currentStepDetails = await wfmWorkflowService.getStepById(currentStepId, context);
        if (!currentStepDetails || !currentStepDetails.status_id) {
          throw new GraphQLError(`Could not retrieve details or status_id for current step ${currentStepId}.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const oldStatus = await wfmStatusService.getById(currentStepDetails.status_id, context);
        const oldStatusName = oldStatus?.name || 'Unknown Status';

        // 3. Validate the transition
        await wfmWorkflowService.validateTransition(
          workflowId, 
          currentStepId,
          targetWfmWorkflowStepId,
          context
        );

        // 4. Update WFMProjectStep
        await wfmProjectService.updateWFMProjectStep(wfmProjectId, targetWfmWorkflowStepId, userId, context);

        // 5. Fetch the target WFMWorkflowStep details to get its status_id
        const targetStepDetails = await wfmWorkflowService.getStepById(targetWfmWorkflowStepId, context);
        if (!targetStepDetails || !targetStepDetails.status_id) { 
          throw new GraphQLError(`Could not retrieve details or status_id for target step ${targetWfmWorkflowStepId}.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const newStatus = await wfmStatusService.getById(targetStepDetails.status_id, context);
        const newStatusName = newStatus?.name || 'Unknown Status';
        
        // Log history for WFM status change
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

        // Continue with metadata processing for probability calculations from the target step's metadata
        if (typeof targetStepDetails.metadata !== 'object' || targetStepDetails.metadata === null) {
          throw new GraphQLError(`Target WFM step ${targetWfmWorkflowStepId} has invalid/missing metadata.`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const metadata = targetStepDetails.metadata as any;
        const targetStepMetadata = {
          name: 'Unnamed Step',
          probability: typeof metadata.deal_probability === 'number' ? metadata.deal_probability : null,
          outcome: metadata.outcome_type as 'OPEN' | 'WON' | 'LOST' | null || 'OPEN',
        };

        // 6. Calculate new probability/weighted amount
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

        // 7. Update deal's probability. Weighted amount will be recalculated by the service.
        const updatePayloadForService: Partial<DealServiceUpdateData> = {};
        let needsDBUpdate = false;
        if (probabilityUpdates.deal_specific_probability_to_set !== undefined) {
          updatePayloadForService.deal_specific_probability = probabilityUpdates.deal_specific_probability_to_set;
          needsDBUpdate = true;
        }
        // weighted_amount is not part of DealInput, it will be handled by dealService.updateDeal internally.
        
        let finalDealRecord: GraphQLDeal;
        if (needsDBUpdate) {
          finalDealRecord = await dealService.updateDeal(userId, dealId, updatePayloadForService, accessToken);
        } else {
          // If no probability changes, refetch the deal to return its current state after WFM step update.
          const refetchedDeal = await dealService.getDealById(userId, dealId, accessToken);
          if (!refetchedDeal) { 
             throw new GraphQLError('Failed to fetch deal after WFM progress update and no probability changes.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
          }
          finalDealRecord = refetchedDeal;
        }
        
        return finalDealRecord;

      } catch (error) {
        console.error(`[Mutation.updateDealWFMProgress] Error:`, error);
        // processZodError might not be relevant if not using Zod for args here directly
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(action + ' failed.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    assignDeal: async (_parent, args: AssignDealMutationArgs, context: GraphQLContext): Promise<GraphQLDeal | null> => {
      const action = `assigning deal ${args.dealId} to user ${args.assignedToUserId}`;
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id; // User performing the assignment
        const accessToken = getAccessToken(context)!;

        // Check for 'deal:assign' permission
        if (!context.userPermissions?.includes('deal:assign')) {
          throw new GraphQLError('Not authorized to assign deals', { extensions: { code: 'FORBIDDEN' } });
        }

        // Prepare the update payload for the dealService
        // The service expects snake_case: assigned_to_user_id
        const updatePayload: DealServiceUpdateData = {
          assigned_to_user_id: args.assignedToUserId,
        };

        // Call the dealService to update the deal
        const updatedDealRecord = await dealService.updateDeal(userId, args.dealId, updatePayload, accessToken);

        if (!updatedDealRecord) {
          // This case should ideally be handled by dealService.updateDeal throwing an error if not found
          throw new GraphQLError(`Failed to assign deal or deal not found: ${args.dealId}`, { extensions: { code: 'NOT_FOUND' } });
        }
        
        // Map the service layer deal object to the GraphQL Deal type
        return {
          id: updatedDealRecord.id,
          created_at: updatedDealRecord.created_at,
          updated_at: updatedDealRecord.updated_at,
          name: updatedDealRecord.name!,
          amount: updatedDealRecord.amount,
          expected_close_date: updatedDealRecord.expected_close_date,
          deal_specific_probability: updatedDealRecord.deal_specific_probability,
          weighted_amount: updatedDealRecord.weighted_amount,
          user_id: updatedDealRecord.user_id!, // Creator of the deal
          assignedToUserId: updatedDealRecord.assigned_to_user_id, // The newly assigned user ID
          person_id: updatedDealRecord.person_id,
          organization_id: updatedDealRecord.organization_id,
          wfm_project_id: updatedDealRecord.wfm_project_id,
          db_custom_field_values: (updatedDealRecord as any).custom_field_values, // For customFieldValues resolver
          // assignedToUser will be resolved by its own field resolver on the Deal type
        } as unknown as GraphQLDeal; // Cast to GraphQLDeal, complex fields resolved by Deal field resolvers

      } catch (error) {
        console.error(`[Mutation.assignDeal] Error during ${action}:`, error);
        if (error instanceof GraphQLError) throw error; // Re-throw known GraphQL errors
        // For other errors, process them (e.g., ZodError if input validation was added, though not for these simple args)
        // or wrap them in a generic GraphQL error.
        throw new GraphQLError(`Failed to assign deal: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    }
}; 