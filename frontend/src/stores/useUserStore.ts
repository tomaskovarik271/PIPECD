// frontend/src/stores/useUserStore.ts
import { create } from 'zustand';
import { gql } from '@apollo/client';
import { apolloClient } from '../lib/graphqlClient'; // Assuming this is your Apollo client instance

/**
 * Defines the structure for a user that can be assigned to a deal.
 * Now maps directly from the User type returned by the `systemUsers` query.
 */
export type AssignableUser = {
  id: string;
  display_name: string | null;
  // email?: string | null; // Optional: email can be added if needed by UI components
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

// Updated GraphQL query to fetch system users.
// Fetches id, display_name, and email for each user.
const GET_USERS_FOR_ASSIGNMENT = gql`
  query GetUsersForAssignment {
    systemUsers {
      id
      display_name
      email # email is fetched, can be added to AssignableUser type if needed later
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
   * Fetches the list of assignable users (now from `systemUsers` query) from the backend
   * and updates the store state.
   */
  fetchAssignableUsers: async () => {
    set({ isLoading: true, error: null }); // Set loading state and clear previous errors
    try {
      // Execute the updated GraphQL query using the Apollo client
      const { data } = await apolloClient.query({ 
        query: GET_USERS_FOR_ASSIGNMENT,
        // Consider fetchPolicy: 'network-only' if fresh data is always needed
      });

      // Map the fetched 'systemUsers' data to the 'AssignableUser' type.
      // Directly uses 'id' and 'display_name' from the User type.
      const users: AssignableUser[] = data.systemUsers 
        ? data.systemUsers.map((user: { id: string; display_name: string | null; email: string | null }) => ({
            id: user.id,
            display_name: user.display_name,
            // email: user.email, // Uncomment if email is added to AssignableUser type
          }))
        : [];
      
      set({ assignableUsers: users, isLoading: false }); // Update state with fetched users and reset loading
    } catch (error) {
      console.error('Error fetching assignable users from systemUsers:', error);
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
