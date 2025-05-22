import { create } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import {
    GET_WFM_PROJECT_TYPES,
    GET_WFM_PROJECT_TYPE_BY_ID,
    CREATE_WFM_PROJECT_TYPE,
    UPDATE_WFM_PROJECT_TYPE,
    // ARCHIVE_WFM_PROJECT_TYPE, // Alias for UPDATE_WFM_PROJECT_TYPE
    // UNARCHIVE_WFM_PROJECT_TYPE, // Alias for UPDATE_WFM_PROJECT_TYPE
} from '../lib/graphql/wfmProjectTypeOperations';
import {
    GET_WFM_WORKFLOWS // To fetch workflows for dropdown
} from '../lib/graphql/wfmWorkflowOperations';
import type {
    WfmProjectType,
    CreateWfmProjectTypeInput,
    UpdateWfmProjectTypeInput,
    WfmWorkflow, // For the list of available workflows
    QueryWfmProjectTypesArgs,
    // GraphQLError, // Removed import as it's not directly available or needed here
} from '../generated/graphql/graphql';

// No need for a separate GQLError interface here if we inspect err.response directly

export interface WFMProjectTypeState {
    projectTypes: WfmProjectType[];
    availableWorkflows: Pick<WfmWorkflow, 'id' | 'name'>[]; // Only need id and name for selection
    loading: boolean;
    loadingWorkflows: boolean;
    submitting: boolean;
    error: string | null;
    fetchWFMProjectTypes: (variables?: QueryWfmProjectTypesArgs) => Promise<void>;
    fetchWFMProjectTypeById: (id: string) => Promise<WfmProjectType | null>;
    createWFMProjectType: (input: CreateWfmProjectTypeInput) => Promise<WfmProjectType | null>;
    updateWFMProjectType: (id: string, input: UpdateWfmProjectTypeInput) => Promise<WfmProjectType | null>;
    archiveWFMProjectType: (id: string) => Promise<boolean>;
    unarchiveWFMProjectType: (id: string) => Promise<boolean>;
    fetchAvailableWorkflows: () => Promise<void>;
}

export const useWFMProjectTypeStore = create<WFMProjectTypeState>((set, get) => ({
    projectTypes: [],
    availableWorkflows: [],
    loading: false,
    loadingWorkflows: false,
    submitting: false,
    error: null,

    fetchWFMProjectTypes: async (variables) => {
        set({ loading: true, error: null });
        try {
            const response = await gqlClient.request<{ wfmProjectTypes: WfmProjectType[] }>(
                GET_WFM_PROJECT_TYPES,
                variables
            );
            set({ projectTypes: response.wfmProjectTypes || [], loading: false });
        } catch (err: any) {
            console.error('Failed to fetch project types:', err);
            const errorMsg = err.response?.errors?.[0]?.message || err.message || 'Failed to fetch project types';
            set({ error: errorMsg, loading: false });
        }
    },

    fetchAvailableWorkflows: async () => {
        set({ loadingWorkflows: true, error: null });
        try {
            // Fetch only active workflows for selection
            const response = await gqlClient.request<{ wfmWorkflows: Pick<WfmWorkflow, 'id' | 'name'>[] }>(
                GET_WFM_WORKFLOWS,
                { isArchived: false } 
            );
            set({ availableWorkflows: response.wfmWorkflows || [], loadingWorkflows: false });
        } catch (err: any) {
            console.error('Failed to fetch available workflows:', err);
            const errorMsg = err.response?.errors?.[0]?.message || err.message || 'Failed to fetch workflows';
            set({ error: errorMsg, loadingWorkflows: false });
        }
    },

    fetchWFMProjectTypeById: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await gqlClient.request<{ wfmProjectType: WfmProjectType | null }>(
                GET_WFM_PROJECT_TYPE_BY_ID,
                { id }
            );
            set({ loading: false });
            return response.wfmProjectType;
        } catch (err: any) {
            console.error(`Failed to fetch project type ${id}:`, err);
            const errorMsg = err.response?.errors?.[0]?.message || err.message || `Failed to fetch project type ${id}`;
            set({ error: errorMsg, loading: false });
            return null;
        }
    },

    createWFMProjectType: async (input) => {
        set({ submitting: true, error: null });
        try {
            // The mutation directly returns WfmProjectType or throws an error
            const response = await gqlClient.request<{ createWFMProjectType: WfmProjectType }>(
                CREATE_WFM_PROJECT_TYPE,
                { input }
            );
            const newProjectType = response.createWFMProjectType;
            set((state) => ({ 
                projectTypes: [...state.projectTypes, newProjectType],
                submitting: false 
            }));
            return newProjectType;
        } catch (err: any) {
            console.error('Exception creating project type:', err);
            const errorMsg = err.response?.errors?.[0]?.message || err.message || 'Exception occurred during project type creation';
            set({ error: errorMsg, submitting: false });
            throw err;
        }
    },

    updateWFMProjectType: async (id, input) => {
        set({ submitting: true, error: null });
        try {
            // The mutation directly returns WfmProjectType or throws an error
            const response = await gqlClient.request<{ updateWFMProjectType: WfmProjectType }>(
                UPDATE_WFM_PROJECT_TYPE,
                { id, input }
            );
            const updatedProjectType = response.updateWFMProjectType;
            set((state) => ({
                projectTypes: state.projectTypes.map((pt) => 
                    pt.id === id ? updatedProjectType : pt
                ),
                submitting: false,
            }));
            return updatedProjectType;
        } catch (err: any) {
            console.error('Exception updating project type:', err);
            const errorMsg = err.response?.errors?.[0]?.message || err.message || 'Exception occurred during project type update';
            set({ error: errorMsg, submitting: false });
            throw err;
        }
    },

    archiveWFMProjectType: async (id: string) => {
        set({ submitting: true, error: null });
        try {
            const result = await get().updateWFMProjectType(id, { isArchived: true });
            set({ submitting: false });
            return !!result; // Return true if update was successful, false otherwise
        } catch (err: any) {
            // Error is already set by updateWFMProjectType if it throws
            set({ submitting: false });
            throw err;
        }
    },

    unarchiveWFMProjectType: async (id: string) => {
        set({ submitting: true, error: null });
        try {
            const result = await get().updateWFMProjectType(id, { isArchived: false });
            set({ submitting: false });
            return !!result; // Return true if update was successful, false otherwise
        } catch (err: any) {
            // Error is already set by updateWFMProjectType if it throws
            set({ submitting: false });
            throw err;
        }
    },
})); 