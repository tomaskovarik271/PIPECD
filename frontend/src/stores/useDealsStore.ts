import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Deal,
  DealInput,
  Maybe,
  MutationCreateDealArgs,
  MutationUpdateDealArgs,
  MutationDeleteDealArgs,
} from '../generated/graphql/graphql';
import { useStagesStore } from './useStagesStore';

// Re-export core Deal types
export type { Deal, DealInput, Maybe };

// --- GraphQL Queries/Mutations for Deals ---
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
        order
        deal_probability
      }
      stage_id
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

const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
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
        order
        deal_probability
      }
      stage_id
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

const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal($id: ID!, $input: DealInput!) {
    updateDeal(id: $id, input: $input) {
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
        order
        deal_probability
      }
      stage_id
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

interface DealsState {
  deals: Deal[];
  dealsLoading: boolean;
  dealsError: string | null;
  hasInitiallyFetchedDeals: boolean;
  fetchDeals: () => Promise<void>;
  createDeal: (input: DealInput) => Promise<Deal | null>;
  updateDeal: (id: string, input: DealInput) => Promise<Deal | null>;
  deleteDeal: (id: string) => Promise<boolean>;

  // Kanban View State and Actions
  selectedKanbanPipelineId: string | null;
  dealsViewMode: 'table' | 'kanban';
  setSelectedKanbanPipelineId: (pipelineId: string | null) => void;
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

  // Initialize Kanban state
  selectedKanbanPipelineId: null,
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
      const response = await gqlClient.request<CreateDealMutationResponse, MutationCreateDealArgs>(
        CREATE_DEAL_MUTATION,
        { input }
      );
      if (response.createDeal) {
        set((state) => ({ deals: [...state.deals, response.createDeal], dealsLoading: false }));
        return response.createDeal;
      } else {
        set({ dealsLoading: false, dealsError: 'Create operation did not return a deal.' });
        return null;
      }
    } catch (error: unknown) {
      console.error("Error creating deal:", error);
      let message = 'Failed to create deal';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ dealsError: message, dealsLoading: false });
      return null;
    }
  },

  updateDeal: async (id: string, input: DealInput): Promise<Deal | null> => {
    set({ dealsLoading: true, dealsError: null });
    try {
      type UpdateDealMutationResponse = { updateDeal?: Maybe<Deal> };
      const response = await gqlClient.request<UpdateDealMutationResponse, MutationUpdateDealArgs>(
        UPDATE_DEAL_MUTATION,
        { id, input }
      );
      if (response.updateDeal) {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? response.updateDeal! : d)),
          dealsLoading: false,
        }));
        return response.updateDeal;
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

  // Kanban View Actions
  setSelectedKanbanPipelineId: (pipelineId: string | null) => {
    set({ selectedKanbanPipelineId: pipelineId });

    if (pipelineId) {
      // Always reset stage fetching state when a pipeline is actively selected for Kanban,
      // to ensure its stages are fetched/re-fetched for this new context.
      useStagesStore.setState({
        hasInitiallyFetchedStages: false,
        stagesError: null,
        stages: [], // Clear current stages to ensure only the selected pipeline's stages are shown
        stagesLoading: false // Reset loading state before DealsKanbanView attempts to fetch
      });
    } else {
      // No pipeline selected, clear stages and reset flags appropriately
      useStagesStore.setState({
        hasInitiallyFetchedStages: false, // Or true, if "no pipeline" implies fetched state is "empty and done"
        stagesError: null,
        stages: [],
        stagesLoading: false
      });
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
}));

export default useDealsStore; 