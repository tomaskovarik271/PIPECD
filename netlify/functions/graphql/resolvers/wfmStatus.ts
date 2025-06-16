import { GraphQLContext, requirePermission } from '../helpers';
import { 
  WfmStatus, 
  CreateWfmStatusInput, 
  UpdateWfmStatusInput,
  User // GraphQL User type
} from '../../../../lib/generated/graphql';

import { getServiceLevelUserProfileData } from '../../../../lib/userProfileService';
import { wfmStatusService } from '../../../../lib/wfmStatusService';
import { mapServiceUserToGraphqlUser } from '../utils/userMapping';

// This interface represents the WfmStatus entity as it would be retrieved from the service,
// including the foreign key user IDs before they are resolved to User objects.
// It extends the GraphQL WfmStatus type to ensure all GraphQL fields are potentially available,
// and adds the user ID fields.
interface WfmStatusWithUserIds extends WfmStatus {
  created_by_user_id?: string | null;
  updated_by_user_id?: string | null;
}



export const WFMStatusResolvers = {
  Query: {
    wfmStatuses: async (_parent: unknown, args: { isArchived?: boolean }, context: GraphQLContext): Promise<WfmStatus[]> => {
      // console.log('Resolving Query.wfmStatuses with args:', args, 'user:', context.currentUser?.id);
      requirePermission(context, 'wfm_status:read_all');
      const statuses = await wfmStatusService.getAll(args.isArchived ?? false, context);
      return statuses.map(status => status as WfmStatusWithUserIds);
    },
    wfmStatus: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<WfmStatus | null> => {
      console.log('Resolving Query.wfmStatus with ID:', args.id, 'user:', context.currentUser?.id);
      requirePermission(context, 'wfm_status:read_one');
      const status = await wfmStatusService.getById(args.id, context);
      if (!status) {
        return null;
      }
      return status as WfmStatusWithUserIds;
    },
  },
  Mutation: {
    createWFMStatus: async (_parent: unknown, args: { input: CreateWfmStatusInput }, context: GraphQLContext): Promise<WfmStatus> => {
      console.log('Resolving Mutation.createWFMStatus with input:', args.input, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to create a status.');
      }
      const newStatus = await wfmStatusService.create(args.input, context.currentUser.id, context);
      return newStatus as WfmStatusWithUserIds;
    },
    updateWFMStatus: async (_parent: unknown, args: { id: string, input: UpdateWfmStatusInput }, context: GraphQLContext): Promise<WfmStatus> => {
      console.log('Resolving Mutation.updateWFMStatus with ID:', args.id, 'input:', args.input, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to update a status.');
      }
      const updatedStatus = await wfmStatusService.update(args.id, args.input, context.currentUser.id, context);
      if (!updatedStatus) {
        throw new Error(`WFMStatus with ID ${args.id} not found or failed to update.`);
      }
      return updatedStatus as WfmStatusWithUserIds;
    },
    deleteWfmStatus: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<{ success: boolean; message?: string; status: null }> => {
      console.log('Resolving Mutation.deleteWfmStatus with ID:', args.id, 'user:', context.currentUser?.id);
      if (!context.currentUser?.id) {
        throw new Error('User must be authenticated to delete a status.');
      }
      // Call the service to delete, which should handle the actual DB operation
      const result = await wfmStatusService.delete(args.id, context); 

      if (!result.success) {
        console.error('Error deleting status via service:', result.message);
        return { success: false, message: result.message, status: null };
      }
      return { success: true, message: 'Status deleted successfully', status: null };
    },
  },
  WFMStatus: {
    createdByUser: async (parent: WfmStatusWithUserIds, _args: unknown, context: GraphQLContext): Promise<User | null> => {
      if (!parent.created_by_user_id) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(parent.created_by_user_id);
        return userProfile ? mapServiceUserToGraphqlUser(userProfile) : null;
      } catch (error) {
        console.error('Error fetching createdByUser:', error);
        return null;
      }
    },
    updatedByUser: async (parent: WfmStatusWithUserIds, _args: unknown, context: GraphQLContext): Promise<User | null> => {
      if (!parent.updated_by_user_id) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(parent.updated_by_user_id);
        return userProfile ? mapServiceUserToGraphqlUser(userProfile) : null;
      } catch (error) {
        console.error('Error fetching updatedByUser:', error);
        return null;
      }
    },
  }
};