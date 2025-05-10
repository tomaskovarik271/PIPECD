import { GraphQLContext, getAccessToken, requireAuthentication, processZodError } from '../helpers';
import {
  CreateActivityInputSchema,
  UpdateActivityInputSchema,
  ActivityFilterInputSchema
} from '../validators';
import { 
    createActivity, 
    getActivities, 
    getActivityById, 
    updateActivity, 
    deleteActivity 
} from '../../../../lib/activityService';
import { inngest } from '../../inngest';

// Import service objects for resolving linked entities
import { dealService } from '../../../../lib/dealService';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import type { 
    QueryActivitiesArgs, 
    MutationCreateActivityArgs, 
    MutationUpdateActivityArgs,
} from '../../../../frontend/src/generated/graphql/graphql.js' with { "resolution-mode": "import" };

// Type definition for the parent object in Activity field resolvers
interface ActivityParent {
  id: string; 
  user_id: string; // Added user_id from Activity type
  deal_id?: string | null;
  person_id?: string | null;
  organization_id?: string | null;
}

export const Activity = {
    deal: async (parent: ActivityParent, _args: unknown, context: GraphQLContext) => {
      if (!parent.deal_id) return null;
      const action = `fetching deal ${parent.deal_id} for activity ${parent.id}`;
      try {
        // Get token and call service method
        const accessToken = getAccessToken(context);
        if (!accessToken) return null; // Or throw? Return null for field resolvers usually safer
        // Assuming parent.user_id is available from the activity query
        return await dealService.getDealById(parent.user_id, parent.deal_id, accessToken);
      } catch (e) {
        console.error(`Error ${action}:`, e);
        return null; 
      }
    },
    person: async (parent: ActivityParent, _args: unknown, context: GraphQLContext) => {
      if (!parent.person_id) return null;
      const action = `fetching person ${parent.person_id} for activity ${parent.id}`;
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) return null;
        return await personService.getPersonById(parent.user_id, parent.person_id, accessToken);
      } catch (e) {
        console.error(`Error ${action}:`, e);
        return null;
      }
    },
    organization: async (parent: ActivityParent, _args: unknown, context: GraphQLContext) => {
      if (!parent.organization_id) return null;
      const action = `fetching organization ${parent.organization_id} for activity ${parent.id}`;
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) return null;
        return await organizationService.getOrganizationById(parent.user_id, parent.organization_id, accessToken);
      } catch (e) {
        console.error(`Error ${action}:`, e);
        return null;
      }
    }
};

export const Query = {
    activities: async (_parent: unknown, args: QueryActivitiesArgs, context: GraphQLContext) => {
      const action = 'fetching activities';
      try {
        requireAuthentication(context); // Check auth first
        const accessToken = getAccessToken(context)!; // Then get token (assert non-null)
        const userId = context.currentUser!.id;

        // Use args.filter directly if QueryActivitiesArgs already defines it with the correct type
        // Or ensure ActivityFilterInputSchema can parse args.filter which might be of type Maybe<ActivityFilterInput>
        const validatedFilter = ActivityFilterInputSchema.parse(args.filter || {});
        return await getActivities(userId, accessToken, validatedFilter);
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    activity: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const action = `fetching activity by ID ${id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;
        return await getActivityById(userId, id, accessToken);
      } catch (error) {
        throw processZodError(error, action);
      }
    },
};

export const Mutation = {
    createActivity: async (_parent: unknown, args: MutationCreateActivityArgs, context: GraphQLContext) => {
      const action = 'creating activity';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;

        const validatedInput = CreateActivityInputSchema.parse(args.input);
        const newActivity = await createActivity(userId, validatedInput, accessToken);

        // Send event to Inngest (fire and forget)
        inngest.send({
          name: 'crm/activity.created',
          data: { activity: newActivity },
          user: { id: userId, email: context.currentUser!.email }
        }).catch((err: unknown) => console.error('Failed to send activity.created event to Inngest:', err));

        return newActivity;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updateActivity: async (_parent: unknown, args: MutationUpdateActivityArgs, context: GraphQLContext) => {
      const action = `updating activity ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;

        const validatedInput = UpdateActivityInputSchema.parse(args.input);
        const updatedActivity = await updateActivity(userId, args.id, validatedInput, accessToken);

        // Send event to Inngest (fire and forget)
        inngest.send({
          name: 'crm/activity.updated',
          data: { activity: updatedActivity },
          user: { id: userId, email: context.currentUser!.email }
        }).catch((err: unknown) => console.error('Failed to send activity.updated event to Inngest:', err));

        return updatedActivity;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    deleteActivity: async (_parent: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const action = `deleting activity ${id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;

        const result = await deleteActivity(userId, id, accessToken);

        // Send event to Inngest (fire and forget)
        inngest.send({
          name: 'crm/activity.deleted',
          data: { activityId: id },
          user: { id: userId, email: context.currentUser!.email }
        }).catch((err: unknown) => console.error('Failed to send activity.deleted event to Inngest:', err));

        return result.id;
      } catch (error) {
        throw processZodError(error, action);
      }
    },
}; 