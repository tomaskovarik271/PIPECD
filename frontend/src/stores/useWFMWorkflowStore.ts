import { create, StateCreator } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  WfmWorkflow,
  CreateWfmWorkflowInput,
  UpdateWfmWorkflowInput,
  QueryWfmWorkflowsArgs,
  QueryWfmWorkflowArgs,
  MutationCreateWfmWorkflowArgs,
  MutationUpdateWfmWorkflowArgs,
  WfmWorkflowStep, // For detailed workflow
  WfmWorkflowTransition, // For detailed workflow
  CreateWfmWorkflowStepInput, // Added this import
  MutationCreateWfmWorkflowStepArgs, // Added this import
  UpdateWfmWorkflowStepInput, // Added this import
  MutationUpdateWfmWorkflowStepArgs, // Added this import
  WfmWorkflowStepMutationResponse, // Corrected casing
  CreateWfmWorkflowTransitionInput,
  UpdateWfmWorkflowTransitionInput, // For the new store action
} from '../generated/graphql/graphql';

import {
  GET_WFM_WORKFLOWS,
  GET_WFM_WORKFLOW_BY_ID, // This query now fetches steps and transitions
  CREATE_WFM_WORKFLOW,
  UPDATE_WFM_WORKFLOW,
  ADD_WFM_WORKFLOW_STEP,
  UPDATE_WFM_WORKFLOW_STEP,
  REMOVE_WFM_WORKFLOW_STEP,
  UPDATE_WFM_WORKFLOW_STEPS_ORDER,
  CREATE_WFM_WORKFLOW_TRANSITION,
  DELETE_WFM_WORKFLOW_TRANSITION,
  UPDATE_WFM_WORKFLOW_TRANSITION, // For the new store action
} from '../lib/graphql/wfmWorkflowOperations';

// Define a more detailed type for the workflow when its steps and transitions are loaded
export type WfmWorkflowWithDetails = WfmWorkflow & {
  steps: WfmWorkflowStep[];
  transitions: WfmWorkflowTransition[];
};

export interface WFMWorkflowState {
  workflows: WfmWorkflow[];
  currentWorkflowWithDetails: WfmWorkflowWithDetails | null; // For the editor
  loading: boolean; 
  submitting: boolean; 
  error: string | null;
  fetchWFMWorkflows: (isArchived?: boolean) => Promise<void>;
  // fetchWFMWorkflowById is replaced by fetchWFMWorkflowWithDetails for editor use
  fetchWFMWorkflowWithDetails: (id: string) => Promise<WfmWorkflowWithDetails | null>;
  createWFMWorkflow: (input: CreateWfmWorkflowInput) => Promise<WfmWorkflow | null>;
  updateWFMWorkflow: (id: string, input: UpdateWfmWorkflowInput) => Promise<WfmWorkflow | null>;
  archiveWFMWorkflow: (id: string) => Promise<boolean>; 

  // Placeholder actions for steps and transitions
  addWorkflowStep: (workflowId: string, statusId: string, stepOrder?: number, isInitialStep?: boolean, isFinalStep?: boolean) => Promise<WfmWorkflowStep | null>;
  updateWorkflowStep: (
    stepId: string, 
    input: UpdateWfmWorkflowStepInput & { name?: string; description?: string } // Allow name/desc for metadata
  ) => Promise<WfmWorkflowStep | null>;
  removeWorkflowStep: (stepId: string, workflowId: string) => Promise<string | undefined>;
  updateWorkflowStepsOrder: (workflowId: string, orderedStepIds: string[]) => Promise<WfmWorkflowWithDetails | null>;
  createWorkflowTransition: (workflowId: string, fromStepId: string, toStepId: string, name?: string) => Promise<WfmWorkflowTransition | null>;
  deleteWorkflowTransition: (transitionId: string) => Promise<boolean>;
  updateWorkflowTransition: (transitionId: string, input: UpdateWfmWorkflowTransitionInput) => Promise<WfmWorkflowTransition | null>;
  addStepToWorkflow: (
    workflowId: string,
    input: Omit<CreateWfmWorkflowStepInput, 'workflowId' | 'stepOrder'> &
      Partial<Pick<CreateWfmWorkflowStepInput, 'stepOrder'>> & {
        name?: string;
        description?: string;
      }
  ) => Promise<WfmWorkflowStep | null>;
  clearError: () => void;
}

export const useWFMWorkflowStore = create<WFMWorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflowWithDetails: null,
  loading: false,
  submitting: false, 
  error: null,

  fetchWFMWorkflows: async (isArchived?: boolean) => {
    set({ loading: true, error: null });
    try {
      const variables: QueryWfmWorkflowsArgs = { isArchived };
      type Response = { wfmWorkflows: WfmWorkflow[] };
      const result = await gqlClient.request<Response>(GET_WFM_WORKFLOWS, variables);
      set({ workflows: result.wfmWorkflows || [], loading: false });
    } catch (err: unknown) {
      let message = 'Failed to fetch WFM workflows.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false, workflows: [] });
      console.error('Error fetching WFM workflows:', err);
    }
  },

  fetchWFMWorkflowWithDetails: async (id: string) => {
    set({ loading: true, error: null, currentWorkflowWithDetails: null });
    try {
      const variables: QueryWfmWorkflowArgs = { id };
      // The query GET_WFM_WORKFLOW_BY_ID is now expected to return WfmWorkflowWithDetails structure
      const result = await gqlClient.request<{ wfmWorkflow: WfmWorkflowWithDetails | null }>(
        GET_WFM_WORKFLOW_BY_ID, 
        variables
      );
      set({ currentWorkflowWithDetails: result.wfmWorkflow, loading: false });
      return result.wfmWorkflow;
    } catch (err: unknown) {
      let message = 'Failed to fetch detailed WFM workflow.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error fetching detailed WFM workflow:', err);
      return null; 
    }
  },

  createWFMWorkflow: async (input) => {
    set({ submitting: true, error: null });
    try {
      const variables: MutationCreateWfmWorkflowArgs = { input };
      const result = await gqlClient.request<{ createWFMWorkflow: WfmWorkflow }>(CREATE_WFM_WORKFLOW, variables);
      const newWorkflow = result.createWFMWorkflow;
      set((state) => ({ 
        workflows: [...state.workflows, newWorkflow].sort((a, b) => a.name.localeCompare(b.name)), 
        submitting: false 
      }));
      return newWorkflow;
    } catch (err: unknown) {
      let message = 'Failed to create WFM workflow.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, submitting: false });
      console.error('Error creating WFM workflow:', err);
      throw err; 
    }
  },

  updateWFMWorkflow: async (id, input) => {
    set({ submitting: true, error: null });
    try {
      const variables: MutationUpdateWfmWorkflowArgs = { id, input };
      const result = await gqlClient.request<{ updateWFMWorkflow: WfmWorkflow }>(UPDATE_WFM_WORKFLOW, variables);
      const updatedWorkflow = result.updateWFMWorkflow;
      set((state) => ({
        workflows: state.workflows.map((wf) => (wf.id === id ? updatedWorkflow : wf)).sort((a, b) => a.name.localeCompare(b.name)),
        currentWorkflowWithDetails: state.currentWorkflowWithDetails?.id === id 
            ? { 
                ...state.currentWorkflowWithDetails, 
                ...updatedWorkflow, 
                steps: state.currentWorkflowWithDetails.steps || [], // Ensure steps array is preserved
                transitions: state.currentWorkflowWithDetails.transitions || [] // Ensure transitions array is preserved
              } 
            : state.currentWorkflowWithDetails,
        submitting: false,
      }));
      return updatedWorkflow;
    } catch (err: unknown) {
      let message = 'Failed to update WFM workflow.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, submitting: false });
      console.error('Error updating WFM workflow:', err);
      throw err; 
    }
  },

  archiveWFMWorkflow: async (id: string) => {
    set({ submitting: true, error: null });
    try {
      const variables: MutationUpdateWfmWorkflowArgs = { id, input: { isArchived: true } }; 
      await gqlClient.request<{ updateWFMWorkflow: Pick<WfmWorkflow, 'id' | 'isArchived'> }>(UPDATE_WFM_WORKFLOW, variables);
      set((state) => ({
        workflows: state.workflows.map(wf => wf.id === id ? { ...wf, isArchived: true } : wf).sort((a, b) => a.name.localeCompare(b.name)),
        currentWorkflowWithDetails: state.currentWorkflowWithDetails?.id === id 
            ? { 
                ...state.currentWorkflowWithDetails, 
                isArchived: true, 
                steps: state.currentWorkflowWithDetails.steps || [], // Ensure steps array is preserved
                transitions: state.currentWorkflowWithDetails.transitions || [] // Ensure transitions array is preserved
              } 
            : state.currentWorkflowWithDetails,
        submitting: false,
      }));
      return true;
    } catch (err: unknown) {
      let message = 'Failed to archive WFM workflow.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, submitting: false });
      console.error('Error archiving WFM workflow:', err);
      throw err; 
    }
  },

  // --- Placeholder implementations for Step and Transition mutations ---
  addWorkflowStep: async (workflowId, statusId, stepOrder, isInitialStep, isFinalStep) => {
    set({ submitting: true, error: null });
    console.log('Store: addWorkflowStep called', { workflowId, statusId, stepOrder, isInitialStep, isFinalStep });
    try {
      // const response = await gqlClient.request(ADD_WFM_WORKFLOW_STEP, { workflowId, statusId, stepOrder, isInitialStep, isFinalStep });
      // TODO: Process response, update currentWorkflowWithDetails.steps
      // await get().fetchWFMWorkflowWithDetails(workflowId); // Refetch for now
      set({ submitting: false });
      // return response.addWFMWorkflowStep;
      return null; // Placeholder
    } catch (err) {
      console.error('Error adding workflow step:', err);
      set({ submitting: false, error: 'Failed to add step' });
      throw err;
    }
  },
  updateWorkflowStep: async (stepId, input) => {
    set({ submitting: true, error: null });
    try {
      const { name, description, ...restInput } = input;
      const metadataUpdate = { 
        ...(input.metadata || {}),
        ...(name && { name }), 
        ...(description && { description })
      };

      const fullInput: UpdateWfmWorkflowStepInput = {
        ...restInput,
        metadata: metadataUpdate,
      };

      const variables: MutationUpdateWfmWorkflowStepArgs = { id: stepId, input: fullInput };
      const result = await gqlClient.request<
        { updateWFMWorkflowStep: WfmWorkflowStep },
        MutationUpdateWfmWorkflowStepArgs
      >(UPDATE_WFM_WORKFLOW_STEP, variables);

      const updatedStep = result.updateWFMWorkflowStep;
      if (!updatedStep) {
        throw new Error('Failed to update workflow step, no data returned.');
      }

      const workflowId = get().currentWorkflowWithDetails?.id;
      if (workflowId) {
        await get().fetchWFMWorkflowWithDetails(workflowId); // Refetch to update the list
      }
      set({ submitting: false });
      return updatedStep;
    } catch (err: any) {
      console.error('Error updating workflow step:', err);
      set({
        submitting: false,
        error: err.message || 'Failed to update workflow step',
      });
      throw err;
    }
  },
  removeWorkflowStep: async (stepId: string, workflowId: string) => {
    set({ submitting: true, error: null });
    try {
      const result = await gqlClient.request< { deleteWFMWorkflowStep: WfmWorkflowStepMutationResponse } >( 
        REMOVE_WFM_WORKFLOW_STEP,
        { id: stepId } 
      );
      if (result.deleteWFMWorkflowStep.success) {
        set({ submitting: false });
        // Re-fetch the workflow details to update the UI
        await get().fetchWFMWorkflowWithDetails(workflowId);
        return result.deleteWFMWorkflowStep.stepId ?? undefined; // Handle potential null from GraphQL ID type
      } else {
        throw new Error(result.deleteWFMWorkflowStep.message || 'Failed to delete step');
      }
    } catch (error: any) {
      console.error('Error in removeWorkflowStep:', error);
      set({ submitting: false, error: error.message || 'Failed to delete step' });
      throw error;
    }
  },
  updateWorkflowStepsOrder: async (workflowId: string, orderedStepIds: string[]): Promise<WfmWorkflowWithDetails | null> => {
    set({ submitting: true, error: null });
    try {
      const result = await gqlClient.request<
        { updateWFMWorkflowStepsOrder: WfmWorkflowWithDetails },
        { workflowId: string; orderedStepIds: string[] }
      >(UPDATE_WFM_WORKFLOW_STEPS_ORDER, { workflowId, orderedStepIds });

      const updatedWorkflow = result.updateWFMWorkflowStepsOrder;
      if (!updatedWorkflow) {
        throw new Error('Failed to update steps order, no data returned.');
      }

      set((state) => ({
        submitting: false,
        currentWorkflowWithDetails: updatedWorkflow,
        // Optionally update the workflow in the main list as well, if it's stored there with details
        workflows: state.workflows.map(wf => wf.id === updatedWorkflow.id ? { ...wf, ...updatedWorkflow } : wf)
      }));
      return updatedWorkflow;
    } catch (error: any) {
      console.error('Error in updateWorkflowStepsOrder:', error);
      set({ submitting: false, error: error.message || 'Failed to update steps order' });
      throw error;
    }
  },
  createWorkflowTransition: async (workflowId, fromStepId, toStepId, name) => {
    set({ submitting: true, error: null });
    console.log('Store: createWorkflowTransition called', { workflowId, fromStepId, toStepId, name });
    try {
      const input: CreateWfmWorkflowTransitionInput = {
        workflowId,
        fromStepId,
        toStepId,
        name: name || null, // Ensure name is null if undefined/empty, as GQL expects String or null
      };
      const response = await gqlClient.request<
        { createWFMWorkflowTransition: WfmWorkflowTransition },
        { input: CreateWfmWorkflowTransitionInput }
      >(CREATE_WFM_WORKFLOW_TRANSITION, { input });

      const newTransition = response.createWFMWorkflowTransition;
      if (!newTransition) {
        throw new Error('Failed to create workflow transition, no data returned.');
      }

      // Refetch the current workflow details to update the transitions list
      await get().fetchWFMWorkflowWithDetails(workflowId);
      set({ submitting: false });
      return newTransition;
    } catch (err: any) {
      console.error('Error creating workflow transition:', err);
      let message = 'Failed to create transition.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ submitting: false, error: message });
      throw err;
    }
  },
  deleteWorkflowTransition: async (transitionId) => {
    set({ submitting: true, error: null });
    console.log('Store: deleteWorkflowTransition called', { transitionId });
    const currentWorkflowId = get().currentWorkflowWithDetails?.id;
    try {
      const result = await gqlClient.request<
        { deleteWFMWorkflowTransition: { success: boolean; transitionId?: string; message?: string } },
        { id: string }
      >(DELETE_WFM_WORKFLOW_TRANSITION, { id: transitionId });

      if (result.deleteWFMWorkflowTransition.success) {
        if (currentWorkflowId) {
          // Refetch the current workflow details to update the transitions list
          await get().fetchWFMWorkflowWithDetails(currentWorkflowId);
        }
        set({ submitting: false });
        return true;
      } else {
        throw new Error(result.deleteWFMWorkflowTransition.message || 'Failed to delete transition from server.');
      }
    } catch (err: any) {
      console.error('Error deleting workflow transition:', err);
      let message = 'Failed to delete transition.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      } else if (err.message) {
        message = err.message;
      }
      set({ submitting: false, error: message });
      throw err;
    }
  },

  updateWorkflowTransition: async (transitionId, input) => {
    set({ submitting: true, error: null });
    console.log('Store: updateWorkflowTransition called', { transitionId, input });
    const currentWorkflowId = get().currentWorkflowWithDetails?.id;

    try {
      const response = await gqlClient.request<
        { updateWFMWorkflowTransition: WfmWorkflowTransition },
        { id: string; input: UpdateWfmWorkflowTransitionInput }
      >(UPDATE_WFM_WORKFLOW_TRANSITION, { id: transitionId, input });

      const updatedTransition = response.updateWFMWorkflowTransition;
      if (!updatedTransition) {
        throw new Error('Failed to update workflow transition, no data returned.');
      }

      if (currentWorkflowId) {
        // Refetch the current workflow details to update the transitions list
        await get().fetchWFMWorkflowWithDetails(currentWorkflowId);
      }
      set({ submitting: false });
      return updatedTransition;
    } catch (err: any) {
      console.error('Error updating workflow transition:', err);
      let message = 'Failed to update transition.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ submitting: false, error: message });
      throw err;
    }
  },

  addStepToWorkflow: async (workflowId, stepInput) => {
    set({ submitting: true, error: null });
    try {
      const currentWorkflow = get().currentWorkflowWithDetails;
      let newStepOrder = 1;
      if (currentWorkflow && currentWorkflow.id === workflowId && currentWorkflow.steps) {
        newStepOrder = currentWorkflow.steps.length + 1;
      }

      const fullInput: CreateWfmWorkflowStepInput = {
        workflowId,
        statusId: stepInput.statusId,
        stepOrder: stepInput.stepOrder ?? newStepOrder,
        isFinalStep: stepInput.isFinalStep ?? false,
        isInitialStep: stepInput.isInitialStep ?? false,
        metadata: {
          ...(stepInput.metadata || {}),
          ...(stepInput.name && { name: stepInput.name }),
          ...(stepInput.description && { description: stepInput.description }),
        },
      };

      const result = await gqlClient.request<
        { createWFMWorkflowStep: WfmWorkflowStep },
        MutationCreateWfmWorkflowStepArgs
      >(ADD_WFM_WORKFLOW_STEP, { input: fullInput });

      const newStep = result.createWFMWorkflowStep;
      if (!newStep) {
        throw new Error('Failed to create workflow step, no data returned.');
      }

      // Refresh current workflow details to include the new step
      await get().fetchWFMWorkflowWithDetails(workflowId);
      set({ submitting: false });
      return newStep;
    } catch (e: any) {
      let displayMessage = 'Failed to add step to workflow.';
      if (isGraphQLErrorWithMessage(e)) {
        const firstError = e.response?.errors?.[0];
        if (firstError) {
          let errorCode: string | undefined = undefined;
          // Safely check for extensions and then for code property
          if (typeof firstError === 'object' && firstError !== null && 'extensions' in firstError && 
              typeof (firstError as any).extensions === 'object' && (firstError as any).extensions !== null &&
              'code' in (firstError as any).extensions) {
            errorCode = (firstError as any).extensions.code;
          }

          if (errorCode === 'WORKFLOW_STATUS_CONFLICT') {
            displayMessage = firstError.message; // Use the user-friendly message
          } else if (firstError.message) {
            displayMessage = firstError.message; // Use other GQL error messages
          }
        }
      } else if (e.message) { // For non-GraphQL errors that might have a message
        displayMessage = e.message;
      }
      
      console.error('Error adding step to workflow:', e); // Log the original error object
      set({
        submitting: false,
        error: displayMessage, // Set the specific or generic error message for the UI
      });
      throw new Error(displayMessage); // Re-throw with the specific or generic message for the component to catch
    }
  },

  clearError: () => {
    set({ error: null });
  },

})); 