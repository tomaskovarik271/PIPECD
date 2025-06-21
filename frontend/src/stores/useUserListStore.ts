import { create } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import { GET_ASSIGNABLE_USERS_QUERY } from '../lib/graphql/userOperations';
import type { User as GraphQLUser, Maybe } from '../generated/graphql/graphql'; // Use User from generated types

// Simplified User type for the list, matching what we fetch
export interface UserListItem {
  id: string;
  display_name?: Maybe<string>;
  email: string;
  avatar_url?: Maybe<string>;
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

// Query moved to userOperations.ts

interface UserListState {
  users: UserListItem[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  clearUsers: () => void;
}

export const useUserListStore = create<UserListState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  hasFetched: false,

  fetchUsers: async () => {
    if (get().loading || get().hasFetched) { // Avoid multiple fetches if already loading or fetched
      return;
    }
    set({ loading: true, error: null });
    try {
      // Use GraphQLUser[] for the response type as 'assignableUsers' query returns array of User
      type GetAssignableUsersResponse = { assignableUsers: GraphQLUser[] }; 
      const response = await gqlClient.request<GetAssignableUsersResponse>(GET_ASSIGNABLE_USERS_QUERY);
      
      // Map to UserListItem, ensuring display_name is handled correctly (it's Maybe<string>)
      // Filter out System Automation user from assignment lists (used for system automations only)
      const userListItems: UserListItem[] = response.assignableUsers
        .filter((user: GraphQLUser) => user.email !== 'system@automation.cz')
        .map((user: GraphQLUser) => ({
          id: user.id,
          display_name: user.display_name, // This is already Maybe<String>
          email: user.email,
          avatar_url: user.avatar_url,
          roles: user.roles || [],
        }));

      set({ users: userListItems, loading: false, error: null, hasFetched: true });
    } catch (error: unknown) {
      console.error("Error fetching user list:", error);
      let message = 'Failed to fetch user list';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ loading: false, error: message, users: [], hasFetched: false });
    }
  },

  refreshUsers: async () => {
    // Force refresh by resetting hasFetched flag
    set({ hasFetched: false });
    return get().fetchUsers();
  },

  clearUsers: () => {
    set({ users: [], loading: false, error: null, hasFetched: false });
  },
})); 