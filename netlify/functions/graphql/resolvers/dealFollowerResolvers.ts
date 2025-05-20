import {
  Resolvers,
  Deal as GraphQLDeal,
  User as GraphQLUser,
  MutationAddDealFollowerArgs,
  MutationRemoveDealFollowerArgs
} from '../../../../lib/generated/graphql';
import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../index'; // Import from the now correctly defined central location

// Helper to get current user ID, throwing error if not authenticated
const getCurrentUserId = (context: GraphQLContext): string => {
  if (!context.currentUser?.id) {
    throw new GraphQLError('User is not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.currentUser.id;
};

export const dealFollowerResolvers: Resolvers<GraphQLContext> = {
  Mutation: {
    addDealFollower: async (_parent: unknown, args: MutationAddDealFollowerArgs, context: GraphQLContext): Promise<GraphQLDeal | null> => {
      const currentUserId = getCurrentUserId(context); // Verifies authentication
      const { dealId, userId: userToFollowId } = args; // userId is the user to be added as follower
      const { supabase } = context;

      // RLS on deal_followers should handle: 
      // 1. If the dealId exists and is visible to currentUserId.
      // 2. If userToFollowId exists.
      // 3. If currentUserId has permission to add userToFollowId (e.g., can add self, or if admin can add others).

      // Check if already a follower to be idempotent
      const { data: existingFollower, error: selectError } = await supabase
        .from('deal_followers')
        .select('deal_id') // Only need to check existence
        .eq('deal_id', dealId)
        .eq('user_id', userToFollowId)
        .maybeSingle();

      if (selectError) {
        console.error(`addDealFollower: Error checking existing follower for deal ${dealId}, user ${userToFollowId}: ${selectError.message}`);
        throw new GraphQLError('Could not add follower due to a server error.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      if (existingFollower) {
        console.log(`addDealFollower: User ${userToFollowId} is already a follower of deal ${dealId}.`);
        // Fetch and return the deal as is.
      } else {
        const { error: insertError } = await supabase
          .from('deal_followers')
          .insert({ deal_id: dealId, user_id: userToFollowId, followed_by_user_id: currentUserId }); // Record who initiated the follow

        if (insertError) {
          console.error(`addDealFollower: Error adding follower ${userToFollowId} to deal ${dealId}: ${insertError.message}`);
          if (insertError.code === '23503') { // foreign key violation
             throw new GraphQLError('Deal or User not found.', { extensions: { code: 'NOT_FOUND' } });
          }
          throw new GraphQLError('Could not add follower.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        console.log(`addDealFollower: User ${userToFollowId} successfully added as a follower to deal ${dealId} by user ${currentUserId}.`);
      }

      // Fetch and return the deal. The Deal.followers field resolver will populate the followers list.
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*') // RLS on deals table ensures visibility for currentUserId
        .eq('id', dealId)
        .single();

      if (dealError) {
        console.error(`addDealFollower: Error fetching deal ${dealId} after adding follower: ${dealError.message}`);
        if (dealError.code === 'PGRST116') throw new GraphQLError('Deal not found.', { extensions: { code: 'NOT_FOUND' }});
        throw new GraphQLError('Follower added, but failed to fetch updated deal.');
      }
      // The direct fields of dealData are mapped; relational fields like 'followers' are handled by field resolvers.
      return dealData as GraphQLDeal; 
    },
    removeDealFollower: async (_parent: unknown, args: MutationRemoveDealFollowerArgs, context: GraphQLContext): Promise<GraphQLDeal | null> => {
      const currentUserId = getCurrentUserId(context);
      const { dealId, userId: userToUnfollowId } = args;
      const { supabase } = context;

      // RLS on deal_followers should handle permissions for removal.
      // (e.g., user can remove self, or deal owner/admin can remove others).

      const { error: deleteError, count } = await supabase
        .from('deal_followers')
        .delete({ count: 'exact' })
        .eq('deal_id', dealId)
        .eq('user_id', userToUnfollowId);

      if (deleteError) {
        console.error(`removeDealFollower: Error removing follower ${userToUnfollowId} from deal ${dealId}: ${deleteError.message}`);
        throw new GraphQLError('Could not remove follower.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }

      if (count === 0) {
        console.warn(`removeDealFollower: Follower ${userToUnfollowId} not found on deal ${dealId}, or RLS prevented deletion.`);
        // This is not necessarily an error; the state is achieved. Proceed to fetch the deal.
      } else {
        console.log(`removeDealFollower: User ${userToUnfollowId} successfully removed as a follower from deal ${dealId} by user ${currentUserId}.`);
      }

      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (dealError) {
        console.error(`removeDealFollower: Error fetching deal ${dealId} after removing follower: ${dealError.message}`);
        if (dealError.code === 'PGRST116') throw new GraphQLError('Deal not found.', { extensions: { code: 'NOT_FOUND' }});
        throw new GraphQLError('Follower removed, but failed to fetch updated deal.');
      }
      return dealData as GraphQLDeal;
    },
  },
  Deal: {
    followers: async (parentDeal: Pick<GraphQLDeal, 'id'>, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLUser[]> => {
      // getCurrentUserId(context); // Not strictly needed for a read operation if RLS handles visibility of followers
      const { supabase } = context;
      const dealId = parentDeal.id;

      if (!dealId) {
        console.warn('Deal.followers: parentDeal.id is missing.');
        return [];
      }

      // RLS on deal_followers (and potentially user_profiles) will determine what is visible.
      const { data: followerLinks, error: followerError } = await supabase
        .from('deal_followers')
        .select('user_id') // Select the user_id of the follower
        .eq('deal_id', dealId);

      if (followerError) {
        console.error(`Deal.followers: Error fetching follower links for deal ${dealId}: ${followerError.message}`);
        // Depending on strictness, might return [] or throw.
        throw new GraphQLError('Could not fetch follower links.');
      }

      if (!followerLinks || followerLinks.length === 0) {
        return [];
      }

      const userIds = followerLinks.map(fl => fl.user_id).filter(id => id != null) as string[];
      if (userIds.length === 0) {
        return [];
      }

      // Fetch profile details for these user IDs
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles') 
        .select('user_id, display_name, avatar_url, email') 
        .in('user_id', userIds);

      if (usersError) {
        console.error(`Deal.followers: Error fetching user profiles for followers of deal ${dealId}: ${usersError.message}`);
        throw new GraphQLError('Could not fetch follower user details.');
      }
      if (!usersData) return [];

      return usersData.map(u => ({
        id: u.user_id, 
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        email: u.email || `\${u.user_id.substring(0,8)}@placeholder.email`, // Corrected template literal escaping for tool
        // teams field should be resolved by User.teams resolver
      })) as GraphQLUser[];
    },
  },
}; 