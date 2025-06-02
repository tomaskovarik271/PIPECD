import { GraphQLContext } from '../helpers';
import { GraphQLError } from 'graphql';
import { 
  WfmWorkflow, 
  CreateWfmWorkflowInput, 
  UpdateWfmWorkflowInput,
  WfmWorkflowStep, 
  WfmWorkflowTransition,
  WfmStatus, // For WFMWorkflowStep.status
  User,
  CreateWfmWorkflowStepInput, // Added for the new mutation
  UpdateWfmWorkflowStepInput, // Corrected casing
  WfmWorkflowStepMutationResponse, // Corrected Casing
  CreateWfmWorkflowTransitionInput,
  UpdateWfmWorkflowTransitionInput, // Added for the new mutation
  WfmWorkflowTransitionMutationResponse // Should be available after codegen
} from '../../../../lib/generated/graphql';

// Import services
import { wfmWorkflowService } from '../../../../lib/wfmWorkflowService';
import { getServiceLevelUserProfileData, ServiceLevelUserProfile } from '../../../../lib/userProfileService';
import { wfmStatusService } from '../../../../lib/wfmStatusService'; // For WFMWorkflowStep.status resolver

// Interface to represent WfmWorkflow with user IDs from the database/service layer
interface WfmWorkflowWithUserIds extends WfmWorkflow {
  created_by_user_id?: string | null;
  updated_by_user_id?: string | null;
  // The WfmWorkflow type from generated/graphql already includes: id, name, description, isArchived, createdAt, updatedAt, steps, transitions
}

// Interface to represent WfmWorkflowStep with status_id for resolver
interface WfmWorkflowStepWithStatusId extends WfmWorkflowStep {
  status_id: string; // This ID comes from the DbWfmWorkflowStep via the parent object in the resolver
}

// Interface to represent WfmWorkflowTransition with step IDs for resolvers
interface WfmWorkflowTransitionWithStepIds extends WfmWorkflowTransition {
  from_step_id: string; // From DbWfmWorkflowTransition
  to_step_id: string;   // From DbWfmWorkflowTransition
}

// Helper to map ServiceLevelUserProfile to GraphQL User type
// TODO: Move this to a shared utility file if used by many resolvers
const mapServiceUserToGraphqlUser = (serviceUser: ServiceLevelUserProfile): User => {
  return {
    __typename: 'User',
    id: serviceUser.user_id,
    email: serviceUser.email,
    display_name: serviceUser.display_name,
    avatar_url: serviceUser.avatar_url,
  };
};

export const WFMWorkflowResolvers = {
  Query: {
    wfmWorkflows: async (_parent: unknown, args: { isArchived?: boolean }, context: GraphQLContext): Promise<WfmWorkflow[]> => {
      console.log('Resolving Query.wfmWorkflows with args:', args, 'user:', context.currentUser?.id);
      const workflows = await wfmWorkflowService.getAll(args.isArchived ?? false, context);
      // The service returns WfmWorkflow objects that were mapped from DbWfmWorkflow.
      // These objects will be used as parents for field resolvers (createdByUser, updatedByUser, steps, transitions).
      // Ensure these parent objects have the necessary underlying IDs (e.g., created_by_user_id).
      // The WfmWorkflowWithUserIds interface helps type this for the field resolvers.
      return workflows.map(wf => wf as WfmWorkflowWithUserIds);
    },
    wfmWorkflow: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<WfmWorkflow | null> => {
      console.log('Resolving Query.wfmWorkflow with ID:', args.id, 'user:', context.currentUser?.id);
      const workflow = await wfmWorkflowService.getById(args.id, context);
      // Cast to WfmWorkflowWithUserIds to ensure field resolvers have access to necessary IDs.
      return workflow ? workflow as WfmWorkflowWithUserIds : null;
    },
  },
  Mutation: {
    createWFMWorkflow: async (_parent: unknown, args: { input: CreateWfmWorkflowInput }, context: GraphQLContext): Promise<WfmWorkflow> => {
      console.log('Resolving Mutation.createWFMWorkflow with input:', args.input, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to create a workflow.');
      }
      const newWorkflow = await wfmWorkflowService.create(args.input, context.currentUser.id, context);
      return newWorkflow as WfmWorkflowWithUserIds;
    },
    updateWFMWorkflow: async (_parent: unknown, args: { id: string, input: UpdateWfmWorkflowInput }, context: GraphQLContext): Promise<WfmWorkflow> => {
      console.log('Resolving Mutation.updateWFMWorkflow with ID:', args.id, 'input:', args.input, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to update a workflow.');
      }
      // The service method update will throw an error if the workflow is not found or update fails.
      const updatedWorkflow = await wfmWorkflowService.update(args.id, args.input, context.currentUser.id, context);
      return updatedWorkflow as WfmWorkflowWithUserIds;
    },
    createWFMWorkflowStep: async (_parent: unknown, args: { input: CreateWfmWorkflowStepInput }, context: GraphQLContext): Promise<WfmWorkflowStep> => {
      console.log('Resolving Mutation.createWFMWorkflowStep with input:', args.input, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to add a step to a workflow.');
      }
      try {
        const newStep = await wfmWorkflowService.addStepToWorkflow(args.input, context.currentUser.id, context);
        return newStep as WfmWorkflowStepWithStatusId; 
      } catch (e: any) {
        // Check if the error is from Supabase and if it's a unique constraint violation for uq_workflow_status
        // Supabase errors often have a 'code' property (string) and a 'message'
        // The specific code for unique violation in PostgreSQL is '23505'
        if (e.code === '23505' && e.message && e.message.includes('uq_workflow_status')) {
          throw new GraphQLError('This status is already used in this workflow. Each status can only be used once per workflow.', {
            extensions: { code: 'WORKFLOW_STATUS_CONFLICT' },
          });
        } else if (e.message && e.message.includes('uq_workflow_status')) { // Fallback check if code is not available but message indicates the constraint
            throw new GraphQLError('This status is already used in this workflow. Each status can only be used once per workflow.', {
                extensions: { code: 'WORKFLOW_STATUS_CONFLICT' },
            });
        }
        // For other errors, re-throw as a generic internal error but log specifics
        console.error('Error in createWFMWorkflowStep resolver:', e);
        throw new GraphQLError('Failed to add workflow step due to an unexpected error.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
    updateWFMWorkflowStep: async (_parent: unknown, args: { id: string, input: UpdateWfmWorkflowStepInput }, context: GraphQLContext): Promise<WfmWorkflowStep> => {
      console.log('Resolving Mutation.updateWFMWorkflowStep for id:', args.id, 'with input:', args.input, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to update a workflow step.');
      }
      // The service method will handle updating the step.
      // It might need the userId for updated_by_user_id if steps have user tracking.
      const updatedStep = await wfmWorkflowService.updateStepInWorkflow(args.id, args.input, context.currentUser.id, context);
      // Assuming the service returns an object compatible with WfmWorkflowStep after update, potentially with status_id
      return updatedStep as WfmWorkflowStepWithStatusId;
    },
    deleteWFMWorkflowStep: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<WfmWorkflowStepMutationResponse> => {
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to delete a workflow step.');
      }
      const result = await wfmWorkflowService.removeStepFromWorkflow(args.id, context);
      return {
        __typename: 'WFMWorkflowStepMutationResponse',
        success: result.success,
        message: result.message,
        stepId: result.stepId,
      };
    },
    updateWFMWorkflowStepsOrder: async (_parent: unknown, args: { workflowId: string, orderedStepIds: [string] }, context: GraphQLContext): Promise<WfmWorkflow | null> => {
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to reorder workflow steps.');
      }
      // The service method updates the order and could return the updated steps or just success.
      // Here we assume it updates the DB, and we re-fetch the workflow to ensure all data is fresh.
      await wfmWorkflowService.updateStepsOrder(args.workflowId, args.orderedStepIds, context);
      
      // Fetch and return the parent workflow. Its 'steps' field will be resolved subsequently,
      // picking up the new order.
      const updatedWorkflow = await wfmWorkflowService.getById(args.workflowId, context);
      if (!updatedWorkflow) {
        // This case should ideally not be reached if the update was successful and workflowId is valid
        throw new Error(`Workflow with ID ${args.workflowId} not found after attempting to reorder steps.`);
      }
      return updatedWorkflow as WfmWorkflowWithUserIds; // Cast for subsequent field resolvers
    },
    createWFMWorkflowTransition: async (
      _parent: any,
      { input }: { input: CreateWfmWorkflowTransitionInput },
      context: GraphQLContext
    ): Promise<WfmWorkflowTransition> => {
      console.log('Resolver: createWFMWorkflowTransition called with input:', input);
      const userId = context.currentUser?.id;
      if (!userId) {
        // Consider using GraphQLError for consistency
        throw new GraphQLError('User ID not found in context, required for creating a transition.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      try {
        const transition = await wfmWorkflowService.addTransitionToWorkflow(input, userId, context);
        // The service returns an object that includes from_step_id and to_step_id,
        // which are then used by the WFMWorkflowTransition field resolvers.
        return transition;
      } catch (e: any) {
        console.error('Error in createWFMWorkflowTransition resolver while calling service:', e);
        // Pass a more detailed error to the client
        throw new GraphQLError(
          `Failed to create workflow transition: ${e.message}`,
          {
            extensions: {
              code: 'TRANSITION_CREATION_FAILED',
              // Consider if exposing parts of the original error is safe/desired for your environment
              // originalError: { name: e.name, message: e.message }, 
            },
            originalError: e // This ensures the original error is available for logging on the server if using a GraphQL error logger
          }
        );
      }
    },
    deleteWFMWorkflowTransition: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ): Promise<WfmWorkflowTransitionMutationResponse> => {
      console.log('Resolver: deleteWFMWorkflowTransition called for id:', id);
      // The service method now returns { success: boolean; message?: string; transitionId?: string }
      const result = await wfmWorkflowService.removeTransitionFromWorkflow(id, context);
      return {
        success: result.success,
        message: result.message,
        transitionId: result.transitionId,
      };
    },
    updateWFMWorkflowTransition: async (
      _parent: any,
      args: { id: string; input: UpdateWfmWorkflowTransitionInput },
      context: GraphQLContext
    ): Promise<WfmWorkflowTransition> => {
      console.log('Resolver: updateWFMWorkflowTransition called for id:', args.id, 'with input:', args.input);
      const userId = context.currentUser?.id;
      if (!userId) {
        throw new GraphQLError('User ID not found in context, required for updating a transition.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      try {
        const updatedTransition = await wfmWorkflowService.updateWorkflowTransition(args.id, args.input, userId, context);
        // The service returns an object that includes from_step_id and to_step_id,
        // which are then used by the WFMWorkflowTransition field resolvers.
        return updatedTransition;
      } catch (e: any) {
        console.error('Error in updateWFMWorkflowTransition resolver while calling service:', e);
        throw new GraphQLError(
          `Failed to update workflow transition: ${e.message}`,
          {
            extensions: {
              code: 'TRANSITION_UPDATE_FAILED',
            },
            originalError: e
          }
        );
      }
    },
  },
  WFMWorkflow: {
    steps: async (parent: WfmWorkflowWithUserIds, _args: unknown, context: GraphQLContext): Promise<WfmWorkflowStep[]> => {
      console.log('Resolving WFMWorkflow.steps for workflow ID:', parent.id, 'user:', context.currentUser?.id);
      const stepsFromService = await wfmWorkflowService.getStepsByWorkflowId(parent.id, context);
      return stepsFromService.map(step => step as WfmWorkflowStepWithStatusId); 
    },
    transitions: async (parent: WfmWorkflowWithUserIds, _args: unknown, context: GraphQLContext): Promise<WfmWorkflowTransition[]> => {
      console.log('Resolving WFMWorkflow.transitions for workflow ID:', parent.id, 'user:', context.currentUser?.id);
      const transitionsFromService = await wfmWorkflowService.getTransitionsByWorkflowId(parent.id, context);
      return transitionsFromService.map(trans => trans as WfmWorkflowTransitionWithStepIds); 
    },
    createdByUser: async (parent: WfmWorkflowWithUserIds, _args: unknown, context: GraphQLContext): Promise<User | null> => {
      console.log('Resolving WFMWorkflow.createdByUser for workflow ID:', parent.id, 'user:', context.currentUser?.id);
      if (!parent.created_by_user_id) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(parent.created_by_user_id);
        return userProfile ? mapServiceUserToGraphqlUser(userProfile) : null;
      } catch (error) {
        console.error('Error fetching createdByUser for WFMWorkflow:', error);
        return null;
      }
    },
    updatedByUser: async (parent: WfmWorkflowWithUserIds, _args: unknown, context: GraphQLContext): Promise<User | null> => {
      console.log('Resolving WFMWorkflow.updatedByUser for workflow ID:', parent.id, 'user:', context.currentUser?.id);
      if (!parent.updated_by_user_id) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(parent.updated_by_user_id);
        return userProfile ? mapServiceUserToGraphqlUser(userProfile) : null;
      } catch (error) {
        console.error('Error fetching updatedByUser for WFMWorkflow:', error);
        return null;
      }
    },
  },
  WFMWorkflowStep: {
    status: async (parent: WfmWorkflowStepWithStatusId, _args: unknown, context: GraphQLContext): Promise<WfmStatus | null> => {
        console.log('Resolving WFMWorkflowStep.status for step ID:', parent.id, 'using status_id:', parent.status_id, 'user:', context.currentUser?.id);
        if (!parent.status_id) {
            console.warn(`WFMWorkflowStep.status resolver: status_id missing on parent step ID ${parent.id}`);
            return null;
        }
        try {
            return await wfmStatusService.getById(parent.status_id, context);
        } catch (error) {
            console.error(`Error fetching status for WFMWorkflowStep ID ${parent.id}, status_id ${parent.status_id}:`, error);
            return null;
        }
    }
  },
  WFMWorkflowTransition: {
    fromStep: async (parent: WfmWorkflowTransitionWithStepIds, _args: unknown, context: GraphQLContext): Promise<WfmWorkflowStep | null> => {
        console.log('Resolving WFMWorkflowTransition.fromStep for transition ID:', parent.id, 'using from_step_id:', parent.from_step_id, 'user:', context.currentUser?.id);
        if (!parent.from_step_id) {
            console.warn(`WFMWorkflowTransition.fromStep resolver: from_step_id missing on parent transition ID ${parent.id}`);
            return null;
        }
        try {
            const step = await wfmWorkflowService.getStepById(parent.from_step_id, context);
            return step as WfmWorkflowStepWithStatusId | null; 
        } catch (error) {
            console.error(`Error fetching fromStep for WFMWorkflowTransition ID ${parent.id}, from_step_id ${parent.from_step_id}:`, error);
            return null;
        }
    },
    toStep: async (parent: WfmWorkflowTransitionWithStepIds, _args: unknown, context: GraphQLContext): Promise<WfmWorkflowStep | null> => {
        console.log('Resolving WFMWorkflowTransition.toStep for transition ID:', parent.id, 'using to_step_id:', parent.to_step_id, 'user:', context.currentUser?.id);
        if (!parent.to_step_id) {
            console.warn(`WFMWorkflowTransition.toStep resolver: to_step_id missing on parent transition ID ${parent.id}`);
            return null;
        }
        try {
            const step = await wfmWorkflowService.getStepById(parent.to_step_id, context);
            return step as WfmWorkflowStepWithStatusId | null; 
        } catch (error) {
            console.error(`Error fetching toStep for WFMWorkflowTransition ID ${parent.id}, to_step_id ${parent.to_step_id}:`, error);
            return null;
        }
    }
  }
}; 