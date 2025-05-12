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

  user: async (parent: DealHistoryDbRow, _args: any, context: GraphQLContext, _info: any) => {
    if (!parent.user_id) return null;
    // requireAuthentication(context); // History entries are public if the deal is accessible, user might be null if system action or user deleted
    const token = getAccessToken(context);
    // If there's no token (e.g. public query part for some reason, or initial schema introspection)
    // we can't fetch a user securely. If user_id exists, but we can't get a token, it implies an issue or an unauthenticated user trying to resolve this.
    // However, the RLS on deal_history should prevent unauthorized access to the parent DealHistoryEntry itself.
    // So, if we reach here, it implies the user CAN see the history entry.
    // We need a client to fetch user details. If no token, we can't get an *authenticated* client for the *current user*,
    // but we might need a service client or a specific way to fetch public user profiles if users can be null.
    // For now, let's assume if we have a user_id, we try to fetch with current user's token for their RLS on users table.

    if (!token) {
        // If no token, we cannot fetch the user details that might be protected by RLS of the 'users' table for the current querier.
        // console.warn('No access token available to fetch user details for DealHistoryEntry.user resolver');
        // Depending on RLS of 'users' table, this might be okay or might prevent fetching.
        // If 'users' table is public for id, email, name, then a service client could be used.
        // For now, if no token, return null to avoid errors, assuming user data might be restricted.
        return null; 
    }
    const supabase = getAuthenticatedClient(token);

    try {
      console.log(`[DealHistoryEntry.user resolver] Fetching person for user_id: ${parent.user_id} (from deal_history)`);
      // Query the 'people' table, matching its 'user_id' with the one from deal_history (auth.users.id).
      const { data, error } = await supabase
        .from('people') 
        .select('id, user_id, email, first_name, last_name') // Ensure user_id from people is selected for clarity if needed, though not strictly for matching here
        .eq('user_id', parent.user_id) // Corrected: Match people.user_id with parent.user_id (auth.users.id)
        .single();

      console.log(`[DealHistoryEntry.user resolver] Fetched data from people table:`, JSON.stringify(data, null, 2));

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        console.error(`Error fetching user ${parent.user_id} for history entry ${parent.id}:`, error);
        // Optionally, throw new GraphQLError to signal frontend about data inconsistency?
        return null; 
      }
      if (!data) return null;

      // Map to GraphQLUser type (ensure fields match User type in your GraphQL schema)
      return {
        id: data.id,
        email: data.email,
        // Construct name if available, otherwise default to email or part of it
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email?.split('@')[0] || 'User',
        // avatar_url: data.avatar_url, // If you have this field
        // Add other User fields from your GraphQL User type as needed
      } as GraphQLUser; // Cast carefully or ensure types match your GraphQL User type definition
    } catch (e) {
        console.error(`Exception fetching user ${parent.user_id} for history entry ${parent.id}:`, e);
        return null;
    }
  },
} as DealHistoryEntryResolvers<GraphQLContext, any>; 