import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Deal,
  DealInput,
  DealUpdateInput,
  Maybe,
  MutationCreateDealArgs,
  MutationUpdateDealArgs,
  MutationDeleteDealArgs,
  MutationUpdateDealWfmProgressArgs,
} from '../generated/graphql/graphql';

// Re-export core Deal types
export type { Deal, DealInput, Maybe };

// --- GraphQL Fragments ---

const PERSON_FIELDS_FRAGMENT = gql`
  fragment PersonFields on Person {
        id
        first_name
        last_name
        email
      }
`;

const ORGANIZATION_FIELDS_FRAGMENT = gql`
  fragment OrganizationFields on Organization {
        id
        name
      }
`;

const USER_PROFILE_FIELDS_FRAGMENT = gql`
  fragment UserProfileFields on User {
    id
    display_name
    email
    avatar_url
  }
`;

const CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT = gql`
  fragment CustomFieldValueFields on CustomFieldValue {
        definition {
          id
          fieldName
          fieldType
        }
        stringValue
        numberValue
        booleanValue
        dateValue
        selectedOptionValues
      }
`;

const ACTIVITY_SUMMARY_FIELDS_FRAGMENT = gql`
  fragment ActivitySummaryFields on Activity {
        id
        type
        subject
        due_date
        is_done
      }
`;

const WFM_STEP_FIELDS_FRAGMENT = gql`
  fragment WfmStepFields on WFMWorkflowStep {
        id
        stepOrder
        isInitialStep
        isFinalStep
        metadata
        status {
          id
          name
          color
        }
      }
`;

const WFM_STATUS_FIELDS_FRAGMENT = gql`
  fragment WfmStatusFields on WFMStatus {
        id
        name
        color
  }
`;

const DEAL_CORE_FIELDS_FRAGMENT = gql`
  fragment DealCoreFields on Deal {
    id
    name
    amount
    currency
    expected_close_date
    created_at
    updated_at
    person_id
    organization_id
    project_id
    user_id # creator
    assigned_to_user_id
    deal_specific_probability
    weighted_amount
    wfm_project_id
  }
`;

// --- GraphQL Queries/Mutations for Deals ---
const GET_DEALS_QUERY = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${CUSTOM_FIELD_VALUE_FIELDS_FRAGMENT}
  ${ACTIVITY_SUMMARY_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  query GetDeals {
    deals {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization {
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      customFieldValues {
        ...CustomFieldValueFields
      }
      activities {
        ...ActivitySummaryFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
    }
  }
`;

const CREATE_DEAL_MUTATION = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${ORGANIZATION_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}

  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      ...DealCoreFields
      person {
        ...PersonFields
      }
      organization { 
        ...OrganizationFields
      }
      assignedToUser {
        ...UserProfileFields
      }
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
      # CustomFields and Activities are usually not returned on create/update by default
      # unless explicitly needed by the immediate UI response.
      # If needed, add their fragments here too.
    }
  }
`;

const UPDATE_DEAL_MUTATION = gql`
  ${PERSON_FIELDS_FRAGMENT}
  ${USER_PROFILE_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT}
  # No WFM fragments here, as it's not typically updated by the generic updateDeal.
  # Organization is also not typically part of the direct return unless it can change.

  mutation UpdateDeal($id: ID!, $input: DealUpdateInput!) {
    updateDeal(id: $id, input: $input) {
      ...DealCoreFields
      person { # If person can change or details are needed post-update
        ...PersonFields
      }
      assignedToUser { # If assignee can change
        ...UserProfileFields
      }
      # Note: If weighted_amount or deal_specific_probability are the only things changing,
      # the DealCoreFields fragment handles them.
      # WFM fields (currentWfmStep, currentWfmStatus) are generally not part of this mutation's direct return.
      # EditDealModal re-uses the full Deal object from the store or a fresh fetch if invalidated.
    }
  }
`;

const DELETE_DEAL_MUTATION = gql`
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id)
  }
`;

// New Mutation for WFM Progress
const UPDATE_DEAL_WFM_PROGRESS_MUTATION = gql`
  ${WFM_STEP_FIELDS_FRAGMENT}
  ${WFM_STATUS_FIELDS_FRAGMENT}
  ${DEAL_CORE_FIELDS_FRAGMENT} # Include core fields like name, amount for card updates

  mutation UpdateDealWFMProgress($dealId: ID!, $targetWfmWorkflowStepId: ID!) {
    updateDealWFMProgress(dealId: $dealId, targetWfmWorkflowStepId: $targetWfmWorkflowStepId) {
      ...DealCoreFields # Key info like id, name, amount, probability, weighted_amount
      # Crucially, the WFM related fields:
      wfm_project_id # Though likely unchanged, good to have
      currentWfmStep {
        ...WfmStepFields
      }
      currentWfmStatus {
        ...WfmStatusFields
      }
      # Other fields needed for card display if they can change due to WFM step
      # e.g. assignedToUser if a step auto-assigns. For now, assuming it's not changing.
      # assignedToUser { ...UserProfileFields }
    }
  }
`;

interface DealsState {
  deals: Deal[];
  dealsLoading: boolean;
  dealsError: string | null;
  hasInitiallyFetchedDeals: boolean;
  fetchDeals: () => Promise<void>;
  createDeal: (input: DealInput) => Promise<Deal | null>;
  updateDeal: (id: string, input: Partial<DealUpdateInput>) => Promise<{ deal: Deal | null; error?: string }>;
  deleteDeal: (id: string) => Promise<boolean>;
  updateDealWFMProgress: (dealId: string, targetWfmWorkflowStepId: string) => Promise<Deal | null>;

  // View State and Actions
  dealsViewMode: 'table' | 'kanban' | 'kanban-compact';
  setDealsViewMode: (mode: 'table' | 'kanban' | 'kanban-compact') => void;
  kanbanCompactMode: boolean;
  setKanbanCompactMode: (isCompact: boolean) => void;
}

// Helper to safely get view mode from localStorage
const getDealsViewModeFromLocalStorage = (): 'table' | 'kanban' | 'kanban-compact' => {
  try {
    const mode = localStorage.getItem('dealsViewMode');
    if (mode === 'kanban' || mode === 'kanban-compact') return mode;
    return 'table'; // Default to 'table' if not a valid mode
  } catch (error) {
    // In case localStorage is not available (e.g. SSR or privacy settings)
    console.warn('Could not access localStorage to get dealsViewMode.', error);
    return 'table';
  }
};

// Helper to safely get compact mode from localStorage
const getKanbanCompactModeFromLocalStorage = (): boolean => {
  try {
    const isCompact = localStorage.getItem('kanbanCompactMode');
    return isCompact === 'true';
  } catch (error) {
    console.warn('Could not access localStorage to get kanbanCompactMode.', error);
    return false;
  }
};

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  dealsLoading: false,
  dealsError: null,
  hasInitiallyFetchedDeals: false,
  dealsViewMode: getDealsViewModeFromLocalStorage(),
  kanbanCompactMode: getKanbanCompactModeFromLocalStorage(),

  fetchDeals: async () => {
    set({ dealsLoading: true, dealsError: null, hasInitiallyFetchedDeals: true });
    try {
      type GetDealsQueryResponse = { deals: Deal[] };
      const data = await gqlClient.request<GetDealsQueryResponse>(GET_DEALS_QUERY);
      set({ deals: data.deals || [], dealsLoading: false });
    } catch (error: unknown) {
      console.error("Error fetching deals:", error);
      let message = 'Failed to fetch deals';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ dealsError: message, dealsLoading: false, deals: [] });
    }
  },

  createDeal: async (input: DealInput): Promise<Deal | null> => {
    set({ dealsLoading: true, dealsError: null });
    try {
      type CreateDealMutationResponse = { createDeal: Deal };
      const variables: MutationCreateDealArgs = { input };

      const data = await gqlClient.request<CreateDealMutationResponse, MutationCreateDealArgs>(
        CREATE_DEAL_MUTATION,
        variables
      );
      const newDeal = data.createDeal;
      set((state) => ({ 
        deals: [newDeal, ...state.deals], 
        dealsLoading: false 
      }));
      return newDeal;
    } catch (error: unknown) {
      console.error("Error creating deal:", error);
      let message = 'Failed to create deal';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ dealsLoading: false, dealsError: message });
      return null;
    }
  },

  updateDeal: async (id: string, input: Partial<DealUpdateInput>): Promise<{ deal: Deal | null; error?: string }> => {
    set({ dealsLoading: true, dealsError: null });
    try {
      // Validate assignedToUserId if provided
      if (input.assignedToUserId) {
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.assignedToUserId);
        if (!isValidUUID) {
          const errorMessage = 'Invalid user ID format. Please refresh the page and try again.';
          console.error('Invalid assignedToUserId format:', input.assignedToUserId);
          set({ dealsError: errorMessage, dealsLoading: false });
          return { deal: null, error: errorMessage };
        }
      }

      const variables: MutationUpdateDealArgs = { id, input: input as DealUpdateInput };
      type UpdateDealMutationResponse = { updateDeal?: Maybe<Deal> };
      
      const response = await gqlClient.request<UpdateDealMutationResponse>(UPDATE_DEAL_MUTATION, variables);
      
      if ((response as any).errors && (response as any).errors.length > 0) {
        const gqlError = (response as any).errors[0];
        const errorMessage = gqlError.message || 'GraphQL operation failed with errors.';
        console.error(`Error updating deal ${id} (GraphQL errors in response):`, (response as any).errors);
        set({ dealsError: errorMessage, dealsLoading: false });
        return { deal: null, error: errorMessage };
      }

      const updatedDeal = response.updateDeal;

      if (updatedDeal) {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? updatedDeal : d)),
          dealsLoading: false,
        }));
        return { deal: updatedDeal, error: undefined };
      } else {
        const specificMessage = 'Deal information could not be retrieved after update. You may no longer have access.';
        console.warn(`Update operation for deal ${id} returned null, but no GraphQL errors array. User may have lost access or deal became invisible.`);
        set({ dealsLoading: false, dealsError: specificMessage }); 
        return { deal: null, error: specificMessage };
      }
    } catch (error: unknown) {
      console.error(`Error updating deal ${id} (caught exception):`, error);
      let message = 'Failed to update deal. An unexpected error occurred.';

      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ dealsError: message, dealsLoading: false });
      return { deal: null, error: message };
    }
  },

  deleteDeal: async (id: string): Promise<boolean> => {
    const originalDeals = get().deals;
    set((state) => ({ 
        deals: state.deals.filter(deal => deal.id !== id), 
        dealsError: null, 
        dealsLoading: true
    })); 
    try {
      type DeleteDealMutationResponse = { deleteDeal?: Maybe<boolean> };
      const response = await gqlClient.request<DeleteDealMutationResponse, MutationDeleteDealArgs>(
        DELETE_DEAL_MUTATION,
        { id }
      );
      if (response.deleteDeal) {
        set({ dealsError: null, dealsLoading: false });
        return true;
      } else {
        set({ deals: originalDeals, dealsError: 'Delete operation did not succeed as reported by API.', dealsLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error(`Failed to delete deal (${id})`, error);
      let message = `Failed to delete deal (${id})`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ deals: originalDeals, dealsError: message, dealsLoading: false });
      return false;
    }
  },

  setDealsViewMode: (mode: 'table' | 'kanban' | 'kanban-compact') => {
    set({ dealsViewMode: mode });
    try {
      localStorage.setItem('dealsViewMode', mode);
    } catch (error) {
      console.warn('Could not access localStorage to set dealsViewMode.', error);
    }
  },

  setKanbanCompactMode: (isCompact: boolean) => {
    set({ kanbanCompactMode: isCompact });
    try {
      localStorage.setItem('kanbanCompactMode', isCompact.toString());
    } catch (error) {
      console.warn('Could not access localStorage to set kanbanCompactMode.', error);
    }
  },

  // This is optimistic update: it replaces the deal in the store immediately.
  // For a more robust solution, you might want to revert on error.
  updateDealWFMProgress: async (dealId: string, targetWfmWorkflowStepId: string): Promise<Deal | null> => {
    set({ dealsLoading: true, dealsError: null }); // Keep dealsError null here or clear specific operational error
    const originalDeals = get().deals;
    // Optimistic update: Find the deal and update its currentWfmStep immediately for responsiveness.
    // This requires more detailed optimistic update logic if you want to reflect the change in the UI before server confirmation.
    // For now, we'll rely on the server to return the updated deal, and then update the store.
    // Consider a more specific loading state, e.g., `updatingWfmProgressDealId: dealId`

    try {
      type UpdateDealWFMProgressResponse = { updateDealWFMProgress: Deal };
      const response = await gqlClient.request<
        UpdateDealWFMProgressResponse,
        MutationUpdateDealWfmProgressArgs 
      >(UPDATE_DEAL_WFM_PROGRESS_MUTATION, { dealId, targetWfmWorkflowStepId });

      const updatedDeal = response.updateDealWFMProgress;
      if (updatedDeal) {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === dealId ? updatedDeal : d)),
          dealsLoading: false,
          // dealsError: null, // Ensure no error is set on success
        }));
        return updatedDeal;
      } else {
        // This case might indicate a successful HTTP request but GraphQL operation error not caught by the catch block below,
        // or the mutation resolved to null unexpectedly.
        set({ dealsLoading: false, deals: originalDeals }); // Revert
        // Do not set main dealsError here, rely on toast from component
        console.warn('[useDealsStore.updateDealWFMProgress] WFM progress update did not return a deal, but no GraphQL error caught.');
        return null;
      }
    } catch (error: unknown) {
      console.error("[useDealsStore.updateDealWFMProgress] Error updating deal WFM progress:", error);
      // Revert optimistic changes and ensure loading is false.
      set({ dealsLoading: false, deals: originalDeals }); 
      // Re-throw the error so the calling component (DealsKanbanView) can catch it 
      // and use its specific message for the toast.
      throw error; 
    }
  },
}));

export default useDealsStore; 