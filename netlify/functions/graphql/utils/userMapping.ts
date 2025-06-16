import type { User } from '../../../../lib/generated/graphql';
import type { ServiceLevelUserProfile } from '../../../../lib/userProfileService';

/**
 * Maps a ServiceLevelUserProfile to GraphQL User type
 * Used across multiple resolvers for consistent user field resolution
 */
export const mapServiceUserToGraphqlUser = (serviceUser: ServiceLevelUserProfile): User => {
  return {
    __typename: 'User',
    id: serviceUser.user_id,
    email: serviceUser.email,
    display_name: serviceUser.display_name,
    avatar_url: serviceUser.avatar_url,
    roles: [], // Roles will be resolved by the User.roles field resolver
  };
}; 