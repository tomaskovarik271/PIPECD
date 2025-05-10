import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Stage,      // Generated Stage type (for Deal.stage and standalone use if needed)
  Maybe,      // Import the Maybe type helper
  Organization, // Generated Organization type
  GetOrganizationsQueryVariables, // Generated variables type for GetOrganizationsQuery
  Pipeline,   // Generated Pipeline type
  PipelineInput, // Generated PipelineInput type
  CreateStageInput as GeneratedCreateStageInput, // Alias to avoid conflict with manual if any lingering
  UpdateStageInput as GeneratedUpdateStageInput, // Alias to avoid conflict
  Activity, // Generated Activity type
  ActivityFilterInput as GeneratedActivityFilterInput, // Alias for generated type
  CreateActivityInput as GeneratedCreateActivityInput, // Alias for generated type
  UpdateActivityInput as GeneratedUpdateActivityInput, // Alias for generated type
  // For operation variables, we use the specific *Args types if available:
  // MutationCreateDealArgs, // MOVED to useDealsStore.ts
  // MutationUpdateDealArgs, // MOVED to useDealsStore.ts
  // MutationDeleteDealArgs, // MOVED to useDealsStore.ts
  MutationDeleteOrganizationArgs, // Generated variables type for DeleteOrganization
  MutationCreatePipelineArgs,
  MutationUpdatePipelineArgs,
  MutationDeletePipelineArgs,
  QueryStagesArgs, // Note: Name is QueryStagesArgs from graphql.ts
  MutationCreateStageArgs,
  MutationUpdateStageArgs,
  MutationDeleteStageArgs,
  QueryActivitiesArgs,
  MutationCreateActivityArgs,
  MutationUpdateActivityArgs,
  MutationDeleteActivityArgs,
  // Specific Query/Mutation result types like GetDealsQuery might not be explicitly exported if not used with gql tag,
  // so we'll define response shapes inline using the core entity types.
  OrganizationInput,
  MutationCreateOrganizationArgs,
  MutationUpdateOrganizationArgs
} from '../generated/graphql/graphql'; // Path to the main generated types file

// Re-export core entity and input types for external use
export type {
  Stage, GeneratedCreateStageInput, GeneratedUpdateStageInput,
  Organization, OrganizationInput,
  Pipeline, PipelineInput,
  Activity, GeneratedCreateActivityInput, GeneratedUpdateActivityInput, GeneratedActivityFilterInput,
  Maybe // Also re-export Maybe if components might need it for optional fields
};

// --- GraphQL Error Handling Types --- MOVED to lib/graphqlUtils.ts
// interface GQLError { ... } // MOVED
// interface GQLResponse { ... } // MOVED
// interface GraphQLErrorWithMessage { ... } // MOVED
// function isGraphQLErrorWithMessage(error: unknown): error is GraphQLErrorWithMessage { ... } // MOVED

// --- Interface Definitions ---

// Organization (Keep manual, to be refactored separately) - REMOVED, using generated type
// export interface Organization {
//     id: string;
//     name: string;
//     address?: string | null;
//     notes?: string | null;
//     created_at: string;
//     updated_at: string;
//     user_id: string;
// }

// Person - Uses generated Person from import

// Deal related manual interfaces - REMOVED
// export interface DealPerson { ... }
// export interface DealStage { ... }
// export interface Deal { ... } // Manual Deal interface removed

// Pipeline & Stage Types
// Pipeline (Keep manual, to be refactored separately)
// export interface Pipeline {
//     id: string;
//     name: string;
// }
// Stage - Uses generated Stage from import

// Activity Type (Keep manual, to be refactored separately) - REMOVED, using generated type
// export interface Activity {
//   id: string; 
//   user_id: string; 
//   created_at: string; 
//   updated_at: string; 
//   type: string;
//   subject: string;
//   due_date: string | null; 
//   is_done: boolean;
//   notes: string | null;
//   deal_id: string | null; 
//   person_id?: string | null; 
//   organization_id?: string | null; 
//   deal?: { id: string; name: string } | null; // Simple ref for now
//   person?: { id: string; first_name?: string | null, last_name?: string | null } | null; // Simple ref for now
//   organization?: { id: string; name: string } | null; // Simple ref for now
// }

// --- GraphQL Queries/Mutations --- (Strings remain the same)

const GET_MY_PERMISSIONS_QUERY = gql`query GetMyPermissions { myPermissions }`;
// const GET_DEALS_QUERY = gql`query GetDeals { ... }`; // MOVED to useDealsStore.ts
// const CREATE_DEAL_MUTATION = gql`mutation CreateDeal($input: DealInput!) { ... }`; // MOVED to useDealsStore.ts
// const UPDATE_DEAL_MUTATION = gql`mutation UpdateDeal($id: ID!, $input: DealInput!) { ... }`; // MOVED to useDealsStore.ts
// const DELETE_DEAL_MUTATION = gql`mutation DeleteDeal($id: ID!) { ... }`; // MOVED to useDealsStore.ts

// Other entity GQL strings (People, Orgs, etc.) remain unchanged here...
// const GET_PEOPLE_QUERY = gql` query GetPeople { ... } `; // MOVED to usePeopleStore.ts
// const DELETE_PERSON_MUTATION = gql` mutation DeletePerson($id: ID!) { ... } `; // MOVED to usePeopleStore.ts
// const CREATE_PERSON_MUTATION = gql` mutation CreatePerson($input: PersonInput!) { ... } `; // MOVED to usePeopleStore.ts
// const UPDATE_PERSON_MUTATION = gql` mutation UpdatePerson($id: ID!, $input: PersonInput!) { ... } `; // MOVED to usePeopleStore.ts

const GET_ORGANIZATIONS_QUERY = gql` query GetOrganizations { organizations { id name address notes created_at updated_at } }`;
const DELETE_ORGANIZATION_MUTATION = gql` mutation DeleteOrganization($id: ID!) { deleteOrganization(id: $id) }`;
const GET_PIPELINES_QUERY = gql` query GetPipelines { pipelines { id name } }`;
const CREATE_PIPELINE_MUTATION = gql` mutation CreatePipeline($input: PipelineInput!) { createPipeline(input: $input) { id name } }`;
const UPDATE_PIPELINE_MUTATION = gql` mutation UpdatePipeline($id: ID!, $input: PipelineInput!) { updatePipeline(id: $id, input: $input) { id name } }`;
const DELETE_PIPELINE_MUTATION = gql` mutation DeletePipeline($id: ID!) { deletePipeline(id: $id) }`;
const GET_STAGES_QUERY = gql` query GetStages($pipelineId: ID!) { stages(pipelineId: $pipelineId) { id name order deal_probability pipeline_id } }`;
const CREATE_STAGE_MUTATION = gql` mutation CreateStage($input: CreateStageInput!) { createStage(input: $input) { id name order deal_probability pipeline_id } }`;
const UPDATE_STAGE_MUTATION = gql` mutation UpdateStage($id: ID!, $input: UpdateStageInput!) { updateStage(id: $id, input: $input) { id name order deal_probability pipeline_id } }`;
const DELETE_STAGE_MUTATION = gql` mutation DeleteStage($id: ID!) { deleteStage(id: $id) }`;
const GET_ACTIVITIES_QUERY = gql` query GetActivities($filter: ActivityFilterInput) { activities(filter: $filter) { id user_id created_at updated_at type subject due_date is_done notes deal_id person_id organization_id deal { id name } person { id first_name last_name } organization { id name } } }`;
const CREATE_ACTIVITY_MUTATION = gql` mutation CreateActivity($input: CreateActivityInput!) { createActivity(input: $input) { id user_id created_at updated_at type subject due_date is_done notes deal_id person_id organization_id deal { id name } person { id first_name last_name } organization { id name } } }`;
const UPDATE_ACTIVITY_MUTATION = gql` mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) { updateActivity(id: $id, input: $input) { id user_id created_at updated_at type subject due_date is_done notes deal_id person_id organization_id deal { id name } person { id first_name last_name } organization { id name } } }`;
const DELETE_ACTIVITY_MUTATION = gql` mutation DeleteActivity($id: ID!) { deleteActivity(id: $id) }`;

// REMOVED Manual GraphQL Result Type Interfaces (GetDealsQueryResult, CreateDealMutationResult etc.)
// They will be replaced by inline definitions or directly using generated operation types if available.

// Manual input types for Deals - REMOVED (will use generated DealInput)
// export interface CreateDealInput { ... }
// export interface UpdateDealInput { ... }

// Other manual input types (Keep for now, to be refactored with their respective entities)
// export interface CreateStageInput { pipeline_id: string; name: string; order: number; deal_probability?: number | null;} // REMOVED
// export interface UpdateStageInput { name?: string; order?: number; deal_probability?: number | null;} // REMOVED
// export interface UpdatePipelineInput { name?: string; } // REMOVED
// export interface CreateActivityInput { type: string; subject: string; due_date?: string | null; notes?: string | null; is_done?: boolean; deal_id?: string | null; person_id?: string | null; organization_id?: string | null;} // REMOVED
// export interface UpdateActivityInput { type?: string; subject?: string; due_date?: string | null; notes?: string | null; is_done?: boolean; deal_id?: string | null; person_id?: string | null; organization_id?: string | null;} // REMOVED
// export interface ActivityFilterInput { dealId?: string; personId?: string; organizationId?: string; isDone?: boolean;} // REMOVED
export type ThemeMode = 'light' | 'dark';

// Restore original manual result type interfaces for non-Deal entities for now
// interface GetMyPermissionsQueryResult { myPermissions: string[]; } // REMOVED
// interface GetOrganizationsQueryResult { organizations: Organization[]; } // REMOVED
// interface DeleteOrganizationMutationResult { deleteOrganization: boolean; } // REMOVED
// interface GetPipelinesQueryResult { pipelines: Pipeline[]; } // REMOVED
// interface CreatePipelineMutationResult { createPipeline: Pipeline; } // REMOVED
// interface UpdatePipelineMutationResult { updatePipeline: Pipeline; } // REMOVED
// interface DeletePipelineMutationResult { deletePipeline: boolean; } // REMOVED
// interface GetStagesQueryResult { stages: Stage[]; } // REMOVED
// interface CreateStageMutationResult { createStage: Stage; } // REMOVED
// interface UpdateStageMutationResult { updateStage: Stage; } // REMOVED
// interface DeleteStageMutationResult { deleteStage: boolean; } // REMOVED
// interface GetActivitiesQueryResult { activities: Activity[]; } // REMOVED
// interface CreateActivityMutationResult { createActivity: Activity; } // REMOVED
// interface UpdateActivityMutationResult { updateActivity: Activity; } // REMOVED
// interface DeleteActivityMutationResult { deleteActivity: string; } // REMOVED - Will adjust deleteActivity to return boolean and handle string ID response

// Add Create/Update Organization Mutations (assuming standard fields)
const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      address
      notes
      created_at
      updated_at
      # Add user_id if it's part of the Organization type returned
    }
  }
`;
const UPDATE_ORGANIZATION_MUTATION = gql`
  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      id
      name
      address
      notes
      created_at
      updated_at
    }
  }
`;

// Helper function to get the initial theme
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    try {
      const storedTheme = localStorage.getItem('app-theme') as ThemeMode | null;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch (error: unknown) {
      console.error("Error reading theme from localStorage:", error);
    }
  }
  return 'light';
};

interface AppState {
  // Auth (unchanged)
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  userPermissions: string[] | null;
  permissionsLoading: boolean;
  setSession: (session: Session | null) => void;
  checkAuth: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  fetchUserPermissions: () => Promise<void>; 
  
  // Deals (use generated types) - MOVED to useDealsStore.ts
  // deals: Deal[]; 
  // dealsLoading: boolean;
  // dealsError: string | null;
  // fetchDeals: () => Promise<void>;
  // createDeal: (input: DealInput) => Promise<Deal | null>; 
  // updateDeal: (id: string, input: DealInput) => Promise<Deal | null>; 
  // deleteDeal: (id: string) => Promise<boolean>;

  // People (uses generated Person) - MOVED to usePeopleStore.ts
  // people: Person[];
  // peopleLoading: boolean;
  // peopleError: string | null;
  // fetchPeople: () => Promise<void>;
  // createPerson: (input: PersonInput) => Promise<Person | null>;
  // updatePerson: (id: string, input: PersonInput) => Promise<Person | null>;
  // deletePerson: (id: string) => Promise<boolean>;

  // Organizations (uses generated Organization)
  organizations: Organization[];
  organizationsLoading: boolean;
  organizationsError: string | null;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (input: OrganizationInput) => Promise<Organization | null>;
  updateOrganization: (id: string, input: OrganizationInput) => Promise<Organization | null>;
  deleteOrganization: (id: string) => Promise<boolean>;

  // Pipelines & Stages (uses manual Pipeline/Stage for now)
  pipelines: Pipeline[]; // Now uses generated Pipeline
  stages: Stage[]; // Uses generated Stage
  pipelinesLoading: boolean;
  pipelinesError: string | null;
  stagesLoading: boolean;
  stagesError: string | null;
  selectedPipelineId: string | null;
  fetchPipelines: () => Promise<void>;
  fetchStages: (pipelineId: string) => Promise<void>;
  createPipeline: (input: PipelineInput) => Promise<Pipeline | null>; // Uses generated PipelineInput and Pipeline
  updatePipeline: (id: string, input: PipelineInput) => Promise<Pipeline | null>; // Uses generated PipelineInput and Pipeline
  deletePipeline: (id: string) => Promise<boolean>;
  createStage: (input: GeneratedCreateStageInput) => Promise<Stage | null>; // Uses generated CreateStageInput and Stage
  updateStage: (id: string, input: GeneratedUpdateStageInput) => Promise<Stage | null>; // Uses generated UpdateStageInput and Stage
  deleteStage: (id: string) => Promise<boolean>;

  // Activities (uses manual Activity for now)
  activities: Activity[]; // Now uses generated Activity
  activitiesLoading: boolean;
  activitiesError: string | null;
  fetchActivities: (filter?: GeneratedActivityFilterInput) => Promise<void>; // Uses generated ActivityFilterInput
  createActivity: (input: GeneratedCreateActivityInput) => Promise<Activity | null>; // Uses generated CreateActivityInput & Activity
  updateActivity: (id: string, input: GeneratedUpdateActivityInput) => Promise<Activity | null>; // Uses generated UpdateActivityInput & Activity
  deleteActivity: (id: string) => Promise<boolean>; // Response should be boolean

  // Theme Management (unchanged)
  currentTheme: ThemeMode; // Added currentTheme state
  setCurrentTheme: (theme: ThemeMode) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // --- Initial state (unchanged) ---
  session: null, user: null, isLoadingAuth: true, userPermissions: null, permissionsLoading: false,
  // deals: [], dealsLoading: false, dealsError: null, // MOVED to useDealsStore.ts
  organizations: [], organizationsLoading: false, organizationsError: null,
  pipelines: [], stages: [], pipelinesLoading: false, pipelinesError: null, stagesLoading: false, stagesError: null, selectedPipelineId: null,
  activities: [], activitiesLoading: false, activitiesError: null,
  currentTheme: getInitialTheme(), // Initialize currentTheme

  // --- Actions ---
  
  // Auth Actions (unchanged from your latest version)
  setSession: (session) => set({ session: session, user: session?.user ?? null }),
  fetchUserPermissions: async () => {
    set({ permissionsLoading: true });
    const token = get().session?.access_token;
    if (!token) {
        console.warn('fetchUserPermissions called without an active session.');
        set({ userPermissions: null, permissionsLoading: false });
        return;
    }
    try {
        // Assuming GetMyPermissionsQueryResult is still the manual one for now, or this query is simple string array
        const data = await gqlClient.request<{myPermissions: string[]}>(GET_MY_PERMISSIONS_QUERY);
        set({ userPermissions: data.myPermissions || [], permissionsLoading: false });
    } catch (error: unknown) {
        console.error('Error fetching user permissions:', error);
        set({ userPermissions: null, permissionsLoading: false });
    }
  },
  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        set({ session: null, user: null, userPermissions: null });
      } else {
        set({ session, user: session?.user ?? null });
        if (session) { await get().fetchUserPermissions(); }
      }
    } catch (error) {
      console.error('Unexpected error during checkAuth:', error);
      set({ session: null, user: null, userPermissions: null });
    } finally {
      set({ isLoadingAuth: false });
    }
  },
  handleSignOut: async () => {
    set({ isLoadingAuth: true });
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    else set({ session: null, user: null, userPermissions: null, isLoadingAuth: false });
    gqlClient.setHeaders({});
    set({ isLoadingAuth: false });
  },

  // Deals Actions - MOVED to useDealsStore.ts
  // fetchDeals: async () => { ... },
  // createDeal: async (input: DealInput): Promise<Deal | null> => { ... },
  // updateDeal: async (id: string, input: DealInput): Promise<Deal | null> => { ... },
  // deleteDeal: async (id: string): Promise<boolean> => { ... },

  // People Actions - MOVED to usePeopleStore.ts
  // fetchPeople: async () => { ... },
  // createPerson: async (input) => { ... },
  // updatePerson: async (id, input) => { ... },
  // deletePerson: async (id) => { ... },

  // Organizations Actions
  fetchOrganizations: async () => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      const data = await gqlClient.request<{ organizations: Organization[] }, GetOrganizationsQueryVariables>(GET_ORGANIZATIONS_QUERY, {});
      set({ organizations: data.organizations || [], organizationsLoading: false });
    } catch (error: unknown) {
      console.error('Error fetching organizations:', error);
      let message = 'Failed to fetch organizations';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ organizationsError: message, organizationsLoading: false, organizations: [] });
    }
  },
  createOrganization: async (input: OrganizationInput): Promise<Organization | null> => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      type Response = { createOrganization?: Maybe<Organization> };
      const response = await gqlClient.request<Response, MutationCreateOrganizationArgs>(
        CREATE_ORGANIZATION_MUTATION,
        { input }
      );
      if (response.createOrganization) {
        set((state) => ({ 
          organizations: [...state.organizations, response.createOrganization!],
          organizationsLoading: false 
        }));
        return response.createOrganization;
      } else {
        set({ organizationsLoading: false });
        return null;
      }
    } catch (error: unknown) {
      console.error("Error creating organization:", error);
      let message = 'Failed to create organization';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ organizationsError: message, organizationsLoading: false });
      return null;
    }
  },
  updateOrganization: async (id: string, input: OrganizationInput): Promise<Organization | null> => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      type Response = { updateOrganization?: Maybe<Organization> };
      const response = await gqlClient.request<Response, MutationUpdateOrganizationArgs>(
        UPDATE_ORGANIZATION_MUTATION,
        { id, input }
      );
      if (response.updateOrganization) {
        set((state) => ({ 
          organizations: state.organizations.map(o => o.id === id ? response.updateOrganization! : o),
          organizationsLoading: false 
        }));
        return response.updateOrganization;
      } else {
        set({ organizationsLoading: false });
        return null;
      }
    } catch (error: unknown) {
      console.error(`Error updating organization ${id}:`, error);
      let message = 'Failed to update organization';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ organizationsError: message, organizationsLoading: false });
      return null;
    }
  },
  deleteOrganization: async (id: string): Promise<boolean> => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      const response = await gqlClient.request<{ deleteOrganization?: Maybe<boolean> }, MutationDeleteOrganizationArgs>(DELETE_ORGANIZATION_MUTATION, { id });
      if (response.deleteOrganization) {
        set(state => ({
          organizations: state.organizations.filter(org => org.id !== id)
        }));
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Error deleting organization:', error);
      let message = 'Failed to delete organization';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ organizationsError: message, organizationsLoading: false });
      return false;
    }
  },

  // Pipelines & Stages Actions
  fetchPipelines: async () => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const data = await gqlClient.request<{ pipelines: Pipeline[] }>(GET_PIPELINES_QUERY);
      set({ pipelines: data.pipelines || [], pipelinesLoading: false });
    } catch (error: unknown) {
      console.error("Error fetching pipelines:", error);
      let message = 'Failed to fetch pipelines';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ pipelinesError: message, pipelinesLoading: false, pipelines: [] });
    }
  },
  fetchStages: async (pipelineId: string) => {
    set({ stages: [], stagesLoading: true, stagesError: null, selectedPipelineId: pipelineId });
    try {
      const data = await gqlClient.request<{ stages: Stage[] }, QueryStagesArgs>(
        GET_STAGES_QUERY,
        { pipelineId }
      );
      set({ stages: (data.stages || []).sort((a, b) => a.order - b.order), stagesLoading: false });
    } catch (error: unknown) {
      console.error(`Error fetching stages for pipeline ${pipelineId}:`, error);
      let message = `Failed to fetch stages for pipeline ${pipelineId}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ stages: [], stagesError: message, stagesLoading: false });
    }
  },
  createPipeline: async (input: PipelineInput): Promise<Pipeline | null> => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const response = await gqlClient.request<{ createPipeline?: Maybe<Pipeline> }, MutationCreatePipelineArgs>(
        CREATE_PIPELINE_MUTATION,
        { input }
      );
      if (response.createPipeline) {
        set(state => ({ 
          pipelines: [...state.pipelines, response.createPipeline!],
          pipelinesLoading: false,
        }));
        return response.createPipeline;
      }
      set({ pipelinesLoading: false });
      return null;
    } catch (error: unknown) {
      console.error("Error creating pipeline:", error);
      let message = 'Failed to create pipeline';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ pipelinesError: message, pipelinesLoading: false });
      return null;
    }
  },
  updatePipeline: async (id: string, input: PipelineInput): Promise<Pipeline | null> => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const response = await gqlClient.request<{ updatePipeline?: Maybe<Pipeline> }, MutationUpdatePipelineArgs>(
        UPDATE_PIPELINE_MUTATION,
        { id, input }
      );
      if (response.updatePipeline) {
        set((state) => ({ 
          pipelines: state.pipelines.map(p => p.id === id ? response.updatePipeline! : p),
          pipelinesLoading: false 
        }));
        return response.updatePipeline;
      }
      set({ pipelinesLoading: false });
      return null;
    } catch (error: unknown) {
      console.error("Error updating pipeline:", error);
      let message = 'Failed to update pipeline';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ pipelinesError: message, pipelinesLoading: false });
      return null;
    }
  },
  deletePipeline: async (id: string): Promise<boolean> => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const response = await gqlClient.request<{ deletePipeline?: Maybe<boolean> }, MutationDeletePipelineArgs>(
        DELETE_PIPELINE_MUTATION,
        { id }
      );
      if (response.deletePipeline) {
        set(state => ({ 
            pipelines: state.pipelines.filter(p => p.id !== id),
            pipelinesLoading: false 
        }));
        if (get().selectedPipelineId === id) {
          set({ stages: [], selectedPipelineId: null });
        }
        return true;
      }
      set({ pipelinesLoading: false });
      return false;
    } catch (error: unknown) {
      console.error(`Error deleting pipeline ${id}:`, error);
      let message = `Failed to delete pipeline ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ pipelinesError: message, pipelinesLoading: false });
      return false;
    }
  },
  createStage: async (input: GeneratedCreateStageInput): Promise<Stage | null> => {
    set({ stagesLoading: true, stagesError: null });
    try {
      const response = await gqlClient.request<{ createStage?: Maybe<Stage> }, MutationCreateStageArgs>(
        CREATE_STAGE_MUTATION,
        { input }
      );
      if (response.createStage) {
        set(state => ({
          stages: [...state.stages, response.createStage!].sort((a, b) => a.order - b.order),
          stagesLoading: false,
        }));
        return response.createStage;
      }
      set({ stagesLoading: false });
      return null;
    } catch (error: unknown) {
      console.error("Error creating stage:", error);
      let message = 'Failed to create stage';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ stagesError: message, stagesLoading: false });
      return null;
    }
  },
  updateStage: async (id: string, input: GeneratedUpdateStageInput): Promise<Stage | null> => {
    set({ stagesLoading: true, stagesError: null });
    try {
      const response = await gqlClient.request<{ updateStage?: Maybe<Stage> }, MutationUpdateStageArgs>(
        UPDATE_STAGE_MUTATION,
        { id, input }
      );
      if (response.updateStage) {
        set(state => ({
          stages: state.stages.map(s => s.id === id ? response.updateStage! : s).sort((a, b) => a.order - b.order),
          stagesLoading: false,
        }));
        return response.updateStage;
      }
      set({ stagesLoading: false });
      return null;
    } catch (error: unknown) {
      console.error(`Error updating stage ${id}:`, error);
      let message = `Failed to update stage ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ stagesError: message, stagesLoading: false });
      return null;
    }
  },
  deleteStage: async (id: string): Promise<boolean> => {
    set({ stagesLoading: true, stagesError: null });
    try {
      const response = await gqlClient.request<{ deleteStage?: Maybe<boolean> }, MutationDeleteStageArgs>(
        DELETE_STAGE_MUTATION,
        { id }
      );
      if (response.deleteStage) {
        set(state => ({ 
            stages: state.stages.filter(s => s.id !== id),
            stagesLoading: false 
        }));
        return true;
      }
      set({ stagesLoading: false });
      return false;
    } catch (error: unknown) {
      console.error(`Error deleting stage ${id}:`, error);
      let message = `Failed to delete stage ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ stagesError: message, stagesLoading: false });
      return false;
    }
  },

  // Activities Actions
  fetchActivities: async (filter?: GeneratedActivityFilterInput) => {
    set({ activitiesLoading: true, activitiesError: null });
    try {
      const data = await gqlClient.request<{ activities: Activity[] }, QueryActivitiesArgs>(
          GET_ACTIVITIES_QUERY,
          { filter }
      );
      set({ activities: (data.activities || []).sort((a, b) => { 
        const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        if (aDate !== bDate) return aDate - bDate;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
      }), activitiesLoading: false });
    } catch (error: unknown) {
      console.error("Error fetching activities:", error);
      let message = 'Failed to fetch activities';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ activitiesError: message, activitiesLoading: false, activities: [] });
    }
  },
  createActivity: async (input: GeneratedCreateActivityInput): Promise<Activity | null> => {
    set({ activitiesLoading: true, activitiesError: null });
    try {
      const response = await gqlClient.request<{ createActivity?: Maybe<Activity> }, MutationCreateActivityArgs>(
        CREATE_ACTIVITY_MUTATION,
        { input }
      );
      if (response.createActivity) {
        set((state) => ({
          activities: [...state.activities, response.createActivity!].sort((a, b) => { 
            const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
            const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
            if (aDate !== bDate) return aDate - bDate;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
          }),
          activitiesLoading: false 
        }));
        return response.createActivity;
      }
      set({ activitiesLoading: false });
      return null;
    } catch (error: unknown) {
      console.error("Error creating activity:", error);
      let message = 'Failed to create activity';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ activitiesError: message, activitiesLoading: false });
      return null;
    }
  },
  updateActivity: async (id: string, input: GeneratedUpdateActivityInput): Promise<Activity | null> => {
    set({ activitiesLoading: true, activitiesError: null });
    try {
      const response = await gqlClient.request<{ updateActivity?: Maybe<Activity> }, MutationUpdateActivityArgs>(
        UPDATE_ACTIVITY_MUTATION,
        { id, input }
      );
      if (response.updateActivity) {
        set((state) => ({
          activities: state.activities.map(a => a.id === id ? response.updateActivity! : a)
                     .sort((a, b) => { 
                                const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                                const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                                if (aDate !== bDate) return aDate - bDate;
                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
                            }),
          activitiesLoading: false
        }));
        return response.updateActivity;
      }
      set({ activitiesLoading: false });
      return null;
    } catch (error: unknown) {
      console.error(`Error updating activity ${id}:`, error);
      let message = 'Failed to update activity';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ activitiesError: message, activitiesLoading: false });
      return null;
    }
  },
  deleteActivity: async (id: string): Promise<boolean> => {
    set({ activitiesLoading: true, activitiesError: null });
    try {
      const response = await gqlClient.request<{ deleteActivity?: Maybe<string> }, MutationDeleteActivityArgs>(
        DELETE_ACTIVITY_MUTATION,
        { id }
      );
      if (response.deleteActivity) {
        set(state => ({ 
            activities: state.activities.filter(a => a.id !== id),
            activitiesLoading: false 
        }));
        return true;
      }
      set({ activitiesLoading: false, activitiesError: "Delete operation did not return an ID." }); 
      return false;
    } catch (error: unknown) {
      console.error(`Error deleting activity ${id}:`, error);
      let message = `Failed to delete activity ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
            message = error.response.errors[0].message;
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
      set({ activitiesError: message, activitiesLoading: false });
      return false;
    }
  },

  // Theme Management (unchanged)
  setCurrentTheme: (theme: ThemeMode) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app-theme', theme);
      } catch (error: unknown) {
        console.error("Error saving theme to localStorage:", error);
      }
    }
    set({ currentTheme: theme }); // Added set call
  },
}));

supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Supabase Auth Listener] Event:', event, 'Session:', session ? 'Exists' : 'Null');
    useAppStore.getState().setSession(session);
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        useAppStore.getState().fetchUserPermissions();
    }
    if (event === 'SIGNED_OUT') {
        useAppStore.setState({ userPermissions: null }); 
    }
}); 

if (typeof window !== 'undefined') {
  useAppStore.getState().checkAuth();
} 