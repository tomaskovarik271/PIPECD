import { GraphQLContext, getAccessToken, requireAuthentication, processZodError } from '../helpers';
import {
  CreateActivityInputSchema,
  UpdateActivityInputSchema,
  ActivityFilterInputSchema
} from '../validators';
import { 
    createActivity as createActivityService,
    getActivities as getActivitiesService,
    getActivityById as getActivityByIdService,
    updateActivity as updateActivityService,
    deleteActivity as deleteActivityService 
} from '../../../../lib/activityService';
import { inngest } from '../../../../lib/inngestClient';

// Import service objects for resolving linked entities
import { dealService } from '../../../../lib/dealService';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { getServiceLevelUserProfileData, ServiceLevelUserProfile } from '../../../../lib/userProfileService';

// Correctly import types from our backend generated types
import type { 
    ActivityResolvers,
    QueryResolvers,
    MutationResolvers,
    Activity as GraphQLActivity,
    Deal as GraphQLDeal,
    Person as GraphQLPerson,
    Organization as GraphQLOrganization,
    User as GraphQLUser,
    CreateActivityInput as GraphQLCreateActivityInput,
    UpdateActivityInput as GraphQLUpdateActivityInput,
    ActivityType as GraphQLActivityType
} from '../../../../lib/generated/graphql';
import { GraphQLError } from 'graphql';

// REMOVE: Manual Parent Type, will be inferred
// interface ActivityParent {
//   id: string; 
//   user_id: string; 
//   deal_id?: string | null;
//   person_id?: string | null;
//   organization_id?: string | null;
// }

// Helper to map ServiceLevelUserProfile to GraphQL User type
const mapServiceUserToGraphqlUser = (serviceUser: ServiceLevelUserProfile): GraphQLUser => {
  return {
    __typename: 'User', // Important for GraphQL
    id: serviceUser.user_id,
    email: serviceUser.email,
    display_name: serviceUser.display_name,
    avatar_url: serviceUser.avatar_url,
  };
};

export const Activity: ActivityResolvers<GraphQLContext> = {
    deal: async (parent, _args, context) => {
        if (!parent.deal_id) return null;
        const { userId, accessToken } = requireAuthentication(context);
        if (!userId) {
            throw new GraphQLError('User ID not found in context for deal resolver');
        }
        return dealService.getDealById(parent.deal_id, userId, accessToken);
    },
    person: async (parent, _args, context) => {
        if (!parent.person_id) return null;
        const { userId, accessToken } = requireAuthentication(context);
        if (!userId) {
            throw new GraphQLError('User ID not found in context for person resolver');
        }
        return personService.getPersonById(parent.person_id, userId, accessToken);
    },
    organization: async (parent, _args, context) => {
        if (!parent.organization_id) return null;
        const { userId, accessToken } = requireAuthentication(context);
        if (!userId) {
            throw new GraphQLError('User ID not found in context for organization resolver');
        }
        return organizationService.getOrganizationById(parent.organization_id, userId, accessToken);
    },
    user: async (parent, _args, context) => {
        requireAuthentication(context);
        if (!parent.user_id) return null;
        const serviceUser = await getServiceLevelUserProfileData(parent.user_id);
        return serviceUser ? mapServiceUserToGraphqlUser(serviceUser) : null;
    },
    assignedToUser: async (parent, _args, context) => {
        requireAuthentication(context);
        if (!parent.assigned_to_user_id) return null;
        const serviceUser = await getServiceLevelUserProfileData(parent.assigned_to_user_id);
        return serviceUser ? mapServiceUserToGraphqlUser(serviceUser) : null;
    },
};

export const Query: QueryResolvers<GraphQLContext> = {
    activities: async (_parent, { filter }, context) => {
        const { userId, accessToken } = requireAuthentication(context);
        const validatedFilter = filter ? ActivityFilterInputSchema.parse(filter) : undefined;
        return getActivitiesService(userId, accessToken, validatedFilter);
    },
    activity: async (_parent, { id }, context) => {
        const { userId, accessToken } = requireAuthentication(context);
        return getActivityByIdService(userId, id, accessToken);
    },
};

export const Mutation: MutationResolvers<GraphQLContext> = {
    createActivity: async (_parent, { input }, context) => {
        const { userId, accessToken } = requireAuthentication(context);
        const validatedInput = CreateActivityInputSchema.parse(input);
        const createdActivity = await createActivityService(userId, validatedInput, accessToken);
        
        try {
            await inngest.send({
                name: 'crm/activity.created',
                user: { id: userId },
                data: { 
                    activityId: createdActivity.id,
                    type: createdActivity.type,
                    deal_id: createdActivity.deal_id,
                    person_id: createdActivity.person_id,
                    organization_id: createdActivity.organization_id,
                 },
            });
            console.log(`[Mutation.createActivity] Sent 'crm/activity.created' event for activity ID: ${createdActivity.id}`);
        } catch (eventError: any) {
            console.error(`[Mutation.createActivity] Failed to send Inngest event for activity ID ${createdActivity.id}:`, eventError.message);
        }
        return createdActivity;
    },
    updateActivity: async (_parent, { id, input }, context) => {
        const { userId, accessToken } = requireAuthentication(context);
        const validatedInput = UpdateActivityInputSchema.parse(input);
        return updateActivityService(userId, id, validatedInput, accessToken);
    },
    deleteActivity: async (_parent, { id }, context) => {
        const { userId, accessToken } = requireAuthentication(context);
        const result = await deleteActivityService(userId, id, accessToken);
        return result.id;
    },
}; 