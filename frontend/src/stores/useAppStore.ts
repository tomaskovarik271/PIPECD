import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { gqlClient } from '../lib/graphqlClient';
import { gql } from 'graphql-request';
import type {
  Deal,       // Generated main Deal entity type
  DealInput,  // Generated input type for create/update deals
  Stage,      // Generated Stage type (for Deal.stage and standalone use if needed)
  Person,     // Generated Person type (for Deal.person and standalone use if needed)
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
  MutationCreateDealArgs,
  MutationUpdateDealArgs,
  MutationDeleteDealArgs,
  MutationDeletePersonArgs,
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
  PersonInput, 
  MutationCreatePersonArgs,
  MutationUpdatePersonArgs,
  OrganizationInput, // Assuming generated based on schema
  MutationCreateOrganizationArgs,
  MutationUpdateOrganizationArgs
} from '../generated/graphql/graphql'; // Path to the main generated types file

// Re-export core entity and input types for external use
export type {
  Deal, DealInput,
  Stage, GeneratedCreateStageInput, GeneratedUpdateStageInput,
  Person, PersonInput,
  Organization, OrganizationInput,
  Pipeline, PipelineInput,
  Activity, GeneratedCreateActivityInput, GeneratedUpdateActivityInput, GeneratedActivityFilterInput,
  Maybe // Also re-export Maybe if components might need it for optional fields
};

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
const GET_DEALS_QUERY = gql`query GetDeals { deals { id name stage { id name pipeline_id pipeline { id name } order deal_probability } stage_id amount created_at updated_at person_id person { id first_name last_name email } user_id } }`;
const CREATE_DEAL_MUTATION = gql`mutation CreateDeal($input: DealInput!) { createDeal(input: $input) { id name stage { id name pipeline_id pipeline { id name } order deal_probability } stage_id amount created_at updated_at person_id person { id first_name last_name email } user_id } }`;
const UPDATE_DEAL_MUTATION = gql`mutation UpdateDeal($id: ID!, $input: DealInput!) { updateDeal(id: $id, input: $input) { id name stage { id name pipeline_id pipeline { id name } order deal_probability } stage_id amount created_at updated_at person_id person { id first_name last_name email } user_id } }`;
const DELETE_DEAL_MUTATION = gql`mutation DeleteDeal($id: ID!) { deleteDeal(id: $id) }`;

// Other entity GQL strings (People, Orgs, etc.) remain unchanged here...
const GET_PEOPLE_QUERY = gql` query GetPeople { people { id first_name last_name email phone notes created_at updated_at organization_id organization { id name } } }`;
const DELETE_PERSON_MUTATION = gql` mutation DeletePerson($id: ID!) { deletePerson(id: $id) }`;
const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id
      organization { id name } # Ensure response matches Person type used in fetchPeople
    }
  }
`;
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
// interface GetStagesQueryResult { stages: Stage[]; } // REMOVED (Uses generated Stage now)
// interface CreateStageMutationResult { createStage: Stage; } // REMOVED (Uses generated Stage)
// interface UpdateStageMutationResult { updateStage: Stage; } // REMOVED (Uses generated Stage)
// interface DeleteStageMutationResult { deleteStage: boolean; } // REMOVED
// interface GetActivitiesQueryResult { activities: Activity[]; } // REMOVED
// interface CreateActivityMutationResult { createActivity: Activity; } // REMOVED
// interface UpdateActivityMutationResult { updateActivity: Activity; } // REMOVED
// interface DeleteActivityMutationResult { deleteActivity: string; } // REMOVED - Will adjust deleteActivity to return boolean and handle string ID response

// Add Update Person Mutation (assuming standard fields)
const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson($id: ID!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id
      organization { id name }
    }
  }
`;

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
  
  // Deals (use generated types)
  deals: Deal[]; // Now uses generated Deal
  dealsLoading: boolean;
  dealsError: string | null;
  fetchDeals: () => Promise<void>;
  createDeal: (input: DealInput) => Promise<Deal | null>; // Uses generated DealInput and Deal
  updateDeal: (id: string, input: DealInput) => Promise<Deal | null>; // Uses generated DealInput and Deal
  deleteDeal: (id: string) => Promise<boolean>;

  // People (uses generated Person)
  people: Person[];
  peopleLoading: boolean;
  peopleError: string | null;
  fetchPeople: () => Promise<void>;
  createPerson: (input: PersonInput) => Promise<Person | null>;
  updatePerson: (id: string, input: PersonInput) => Promise<Person | null>;
  deletePerson: (id: string) => Promise<boolean>;

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
  setCurrentTheme: (theme: ThemeMode) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // --- Initial state (unchanged) ---
  session: null, user: null, isLoadingAuth: true, userPermissions: null, permissionsLoading: false,
  deals: [], dealsLoading: false, dealsError: null,
  people: [], peopleLoading: false, peopleError: null,
  organizations: [], organizationsLoading: false, organizationsError: null,
  pipelines: [], stages: [], pipelinesLoading: false, pipelinesError: null, stagesLoading: false, stagesError: null, selectedPipelineId: null,
  activities: [], activitiesLoading: false, activitiesError: null,

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
    } catch (error: any) {
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

  // Deals Actions (Refactored to use generated types)
  fetchDeals: async () => {
    set({ dealsLoading: true, dealsError: null });
    try {
      // Define inline response shape using the generated Deal type
      type GetDealsQueryResponse = { deals: Deal[] }; 
      const data = await gqlClient.request<GetDealsQueryResponse>(GET_DEALS_QUERY);
        set({ deals: data.deals || [], dealsLoading: false });
    } catch (err: any) {
        console.error("Error fetching deals:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch deals';
        set({ dealsError: errorMsg, dealsLoading: false, deals: [] });
    }
  },
  createDeal: async (input: DealInput): Promise<Deal | null> => {
    set({ dealsLoading: true, dealsError: null }); // Use general dealsLoading
    try {
      // Define inline response shape using the generated Deal type
      type CreateDealMutationResponse = { createDeal: Deal }; 
      const response = await gqlClient.request<CreateDealMutationResponse, MutationCreateDealArgs>(
        CREATE_DEAL_MUTATION,
        { input } 
      );
      if (response.createDeal) {
        set((state) => ({ deals: [...state.deals, response.createDeal], dealsLoading: false }));
        return response.createDeal;
      } else {
        set({ dealsLoading: false }); // Reset loading if null response
        return null;
      }
    } catch (err: any) {
        console.error("Error creating deal:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to create deal';
        set({ dealsError: errorMsg, dealsLoading: false });
        return null;
    }
  },
  updateDeal: async (id: string, input: DealInput): Promise<Deal | null> => {
    set({ dealsLoading: true, dealsError: null });
    try {
      // Define inline response shape using the generated Deal type
      type UpdateDealMutationResponse = { updateDeal?: Maybe<Deal> }; 
      const response = await gqlClient.request<UpdateDealMutationResponse, MutationUpdateDealArgs>(
        UPDATE_DEAL_MUTATION,
        { id, input }
      );
      if (response.updateDeal) {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? response.updateDeal! : d)), // Using non-null assertion
          dealsLoading: false,
        }));
        return response.updateDeal;
      } else {
        set({ dealsLoading: false }); // Reset loading if null response
        return null;
      }
    } catch (error: any) {
        console.error(`Error updating deal ${id}:`, error);
        const errorMsg = error.response?.errors?.[0]?.message || error.message || 'Failed to update deal';
        set({ dealsLoading: false, dealsError: errorMsg });
        return null;
    }
  },
  deleteDeal: async (id: string): Promise<boolean> => {
    const session = get().session; // Auth check still relevant
    if (!session) {
      set({ dealsError: 'Not authenticated' });
      return false;
    }
    const originalDeals = get().deals;
    set((state) => ({ deals: state.deals.filter(deal => deal.id !== id), dealsError: null })); // Optimistic update
    try {
      // Define inline response shape
      type DeleteDealMutationResponse = { deleteDeal?: Maybe<boolean> }; 
      const response = await gqlClient.request<DeleteDealMutationResponse, MutationDeleteDealArgs>(
          DELETE_DEAL_MUTATION, 
        { id },
        { Authorization: `Bearer ${session.access_token}` } 
      );
      if (response.deleteDeal) {
        set({ dealsError: null, dealsLoading: false }); // Clear loading on success
          return true;
      } else {
        // If API returns false explicitly or field is null/missing after successful HTTP call
        set({ deals: originalDeals, dealsError: 'Delete operation did not succeed as reported by API', dealsLoading: false });
        return false;
      }
    } catch (err: any) {
        console.error('Error deleting deal:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete deal';
        set({ deals: originalDeals, dealsError: `Failed to delete deal (${id}): ${errorMsg}`, dealsLoading: false });
        return false;
    }
  },

  // People Actions (Refactored)
  fetchPeople: async () => {
    set({ peopleLoading: true, peopleError: null });
    try {
        const session = get().session;
        if (!session) throw new Error("Not authenticated");
        // Define inline response shape using generated Person
        type GetPeopleQueryResponse = { people: Person[] }; 
        const data = await gqlClient.request<GetPeopleQueryResponse>(
            GET_PEOPLE_QUERY,
            {},
            { Authorization: `Bearer ${session.access_token}` }
        );
        set({ people: data.people || [], peopleLoading: false }); // Uses generated Person[]
    } catch (err: any) {
        console.error("Error fetching people:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to fetch people';
        set({ peopleError: errorMsg, peopleLoading: false, people: [] });
    }
  },
  createPerson: async (input: PersonInput): Promise<Person | null> => {
    set({ peopleLoading: true, peopleError: null });
    try {
      // Define inline response shape using the generated Person type
      type CreatePersonMutationResponse = { createPerson?: Maybe<Person> }; 
      const response = await gqlClient.request<CreatePersonMutationResponse, MutationCreatePersonArgs>(
        CREATE_PERSON_MUTATION,
        { input } 
      );
      if (response.createPerson) {
        set((state) => ({ 
          people: [...state.people, response.createPerson!], // Add new person to state
          peopleLoading: false 
        }));
        return response.createPerson;
      } else {
        set({ peopleLoading: false }); // Reset loading if null response
        // Consider setting an error if the API unexpectedly returns null after a 200 OK
        // set({ peopleError: 'Create person mutation returned null' });
        return null;
      }
    } catch (err: any) {
        console.error("Error creating person:", err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to create person';
        set({ peopleError: errorMsg, peopleLoading: false });
        return null;
    }
  },
  updatePerson: async (id: string, input: PersonInput): Promise<Person | null> => {
    set({ peopleLoading: true, peopleError: null });
    try {
      type UpdatePersonMutationResponse = { updatePerson?: Maybe<Person> };
      const response = await gqlClient.request<UpdatePersonMutationResponse, MutationUpdatePersonArgs>(
        UPDATE_PERSON_MUTATION,
        { id, input }
      );
      if (response.updatePerson) {
        set((state) => ({ 
          people: state.people.map(p => p.id === id ? response.updatePerson! : p),
          peopleLoading: false 
        }));
        return response.updatePerson;
      } else {
        set({ peopleLoading: false });
        // set({ peopleError: 'Update person mutation returned null' });
        return null;
      }
    } catch (err: any) {
      console.error(`Error updating person ${id}:`, err);
      const gqlError = err.response?.errors?.[0]?.message;
      const errorMsg = gqlError || err.message || 'Failed to update person';
      set({ peopleError: errorMsg, peopleLoading: false });
      return null;
    }
  },
  deletePerson: async (id: string): Promise<boolean> => {
    const session = get().session;
    if (!session) {
      set({ peopleError: 'Not authenticated' });
      return false;
    }
    const originalPeople = get().people;
    set((state) => ({ people: state.people.filter(p => p.id !== id), peopleError: null })); // Uses generated Person[]
    try {
      // Define inline response shape
      type DeletePersonMutationResponse = { deletePerson?: Maybe<boolean> };
      const result = await gqlClient.request<DeletePersonMutationResponse, MutationDeletePersonArgs>(
          DELETE_PERSON_MUTATION, 
          { id }, // Variables match MutationDeletePersonArgs
          { Authorization: `Bearer ${session.access_token}` }
      );
      if (result.deletePerson) {
          set({ peopleError: null });
          return true;
      } else {
          set({ people: originalPeople, peopleError: 'Delete operation did not succeed as reported by API' });
          return false;
      }
    } catch (err: any) {
        console.error('Error deleting person:', err);
        const gqlError = err.response?.errors?.[0]?.message;
        const errorMsg = gqlError || err.message || 'Failed to delete person';
        set({ people: originalPeople, peopleError: `Failed to delete person (${id}): ${errorMsg}` });
        return false;
    }
  },

  // Organizations Actions
  fetchOrganizations: async () => {
    set({ organizationsLoading: true, organizationsError: null });
    try {
      // Use generated Organization type for the response structure
      const data = await gqlClient.request<{ organizations: Organization[] }, GetOrganizationsQueryVariables>(GET_ORGANIZATIONS_QUERY, {});
      set({ organizations: data.organizations || [], organizationsLoading: false });
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      const gqlError = error.response?.errors?.[0]?.message; // Extract GQL error
      set({ organizationsError: gqlError || error.message, organizationsLoading: false, organizations: [] });
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
    } catch (err: any) {
      console.error("Error creating organization:", err);
      const gqlError = err.response?.errors?.[0]?.message;
      set({ organizationsError: gqlError || err.message, organizationsLoading: false });
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
    } catch (err: any) {
      console.error(`Error updating organization ${id}:`, err);
      const gqlError = err.response?.errors?.[0]?.message;
      set({ organizationsError: gqlError || err.message, organizationsLoading: false });
      return null;
    }
  },
  deleteOrganization: async (id: string): Promise<boolean> => {
    set({ organizationsLoading: true, organizationsError: null }); // Optimistic loading
    try {
      // Use generated Organization related types for response and variables
      const response = await gqlClient.request<{ deleteOrganization?: Maybe<boolean> }, MutationDeleteOrganizationArgs>(DELETE_ORGANIZATION_MUTATION, { id });
      if (response.deleteOrganization) {
        set(state => ({
          organizations: state.organizations.filter(org => org.id !== id)
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      // Optionally, set an error state for organization deletion
      // set({ organizationsError: error.message }); 
      return false;
    }
  },

  // Pipelines & Stages Actions
  fetchPipelines: async () => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const data = await gqlClient.request<{ pipelines: Pipeline[] }>(GET_PIPELINES_QUERY);
      set({ pipelines: data.pipelines || [], pipelinesLoading: false });
    } catch (error: any) {
      console.error("Error fetching pipelines:", error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to fetch pipelines";
      set({ pipelinesError: errorMessage, pipelinesLoading: false, pipelines: [] });
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
    } catch (error: any) {
      console.error(`Error fetching stages for pipeline ${pipelineId}:`, error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to fetch stages for pipeline ${pipelineId}`;
      set({ stages: [], stagesError: errorMessage, stagesLoading: false });
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
    } catch (error: any) {
      console.error("Error creating pipeline:", error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to create pipeline";
      set({ pipelinesError: errorMessage, pipelinesLoading: false });
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
    } catch (error: any) {
      console.error("Error updating pipeline:", error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to update pipeline";
      set({ pipelinesError: errorMessage, pipelinesLoading: false });
      return null;
    }
  },
  deletePipeline: async (id: string): Promise<boolean> => {
    set({ pipelinesLoading: true, pipelinesError: null }); // Indicate loading
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
          set({ stages: [], selectedPipelineId: null }); // Clear stages if deleted pipeline was selected
        }
        return true;
      }
      set({ pipelinesLoading: false }); // Reset loading if API reports false
      return false;
    } catch (error: any) {
      console.error(`Error deleting pipeline ${id}:`, error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to delete pipeline ${id}`;
      set({ pipelinesError: errorMessage, pipelinesLoading: false });
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
    } catch (error: any) {
      console.error("Error creating stage:", error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || "Failed to create stage";
      set({ stagesError: errorMessage, stagesLoading: false });
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
    } catch (error: any) {
      console.error(`Error updating stage ${id}:`, error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to update stage ${id}`;
      set({ stagesError: errorMessage, stagesLoading: false });
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
    } catch (error: any) {
      console.error(`Error deleting stage ${id}:`, error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to delete stage ${id}`;
      set({ stagesError: errorMessage, stagesLoading: false });
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
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      const gqlError = err.response?.errors?.[0]?.message;
      const errorMsg = gqlError || err.message || 'Failed to fetch activities';
      set({ activitiesError: errorMsg, activitiesLoading: false, activities: [] });
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
    } catch (err: any) {
      console.error("Error creating activity:", err);
      const gqlError = err.response?.errors?.[0]?.message;
      const errorMsg = gqlError || err.message || 'Failed to create activity';
      set({ activitiesError: errorMsg, activitiesLoading: false });
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
    } catch (err: any) {
      console.error(`Error updating activity ${id}:`, err);
      const gqlError = err.response?.errors?.[0]?.message;
      const errorMsg = gqlError || err.message || 'Failed to update activity';
      set({ activitiesError: errorMsg, activitiesLoading: false });
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
      if (response.deleteActivity) { // Check if an ID (string) was returned, indicating success
        set(state => ({ 
            activities: state.activities.filter(a => a.id !== id),
            activitiesLoading: false 
        }));
        return true;
      }
      set({ activitiesLoading: false, activitiesError: "Delete operation did not return an ID." }); 
      return false;
    } catch (error: any) {
      console.error(`Error deleting activity ${id}:`, error);
      const errorMessage = error.response?.errors?.[0]?.message || error.message || `Failed to delete activity ${id}`;
      set({ activitiesError: errorMessage, activitiesLoading: false });
      return false;
    }
  },

  // Theme Management (unchanged)
  setCurrentTheme: (theme: ThemeMode) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('app-theme', theme);
      } catch (error) {
        console.error("Error saving theme to localStorage:", error);
      }
    }
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

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    try {
      const storedTheme = localStorage.getItem('app-theme') as ThemeMode | null;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch (error) {
      console.error("Error reading theme from localStorage:", error);
    }
  }
  return 'light';
};

if (typeof window !== 'undefined') {
  useAppStore.getState().checkAuth();
} 