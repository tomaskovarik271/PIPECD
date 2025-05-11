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
import { inngest } from '../../inngest';

// Import service objects for resolving linked entities
import { dealService } from '../../../../lib/dealService';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';

// Correctly import types from our backend generated types
import type { 
    ActivityResolvers,
    QueryResolvers,
    MutationResolvers,
    Activity as GraphQLActivity,
    Deal as GraphQLDeal,
    Person as GraphQLPerson,
    Organization as GraphQLOrganization,
    CreateActivityInput as GraphQLCreateActivityInput,
    UpdateActivityInput as GraphQLUpdateActivityInput,
    ActivityType as GraphQLActivityType
} from '../../../../lib/generated/graphql';

// REMOVE: Manual Parent Type, will be inferred
// interface ActivityParent {
//   id: string; 
//   user_id: string; 
//   deal_id?: string | null;
//   person_id?: string | null;
//   organization_id?: string | null;
// }

export const Activity: ActivityResolvers<GraphQLContext> = {
    deal: async (parent, _args, context) => {
      if (!parent.deal_id) return null;
      const action = `fetching deal ${parent.deal_id} for activity ${parent.id}`;
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) return null;
        const dealRecord = await dealService.getDealById(parent.user_id, parent.deal_id, accessToken);
        if (!dealRecord) return null;
        return { /* Map DealRecord to GraphQLDeal */ 
            id: dealRecord.id,
            name: dealRecord.name,
            amount: dealRecord.amount,
            stage_id: dealRecord.stage_id,
            person_id: dealRecord.person_id,
            user_id: dealRecord.user_id,
            created_at: dealRecord.created_at,
            updated_at: dealRecord.updated_at,
        } as GraphQLDeal;
      } catch (e) {
        console.error(`Error ${action}:`, e);
        return null; 
      }
    },
    person: async (parent, _args, context) => {
      if (!parent.person_id) return null;
      const action = `fetching person ${parent.person_id} for activity ${parent.id}`;
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) return null;
        const personRecord = await personService.getPersonById(parent.user_id, parent.person_id, accessToken);
        if (!personRecord) return null;
        return { /* Map PersonRecord to GraphQLPerson */ 
            id: personRecord.id,
            first_name: personRecord.first_name,
            last_name: personRecord.last_name,
            email: personRecord.email,
            phone: personRecord.phone,
            notes: personRecord.notes,
            organization_id: personRecord.organization_id,
            user_id: personRecord.user_id,
            created_at: personRecord.created_at,
            updated_at: personRecord.updated_at,
        } as GraphQLPerson;
      } catch (e) {
        console.error(`Error ${action}:`, e);
        return null;
      }
    },
    organization: async (parent, _args, context) => {
      if (!parent.organization_id) return null;
      const action = `fetching organization ${parent.organization_id} for activity ${parent.id}`;
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) return null;
        const orgRecord = await organizationService.getOrganizationById(parent.user_id, parent.organization_id, accessToken);
        if (!orgRecord) return null;
        return { /* Map OrganizationRecord to GraphQLOrganization */ 
            id: orgRecord.id,
            name: orgRecord.name,
            address: orgRecord.address,
            notes: orgRecord.notes,
            user_id: orgRecord.user_id,
            created_at: orgRecord.created_at,
            updated_at: orgRecord.updated_at,
        } as GraphQLOrganization;
      } catch (e) {
        console.error(`Error ${action}:`, e);
        return null;
      }
    }
};

export const Query: QueryResolvers<GraphQLContext> = {
    activities: async (_parent, args, context) => {
      const action = 'fetching activities';
      try {
        requireAuthentication(context); 
        const accessToken = getAccessToken(context)!; 
        const userId = context.currentUser!.id;
        // Assuming args.filter is now correctly typed as Maybe<ActivityFilterInput>
        const validatedFilter = ActivityFilterInputSchema.parse(args.filter || {});
        return await getActivitiesService(userId, accessToken, validatedFilter) as GraphQLActivity[]; // Cast service result
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    activity: async (_parent, args, context) => { // args type will be { id: string }
      const action = `fetching activity by ID ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;
        return await getActivityByIdService(userId, args.id, accessToken) as GraphQLActivity | null; // Cast service result
      } catch (error) {
        throw processZodError(error, action);
      }
    },
};

export const Mutation: MutationResolvers<GraphQLContext> = {
    createActivity: async (_parent, args, context) => { 
      const action = 'creating activity';
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;

        const validatedInputFromZod = CreateActivityInputSchema.parse(args.input);
        // Cast the Zod output to the shape expected by the service, especially for the enum
        const serviceInput: GraphQLCreateActivityInput = {
            ...validatedInputFromZod,
            type: validatedInputFromZod.type as GraphQLActivityType, // Cast string to enum type
        };
        const newActivity = await createActivityService(userId, serviceInput, accessToken);

        inngest.send({
          name: 'crm/activity.created',
          data: { activity: newActivity as any }, // Inngest might not know GraphQLActivity type
          user: { id: userId, email: context.currentUser!.email! }
        }).catch((err: unknown) => console.error('Failed to send activity.created event to Inngest:', err));

        return newActivity as GraphQLActivity; // Cast service result
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    updateActivity: async (_parent, args, context) => { 
      const action = `updating activity ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;

        const validatedInputFromZod = UpdateActivityInputSchema.parse(args.input);
        // Cast the Zod output to the shape expected by the service
        const serviceInput: GraphQLUpdateActivityInput = {
            ...validatedInputFromZod,
            // Type is optional in UpdateActivityInput, handle if present
            type: validatedInputFromZod.type ? validatedInputFromZod.type as GraphQLActivityType : undefined,
        };
        const updatedActivity = await updateActivityService(userId, args.id, serviceInput, accessToken);

        inngest.send({
          name: 'crm/activity.updated',
          data: { activity: updatedActivity as any }, // Inngest might not know GraphQLActivity type
          user: { id: userId, email: context.currentUser!.email! }
        }).catch((err: unknown) => console.error('Failed to send activity.updated event to Inngest:', err));

        return updatedActivity as GraphQLActivity; // Cast service result
      } catch (error) {
        throw processZodError(error, action);
      }
    },
    deleteActivity: async (_parent, args, context) => { // args type will be { id: string }
      const action = `deleting activity ${args.id}`;
      try {
        requireAuthentication(context);
        const accessToken = getAccessToken(context)!;
        const userId = context.currentUser!.id;

        const result = await deleteActivityService(userId, args.id, accessToken);

        inngest.send({
          name: 'crm/activity.deleted',
          data: { activityId: args.id }, // Ensure id is passed correctly
          user: { id: userId, email: context.currentUser!.email! }
        }).catch((err: unknown) => console.error('Failed to send activity.deleted event to Inngest:', err));

        return result.id; // This matches the schema (returns ID!)
      } catch (error) {
        throw processZodError(error, action);
      }
    },
}; 