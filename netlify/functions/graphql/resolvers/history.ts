import { DealHistoryEntryResolvers, User as GraphQLUser } from '../../../../lib/generated/graphql'; // DealHistoryEntryType removed as parent will be DB row type
import { requireAuthentication, GraphQLContext, getAccessToken } from '../helpers'; // Assuming getAccessToken is in helpers
import { getAuthenticatedClient } from '../../../../lib/serviceUtils'; // For fetching user details
import { GraphQLError } from 'graphql';
import * as userProfileService from '../../../../lib/userProfileService'; // ADDED import

// Define an interface for the expected shape of the parent object (DB row from deal_history)
interface DealHistoryDbRow {
  id: string;
  deal_id: string;
  user_id?: string | null; // user_id can be null
  event_type: string;
  changes: any; // JSONB, so 'any' is appropriate here
  created_at: string; // TIMESTAMPTZ will be a string
}

export const DealHistoryEntry = {
  // Explicitly resolve 'id' from the parent DB row's 'id' field
  id: (parent: DealHistoryDbRow) => parent.id,

  // Explicitly resolve 'eventType' from the parent DB row's 'event_type' field
  eventType: (parent: DealHistoryDbRow) => parent.event_type,

  // Explicitly resolve 'changes' from the parent DB row's 'changes' field
  changes: (parent: DealHistoryDbRow) => parent.changes,

  // Explicitly resolve 'createdAt' from the parent DB row's 'created_at' field
  createdAt: (parent: DealHistoryDbRow) => new Date(parent.created_at),

  user: async (parent: DealHistoryDbRow, _args: any, context: GraphQLContext, _info: any): Promise<GraphQLUser | null> => {
    if (!parent.user_id) {
      console.log('[DealHistoryEntry.user resolver] No user_id in parent history entry, returning null.');
        return null; 
    }

    const currentUser = context.currentUser;
    const accessToken = getAccessToken(context); // Get accessToken

    if (currentUser && currentUser.id === parent.user_id) {
      console.log(`[DealHistoryEntry.user resolver] History user ${parent.user_id} is the current authenticated user. Fetching profile...`);
      
      if (!currentUser.email) { // Should not happen if requireAuthentication passed and email is primary id
        console.error(`[DealHistoryEntry.user resolver] Critical: Authenticated user ${currentUser.id} has no email for history entry.`);
        return null; // Or a more specific error/fallback if strictly needed
      }
      if (!accessToken) { // Should not happen if requireAuthentication passed
        console.error(`[DealHistoryEntry.user resolver] Critical: No access token for authenticated user ${currentUser.id}.`);
        return null;
      }

      try {
        const profile = await userProfileService.getUserProfile(currentUser.id, accessToken);
        
        // Fallback logic for display name if not in profile, similar to before but prioritizing profile
        const nameFromMetadata = currentUser.user_metadata?.name || currentUser.user_metadata?.full_name;
        const calculatedDisplayName = profile?.display_name || nameFromMetadata || currentUser.email?.split('@')[0] || `User ${currentUser.id.substring(0, 8)}`;

        return {
          id: currentUser.id,
          email: currentUser.email, // email is String! and guaranteed by above check
          display_name: calculatedDisplayName,
          avatar_url: profile?.avatar_url || currentUser.user_metadata?.avatar_url || null,
        } as GraphQLUser;
      } catch (error) {
        console.error(`[DealHistoryEntry.user resolver] Error fetching profile for user ${currentUser.id}:`, error);
        // Fallback to basic info from currentUser if profile fetch fails
        const fallbackDisplayName = currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || `User ${currentUser.id.substring(0, 8)}`;
        return {
          id: currentUser.id,
          email: currentUser.email,
          display_name: fallbackDisplayName,
          avatar_url: currentUser.user_metadata?.avatar_url || null,
        } as GraphQLUser;
      }
    } else {
      // The user who made the history entry is NOT the current user.
      // Try to fetch their profile using the current authenticated user's accessToken.
      console.log(`[DealHistoryEntry.user resolver] History user ${parent.user_id} is not current user. Fetching their profile...`);
      if (!accessToken) { // Current viewing user must have an access token
        console.warn(`[DealHistoryEntry.user resolver] No access token for current viewing user to fetch other user's profile. Returning null.`);
        return null;
      }

      try {
        const profile = await userProfileService.getUserProfile(parent.user_id, accessToken);
        if (profile && profile.display_name) { // Ensure profile and display_name exist
          return {
            id: parent.user_id, // The ID of the user who made the change
            email: `${parent.user_id.substring(0,8)}@system.local`, // Placeholder email, as we don't fetch/store other users' emails here
            display_name: profile.display_name,
            avatar_url: profile.avatar_url || null,
          } as GraphQLUser;
        } else {
          console.warn(`[DealHistoryEntry.user resolver] Profile not found or no display_name for user ${parent.user_id}. Returning null.`);
          return null; // Fallback to System Action if profile or display_name is missing
        }
      } catch (error) {
        console.error(`[DealHistoryEntry.user resolver] Error fetching profile for other user ${parent.user_id}:`, error);
        return null; // Fallback to System Action on error
      }
    }
  },
} as DealHistoryEntryResolvers<GraphQLContext, any>; // Specify 'any' for ParentType to bypass complex type constraint 