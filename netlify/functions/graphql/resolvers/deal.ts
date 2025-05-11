// Resolvers for Deal type fields
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../helpers';
import { personService } from '../../../../lib/personService';
import * as stageService from '../../../../lib/stageService';
import type { DealResolvers, Person, Stage as GraphQLStage } from '../../../../lib/generated/graphql'; // Import generated types

// Define the parent type for Deal field resolvers - Will be removed
// type ParentDeal = {
//   id: string;
//   person_id?: string | null;
//   stage_id?: string | null;
// };

export const Deal: DealResolvers<GraphQLContext> = {
    // Resolver for the 'person' field on Deal
    person: async (parent, _args, context) => { // parent and _args types will be inferred
      if (!parent.person_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
         const personRecord = await personService.getPersonById(context.currentUser!.id, parent.person_id, accessToken);
         if (!personRecord) return null;
         // Map PersonRecord to GraphQL Person type
         return {
            id: personRecord.id,
            created_at: personRecord.created_at,
            updated_at: personRecord.updated_at,
            user_id: personRecord.user_id,
            first_name: personRecord.first_name,
            last_name: personRecord.last_name,
            email: personRecord.email,
            phone: personRecord.phone,
            notes: personRecord.notes,
            organization_id: personRecord.organization_id,
            // organization, deals, activities fields are resolved by Person type resolvers
         } as Person;
      } catch (e) {
          console.error(`Error fetching person ${parent.person_id} for deal ${parent.id}:`, e);
          return null; 
      }
    },
    // Resolver for the 'stage' field on Deal
    stage: async (parent, _args, context) => { // parent and _args types will be inferred
        if (!parent.stage_id) {
            console.error(`Deal ${parent.id} is missing stage_id.`);
            throw new GraphQLError('Internal Error: Deal is missing stage information.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        requireAuthentication(context); 
        const accessToken = getAccessToken(context)!; 
        
        try {
            const stageRecord = await stageService.getStageById(accessToken, parent.stage_id);
            if (!stageRecord) {
                console.error(`Stage ${parent.stage_id} not found for deal ${parent.id}.`);
                 throw new GraphQLError('Stage associated with this deal not found.', { extensions: { code: 'NOT_FOUND' } });
            }
            // Map Stage (from lib/types) to GraphQL Stage type
            return {
                id: stageRecord.id,
                user_id: stageRecord.user_id,
                pipeline_id: stageRecord.pipeline_id,
                name: stageRecord.name,
                order: stageRecord.order,
                deal_probability: stageRecord.deal_probability,
                created_at: stageRecord.created_at,
                updated_at: stageRecord.updated_at,
                // pipeline field is resolved by Stage type resolver
            } as GraphQLStage;
        } catch (e) {
            console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id}:`, e);
             if (e instanceof GraphQLError && e.extensions?.code === 'NOT_FOUND') {
                 throw e; 
             }
             throw processZodError(e, `fetching stage ${parent.stage_id}`);
        }
    }
}; 