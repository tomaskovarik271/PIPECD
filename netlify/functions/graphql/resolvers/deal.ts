// Resolvers for Deal type fields
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../helpers';
import { personService } from '../../../../lib/personService';
import * as stageService from '../../../../lib/stageService';

// Define the parent type for Deal field resolvers
type ParentDeal = {
  id: string;
  person_id?: string | null;
  stage_id?: string | null;
};

export const Deal = {
    // Resolver for the 'person' field on Deal
    person: async (parent: ParentDeal, _args: unknown, context: GraphQLContext) => {
      if (!parent.person_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
      try {
         // Use personService to fetch the person
         return await personService.getPersonById(context.currentUser!.id, parent.person_id, accessToken);
      } catch (e) {
          console.error(`Error fetching person ${parent.person_id} for deal ${parent.id}:`, e);
          // Avoid throwing full error which might fail the whole deal query
          // Return null or a minimal error object if preferred
          return null; 
      }
    },
    // Resolver for the 'stage' field on Deal
    stage: async (parent: ParentDeal, _args: unknown, context: GraphQLContext) => {
        if (!parent.stage_id) {
            // This shouldn't happen if stage_id is non-nullable in DB/schema
            console.error(`Deal ${parent.id} is missing stage_id.`);
            throw new GraphQLError('Internal Error: Deal is missing stage information.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        requireAuthentication(context); // Check first
        const accessToken = getAccessToken(context)!; // Then get token
        
        try {
            // Assuming stageService has a method like getStageById
            // Note: Stage RLS might need checking if it's not implicitly handled by user_id on pipeline
            const stage = await stageService.getStageById(accessToken, parent.stage_id);
            if (!stage) {
                console.error(`Stage ${parent.stage_id} not found for deal ${parent.id}.`);
                // Handle case where stage might have been deleted but deal wasn't updated
                 throw new GraphQLError('Stage associated with this deal not found.', { extensions: { code: 'NOT_FOUND' } });
            }
            return stage;
        } catch (e) {
            console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id}:`, e);
            // Process error: Check if it's a standard not found or other issue
             if (e instanceof GraphQLError && e.extensions?.code === 'NOT_FOUND') {
                 throw e; // Re-throw known errors
             }
             // Log unexpected errors but return a generic error to client
             throw processZodError(e, `fetching stage ${parent.stage_id}`);
        }
    }
}; 