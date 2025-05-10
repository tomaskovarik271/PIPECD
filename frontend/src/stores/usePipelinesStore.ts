import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Pipeline,
  PipelineInput,
  Maybe,
  MutationCreatePipelineArgs,
  MutationUpdatePipelineArgs,
  MutationDeletePipelineArgs,
} from '../generated/graphql/graphql';

// Re-export core Pipeline types
export type { Pipeline, PipelineInput, Maybe };

// --- GraphQL Queries/Mutations for Pipelines ---
const GET_PIPELINES_QUERY = gql`
  query GetPipelines {
    pipelines {
      id
      name
    }
  }
`;

const CREATE_PIPELINE_MUTATION = gql`
  mutation CreatePipeline($input: PipelineInput!) {
    createPipeline(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_PIPELINE_MUTATION = gql`
  mutation UpdatePipeline($id: ID!, $input: PipelineInput!) {
    updatePipeline(id: $id, input: $input) {
      id
      name
    }
  }
`;

const DELETE_PIPELINE_MUTATION = gql`
  mutation DeletePipeline($id: ID!) {
    deletePipeline(id: $id)
  }
`;

interface PipelinesState {
  pipelines: Pipeline[];
  pipelinesLoading: boolean;
  pipelinesError: string | null;
  selectedPipelineId: string | null;
  fetchPipelines: () => Promise<void>;
  selectPipeline: (pipelineId: string | null) => void;
  createPipeline: (input: PipelineInput) => Promise<Pipeline | null>;
  updatePipeline: (id: string, input: PipelineInput) => Promise<Pipeline | null>;
  deletePipeline: (id: string) => Promise<boolean>;
}

export const usePipelinesStore = create<PipelinesState>((set, get) => ({
  pipelines: [],
  pipelinesLoading: false,
  pipelinesError: null,
  selectedPipelineId: null,

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
      }
      set({ pipelinesError: message, pipelinesLoading: false, pipelines: [] });
    }
  },

  selectPipeline: (pipelineId: string | null) => {
    set({ selectedPipelineId: pipelineId });
  },

  createPipeline: async (input: PipelineInput): Promise<Pipeline | null> => {
    set({ pipelinesLoading: true, pipelinesError: null });
    try {
      const response = await gqlClient.request<{ createPipeline?: Maybe<Pipeline> }, MutationCreatePipelineArgs>(
        CREATE_PIPELINE_MUTATION,
        { input }
      );
      if (response.createPipeline) {
        set((state) => ({
          pipelines: [...state.pipelines, response.createPipeline!],
          pipelinesLoading: false,
        }));
        return response.createPipeline;
      } else {
        set({ pipelinesLoading: false, pipelinesError: 'Create operation did not return a pipeline.' });
        return null;
      }
    } catch (error: unknown) {
      console.error("Error creating pipeline:", error);
      let message = 'Failed to create pipeline';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
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
          pipelines: state.pipelines.map((p) => (p.id === id ? response.updatePipeline! : p)),
          pipelinesLoading: false,
        }));
        return response.updatePipeline;
      } else {
        set({ pipelinesLoading: false, pipelinesError: 'Update operation did not return a pipeline.' });
        return null;
      }
    } catch (error: unknown) {
      console.error(`Error updating pipeline ${id}:`, error);
      let message = 'Failed to update pipeline';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ pipelinesError: message, pipelinesLoading: false });
      return null;
    }
  },

  deletePipeline: async (id: string): Promise<boolean> => {
    const originalPipelines = get().pipelines;
    set((state) => ({
      pipelines: state.pipelines.filter((p) => p.id !== id),
      pipelinesLoading: true,
      pipelinesError: null,
    }));
    try {
      const response = await gqlClient.request<{ deletePipeline?: Maybe<boolean> }, MutationDeletePipelineArgs>(
        DELETE_PIPELINE_MUTATION,
        { id }
      );
      if (response.deletePipeline) {
        set({ pipelinesLoading: false });
        if (get().selectedPipelineId === id) {
          set({ selectedPipelineId: null });
        }
        return true;
      } else {
        set({ pipelines: originalPipelines, pipelinesError: 'Delete operation did not succeed as reported by API.', pipelinesLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error(`Error deleting pipeline ${id}:`, error);
      let message = 'Failed to delete pipeline';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ pipelines: originalPipelines, pipelinesError: message, pipelinesLoading: false });
      return false;
    }
  },
})); 