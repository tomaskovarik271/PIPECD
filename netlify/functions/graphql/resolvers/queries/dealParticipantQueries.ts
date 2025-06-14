import { GraphQLError } from 'graphql';
import { requireAuthentication } from '../../helpers';
import { dealParticipantService } from '../../../../../lib/dealParticipantService';
import type { GraphQLContext } from '../../helpers';
import type { QueryResolvers } from '../../../../../lib/generated/graphql';

export const dealParticipantQueries: QueryResolvers = {
  // Get all participants for a deal
  getDealParticipants: async (_, { dealId }, context: GraphQLContext) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    return await dealParticipantService.getDealParticipants(
      userId,
      dealId,
      accessToken
    );
  },

  // Suggest participants from email thread or organization
  suggestEmailParticipants: async (_, { dealId, threadId }, context: GraphQLContext) => {
    const { userId, accessToken } = requireAuthentication(context);
    
    return await dealParticipantService.suggestEmailParticipants(
      userId,
      dealId,
      threadId || null,
      accessToken
    );
  },
}; 