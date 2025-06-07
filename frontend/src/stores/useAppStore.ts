import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  // Stage, // No longer needed if only Pipeline is exported by name
  Maybe,
  // Pipeline, // REMOVED
  Deal as GraphQLDeal,
  DealHistoryEntry as GraphQLDealHistoryEntry,
  User as GraphQLUser
  // Activity as GraphQLActivity, // Removed, handled by useActivitiesStore
  // Person as GraphQLPerson, // Removed
  // Organization as GraphQLOrganization // Removed
} from '../generated/graphql/graphql';

// Re-export core entity and input types for external use
export type {
  // Pipeline, // REMOVED
  Maybe,
  // GraphQLActivity as Activity, // Removed, re-exported from useActivitiesStore if needed elsewhere
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
      weighted_amount
      assigned_to_user_id
      project_id
      assignedToUser {
        id
        display_name
        email
      }
      currentWfmStatus {
        id
        name
        color
      }
      currentWfmStep {
        id
        stepOrder
        isInitialStep
        isFinalStep
        metadata
        status {
          id
          name
          color
        }
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
      customFieldValues {
        definition {
          id
          fieldName
          fieldLabel
          fieldType
          dropdownOptions {
            value
            label
          }
        }
        stringValue
        numberValue
        booleanValue
        dateValue
        selectedOptionValues
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

export interface DealWithHistory extends GraphQLDeal {
    history: (Pick<GraphQLDealHistoryEntry, 'id' | 'eventType' | 'changes' | 'createdAt'> & {
        user: Pick<GraphQLUser, 'id' | 'email' | 'display_name'> | null;
    })[];
    person: GraphQLDeal['person'];
    organization: GraphQLDeal['organization'];
}

// Removed GET_ACTIVITY_BY_ID_QUERY
// Removed ActivityWithDetails interface

export interface AppState {
  // Auth
  session: Session | null;
  user: SupabaseUser | null; 
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

  // UI State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Removed Current Activity Detail state
  // currentActivity: ActivityWithDetails | null;
  // currentActivityLoading: boolean;
  // currentActivityError: string | null;
  // fetchActivityById: (activityId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Auth State
  session: null,
  user: null,
  isLoadingAuth: true, 
  userPermissions: null,
  permissionsLoading: false,

  // Initial Deal Detail State
  currentDeal: null,
  currentDealLoading: false,
  currentDealError: null,

  // Initial UI State
  isSidebarCollapsed: false,

  // Removed Initial Activity Detail State
  // currentActivity: null,
  // currentActivityLoading: false,
  // currentActivityError: null,

  // Auth Action Implementations
  setSession: (session) => set({ session, user: session?.user ?? null, isLoadingAuth: false }),
  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ session, user: session?.user ?? null, isLoadingAuth: false });
      if (session) {
        supabase.auth.onAuthStateChange((_event, currentSession) => {
          set({ session: currentSession, user: currentSession?.user ?? null });
          if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
            get().fetchUserPermissions();
          }
          if (_event === 'SIGNED_OUT') {
            set({ userPermissions: null });
          }
        });
        await get().fetchUserPermissions();
      } else {
        set({ userPermissions: null });
      }
    } catch (error: any) {
      console.error('Auth check error:', error.message);
      set({ session: null, user: null, isLoadingAuth: false, userPermissions: null });
    }
  },
  handleSignOut: async () => {
    set({ isLoadingAuth: true });
    try {
      await supabase.auth.signOut();
      set({ session: null, user: null, userPermissions: null, isLoadingAuth: false });
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
      const data = await gqlClient.request<{ myPermissions: string[] }>(GET_MY_PERMISSIONS_QUERY);
      set({ userPermissions: data.myPermissions || [], permissionsLoading: false });
    } catch (error: any) {
      console.error('Error fetching permissions:', isGraphQLErrorWithMessage(error) && error.response ? error.response.errors : error.message);
      set({ userPermissions: [], permissionsLoading: false });
    }
  },

  // Deal Detail Actions
  fetchDealById: async (dealId: string) => {
    console.log('[useAppStore.fetchDealById] Received dealId:', dealId);
    set({ currentDealLoading: true, currentDealError: null });
    if (!get().session?.access_token) {
      set({ currentDealLoading: false, currentDealError: 'User not authenticated to fetch deal.' });
      return;
    }
    try {
      const variables = { dealId };
      console.log('[useAppStore.fetchDealById] Variables for gqlClient.request:', variables);
      const data = await gqlClient.request<
        { deal: DealWithHistory }, 
        { dealId: string } 
      >(
        GET_DEAL_WITH_HISTORY_QUERY, 
        variables 
      );
      set({ currentDeal: data.deal, currentDealLoading: false });
    } catch (error: any) {
      console.error(`Error fetching deal ${dealId}:`, error);
      let errorMessage = 'Failed to fetch deal details.';
      if (isGraphQLErrorWithMessage(error)) {
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

  // UI Actions
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));

// Initialize auth check when store is loaded (client-side only)
if (typeof window !== 'undefined') {
  useAppStore.getState().checkAuth();
} 

export default useAppStore;