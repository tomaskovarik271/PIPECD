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

// --- GraphQL Queries/Mutations for Deals ---
const GET_DEALS_QUERY = gql`
  query GetDeals {
    deals {
      id
      name
      amount
      expected_close_date
      created_at
      updated_at
      person_id
      person {
        id
        first_name
        last_name
        email
      }
      organization_id
      organization {
        id
        name
      }
      user_id
      deal_specific_probability
      weighted_amount
      customFieldValues {
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
      activities {
        id
        type
        subject
        due_date
        is_done
      }
      wfm_project_id
      currentWfmStep {
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
      currentWfmStatus {
        id
        name
        color
      }
    }
  }
`;

const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id
      name
      amount
      expected_close_date
      created_at
      updated_at
      person_id
      person {
        id
        first_name
        last_name
        email
      }
      organization_id
      user_id
      deal_specific_probability
      weighted_amount
      wfm_project_id
      currentWfmStep {
        id
        stepOrder
        metadata
        status { id name color }
      }
      currentWfmStatus { id name color }
    }
  }
`;

const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal($id: ID!, $input: DealUpdateInput!) {
    updateDeal(id: $id, input: $input) {
      id
      name
      amount
      expected_close_date
      created_at
      updated_at
      person_id
      person {
        id
        first_name
        last_name
        email
      }
      organization_id
      user_id
      deal_specific_probability
      weighted_amount
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
  mutation UpdateDealWFMProgress($dealId: ID!, $targetWfmWorkflowStepId: ID!) {
    updateDealWFMProgress(dealId: $dealId, targetWfmWorkflowStepId: $targetWfmWorkflowStepId) {
      id # Fetched updated deal fields relevant to Kanban or list views
      name
      amount
      expected_close_date
      deal_specific_probability
      weighted_amount
      wfm_project_id
      currentWfmStep {
        id
        stepOrder
        isInitialStep
        isFinalStep
        metadata # Includes deal_probability, outcome_type, name etc.
        status { # Ensure status is fetched for display name
            id
            name
            color
        }
      }
      currentWfmStatus {
        id
        name
        color
      }
      # Add other fields you might need after a WFM update, e.g., custom fields if they change
      # For example, if custom fields are linked to WFM steps:
      # customFieldValues {
      #   definition { id fieldName fieldType }
      #   stringValue numberValue booleanValue dateValue selectedOptionValues
      # }
      # Also activities if they might change
      # activities {
      #   id type subject due_date is_done
      # }
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
  updateDeal: (id: string, input: Partial<DealUpdateInput>) => Promise<Deal | null>;
  deleteDeal: (id: string) => Promise<boolean>;
  updateDealWFMProgress: (dealId: string, targetWfmWorkflowStepId: string) => Promise<Deal | null>;

  // Kanban View State and Actions
  dealsViewMode: 'table' | 'kanban';
  setDealsViewMode: (mode: 'table' | 'kanban') => void;
}

// Helper to safely get from localStorage
const getDealsViewModeFromLocalStorage = (): 'table' | 'kanban' => {
  try {
    const mode = localStorage.getItem('dealsViewMode');
    return mode === 'kanban' ? 'kanban' : 'table'; // Default to 'table' if not 'kanban'
  } catch (error) {
    // In case localStorage is not available (e.g. SSR or privacy settings)
    console.warn('Could not access localStorage to get dealsViewMode.', error);
    return 'table';
  }
};

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  dealsLoading: false,
  dealsError: null,
  hasInitiallyFetchedDeals: false,
  dealsViewMode: getDealsViewModeFromLocalStorage(),

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

  updateDeal: async (id: string, input: Partial<DealUpdateInput>): Promise<Deal | null> => {
    set({ dealsLoading: true, dealsError: null });
    try {
      const variables: MutationUpdateDealArgs = { id, input: input as DealUpdateInput };
      type UpdateDealMutationResponse = { updateDeal?: Maybe<Deal> };
      const response = await gqlClient.request<UpdateDealMutationResponse>(UPDATE_DEAL_MUTATION, variables);
      const updatedDeal = response.updateDeal;
      if (updatedDeal) {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? updatedDeal : d)),
          dealsLoading: false,
        }));
        return updatedDeal;
      } else {
        set({ dealsLoading: false, dealsError: 'Update operation did not return a deal.' });
        return null;
      }
    } catch (error: unknown) {
      console.error(`Error updating deal ${id}:`, error);
      let message = 'Failed to update deal';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ dealsError: message, dealsLoading: false });
      return null;
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

  setDealsViewMode: (mode: 'table' | 'kanban') => {
    set({ dealsViewMode: mode });
    try {
      localStorage.setItem('dealsViewMode', mode);
    } catch (error) {
      console.warn('Could not access localStorage to set dealsViewMode.', error);
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