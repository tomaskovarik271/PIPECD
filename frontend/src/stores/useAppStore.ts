import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';

// --- Interface Definitions ---

// Organization
interface Organization {
    id: string;
    name: string;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
    // people?: Person[]; // Add if needed for nested queries
}

// Person
interface Person {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    organization_id?: string | null;
    organization?: Organization | null; // Nested organization
    created_at: string;
    updated_at: string;
    user_id: string;
    // deals?: Deal[]; // Add if needed for nested queries
}

// Deal (Simplified, keep fields relevant to store/pages)
interface DealPerson { 
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
}
interface Deal {
  id: string;
  name: string;
  stage: string;
  amount?: number | null;
  created_at: string;
  updated_at: string;
  person_id?: string | null; 
  person?: DealPerson | null; 
}

// --- GraphQL Queries/Mutations --- 

// Deals
const GET_DEALS_QUERY = gql`
  query GetDeals {
    deals {
      id
      name
      stage
      amount
      created_at
      updated_at
      person_id 
      person { 
        id
        first_name
        last_name
        email
      }
    }
  }
`;

const DELETE_DEAL_MUTATION = gql`
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id)
  }
`;

// People
const GET_PEOPLE_QUERY = gql`
  query GetPeople {
    people {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id
      organization {
        id
        name
      }
    }
  }
`;

const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id)
  }
`;

// Organizations
const GET_ORGANIZATIONS_QUERY = gql`
  query GetOrganizations {
    organizations {
      id
      name
      address
      notes
      created_at
      updated_at
      # Add people count or list if needed
    }
  }
`;

const DELETE_ORGANIZATION_MUTATION = gql`
  mutation DeleteOrganization($id: ID!) {
    deleteOrganization(id: $id)
  }
`;

// --- Result Types ---
interface GetDealsQueryResult { deals: Deal[]; }
interface DeleteDealMutationResult { deleteDeal: boolean; }
interface GetPeopleQueryResult { people: Person[]; }
interface DeletePersonMutationResult { deletePerson: boolean; }
interface GetOrganizationsQueryResult { organizations: Organization[]; }
interface DeleteOrganizationMutationResult { deleteOrganization: boolean; }

// --- App State Interface ---
interface AppState {
  // Auth
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  setSession: (session: Session | null) => void;
  checkAuth: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  
  // Deals
  deals: Deal[];
  dealsLoading: boolean;
  dealsError: string | null;
  fetchDeals: () => Promise<void>;
  deleteDeal: (id: string) => Promise<boolean>;

  // People
  people: Person[];
  peopleLoading: boolean;
  peopleError: string | null;
  fetchPeople: () => Promise<void>;
  deletePerson: (id: string) => Promise<boolean>;

  // Organizations
  organizations: Organization[];
  organizationsLoading: boolean;
  organizationsError: string | null;
  fetchOrganizations: () => Promise<void>;
  deleteOrganization: (id: string) => Promise<boolean>;
}

// --- Zustand Store Implementation ---
export const useAppStore = create<AppState>((set /*, get */) => ({
  // --- Initial state ---
  session: null,
  user: null,
  isLoadingAuth: true, 
  deals: [],
  dealsLoading: false,
  dealsError: null,
  people: [],
  peopleLoading: false,
  peopleError: null,
  organizations: [],
  organizationsLoading: false,
  organizationsError: null,

  // --- Actions ---
  
  // Auth Actions
  setSession: (session) => {
    set({ session: session, user: session?.user ?? null });
  },

  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        set({ session: null, user: null }); // Clear session on error
      } else {
        set({ session: session, user: session?.user ?? null });
      }
    } catch (err) {
        console.error('Unexpected error during checkAuth:', err);
        set({ session: null, user: null });
    } finally {
        set({ isLoadingAuth: false });
    }
  },

  handleSignOut: async () => {
    // Don't necessarily need isLoadingAuth here unless we add specific UI feedback
    // set({ isLoadingAuth: true }); 
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            // Clear session in store even if signout API failed, 
            // as user intent was to sign out.
            set({ session: null, user: null, isLoadingAuth: false }); 
        } else {
            // SUCCESS: Explicitly clear the session state immediately 
            // in addition to relying on the listener.
            console.log('Sign out successful, explicitly clearing session in store.');
            set({ session: null, user: null, isLoadingAuth: false }); 
        }
    } catch (err) {
        console.error('Unexpected error during signout:', err);
        // Also clear session on unexpected errors
        set({ session: null, user: null, isLoadingAuth: false }); 
    } finally {
        // Redundant isLoadingAuth set removed as it's handled in try/catch
    }
  },

  // Deals Actions
  fetchDeals: async () => {
    set({ dealsLoading: true, dealsError: null });
    try {
        const data = await gqlClient.request<GetDealsQueryResult>(GET_DEALS_QUERY);
        set({ deals: data.deals || [], dealsLoading: false });
    } catch (err: any) {
        console.error("Error fetching deals:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch deals';
        set({ dealsError: errorMsg, dealsLoading: false, deals: [] }); // Clear deals on error
    }
  },

  deleteDeal: async (id: string): Promise<boolean> => {
    // Note: We don't set a specific deleting state here,
    // the component can handle temporary UI feedback if needed.
    // We focus on updating the main deals list/error state.
    try {
      const variables = { id };
      const result = await gqlClient.request<DeleteDealMutationResult>(
          DELETE_DEAL_MUTATION, 
          variables
      );
      if (result.deleteDeal) {
          // Success: Remove the deal from the local state
          set((state) => ({
              deals: state.deals.filter(deal => deal.id !== id),
              dealsError: null // Clear previous errors
          }));
          return true;
      } else {
          // This path might not be reached if the backend throws on failure
          throw new Error('Delete operation returned false from API.');
      }
    } catch (err: any) {
        console.error('Error deleting deal:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete deal';
        // Update the error state, keep existing deals
        set({ dealsError: `Failed to delete deal (${id}): ${errorMsg}` });
        return false;
    }
  },

  // People Actions
  fetchPeople: async () => {
    set({ peopleLoading: true, peopleError: null });
    try {
        const data = await gqlClient.request<GetPeopleQueryResult>(GET_PEOPLE_QUERY);
        set({ people: data.people || [], peopleLoading: false });
    } catch (err: any) {
        console.error("Error fetching people:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch people';
        set({ peopleError: errorMsg, peopleLoading: false, people: [] });
    }
  },
  deletePerson: async (id: string): Promise<boolean> => {
    try {
      const result = await gqlClient.request<DeletePersonMutationResult>(
          DELETE_PERSON_MUTATION, { id }
      );
      if (result.deletePerson) {
          set((state) => ({
              people: state.people.filter(p => p.id !== id),
              peopleError: null 
          }));
          return true;
      } else {
          throw new Error('Delete operation returned false from API.');
      }
    } catch (err: any) {
        console.error('Error deleting person:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete person';
        set({ peopleError: `Failed to delete person (${id}): ${errorMsg}` });
        return false;
    }
  },

  // Organizations Actions
  fetchOrganizations: async () => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
        const data = await gqlClient.request<GetOrganizationsQueryResult>(GET_ORGANIZATIONS_QUERY);
        set({ organizations: data.organizations || [], organizationsLoading: false });
    } catch (err: any) {
        console.error("Error fetching organizations:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch organizations';
        set({ organizationsError: errorMsg, organizationsLoading: false, organizations: [] });
    }
  },
  deleteOrganization: async (id: string): Promise<boolean> => {
    try {
      const result = await gqlClient.request<DeleteOrganizationMutationResult>(
          DELETE_ORGANIZATION_MUTATION, { id }
      );
      if (result.deleteOrganization) {
          set((state) => ({
              organizations: state.organizations.filter(o => o.id !== id),
              organizationsError: null 
          }));
          return true;
      } else {
          throw new Error('Delete operation returned false from API.');
      }
    } catch (err: any) {
        console.error('Error deleting organization:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete organization';
        set({ organizationsError: `Failed to delete organization (${id}): ${errorMsg}` });
        return false;
    }
  },

}));

// Initialize auth check (optional, App.tsx also listens)
// useAppStore.getState().checkAuth(); 