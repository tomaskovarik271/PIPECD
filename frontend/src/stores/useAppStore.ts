import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Stage,
  Maybe,
  Pipeline,
  Deal as GraphQLDeal,
  DealHistoryEntry as GraphQLDealHistoryEntry,
  User as GraphQLUser
} from '../generated/graphql/graphql';

// Re-export core entity and input types for external use
export type {
  Pipeline,
  Maybe
};

// --- GraphQL Queries/Mutations ---

const GET_MY_PERMISSIONS_QUERY = gql`query GetMyPermissions { myPermissions }`;

const GET_DEAL_WITH_HISTORY_QUERY = gql`
  query GetDealWithHistory($dealId: ID!) {
    deal(id: $dealId) {
      id
      name
      amount
      expected_close_date
      created_at
      updated_at
      deal_specific_probability
      stage {
        id
        name
        pipeline_id
      }
      person {
          id
          first_name
          last_name
          email
      }
      organization {
          id
          name
      }
      history(limit: 50) {
        id
        eventType
        changes
        createdAt
        user {
          id
          email
          display_name
        }
      }
    }
  }
`;

// Define a more specific type for the deal we expect from GetDealWithHistory
// This helps with typing in the component that uses this data.
// We can use Pick or extend GraphQLDeal if needed, but for now, let's assume this structure matches the query.
export interface DealWithHistory extends GraphQLDeal {
    history: (Pick<GraphQLDealHistoryEntry, 'id' | 'eventType' | 'changes' | 'createdAt'> & {
        user: Pick<GraphQLUser, 'id' | 'email' | 'display_name'> | null;
    })[];
    // Ensure other fields from the query like person, organization are also strongly typed if not already by GraphQLDeal
    person: GraphQLDeal['person'];
    organization: GraphQLDeal['organization'];
}

export interface AppState {
  // Auth
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  userPermissions: string[] | null;
  permissionsLoading: boolean;
  setSession: (session: Session | null) => void;
  checkAuth: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  fetchUserPermissions: () => Promise<void>; 

  // Current Deal Detail
  currentDeal: DealWithHistory | null;
  currentDealLoading: boolean;
  currentDealError: string | null;
  fetchDealById: (dealId: string) => Promise<void>; 
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Auth State
  session: null,
  user: null,
  isLoadingAuth: true, // Start with true, checkAuth will set it
  userPermissions: null,
  permissionsLoading: false,

  // Initial Deal Detail State
  currentDeal: null,
  currentDealLoading: false,
  currentDealError: null,

  // Auth Action Implementations
  setSession: (session) => set({ session, user: session?.user ?? null, isLoadingAuth: false }),
  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ session, user: session?.user ?? null, isLoadingAuth: false });
      if (session) {
        // gqlClient.setHeader('Authorization', `Bearer ${session.access_token}`);
        // Set up a listener for auth changes AFTER initial check
        supabase.auth.onAuthStateChange((_event, currentSession) => {
          set({ session: currentSession, user: currentSession?.user ?? null });
          // if (currentSession?.access_token) {
          //   gqlClient.setHeader('Authorization', `Bearer ${currentSession.access_token}`);
          // } else {
          //    gqlClient.setHeader('Authorization', '');
          // }
          if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
            get().fetchUserPermissions();
          }
          if (_event === 'SIGNED_OUT') {
            set({ userPermissions: null });
            // gqlClient.setHeader('Authorization', '');
          }
        });
        await get().fetchUserPermissions(); // Fetch initial permissions
      } else {
        // No session, clear auth header and permissions
        set({ userPermissions: null });
        // gqlClient.setHeader('Authorization', '');
      }
    } catch (error: any) {
      console.error('Auth check error:', error.message);
      set({ session: null, user: null, isLoadingAuth: false, userPermissions: null });
      // gqlClient.setHeader('Authorization', '');
    }
  },
  handleSignOut: async () => {
    set({ isLoadingAuth: true });
    try {
      await supabase.auth.signOut();
      set({ session: null, user: null, userPermissions: null, isLoadingAuth: false });
      // gqlClient.setHeader('Authorization', '');
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      set({ isLoadingAuth: false });
    }
  },
  fetchUserPermissions: async () => {
    const session = get().session;
    if (!session || !session.access_token) {
      set({ userPermissions: [], permissionsLoading: false });
      return;
    }
    set({ permissionsLoading: true });
    try {
      // Ensure gqlClient has the latest token before this call specifically
      // gqlClient.setHeader('Authorization', `Bearer ${session.access_token}`);
      const data = await gqlClient.request<{ myPermissions: string[] }>(GET_MY_PERMISSIONS_QUERY);
      set({ userPermissions: data.myPermissions || [], permissionsLoading: false });
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      set({ userPermissions: [], permissionsLoading: false });
      if (isGraphQLErrorWithMessage(error) && error.response && error.response.errors && error.response.errors.length > 0) {
        const authError = error.response.errors.find(
          (e: any) => e.extensions?.code === 'UNAUTHENTICATED' || e.extensions?.code === 'FORBIDDEN'
        );
        if (authError) {
          console.warn("Permissions fetch failed due to auth error, potentially stale session.");
          // Consider auto sign-out or token refresh attempt here if this becomes a recurring issue.
      }
    }
    }
  },

  // Deal Detail Actions
  fetchDealById: async (dealId: string) => {
    set({ currentDealLoading: true, currentDealError: null, currentDeal: null });
    if (!get().session?.access_token) {
      set({ currentDealLoading: false, currentDealError: 'User not authenticated to fetch deal.' });
      return;
    }
    try {
      const data = await gqlClient.request<
        { deal: DealWithHistory }, 
        { dealId: string } 
      >(
        GET_DEAL_WITH_HISTORY_QUERY, 
        { dealId } 
      );
      set({ currentDeal: data.deal, currentDealLoading: false });
    } catch (error: any) {
      console.error(`Error fetching deal ${dealId}:`, error);
      let errorMessage = 'Failed to fetch deal details.';
      if (isGraphQLErrorWithMessage(error)) {
        // Check for specific GraphQL errors (e.g., NOT_FOUND)
        const notFoundError = error.response?.errors?.find((e: any) => e.extensions?.code === 'NOT_FOUND');
        if (notFoundError) {
          errorMessage = 'Deal not found.';
        } else {
            errorMessage = error.response?.errors?.map((e:any) => e.message).join('\n') || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ currentDealLoading: false, currentDealError: errorMessage, currentDeal: null });
    }
  },
}));

// Initialize auth check when store is loaded (client-side only)
if (typeof window !== 'undefined') {
  useAppStore.getState().checkAuth();
} 

export default useAppStore;