import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';

import {
  Stage,
  CreateStageInput as GeneratedCreateStageInput,
  UpdateStageInput as GeneratedUpdateStageInput,
  QueryStagesArgs,
  MutationCreateStageArgs,
  MutationUpdateStageArgs,
  MutationDeleteStageArgs,
  Maybe,
} from '../generated/graphql/graphql';

// Re-export core Stage types
export type { Stage, GeneratedCreateStageInput, GeneratedUpdateStageInput, Maybe };

// GQL Constants
const GET_STAGES_QUERY = gql`
  query GetStages($pipelineId: ID!) {
    stages(pipelineId: $pipelineId) {
      id
      name
      order
      deal_probability
      pipeline_id
    }
  }
`;

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

const DELETE_STAGE_MUTATION = gql`
  mutation DeleteStage($id: ID!) {
    deleteStage(id: $id)
  }
`;

// State Interface
export interface StagesState {
  stages: Stage[];
  stagesLoading: boolean;
  stagesError: string | null;
  fetchStages: (pipelineId: string) => Promise<void>;
  createStage: (input: GeneratedCreateStageInput) => Promise<Stage | null>;
  updateStage: (id: string, input: GeneratedUpdateStageInput) => Promise<Stage | null>;
  deleteStage: (id: string) => Promise<boolean>;
  // Add selectedStageId and selectStage if needed, similar to pipelines
  // selectedStageId: string | null;
  // selectStage: (stageId: string | null) => void;
}

// Store Implementation
export const useStagesStore = create<StagesState>((set, get) => ({
  stages: [],
  stagesLoading: false,
  stagesError: null,
  // selectedStageId: null, // Uncomment if selectedStageId is needed

  // selectStage: (stageId: string | null) => { // Uncomment if selectedStageId is needed
  //   set({ selectedStageId: stageId });
  // },

  fetchStages: async (pipelineId: string) => {
    set({ stages: [], stagesLoading: true, stagesError: null });
    try {
      type GetStagesQueryResponse = { stages: Stage[] };
      const data = await gqlClient.request<GetStagesQueryResponse, QueryStagesArgs>(
        GET_STAGES_QUERY,
        { pipelineId }
      );
      set({ stages: (data.stages || []).sort((a: Stage, b: Stage) => a.order - b.order), stagesLoading: false });
    } catch (error) {
      console.error(`Error fetching stages for pipeline ${pipelineId}:`, error);
      let message = `Failed to fetch stages for pipeline ${pipelineId}`;
      if (isGraphQLErrorWithMessage(error) && error.response && error.response.errors && error.response.errors.length > 0) {
        message = error.response.errors[0].message;
      }
      set({ stagesError: message, stagesLoading: false, stages: [] });
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
        set((state) => ({
          stages: [...state.stages, response.createStage!].sort((a: Stage, b: Stage) => a.order - b.order),
          stagesLoading: false,
        }));
        return response.createStage;
      }
      set({ stagesLoading: false });
      return null;
    } catch (error) {
      console.error('Error creating stage:', error);
      let message = 'Failed to create stage';
      if (isGraphQLErrorWithMessage(error) && error.response && error.response.errors && error.response.errors.length > 0) {
        message = error.response.errors[0].message;
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
        set((state) => ({
          stages: state.stages.map((s) => (s.id === id ? response.updateStage! : s)).sort((a: Stage, b: Stage) => a.order - b.order),
          stagesLoading: false,
        }));
        return response.updateStage;
      }
      set({ stagesLoading: false });
      return null;
    } catch (error) {
      console.error(`Error updating stage ${id}:`, error);
      let message = `Failed to update stage ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response && error.response.errors && error.response.errors.length > 0) {
        message = error.response.errors[0].message;
      }
      set({ stagesError: message, stagesLoading: false });
      return null;
    }
  },

  deleteStage: async (id: string): Promise<boolean> => {
    // Optimistic update can be considered here if desired
    set({ stagesLoading: true, stagesError: null }); // Or just set error: null
    try {
      await gqlClient.request<{ deleteStage: boolean }, MutationDeleteStageArgs>(
        DELETE_STAGE_MUTATION,
        { id }
      );
      set((state) => ({
        stages: state.stages.filter((s) => s.id !== id),
        stagesLoading: false,
        // Potentially clear selectedStageId if it matches 'id'
        // selectedStageId: state.selectedStageId === id ? null : state.selectedStageId,
      }));
      return true;
    } catch (error) {
      console.error(`Error deleting stage ${id}:`, error);
      let message = `Failed to delete stage ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response && error.response.errors && error.response.errors.length > 0) {
        message = error.response.errors[0].message;
      }
      // Revert optimistic update if it was implemented and failed
      set({ stagesError: message, stagesLoading: false });
      return false;
    }
  },
}));

export default useStagesStore; 