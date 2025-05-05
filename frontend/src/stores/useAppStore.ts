import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';

// --- Interface Definitions ---

// Organization
export interface Organization {
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
export interface Person {
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
export interface DealPerson { 
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
}
// Add nested Stage type for Deal
export interface DealStage { 
    id: string;
    name: string;
    pipeline_id: string;
    pipeline: { // Add nested pipeline info
        id: string;
        name: string;
    };
    // Add order or other fields if needed by UI
}
export interface Deal {
  id: string;
  name: string;
  user_id: string;
  // stage: string; // REMOVED old string stage
  stage: DealStage; // ADDED nested stage object
  stage_id?: string | null; // Keep stage_id if useful
  amount?: number | null;
  created_at: string;
  updated_at: string;
  person_id?: string | null; 
  person?: DealPerson | null; 
}

// Pipeline & Stage Types
export interface Pipeline {
    id: string;
    name: string;
}
export interface Stage {
    id: string;
    name: string;
    order: number;
    pipeline_id: string;
    deal_probability?: number | null;
}

// Activity Type
// Define based on GraphQL schema, including potential nested objects if needed by UI
// For now, keep it relatively flat, matching lib/types.ts initially.
export interface Activity {
  id: string; 
  user_id: string; 
  created_at: string; 
  updated_at: string; 
  type: string; // Consider ActivityType enum if needed client-side
  subject: string;
  due_date: string | null; 
  is_done: boolean;
  notes: string | null;
  deal_id: string | null; 
  person_id: string | null; 
  organization_id: string | null; 
  // Add nested Deal/Person/Org if fetched and needed by UI components
  deal?: { id: string; name: string } | null;
  person?: { id: string; first_name?: string | null, last_name?: string | null } | null;
  organization?: { id: string; name: string } | null;
}

// --- GraphQL Queries/Mutations --- 

// My Permissions
const GET_MY_PERMISSIONS_QUERY = gql`
  query GetMyPermissions {
    myPermissions
  }
`;

// Deals
const GET_DEALS_QUERY = gql`
  query GetDeals {
    deals {
      id
      name
      stage {
        id
        name
        pipeline_id
        pipeline {
          id
          name
        }
      }
      stage_id
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
      user_id
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

// Pipelines
const GET_PIPELINES_QUERY = gql`
  query GetPipelines {
    pipelines {
      id
      name
      # Add created_at, updated_at if needed later
    }
  }
`;

// Stages (per pipeline)
const GET_STAGES_QUERY = gql`
  query GetStages($pipelineId: ID!) {
    stages(pipelineId: $pipelineId) {
      id
      name
      order
      deal_probability
      pipeline_id
      # Add created_at, updated_at if needed later
    }
  }
`;

// Add Create Pipeline Mutation
const CREATE_PIPELINE_MUTATION = gql`
  mutation CreatePipeline($input: PipelineInput!) {
    createPipeline(input: $input) {
      id
      name
      # Add other fields if needed upon creation
    }
  }
`;

// Add Create Deal Mutation
const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id
      name
      stage {
        id
        name
      }
      stage_id
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

// Add Create Stage Mutation
const CREATE_STAGE_MUTATION = gql`
  mutation CreateStage($input: CreateStageInput!) {
    createStage(input: $input) {
      id
      name
      order
      deal_probability
      pipeline_id
    }
  }
`;

// Add Update Stage Mutation
const UPDATE_STAGE_MUTATION = gql`
  mutation UpdateStage($id: ID!, $input: UpdateStageInput!) {
    updateStage(id: $id, input: $input) {
      id
      name
      order
      deal_probability
      pipeline_id
    }
  }
`;

// Add Delete Stage Mutation
const DELETE_STAGE_MUTATION = gql`
  mutation DeleteStage($id: ID!) {
    deleteStage(id: $id)
  }
`;

// Add Update Pipeline Mutation
const UPDATE_PIPELINE_MUTATION = gql`
  mutation UpdatePipeline($id: ID!, $input: PipelineInput!) {
    updatePipeline(id: $id, input: $input) {
      id
      name
    }
  }
`;

// Add Delete Pipeline Mutation
const DELETE_PIPELINE_MUTATION = gql`
  mutation DeletePipeline($id: ID!) {
    deletePipeline(id: $id)
  }
`;

// Add Update Deal Mutation
const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal($id: ID!, $input: DealInput!) {
    updateDeal(id: $id, input: $input) {
      id
      name
      stage {
        id
        name
      }
      stage_id
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

// Activities
// Define fields needed by the UI (including nested links for display)
const GET_ACTIVITIES_QUERY = gql`
  query GetActivities($filter: ActivityFilterInput) {
    activities(filter: $filter) {
      id
      user_id
      created_at
      updated_at
      type
      subject
      due_date
      is_done
      notes
      deal_id
      person_id
      organization_id
      # Include linked objects for display
      deal {
        id
        name
      }
      person {
        id
        first_name
        last_name
      }
      organization {
        id
        name
      }
    }
  }
`;

const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      # Return the full activity object needed after creation
      id
      user_id
      created_at
      updated_at
      type
      subject
      due_date
      is_done
      notes
      deal_id
      person_id
      organization_id
      deal {
        id
        name
      }
      person {
        id
        first_name
        last_name
      }
      organization {
        id
        name
      }
    }
  }
`;

const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      # Return the updated activity object
      id
      user_id
      created_at
      updated_at
      type
      subject
      due_date
      is_done
      notes
      deal_id
      person_id
      organization_id
      deal {
        id
        name
      }
      person {
        id
        first_name
        last_name
      }
      organization {
        id
        name
      }
    }
  }
`;

const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

// --- Result Types ---

// My Permissions
interface GetMyPermissionsQueryResult { myPermissions: string[]; }

// Deals
interface GetDealsQueryResult { deals: Deal[]; }
interface DeleteDealMutationResult { deleteDeal: boolean; }
interface GetPeopleQueryResult { people: Person[]; }
interface DeletePersonMutationResult { deletePerson: boolean; }
interface GetOrganizationsQueryResult { organizations: Organization[]; }
interface DeleteOrganizationMutationResult { deleteOrganization: boolean; }
interface GetPipelinesQueryResult { pipelines: Pipeline[]; }
interface GetStagesQueryResult { stages: Stage[]; }
// Add Mutation results
interface CreatePipelineMutationResult { createPipeline: Pipeline; }
interface CreateDealMutationResult { createDeal: Deal; }
// Add Stage mutation result type
interface CreateStageMutationResult { createStage: Stage; }
// Add Update/Delete Stage mutation result types
interface UpdateStageMutationResult { updateStage: Stage; }
interface DeleteStageMutationResult { deleteStage: boolean; }
// Add Pipeline Update/Delete Result Types
interface UpdatePipelineMutationResult { updatePipeline: Pipeline; }
interface DeletePipelineMutationResult { deletePipeline: boolean; }
// TODO: Add other mutation results later if needed
// interface UpdatePipelineMutationResult { updatePipeline: Pipeline; }
// ... etc

// ... existing GQL result types ...
interface GetActivitiesQueryResult { activities: Activity[]; }
interface CreateActivityMutationResult { createActivity: Activity; }
interface UpdateActivityMutationResult { updateActivity: Activity; }
interface DeleteActivityMutationResult { deleteActivity: string; } // Changed ID! to string

// --- Input Type Definitions (Add for Activities) ---

// ... existing input types ...

export interface CreateActivityInput { // Matches GraphQL input
  type: string; // Use string for simplicity, map to enum later if needed
  subject: string;
  due_date?: string | null;
  notes?: string | null;
  is_done?: boolean; 
  deal_id?: string | null;
  person_id?: string | null;
  organization_id?: string | null;
}

export interface UpdateActivityInput { // Matches GraphQL input
  type?: string;
  subject?: string;
  due_date?: string | null;
  notes?: string | null;
  is_done?: boolean;
  deal_id?: string | null;
  person_id?: string | null;
  organization_id?: string | null;
}

// Add filter type if needed for fetchActivities action
export interface ActivityFilterInput {
  dealId?: string;
  personId?: string;
  organizationId?: string;
  isDone?: boolean;
}

// --- App State Interface ---
interface AppState {
  // Auth
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  userPermissions: string[] | null; // Added permissions
  permissionsLoading: boolean; // Added loading state for permissions
  setSession: (session: Session | null) => void;
  checkAuth: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  fetchUserPermissions: () => Promise<void>; // Added action to fetch permissions
  
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

  // Pipelines & Stages
  pipelines: Pipeline[];
  stages: Stage[]; // Stages for the currently selected/viewed pipeline
  pipelinesLoading: boolean;
  pipelinesError: string | null;
  stagesLoading: boolean;
  stagesError: string | null;
  selectedPipelineId: string | null; // Track which pipeline's stages are loaded
  fetchPipelines: () => Promise<void>;
  fetchStages: (pipelineId: string) => Promise<void>; // Fetch stages for a specific pipeline
  // Add CRUD actions
  createPipeline: (input: { name: string }) => Promise<Pipeline | null>;
  updatePipeline: (id: string, input: UpdatePipelineInput) => Promise<Pipeline | null>;
  deletePipeline: (id: string) => Promise<boolean>;
  createStage: (input: CreateStageInput) => Promise<Stage | null>;
  updateStage: (id: string, input: UpdateStageInput) => Promise<Stage | null>;
  deleteStage: (id: string) => Promise<boolean>;

  // Deal Actions
  createDeal: (input: CreateDealInput) => Promise<Deal | null>;
  updateDeal: (id: string, input: UpdateDealInput) => Promise<Deal | null>;

  // Activities
  activities: Activity[];
  activitiesLoading: boolean;
  activitiesError: string | null;
  fetchActivities: (filter?: ActivityFilterInput) => Promise<void>; // Add optional filter
  createActivity: (input: CreateActivityInput) => Promise<Activity | null>;
  updateActivity: (id: string, input: UpdateActivityInput) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
}

// Define types for Stage create/update inputs
export interface CreateStageInput {
    pipeline_id: string;
    name: string;
    order: number;
    deal_probability?: number | null;
}
export interface UpdateStageInput { // Export Update Input Type
    name?: string;
    order?: number;
    deal_probability?: number | null;
}

// Add Update Pipeline Input Type
export interface UpdatePipelineInput {
    name?: string; // Only name is updatable for now
}

// --- Input Type Definitions (Matching GraphQL Schema) ---

export interface CreateDealInput {
    name: string;
    stage_id: string; // Required for creation
    amount?: number | null;
    person_id?: string | null;
}

export interface UpdateDealInput {
    name?: string;
    stage_id?: string;
    amount?: number | null;
    person_id?: string | null;
}

// Result type for Update Deal Mutation
interface UpdateDealMutationResult { updateDeal: Deal | null; }

// --- Zustand Store Implementation ---
export const useAppStore = create<AppState>((set, get) => ({
  // --- Initial state ---
  session: null,
  user: null,
  isLoadingAuth: true, 
  userPermissions: null, // Initial permissions state
  permissionsLoading: false, // Initial permissions loading state
  deals: [],
  dealsLoading: false,
  dealsError: null,
  people: [],
  peopleLoading: false,
  peopleError: null,
  organizations: [],
  organizationsLoading: false,
  organizationsError: null,
  pipelines: [],
  stages: [],
  pipelinesLoading: false,
  pipelinesError: null,
  stagesLoading: false,
  stagesError: null,
  selectedPipelineId: null, // Initialize
  activities: [],
  activitiesLoading: false,
  activitiesError: null,

  // --- Actions ---
  
  // Auth Actions
  setSession: (session) => {
    set({ session: session, user: session?.user ?? null });
  },

  // Action to fetch permissions
  fetchUserPermissions: async () => {
    set({ permissionsLoading: true });
    const token = get().session?.access_token;
    if (!token) {
        console.warn('fetchUserPermissions called without an active session.');
        set({ userPermissions: null, permissionsLoading: false });
        return;
    }
    try {
        // Use the client configured with the auth token
        const data = await gqlClient.request<GetMyPermissionsQueryResult>(
            GET_MY_PERMISSIONS_QUERY
        );
        console.log('Fetched permissions:', data.myPermissions);
        set({ userPermissions: data.myPermissions || [], permissionsLoading: false });
    } catch (error: any) {
        console.error('Error fetching user permissions:', error);
        set({ userPermissions: null, permissionsLoading: false });
        // Optional: Set a specific permissions error state if needed
    }
  },

  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        set({ session: null, user: null, userPermissions: null }); // Clear permissions on error
      } else {
        set({ session, user: session?.user ?? null });
        if (session) {
            // If session exists, fetch permissions
            await get().fetchUserPermissions(); 
        }
      }
    } catch (error) {
      console.error('Unexpected error during checkAuth:', error);
      set({ session: null, user: null, userPermissions: null });
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  handleSignOut: async () => {
    set({ isLoadingAuth: true }); // Optional: indicate loading during sign out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      // Handle error appropriately, maybe show a toast
    } else {
      // Clear session, user, and permissions state
      set({ session: null, user: null, userPermissions: null, isLoadingAuth: false });
      // Clear GQL client cache/headers if necessary (depends on client setup)
      gqlClient.setHeaders({}); // Clear auth header
    }
     set({ isLoadingAuth: false }); // Ensure loading is stopped
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
    // Add explicit auth check
    const session = get().session;
    if (!session) {
      set({ dealsError: 'Not authenticated' });
      return false;
    }

    // Keep original list for potential rollback (though not implemented currently)
    const originalDeals = get().deals;
    // Optimistic Update
    set((state) => ({
        deals: state.deals.filter(deal => deal.id !== id),
        dealsError: null // Clear previous errors during attempt
    }));

    try {
      const variables = { id };
      const result = await gqlClient.request<DeleteDealMutationResult>(
          DELETE_DEAL_MUTATION, 
          variables,
          { Authorization: `Bearer ${session.access_token}` } // Pass token
      );
      if (result.deleteDeal) {
          // Success: Optimistic update already applied
           set({ dealsError: null }); // Ensure error is cleared on success
          return true;
      } else {
          // This path might not be reached if the backend throws on failure
          throw new Error('Delete operation returned false from API.');
      }
    } catch (err: any) {
        console.error('Error deleting deal:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete deal';
        // Revert optimistic update (or just set error)
        set({ deals: originalDeals, dealsError: `Failed to delete deal (${id}): ${errorMsg}` });
        return false;
    }
  },

  // People Actions
  fetchPeople: async () => {
    set({ peopleLoading: true, peopleError: null });
    try {
        // Add Auth check for consistency, though API might handle it
        const session = get().session;
        if (!session) throw new Error("Not authenticated");

        const data = await gqlClient.request<GetPeopleQueryResult>(
            GET_PEOPLE_QUERY,
            {},
            { Authorization: `Bearer ${session.access_token}` }
        );
        set({ people: data.people || [], peopleLoading: false });
    } catch (err: any) {
        console.error("Error fetching people:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch people';
        set({ peopleError: errorMsg, peopleLoading: false, people: [] });
    }
  },
  deletePerson: async (id: string): Promise<boolean> => {
    // Add explicit auth check
    const session = get().session;
    if (!session) {
      set({ peopleError: 'Not authenticated' });
      return false;
    }
    const originalPeople = get().people;
    // Optimistic Update
    set((state) => ({
        people: state.people.filter(p => p.id !== id),
        peopleError: null // Clear error during attempt
    }));

    try {
      const result = await gqlClient.request<DeletePersonMutationResult>(
          DELETE_PERSON_MUTATION, 
          { id },
          { Authorization: `Bearer ${session.access_token}` } // Pass token
      );
      if (result.deletePerson) {
          // Success: Optimistic update already applied
          set({ peopleError: null }); // Clear error on success
          return true;
      } else {
          throw new Error('Delete operation returned false from API.');
      }
    } catch (err: any) {
        console.error('Error deleting person:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete person';
        // Revert or just set error
        set({ people: originalPeople, peopleError: `Failed to delete person (${id}): ${errorMsg}` });
        return false;
    }
  },

  // Organizations Actions
  fetchOrganizations: async () => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
        // Add Auth check for consistency
        const session = get().session;
        if (!session) throw new Error("Not authenticated");

        const data = await gqlClient.request<GetOrganizationsQueryResult>(
            GET_ORGANIZATIONS_QUERY,
            {},
            { Authorization: `Bearer ${session.access_token}` }
        );
        set({ organizations: data.organizations || [], organizationsLoading: false });
    } catch (err: any) {
        console.error("Error fetching organizations:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch organizations';
        set({ organizationsError: errorMsg, organizationsLoading: false, organizations: [] });
    }
  },
  deleteOrganization: async (id: string): Promise<boolean> => {
    // Add explicit auth check
    const session = get().session;
    if (!session) {
      set({ organizationsError: 'Not authenticated' });
      return false;
    }
    const originalOrganizations = get().organizations;
    // Optimistic Update
    // Remove loading set here - let component handle UI
    set((state) => ({ 
        organizations: state.organizations.filter(org => org.id !== id),
        organizationsError: null // Clear error during attempt
     }));
    try {
      await gqlClient.request<DeleteOrganizationMutationResult>(
          DELETE_ORGANIZATION_MUTATION, 
          { id },
          { Authorization: `Bearer ${session.access_token}` } // Pass token
      );
      // Success: Optimistic update done
      set({ organizationsLoading: false, organizationsError: null }); // Clear loading/error only on actual success
      return true;
    } catch (error: any) {
      console.error("Error deleting organization:", error);
      const errorMsg = error.response?.errors?.[0]?.message || error.message || 'Failed to delete organization';
      // Revert or just set error
      set({ organizations: originalOrganizations, organizationsLoading: false, organizationsError: errorMsg });
      return false;
    }
  },

  // Pipelines & Stages Actions
  fetchPipelines: async () => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const session = get().session;
      if (!session) throw new Error("Not authenticated");
      
      const data = await gqlClient.request<GetPipelinesQueryResult>(
        GET_PIPELINES_QUERY,
        {},
        { Authorization: `Bearer ${session.access_token}` }
      );
      set({ pipelines: data.pipelines, pipelinesLoading: false });
    } catch (error: any) {
      console.error("Error fetching pipelines:", error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to fetch pipelines";
      set({ pipelinesError: errorMessage, pipelinesLoading: false });
    }
  },

  fetchStages: async (pipelineId: string) => {
    // Clear stages when fetching for a new pipeline ID starts
    set({ stages: [], stagesLoading: true, stagesError: null, selectedPipelineId: pipelineId });
    try {
      const session = get().session;
      if (!session) throw new Error("Not authenticated");

      const data = await gqlClient.request<GetStagesQueryResult>(
        GET_STAGES_QUERY,
        { pipelineId },
        { Authorization: `Bearer ${session.access_token}` }
      );
      set({ stages: data.stages, stagesLoading: false });
    } catch (error: any) {
      console.error(`Error fetching stages for pipeline ${pipelineId}:`, error);
       const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to fetch stages for pipeline ${pipelineId}`;
      // Clear stages on error too
      set({ stages: [], stagesError: errorMessage, stagesLoading: false });
    }
  },

  // Pipeline Actions
  createPipeline: async (input: { name: string }): Promise<Pipeline | null> => {
    set({ pipelinesLoading: true }); // Indicate activity
    try {
      const session = get().session;
      if (!session) throw new Error("Not authenticated");

      const result = await gqlClient.request<CreatePipelineMutationResult>(
        CREATE_PIPELINE_MUTATION,
        { input },
        { Authorization: `Bearer ${session.access_token}` }
      );
      
      const newPipeline = result.createPipeline;
      // Add to state
      set(state => ({ 
        pipelines: [...state.pipelines, newPipeline],
        pipelinesLoading: false,
        pipelinesError: null 
      }));
      return newPipeline;
    } catch (error: any) {
      console.error("Error creating pipeline:", error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to create pipeline";
      set({ pipelinesError: errorMessage, pipelinesLoading: false });
      return null;
    }
  },

    // Deal Actions
    createDeal: async (input: CreateDealInput): Promise<Deal | null> => {
        set({ dealsError: null }); // Clear previous errors
        try {
            const variables = { input }; 
            const data = await gqlClient.request<CreateDealMutationResult>(
                CREATE_DEAL_MUTATION,
                variables
            );
            const newDeal = data.createDeal;
            if (newDeal) {
                // Add the new deal to the local state
                // Note: The returned 'stage' is nested, ensure it matches the Deal interface
                const formattedDeal: Deal = {
                    ...newDeal,
                    // Ensure all fields match the Deal interface in the store
                    // stage: { id: newDeal.stage.id, name: newDeal.stage.name }, // Already formatted correctly by GQL?
                };
                set((state) => ({ 
                    deals: [...state.deals, formattedDeal],
                    dealsError: null 
                }));
                return formattedDeal;
            } else {
                throw new Error('Create deal mutation did not return a deal.');
            }
        } catch (err: any) {
            console.error("Error creating deal:", err);
            const gqlError = err.response?.errors?.[0]?.message;
            const errorMsg = gqlError || err.message || 'Failed to create deal';
            set({ dealsError: errorMsg });
            return null;
        }
    },

    // Stage Actions
    createStage: async (input: CreateStageInput): Promise<Stage | null> => {
        set({ stagesLoading: true }); // Indicate stage list activity
        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");
          
          // Ensure the pipelineId matches the currently selected one for consistency
          if (input.pipeline_id !== get().selectedPipelineId) {
            console.warn('Attempting to create stage for a pipeline different from the one currently viewed in the store.');
            // Potentially throw error or just proceed?
            // Let's proceed, but this indicates a potential UI/logic mismatch.
          }

          const result = await gqlClient.request<CreateStageMutationResult>(
            CREATE_STAGE_MUTATION,
            { input },
            { Authorization: `Bearer ${session.access_token}` }
          );
          
          const newStage = result.createStage;
          // Add to state and re-sort by order
          set(state => ({
            stages: [...state.stages, newStage].sort((a, b) => a.order - b.order),
            stagesLoading: false,
            stagesError: null
          }));
          return newStage;
        } catch (error: any) {
          console.error("Error creating stage:", error);
          const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to create stage";
          set({ stagesError: errorMessage, stagesLoading: false });
          return null;
        }
    },

    updateStage: async (id: string, input: UpdateStageInput): Promise<Stage | null> => {
        set({ stagesLoading: true }); // Indicate stage list activity
        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");

          const result = await gqlClient.request<UpdateStageMutationResult>(
            UPDATE_STAGE_MUTATION,
            { id, input },
            { Authorization: `Bearer ${session.access_token}` }
          );
          
          const updatedStage = result.updateStage;
          // Update in state and re-sort by order
          set(state => ({
            stages: state.stages.map(s => s.id === id ? updatedStage : s).sort((a, b) => a.order - b.order),
            stagesLoading: false,
            stagesError: null
          }));
          return updatedStage;
        } catch (error: any) {
          console.error(`Error updating stage ${id}:`, error);
          const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to update stage ${id}`;
          set({ stagesError: errorMessage, stagesLoading: false });
          return null;
        }
    },

    deleteStage: async (id: string): Promise<boolean> => {
        const originalStages = get().stages;
        // Optimistic update - Remove loading set here
        set(state => ({
            stages: state.stages.filter(s => s.id !== id),
            // stagesLoading: true // Remove loading state set here
            stagesError: null // Clear error during attempt
        }));
        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");

          await gqlClient.request<DeleteStageMutationResult>(
            DELETE_STAGE_MUTATION,
            { id },
            { Authorization: `Bearer ${session.access_token}` }
          );
          
          set({ stagesLoading: false, stagesError: null }); // Clear loading/error on success
          return true;
        } catch (error: any) {
          console.error(`Error deleting stage ${id}:`, error);
          const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to delete stage ${id}`;
          // Revert optimistic update
          set({ stages: originalStages, stagesError: errorMessage, stagesLoading: false });
          return false;
        }
    },

    updatePipeline: async (id: string, input: UpdatePipelineInput): Promise<Pipeline | null> => {
        const session = get().session;
        if (!session?.access_token) {
          set({ pipelinesError: "Authentication required" });
          return null;
        }
        // Add check for name existence, though UI should prevent empty submission
        if (!input.name) {
            console.warn("UpdatePipeline called without a name in input.");
            set({ pipelinesError: "Pipeline name cannot be empty." }); // Or handle differently
            return null;
        }
        
        set({ pipelinesLoading: true, pipelinesError: null });
        try {
          const data: UpdatePipelineMutationResult = await gqlClient.request(
            UPDATE_PIPELINE_MUTATION,
            { id, input: { name: input.name } }, // Pass explicitly structured input
            { Authorization: `Bearer ${session.access_token}` }
          );
          const updatedPipeline = data.updatePipeline;
          set((state) => ({ 
            pipelines: state.pipelines.map(p => p.id === id ? updatedPipeline : p),
            pipelinesLoading: false 
          }));
          return updatedPipeline;
        } catch (error: any) {
          console.error("Error updating pipeline:", error);
          const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to update pipeline";
          set({ pipelinesError: errorMessage, pipelinesLoading: false });
          return null;
        }
    },

    deletePipeline: async (id: string): Promise<boolean> => {
        // Keep original list in case of error
        const originalPipelines = get().pipelines;
        // Optimistic update - Remove loading set here
        set(state => ({ 
            pipelines: state.pipelines.filter(p => p.id !== id),
            // pipelinesLoading: true // Remove loading state set here
            pipelinesError: null // Clear error during attempt
        }));
        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");

          await gqlClient.request<DeletePipelineMutationResult>(
            DELETE_PIPELINE_MUTATION,
            { id },
            { Authorization: `Bearer ${session.access_token}` }
          );
          
          set({ pipelinesLoading: false, pipelinesError: null }); // Clear loading/error on success
          // If the deleted pipeline was selected, clear stages
          if (get().selectedPipelineId === id) {
             set({ stages: [], selectedPipelineId: null });
          }
          return true;
        } catch (error: any) {
          console.error(`Error deleting pipeline ${id}:`, error);
           const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to delete pipeline ${id}`;
          // Revert optimistic update on error
          set({ 
              pipelines: originalPipelines, 
              pipelinesError: errorMessage, 
              pipelinesLoading: false 
          });
          return false;
        }
    },

    updateDeal: async (id: string, input: UpdateDealInput): Promise<Deal | null> => {
        set({ dealsLoading: true, dealsError: null });
        try {
            const variables = { id, input }; 
            const data = await gqlClient.request<UpdateDealMutationResult>(
                UPDATE_DEAL_MUTATION,
                variables
            );
            const updatedDeal = data.updateDeal;
            if (updatedDeal) {
                set((state) => ({ 
                    deals: state.deals.map(d => d.id === id ? updatedDeal : d),
                    dealsLoading: false 
                }));
                return updatedDeal;
            } else {
                throw new Error("Update deal returned null");
            }
        } catch (error: any) {
            console.error(`Error updating deal ${id}:`, error);
            const errorMsg = error.response?.errors?.[0]?.message || error.message || 'Failed to update deal';
            set({ dealsLoading: false, dealsError: errorMsg });
            return null;
        }
    },

    // Activities
    fetchActivities: async (filter?: ActivityFilterInput) => {
        set({ activitiesLoading: true, activitiesError: null });
        try {
            const session = get().session;
            if (!session) throw new Error("Not authenticated");

            const data = await gqlClient.request<GetActivitiesQueryResult>(
                GET_ACTIVITIES_QUERY,
                { filter },
                { Authorization: `Bearer ${session.access_token}` }
            );
            set({ activities: data.activities, activitiesLoading: false });
        } catch (err: any) {
            console.error("Error fetching activities:", err);
            const gqlError = err.response?.errors?.[0]?.message;
            const errorMsg = gqlError || err.message || 'Failed to fetch activities';
            set({ activitiesError: errorMsg, activitiesLoading: false, activities: [] }); // Clear activities on error
        }
    },

    createActivity: async (input: CreateActivityInput): Promise<Activity | null> => {
        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");

          const data = await gqlClient.request<CreateActivityMutationResult>(
            CREATE_ACTIVITY_MUTATION,
            { input },
            { Authorization: `Bearer ${session.access_token}` }
          );
          const newActivity = data.createActivity;
          if (newActivity) {
            set((state) => ({
              activities: [...state.activities, newActivity].sort((a, b) => { 
                // Corrected sort logic
                const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                if (aDate !== bDate) return aDate - bDate;
                // Sort by created_at descending if due dates are equal/null
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
              }),
              activitiesError: null 
            }));
            return newActivity;
          } else {
            throw new Error('Create activity mutation did not return an activity.');
          }
        } catch (err: any) {
          console.error("Error creating activity:", err);
          const gqlError = err.response?.errors?.[0]?.message;
          const errorMsg = gqlError || err.message || 'Failed to create activity';
          set({ activitiesError: errorMsg });
          return null;
        }
    },

    updateActivity: async (id: string, input: UpdateActivityInput): Promise<Activity | null> => {
        const originalActivities = get().activities;
        const originalActivity = originalActivities.find(a => a.id === id);
        let optimisticActivity = null;

        // Optimistic update
        if (originalActivity) {
            optimisticActivity = { ...originalActivity, ...input }; // Store optimistic version
            set(state => ({
                activities: state.activities.map(a => (a.id === id ? optimisticActivity! : a))
                               .sort((a, b) => { // Corrected sort logic
                                    const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                                    const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                                    if (aDate !== bDate) return aDate - bDate;
                                    // Sort by created_at descending if due dates are equal/null
                                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
                                }),
                activitiesError: null // Clear error during attempt
            }));
        } else {
             console.warn(`Activity ${id} not found for optimistic update.`);
             // If not found locally, we probably can't update anyway, but let the mutation try
        }

        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");

          const data = await gqlClient.request<UpdateActivityMutationResult>(
            UPDATE_ACTIVITY_MUTATION,
            { id, input },
            { Authorization: `Bearer ${session.access_token}` }
          );
          const updatedActivity = data.updateActivity;
          if (updatedActivity) {
            // Replace optimistic update with actual data (even if optimistic didn't run)
            set((state) => ({
              activities: state.activities.map(a => a.id === id ? updatedActivity : a)
                             .sort((a, b) => { // Corrected sort logic
                                    const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                                    const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                                    if (aDate !== bDate) return aDate - bDate;
                                    // Sort by created_at descending if due dates are equal/null
                                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
                                }),
              activitiesError: null
            }));
            return updatedActivity;
          } else {
            // This case implies the mutation succeeded but returned null - treat as error
            throw new Error("Update activity mutation returned null");
          }
        } catch (err: any) {
          console.error(`Error updating activity ${id}:`, err);
          const gqlError = err.response?.errors?.[0]?.message;
          const errorMsg = gqlError || err.message || 'Failed to update activity';
          // Revert optimistic update on error only if optimistic update occurred
          if (optimisticActivity) {
              set({ activities: originalActivities, activitiesError: errorMsg });
          } else {
              // If no optimistic update, just set the error
              set({ activitiesError: errorMsg });
          }
          return null; // Ensure return null on error
        }
    },

    deleteActivity: async (id: string): Promise<boolean> => {
        const originalActivities = get().activities;
        // Optimistic update: remove the activity immediately
        set(state => ({
          activities: state.activities.filter(a => a.id !== id),
          activitiesError: null // Clear error during attempt
        }));

        try {
          const session = get().session;
          if (!session) throw new Error("Not authenticated");

          await gqlClient.request<DeleteActivityMutationResult>(
            DELETE_ACTIVITY_MUTATION,
            { id },
            { Authorization: `Bearer ${session.access_token}` }
          );

          // Success: Optimistic update holds, ensure error state is clear
          set({ activitiesError: null });
          return true;
        } catch (error: any) {
          console.error(`Error deleting activity ${id}:`, error);
          const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to delete activity ${id}`;
          // Revert optimistic update on error
          set({ activities: originalActivities, activitiesError: errorMessage });
          return false;
        }
    },

}));

// Initialize auth check (optional, App.tsx also listens)
// useAppStore.getState().checkAuth(); 

// Subscribe to auth changes (handle SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase Auth Listener] Event:', event, 'Session:', session ? 'Exists' : 'Null');
    // Update session state in the store
    useAppStore.getState().setSession(session);
    
    // Fetch permissions on sign-in or token refresh
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        useAppStore.getState().fetchUserPermissions();
    }
    
    // Clear permissions on sign-out (already handled in handleSignOut, but good belt-and-suspenders)
    if (event === 'SIGNED_OUT') {
        useAppStore.setState({ userPermissions: null }); 
    }
}); 