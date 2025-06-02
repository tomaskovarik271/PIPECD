import { create, StateCreator } from 'zustand';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  CustomFieldDefinition,
  CustomFieldDefinitionInput,
  CustomFieldEntityType,
  QueryCustomFieldDefinitionsArgs,
  MutationCreateCustomFieldDefinitionArgs,
  MutationUpdateCustomFieldDefinitionArgs,
  MutationDeactivateCustomFieldDefinitionArgs,
  MutationReactivateCustomFieldDefinitionArgs,
} from '../generated/graphql/graphql'; // Adjust path as needed

import {
  GET_CUSTOM_FIELD_DEFINITIONS,
  // GET_CUSTOM_FIELD_DEFINITION, // We might not need a separate fetch by ID if list is comprehensive
  CREATE_CUSTOM_FIELD_DEFINITION,
  UPDATE_CUSTOM_FIELD_DEFINITION,
  DEACTIVATE_CUSTOM_FIELD_DEFINITION,
  REACTIVATE_CUSTOM_FIELD_DEFINITION,
} from '../lib/graphql/customFieldDefinitionOperations';

export interface CustomFieldDefinitionState {
  definitions: CustomFieldDefinition[];
  loading: boolean;
  error: string | null;
  fetchCustomFieldDefinitions: (
    entityType: CustomFieldEntityType,
    includeInactive?: boolean
  ) => Promise<void>;
  createCustomFieldDefinition: (
    input: CustomFieldDefinitionInput
  ) => Promise<CustomFieldDefinition | null>;
  updateCustomFieldDefinition: (
    id: string,
    input: CustomFieldDefinitionInput
  ) => Promise<CustomFieldDefinition | null>;
  deactivateCustomFieldDefinition: (id: string) => Promise<CustomFieldDefinition | null>;
  reactivateCustomFieldDefinition: (id: string) => Promise<CustomFieldDefinition | null>;
  // The _setActiveStatus method is an internal helper and should not be part of this public interface.
}

// Define the helper function outside the store creator, but within the module scope.
// It needs `set` to modify the store state.
type SetCustomFieldDefinitionState = StateCreator<CustomFieldDefinitionState>['arguments']['0'];

const _setActiveStatusHelper = async (
  set: SetCustomFieldDefinitionState,
  id: string, 
  mutationGql: string, 
  operationName: string
): Promise<CustomFieldDefinition | null> => {
  set({ loading: true, error: null });
  try {
    const variables: {id: string} = { id };
    // The response type for deactivate/reactivate returns id, isActive, updatedAt
    type MutationResponse = { [key: string]: Pick<CustomFieldDefinition, 'id' | 'isActive' | 'updatedAt'> }; 
    const result = await gqlClient.request<MutationResponse>(mutationGql, variables);
    const updatedStatus = result[operationName];
    
    let fullUpdatedDefinition: CustomFieldDefinition | undefined;

    set((state: CustomFieldDefinitionState) => ({
      definitions: state.definitions.map((def: CustomFieldDefinition) => {
        if (def.id === id) {
          fullUpdatedDefinition = { ...def, isActive: updatedStatus.isActive, updatedAt: updatedStatus.updatedAt };
          return fullUpdatedDefinition;
        }
        return def;
      }).sort((a: CustomFieldDefinition, b: CustomFieldDefinition) => a.displayOrder - b.displayOrder),
      loading: false,
    }));
    return fullUpdatedDefinition || null;
  } catch (err: unknown) {
    let message = `Failed to ${operationName.toLowerCase().replace(/customfielddefinition/g, 'custom field definition')}.`;
    if (isGraphQLErrorWithMessage(err)) {
      message = err.response?.errors?.[0]?.message || message;
    }
    set({ error: message, loading: false });
    console.error(`Error in ${operationName}:`, err);
    return null;
  }
};

export const useCustomFieldDefinitionStore = create<CustomFieldDefinitionState>((set) => ({
  definitions: [],
  loading: false,
  error: null,

  fetchCustomFieldDefinitions: async (entityType, includeInactive = true) => {
    set({ loading: true, error: null });
    try {
      const variables: QueryCustomFieldDefinitionsArgs = { entityType, includeInactive };
      type Response = { customFieldDefinitions: CustomFieldDefinition[] };
      const result = await gqlClient.request<Response>(GET_CUSTOM_FIELD_DEFINITIONS, variables);
      set({ definitions: result.customFieldDefinitions || [], loading: false });
    } catch (err: unknown) {
      let message = 'Failed to fetch custom field definitions.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false, definitions: [] });
      console.error('Error fetching custom field definitions:', err);
    }
  },

  createCustomFieldDefinition: async (input) => {
    set({ loading: true, error: null });
    try {
      const variables: MutationCreateCustomFieldDefinitionArgs = { input };
      type Response = { createCustomFieldDefinition: CustomFieldDefinition };
      const result = await gqlClient.request<Response>(CREATE_CUSTOM_FIELD_DEFINITION, variables);
      const newDefinition = result.createCustomFieldDefinition;
      set((state: CustomFieldDefinitionState) => ({
        definitions: [...state.definitions, newDefinition].sort((a: CustomFieldDefinition, b: CustomFieldDefinition) => a.displayOrder - b.displayOrder),
        loading: false,
      }));
      return newDefinition;
    } catch (err: unknown) {
      let message = 'Failed to create custom field definition.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error creating custom field definition:', err);
      return null;
    }
  },

  updateCustomFieldDefinition: async (id, input) => {
    set({ loading: true, error: null });
    try {
      const variables: MutationUpdateCustomFieldDefinitionArgs = { id, input };
      type Response = { updateCustomFieldDefinition: CustomFieldDefinition };
      const result = await gqlClient.request<Response>(UPDATE_CUSTOM_FIELD_DEFINITION, variables);
      const updatedDefinition = result.updateCustomFieldDefinition;
      set((state: CustomFieldDefinitionState) => ({
        definitions: state.definitions.map((def: CustomFieldDefinition) =>
          def.id === id ? updatedDefinition : def
        ).sort((a: CustomFieldDefinition, b: CustomFieldDefinition) => a.displayOrder - b.displayOrder),
        loading: false,
      }));
      return updatedDefinition;
    } catch (err: unknown) {
      let message = 'Failed to update custom field definition.';
      if (isGraphQLErrorWithMessage(err)) {
        message = err.response?.errors?.[0]?.message || message;
      }
      set({ error: message, loading: false });
      console.error('Error updating custom field definition:', err);
      return null;
    }
  },

  deactivateCustomFieldDefinition: async (id: string) => {
    return _setActiveStatusHelper(set, id, DEACTIVATE_CUSTOM_FIELD_DEFINITION, 'deactivateCustomFieldDefinition');
  },

  reactivateCustomFieldDefinition: async (id: string) => {
    return _setActiveStatusHelper(set, id, REACTIVATE_CUSTOM_FIELD_DEFINITION, 'reactivateCustomFieldDefinition');
  },
})); 