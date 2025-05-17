import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../../helpers';
import * as userProfileService from '../../../../../lib/userProfileService';
import type { MutationResolvers, User as GraphQLUser, UpdateUserProfileInput } from '../../../../../lib/generated/graphql';

export const userProfileMutations: Pick<MutationResolvers<GraphQLContext>, 'updateUserProfile'> = {
    updateUserProfile: async (_parent, args, context: GraphQLContext): Promise<GraphQLUser> => {
      const actionDescription = 'updating user profile';
      try {
        requireAuthentication(context);
        const currentUser = context.currentUser!;
        const accessToken = getAccessToken(context)!;

        if (!currentUser.email) {
          console.error(`[Mutation.updateUserProfile] Critical: Authenticated user ${currentUser.id} has no email.`);
          throw new GraphQLError('Authenticated user email is missing.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        
        console.log(`[Mutation.updateUserProfile] User: ${currentUser.id}, Input:`, args.input);

        const updatedProfileData = await userProfileService.updateUserProfile(
          currentUser.id,
          args.input as UpdateUserProfileInput,
          accessToken
        );

        console.log(`[Mutation.updateUserProfile] Successfully updated profile for user ${currentUser.id}`);
        
        return {
          id: currentUser.id,
          email: currentUser.email,
          display_name: updatedProfileData.display_name,
          avatar_url: updatedProfileData.avatar_url,
        };
      } catch (error) {
        console.error(`[Mutation.updateUserProfile] Error ${actionDescription} for user ${context.currentUser?.id}:`, error);
        throw processZodError(error, actionDescription);
      }
    },
}; 