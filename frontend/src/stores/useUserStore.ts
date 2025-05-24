// frontend/src/stores/useUserStore.ts
import { create } from 'zustand';
import { gql } from '@apollo/client';
import { apolloClient } from '../lib/graphqlClient'; // Assuming this is your Apollo client instance

/**
 * Defines the structure for a user that can be assigned to a deal.
 * 'name' from personList is mapped to 'display_name'.
 */
export type AssignableUser = {
  id: string;
  display_name: string | null; // Mapped from PersonListItem.name
};

/**
 * Defines the state and actions for the user store, specifically for users assignable to deals.
 */
type UserStoreState = {
  assignableUsers: AssignableUser[]; // Holds the list of users that can be assigned
  fetchAssignableUsers: () => Promise<void>; // Action to fetch these users
  isLoading: boolean; // Flag to indicate loading state
  error: Error | null; // Holds any error that occurred during fetching
};

// GraphQL query to fetch the list of people (as assignable users)
// Uses the existing 'personList' query which returns id and name.
const GET_USERS_FOR_ASSIGNMENT = gql`
  query GetUsersForAssignment {
    personList {
      id
      name # This name will be used as display_name for AssignableUser
    }
  }
`;

/**
 * Zustand store for managing users that can be assigned to deals.
 */
export const useUserStore = create<UserStoreState>((set) => ({
  assignableUsers: [], // Initial empty list of assignable users
  isLoading: false, // Initially not loading
  error: null, // Initially no error
  
  /**
   * Fetches the list of assignable users (currently People) from the backend
   * and updates the store state.
   */
  fetchAssignableUsers: async () => {
    set({ isLoading: true, error: null }); // Set loading state and clear previous errors
    try {
      // Execute the GraphQL query using the Apollo client
      const { data } = await apolloClient.query({ 
        query: GET_USERS_FOR_ASSIGNMENT,
        // Consider fetchPolicy: 'network-only' if fresh data is always needed
      });

      // Map the fetched 'personList' data to the 'AssignableUser' type
      // The 'name' field from personList is used as 'display_name'.
      const users: AssignableUser[] = data.personList 
        ? data.personList.map((person: { id: string; name: string | null }) => ({
            id: person.id,
            display_name: person.name,
          }))
        : [];
      
      set({ assignableUsers: users, isLoading: false }); // Update state with fetched users and reset loading
    } catch (error) {
      console.error('Error fetching assignable users:', error);
      // Store the error and reset loading state and users list
      set({ isLoading: false, error: error instanceof Error ? error : new Error('An unknown error occurred'), assignableUsers: [] });
    }
  },
}));

// Example usage (optional, for illustration):
// const { assignableUsers, fetchAssignableUsers, isLoading, error } = useUserStore();
// useEffect(() => {
//   fetchAssignableUsers();
// }, [fetchAssignableUsers]);
// if (isLoading) return <p>Loading users...</p>;
// if (error) return <p>Error loading users: {error.message}</p>;
// return <ul>{assignableUsers.map(user => <li key={user.id}>{user.display_name}</li>)}</ul>;
