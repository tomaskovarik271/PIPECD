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
// Add nested Stage type for Deal
interface DealStage { 
    id: string;
    name: string;
    pipeline_id: string;
    pipeline: { // Add nested pipeline info
        id: string;
        name: string;
    };
    // Add order or other fields if needed by UI
}
interface Deal {
  id: string;
  name: string;
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

// --- GraphQL Queries/Mutations --- 

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

// --- Result Types ---
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
    set({ organizationsLoading: true, organizationsError: null });
    try {
      await gqlClient.request<DeleteOrganizationMutationResult>(DELETE_ORGANIZATION_MUTATION, { id });
      set((state) => ({ 
        organizations: state.organizations.filter(org => org.id !== id),
        organizationsLoading: false 
      }));
      return true;
    } catch (error: any) {
      console.error("Error deleting organization:", error);
      const errorMsg = error.response?.errors?.[0]?.message || error.message || 'Failed to delete organization';
      set({ organizationsLoading: false, organizationsError: errorMsg });
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
    set({ stagesLoading: true, stagesError: null, selectedPipelineId: pipelineId });
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
      set({ stagesError: errorMessage, stagesLoading: false });
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
        // Optimistic update
        set(state => ({
            stages: state.stages.filter(s => s.id !== id),
            stagesLoading: true
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
        // Optimistic update
        set(state => ({ 
            pipelines: state.pipelines.filter(p => p.id !== id),
            pipelinesLoading: true // Indicate activity
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

}));

// Initialize auth check (optional, App.tsx also listens)
// useAppStore.getState().checkAuth(); 