import { GraphQLError } from 'graphql';
import { requireAuthentication } from '../../helpers';
import { dealParticipantService } from '../../../../../lib/dealParticipantService';
import type { GraphQLContext } from '../../helpers';
import type { MutationResolvers } from '../../../../../lib/generated/graphql';

export const dealParticipantMutations: MutationResolvers = {
  // Add a participant to a deal
  addDealParticipant: async (_, { input }, context: GraphQLContext) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    return await dealParticipantService.addDealParticipant(
      userId,
      input,
      accessToken
    );
  },

  // Remove a participant from a deal
  removeDealParticipant: async (_, { dealId, personId }, context: GraphQLContext) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    return await dealParticipantService.removeDealParticipant(
      userId,
      dealId,
      personId,
      accessToken
    );
  },

  // Update participant role
  updateDealParticipantRole: async (_, { dealId, personId, role }, context: GraphQLContext) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    return await dealParticipantService.updateDealParticipantRole(
      userId,
      dealId,
      personId,
      role,
      accessToken
    );
  },
}; 