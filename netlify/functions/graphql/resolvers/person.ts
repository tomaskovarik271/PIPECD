// Resolvers for Person type fields
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { organizationService } from '../../../../lib/organizationService';
import type { PersonResolvers, Organization } from '../../../../lib/generated/graphql';
// import { dealService } from '../../../../lib/dealService'; // Keep commented until deals resolver is implemented

// Define parent types for context within these resolvers - Will be removed as types are inferred
// type PersonOrganizationParent = { 
//   organization_id?: string | null 
// };

// type PersonDealsParent = { 
//   id: string 
// };

export const Person: PersonResolvers<GraphQLContext> = {
    // Resolver for the nested 'organization' field within Person
    organization: async (parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      if (!parent.organization_id) {
        return null;
      }
      try {
        const orgRecord = await organizationService.getOrganizationById(context.currentUser!.id, parent.organization_id, accessToken);
        if (!orgRecord) {
          return null;
        }
        // Map OrganizationRecord to the expected Organization type for the resolver
        // Fields like 'activities', 'deals', 'people' on Organization will be resolved by their own resolvers
        return {
          id: orgRecord.id,
          created_at: orgRecord.created_at,
          updated_at: orgRecord.updated_at,
          user_id: orgRecord.user_id,
          name: orgRecord.name,
          address: orgRecord.address,
          notes: orgRecord.notes,
          // The following are resolved by Organization type resolvers, so not needed here:
          // activities: [], 
          // deals: [],
          // people: [], 
        } as Organization; // Cast to assert the shape is sufficient for resolver chain
      } catch (e) {
        // Don't throw here, just return null if org fetch fails (e.g., RLS denies)
        console.error('Error fetching Person.organization:', e);
        return null; 
      }
    },
    // Placeholder for deals linked to a person (requires dealService update)
    deals: async (_parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       console.warn(`Resolver Person.deals not fully implemented - needs service update`);
       return []; // Return empty array for now
    }
}; 