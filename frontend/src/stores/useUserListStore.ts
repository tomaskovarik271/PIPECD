import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type { User as GraphQLUser, Maybe } from '../generated/graphql/graphql'; // Use User from generated types

// Simplified User type for the list, matching what we fetch
export interface UserListItem {
  id: string;
  display_name?: Maybe<string>;
  email: string;
  avatar_url?: Maybe<string>;
}

const GET_USER_LIST_QUERY = gql`
  query GetUserList {
    users {
      id
      display_name
      email
      avatar_url
    }
  }
`;

interface UserListState {
  users: UserListItem[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchUsers: () => Promise<void>;
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
      // Use GraphQLUser[] for the response type as 'users' query returns array of User
      type GetUserListResponse = { users: GraphQLUser[] }; 
      const response = await gqlClient.request<GetUserListResponse>(GET_USER_LIST_QUERY);
      
      // Map to UserListItem, ensuring display_name is handled correctly (it's Maybe<string>)
      const userListItems: UserListItem[] = response.users.map(user => ({
        id: user.id,
        display_name: user.display_name, // This is already Maybe<String>
        email: user.email,
        avatar_url: user.avatar_url,
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
})); 