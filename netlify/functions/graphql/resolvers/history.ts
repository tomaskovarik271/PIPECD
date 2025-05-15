import { DealHistoryEntryResolvers, User as GraphQLUser } from '../../../../lib/generated/graphql'; // DealHistoryEntryType removed as parent will be DB row type
import { requireAuthentication, GraphQLContext, getAccessToken } from '../helpers'; // Assuming getAccessToken is in helpers
import { getAuthenticatedClient } from '../../../../lib/serviceUtils'; // For fetching user details
import { GraphQLError } from 'graphql';

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

    const currentUser = context.currentUser; // User object from @supabase/supabase-js

    if (currentUser && currentUser.id === parent.user_id) {
      console.log(`[DealHistoryEntry.user resolver] History user ${parent.user_id} is the current authenticated user.`);
      // Attempt to get name from user_metadata, fallback to email part or generic
      const nameFromMetadata = currentUser.user_metadata?.name || currentUser.user_metadata?.full_name;
      const displayName = nameFromMetadata || currentUser.email?.split('@')[0] || `User ${currentUser.id.substring(0, 8)}`;
      
      return {
        id: currentUser.id,
        email: currentUser.email || null, // Ensure email is explicitly null if undefined
        name: displayName,
        // avatar_url: currentUser.user_metadata?.avatar_url || null, // If you add avatar_url to GraphQL User
      } as GraphQLUser;
    } else {
      // The user who made the history entry is NOT the current user,
      // or the current user is not authenticated (e.g. during schema introspection).
      // This is where querying 'user_profiles' or an RPC to 'auth.users' for parent.user_id would be ideal.
      // For now, return a placeholder. This is NOT a long-term solution for displaying other users.
      console.warn(`[DealHistoryEntry.user resolver] History user ${parent.user_id} is not the current authenticated user OR no current user in context. \
Returning placeholder. Implement proper lookup (e.g., from a user_profiles table or RPC to auth.users).`);
      
      // We must return a valid GraphQLUser if parent.user_id exists.
      // 'id' is mandatory. 'email' and 'name' are nullable in the GraphQL schema.
      return {
        id: parent.user_id,
        email: null, // We can't securely get other users' emails without a proper mechanism
        name: `User ${parent.user_id.substring(0, 8)}...`, // Placeholder name
        // avatar_url: null,
      } as GraphQLUser;
    }
  },
} as DealHistoryEntryResolvers<GraphQLContext, any>; // Specify 'any' for ParentType to bypass complex type constraint 