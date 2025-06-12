import { GraphQLContext, requireAuthentication, requirePermission } from '../helpers';
import { 
  WfmProjectType,
  CreateWfmProjectTypeInput,
  UpdateWfmProjectTypeInput,
  WfmWorkflow, // For WFMProjectType.defaultWorkflow
  User
} from '../../../../lib/generated/graphql';

// Import services
import { wfmWorkflowService } from '../../../../lib/wfmWorkflowService'; // For defaultWorkflow resolver
import { getServiceLevelUserProfileData, ServiceLevelUserProfile } from '../../../../lib/userProfileService';
import { wfmProjectTypeService } from '../../../../lib/wfmProjectTypeService'; // Make sure this is imported
// import { wfmProjectTypeService } from '../../../../lib/wfmProjectTypeService'; // Not directly needed for these field resolvers

// Interface to represent WfmProjectType with IDs needed for field resolution
interface WfmProjectTypeWithResolvedIds extends WfmProjectType {
  default_workflow_id?: string | null;
  created_by_user_id?: string | null;
  updated_by_user_id?: string | null;
}

// Helper to map ServiceLevelUserProfile to GraphQL User type
// TODO: Move this to a shared utility file
const mapServiceUserToGraphqlUser = (serviceUser: ServiceLevelUserProfile): User => {
  return {
    __typename: 'User',
    id: serviceUser.user_id,
    email: serviceUser.email,
    display_name: serviceUser.display_name,
    avatar_url: serviceUser.avatar_url,
  };
};

export const WFMProjectTypeResolvers = {
  Query: {
    wfmProjectTypes: async (_parent: unknown, args: { isArchived?: boolean }, context: GraphQLContext): Promise<WfmProjectType[]> => {
      // console.log('Resolving Query.wfmProjectTypes with args:', args, 'user:', context.currentUser?.id);
      const projectTypes = await wfmProjectTypeService.getAll(args.isArchived ?? false, context);
      return projectTypes as WfmProjectTypeWithResolvedIds[];
    },
    wfmProjectType: async (_parent: unknown, args: { id: string }, context: GraphQLContext): Promise<WfmProjectType | null> => {
      console.log('Resolving Query.wfmProjectType with ID:', args.id, 'user:', context.currentUser?.id);
      const projectType = await wfmProjectTypeService.getById(args.id, context);
      return projectType as WfmProjectTypeWithResolvedIds | null;
    },
    wfmProjectTypeByName: async (_parent: unknown, args: { name: string }, context: GraphQLContext): Promise<WfmProjectType | null> => {
      // console.log('Resolving Query.wfmProjectTypeByName with name:', args.name, 'user:', context.currentUser?.id);
      const projectType = await wfmProjectTypeService.getWFMProjectTypeByName(args.name, context);
      return projectType as WfmProjectTypeWithResolvedIds | null;
    },
  },
  Mutation: {
    createWFMProjectType: async (_parent: unknown, args: { input: CreateWfmProjectTypeInput }, context: GraphQLContext): Promise<WfmProjectType> => {
      console.log('Resolving Mutation.createWFMProjectType with input:', args.input, 'user:', context.currentUser?.id);
      const auth = requireAuthentication(context);
      requirePermission(context, 'wfm:manage_project_types');
      
      const newProjectType = await wfmProjectTypeService.create(args.input, auth.userId, context);
      return newProjectType as WfmProjectTypeWithResolvedIds;
    },
    updateWFMProjectType: async (_parent: unknown, args: { id: string, input: UpdateWfmProjectTypeInput }, context: GraphQLContext): Promise<WfmProjectType> => {
      console.log('Resolving Mutation.updateWFMProjectType with ID:', args.id, 'input:', args.input, 'user:', context.currentUser?.id);
      const auth = requireAuthentication(context);
      requirePermission(context, 'wfm:manage_project_types');
      
      const updatedProjectType = await wfmProjectTypeService.update(args.id, args.input, auth.userId, context);
      if (!updatedProjectType) throw new Error('Project Type not found or update failed');
      return updatedProjectType as WfmProjectTypeWithResolvedIds;
    },
  },
  WFMProjectType: {
    defaultWorkflow: async (parent: WfmProjectTypeWithResolvedIds, _args: unknown, context: GraphQLContext): Promise<WfmWorkflow | null> => {
      // console.log('Resolving WFMProjectType.defaultWorkflow for project type ID:', parent.id, 'user:', context.currentUser?.id);
      if (!parent.default_workflow_id) {
        return null;
      }
      try {
        // Note: wfmWorkflowService.getById returns WfmWorkflow, which matches the expected return type.
        // The WfmWorkflow type itself has field resolvers for its own complex fields (steps, transitions, users).
        return await wfmWorkflowService.getById(parent.default_workflow_id, context);
      } catch (error) {
        console.error('Error fetching defaultWorkflow for WFMProjectType:', error);
        return null; // Or rethrow, depending on error handling policy
      }
    },
    createdByUser: async (parent: WfmProjectTypeWithResolvedIds, _args: unknown, context: GraphQLContext): Promise<User | null> => {
      // console.log('Resolving WFMProjectType.createdByUser for project type ID:', parent.id, 'user:', context.currentUser?.id);
      if (!parent.created_by_user_id) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(parent.created_by_user_id);
        return userProfile ? mapServiceUserToGraphqlUser(userProfile) : null;
      } catch (error) {
        console.error('Error fetching createdByUser for WFMProjectType:', error);
        return null;
      }
    },
    updatedByUser: async (parent: WfmProjectTypeWithResolvedIds, _args: unknown, context: GraphQLContext): Promise<User | null> => {
      // console.log('Resolving WFMProjectType.updatedByUser for project type ID:', parent.id, 'user:', context.currentUser?.id);
      if (!parent.updated_by_user_id) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(parent.updated_by_user_id);
        return userProfile ? mapServiceUserToGraphqlUser(userProfile) : null;
      } catch (error) {
        console.error('Error fetching updatedByUser for WFMProjectType:', error);
        return null;
      }
    },
  }
}; 