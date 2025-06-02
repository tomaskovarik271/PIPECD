import { create, StateCreator } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  WfmStatus,
  CreateWfmStatusInput,
  UpdateWfmStatusInput,
  QueryWfmStatusesArgs,
  QueryWfmStatusArgs,
  MutationCreateWfmStatusArgs,
  MutationUpdateWfmStatusArgs,
  MutationDeleteWfmStatusArgs,
  WfmStatusMutationResponse
} from '../generated/graphql/graphql';

import {
  GET_WFM_STATUSES,
  GET_WFM_STATUS_BY_ID,
  CREATE_WFM_STATUS,
  UPDATE_WFM_STATUS,
  DELETE_WFM_STATUS,
} from '../lib/graphql/wfmStatusOperations';

export interface WFMStatusState {
  statuses: WfmStatus[];
  currentStatus: WfmStatus | null; // For fetching a single status by ID
  loading: boolean;
  error: string | null;
  fetchWFMStatuses: (isArchived?: boolean) => Promise<void>;
  fetchWFMStatusById: (id: string) => Promise<WfmStatus | null>;
  createWFMStatus: (input: CreateWfmStatusInput) => Promise<WfmStatus | null>;
  updateWFMStatus: (id: string, input: UpdateWfmStatusInput) => Promise<WfmStatus | null>;
  deleteWFMStatus: (id: string) => Promise<boolean>; // Returns true on success
}

export const useWFMStatusStore = create<WFMStatusState>((set, get) => ({
  statuses: [],
  currentStatus: null,
  loading: false,
  error: null,

  fetchWFMStatuses: async (isArchived?: boolean) => {
    set({ loading: true, error: null });
    try {
      const variables: QueryWfmStatusesArgs = { isArchived };
      type Response = { wfmStatuses: WfmStatus[] };
      const result = await gqlClient.request<Response>(GET_WFM_STATUSES, variables);
      set({ statuses: result.wfmStatuses || [], loading: false });
    } catch (err: unknown) {
      let message = 'Failed to fetch WFM statuses.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false, statuses: [] });
      console.error('Error fetching WFM statuses:', err);
    }
  },

  fetchWFMStatusById: async (id: string) => {
    set({ loading: true, error: null, currentStatus: null });
    try {
      const variables: QueryWfmStatusArgs = { id };
      type Response = { wfmStatus: WfmStatus | null };
      const result = await gqlClient.request<Response>(GET_WFM_STATUS_BY_ID, variables);
      set({ currentStatus: result.wfmStatus, loading: false });
      return result.wfmStatus;
    } catch (err: unknown) {
      let message = 'Failed to fetch WFM status by ID.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error fetching WFM status by ID:', err);
      return null;
    }
  },

  createWFMStatus: async (input) => {
    set({ loading: true, error: null });
    try {
      const variables: MutationCreateWfmStatusArgs = { input };
      type Response = { createWFMStatus: WfmStatus };
      const result = await gqlClient.request<Response>(CREATE_WFM_STATUS, variables);
      const newStatus = result.createWFMStatus;
      set((state) => ({ 
        statuses: [...state.statuses, newStatus].sort((a, b) => a.name.localeCompare(b.name)), 
        loading: false 
      }));
      return newStatus;
    } catch (err: unknown) {
      let message = 'Failed to create WFM status.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error creating WFM status:', err);
      return null;
    }
  },

  updateWFMStatus: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const variables: MutationUpdateWfmStatusArgs = { id, input };
      type Response = { updateWFMStatus: WfmStatus };
      const result = await gqlClient.request<Response>(UPDATE_WFM_STATUS, variables);
      const updatedStatus = result.updateWFMStatus;
      set((state) => ({
        statuses: state.statuses.map((s) => (s.id === id ? updatedStatus : s)).sort((a, b) => a.name.localeCompare(b.name)),
        currentStatus: state.currentStatus?.id === id ? updatedStatus : state.currentStatus,
        loading: false,
      }));
      return updatedStatus;
    } catch (err: unknown) {
      let message = 'Failed to update WFM status.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error updating WFM status:', err);
      return null;
    }
  },

  deleteWFMStatus: async (id) => {
    set({ loading: true, error: null });
    try {
      const variables: MutationDeleteWfmStatusArgs = { id };
      type Response = { deleteWfmStatus: WfmStatusMutationResponse }; // Matches the GQL response type
      const result = await gqlClient.request<Response>(DELETE_WFM_STATUS, variables);
      if (result.deleteWfmStatus.success) {
        set((state) => ({
          statuses: state.statuses.filter((s) => s.id !== id),
          currentStatus: state.currentStatus?.id === id ? null : state.currentStatus,
          loading: false,
        }));
        return true;
      }
      throw new Error(result.deleteWfmStatus.message || 'Delete operation failed but reported success true.');
    } catch (err: unknown) {
      let message = 'Failed to delete WFM status.';
      if (err instanceof Error) {
        message = err.message;
      } else if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error deleting WFM status:', err);
      return false;
    }
  },
})); 