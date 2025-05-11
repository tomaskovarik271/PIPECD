// Resolvers for Deal type fields
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../helpers';
import { personService } from '../../../../lib/personService';
import * as stageService from '../../../../lib/stageService';
import type { DealResolvers, Person, Stage as GraphQLStage, Deal as GraphQLDealParent } from '../../../../lib/generated/graphql'; // Import generated types

// Define the parent type for Deal field resolvers to ensure all fields are available
// type ParentDeal = Pick<GraphQLDealParent, 'id' | 'person_id' | 'stage_id' | 'amount' | 'deal_specific_probability'> & {
//   stage?: Pick<GraphQLStage, 'deal_probability'> | null; // Ensure stage with deal_probability can be part of parent
// };

export const Deal: DealResolvers<GraphQLContext> = {
    // Resolver for the 'person' field on Deal
    person: async (parent, _args, context) => { 
      if (!parent.person_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
         const personRecord = await personService.getPersonById(context.currentUser!.id, parent.person_id, accessToken);
         if (!personRecord) return null;
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
         } as Person;
      } catch (e) {
          console.error(`Error fetching person ${parent.person_id} for deal ${parent.id}:`, e);
          return null; 
      }
    },
    // Resolver for the 'stage' field on Deal
    stage: async (parent, _args, context) => { 
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
            return {
                id: stageRecord.id,
                user_id: stageRecord.user_id,
                pipeline_id: stageRecord.pipeline_id,
                name: stageRecord.name,
                order: stageRecord.order,
                deal_probability: stageRecord.deal_probability,
                created_at: stageRecord.created_at,
                updated_at: stageRecord.updated_at,
            } as GraphQLStage;
        } catch (e) {
            console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id}:`, e);
             if (e instanceof GraphQLError && e.extensions?.code === 'NOT_FOUND') {
                 throw e; 
             }
             throw processZodError(e, `fetching stage ${parent.stage_id}`);
        }
    },
    // Resolver for the 'weighted_amount' field on Deal
    weighted_amount: async (parent: GraphQLDealParent, _args, context: GraphQLContext) => {
        if (parent.amount == null) {
            return null;
        }

        let probabilityToUse: number | null | undefined = parent.deal_specific_probability;

        if (probabilityToUse == null) {
            let stageDealProbability: number | null | undefined = null;

            // Check if stage is already resolved on the parent and has deal_probability
            if (parent.stage && typeof parent.stage.deal_probability === 'number') { 
                stageDealProbability = parent.stage.deal_probability;
            } else if (parent.stage_id) {
                // If stage is not resolved, or doesn't have probability, and we have stage_id, fetch the stage
                requireAuthentication(context); // Ensure context is authenticated for service call
                const accessToken = getAccessToken(context);
                if (!accessToken) {
                    // This case should ideally be caught by requireAuthentication, but as a safeguard:
                    console.error('Authentication token not found in weighted_amount resolver.');
                    throw new GraphQLError('User not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
                }
                try {
                    const stageRecord = await stageService.getStageById(accessToken, parent.stage_id);
                    if (stageRecord && typeof stageRecord.deal_probability === 'number') {
                        stageDealProbability = stageRecord.deal_probability;
                    }
                } catch (e) {
                    console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id} within weighted_amount resolver:`, e);
                    // If stage fetch fails, proceed without stage probability (probabilityToUse remains null)
                }
            }
            probabilityToUse = stageDealProbability;
        }

        if (probabilityToUse != null) {
            // Ensure parent.amount is still valid if any async operations occurred, though it shouldn't change.
            return parent.amount * probabilityToUse;
        }
        return null; // If no probability can be determined
    }
    // TODO: Add resolver for Deal.activities if not already present or handled by default
}; 