// Resolvers for Person type fields
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken /*, processZodError */ } from '../helpers'; // processZodError might not be needed here yet
import { organizationService } from '../../../../lib/organizationService';
// import { dealService } from '../../../../lib/dealService'; // Keep commented until deals resolver is implemented

// Define parent types for context within these resolvers
type PersonOrganizationParent = { 
  organization_id?: string | null 
};

type PersonDealsParent = { 
  id: string 
};

export const Person = {
    // Resolver for the nested 'organization' field within Person
    organization: async (parent: PersonOrganizationParent, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context); // Added Auth Check
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      if (!parent.organization_id) {
        return null;
      }
      try {
        // Fetch the organization using the organization_id from the parent Person object
        // Pass user context for RLS
        return await organizationService.getOrganizationById(context.currentUser!.id, parent.organization_id, accessToken);
      } catch (e) {
        // Don't throw here, just return null if org fetch fails (e.g., RLS denies)
        console.error('Error fetching Person.organization:', e);
        return null; 
        // Alternatively, re-throw using processZodError if we want errors shown?
        // throw processZodError(e, 'fetching Person.organization');
      }
    },
    // Placeholder for deals linked to a person (requires dealService update)
    deals: async (parent: PersonDealsParent, _args: unknown, context: GraphQLContext) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       console.warn(`Resolver Person.deals not fully implemented - needs service update`);
       // TODO: Implement dealService.getDealsByPersonId(userId, personId, accessToken)
       // try {
       //   return await dealService.getDealsByPersonId(context.currentUser!.id, parent.id, accessToken);
       // } catch (e) {
       //   throw processZodError(e, 'fetching Person.deals');
       // }
       return []; // Return empty array for now
    }
}; 