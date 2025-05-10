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
} from '../generated/graphql/graphql';

// Re-export core entity and input types for external use
export type {
  Pipeline,
  Maybe
};

// --- GraphQL Queries/Mutations ---

const GET_MY_PERMISSIONS_QUERY = gql`query GetMyPermissions { myPermissions }`;

interface AppState {
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
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Auth State
  session: null,
  user: null,
  isLoadingAuth: true, // Start with true, checkAuth will set it
  userPermissions: null,
  permissionsLoading: false,

  // Auth Action Implementations
  setSession: (session) => set({ session, user: session?.user ?? null, isLoadingAuth: false }),
  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({ session, user: session?.user ?? null, isLoadingAuth: false });
      if (session) {
        gqlClient.setHeader('Authorization', `Bearer ${session.access_token}`);
        // Set up a listener for auth changes AFTER initial check
        supabase.auth.onAuthStateChange((_event, currentSession) => {
          set({ session: currentSession, user: currentSession?.user ?? null });
          if (currentSession?.access_token) {
            gqlClient.setHeader('Authorization', `Bearer ${currentSession.access_token}`);
          } else {
             gqlClient.setHeader('Authorization', '');
          }
          if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED') {
            get().fetchUserPermissions();
          }
          if (_event === 'SIGNED_OUT') {
            set({ userPermissions: null });
            gqlClient.setHeader('Authorization', '');
          }
        });
        await get().fetchUserPermissions(); // Fetch initial permissions
      } else {
        // No session, clear auth header and permissions
        set({ userPermissions: null });
        gqlClient.setHeader('Authorization', '');
      }
    } catch (error: any) {
      console.error('Auth check error:', error.message);
      set({ session: null, user: null, isLoadingAuth: false, userPermissions: null });
      gqlClient.setHeader('Authorization', '');
    }
  },
  handleSignOut: async () => {
    set({ isLoadingAuth: true });
    try {
      await supabase.auth.signOut();
      set({ session: null, user: null, userPermissions: null, isLoadingAuth: false });
      gqlClient.setHeader('Authorization', '');
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
      gqlClient.setHeader('Authorization', `Bearer ${session.access_token}`);
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
}));

// Initialize auth check when store is loaded (client-side only)
if (typeof window !== 'undefined') {
  useAppStore.getState().checkAuth();
} 

export default useAppStore;