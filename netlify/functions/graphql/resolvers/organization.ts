import type { GraphQLContext } from '../helpers';
import { requireAuthentication, getAccessToken } from '../helpers';
import { GraphQLError } from 'graphql';
// import { personService } from '../../../../lib/personService'; // Assuming personService will be needed eventually

export const Organization = {
  people: async (_parent: { id: string }, _args: unknown, context: GraphQLContext) => {
     requireAuthentication(context);
     const accessToken = getAccessToken(context);
     if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
     console.warn(`Resolver Organization.people not fully implemented - needs service update`);
     // TODO: Implement personService.getPeopleByOrganizationId(userId, orgId, accessToken)
     // try {
     //    return await personService.getPeopleByOrganizationId(context.currentUser!.id, parent.id, accessToken);
     // } catch (e) {
     //    throw processServiceError(e, 'fetching Organization.people'); // Need processServiceError helper?
     // }
     return []; // Return empty array for now
  }
}; 