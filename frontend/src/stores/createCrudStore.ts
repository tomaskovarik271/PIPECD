import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';

// Universal types for any entity
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CrudStoreState<T extends BaseEntity, TInput, TUpdateInput = Partial<TInput>> {
  // Data state
  items: T[];
  currentItem: T | null;
  
  // Loading states
  loading: boolean;
  singleItemLoading: boolean;
  
  // Error states
  error: string | null;
  singleItemError: string | null;
  
  // Flags
  hasInitiallyFetched: boolean;
  
  // Actions
  fetchItems: () => Promise<void>;
  fetchItemById: (id: string) => Promise<void>;
  createItem: (input: TInput) => Promise<T | null>;
  updateItem: (id: string, input: TUpdateInput) => Promise<T | null>;
  deleteItem: (id: string) => Promise<boolean>;
  clearItems: () => void;
  setCurrentItem: (item: T | null) => void;
}

export interface CrudStoreConfig<T extends BaseEntity, TInput, TUpdateInput = Partial<TInput>> {
  // Entity configuration
  entityName: string; // 'deal', 'person', 'organization', etc.
  entityNamePlural: string; // 'deals', 'people', 'organizations', etc.
  
  // GraphQL queries/mutations
  queries: {
    getItems: string;
    getItemById: string;
  };
  mutations: {
    create: string;
    update: string;
    delete: string;
  };
  
  // Response type extraction
  extractItems: (response: any) => T[];
  extractSingleItem: (response: any) => T | null;
  extractCreatedItem: (response: any) => T | null;
  extractUpdatedItem: (response: any) => T | null;
  extractDeleteResult: (response: any) => boolean;
}

export function createCrudStore<T extends BaseEntity, TInput, TUpdateInput = Partial<TInput>>(
  config: CrudStoreConfig<T, TInput, TUpdateInput>
) {
  return create<CrudStoreState<T, TInput, TUpdateInput>>((set, get) => ({
    // Initial state
    items: [],
    currentItem: null,
    loading: false,
    singleItemLoading: false,
    error: null,
    singleItemError: null,
    hasInitiallyFetched: false,

    // Fetch all items
    fetchItems: async () => {
      if (get().loading || get().hasInitiallyFetched) return;
      
      set({ loading: true, error: null });
      try {
        const response = await gqlClient.request(config.queries.getItems);
        const items = config.extractItems(response);
        set({ 
          items, 
          loading: false, 
          error: null, 
          hasInitiallyFetched: true 
        });
      } catch (error: unknown) {
        console.error(`Error fetching ${config.entityNamePlural}:`, error);
        let message = `Failed to fetch ${config.entityNamePlural}`;
        
        if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
          message = error.response.errors[0].message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        
        set({ 
          loading: false, 
          error: message, 
          items: [], 
          hasInitiallyFetched: false 
        });
      }
    },

    // Fetch single item by ID
    fetchItemById: async (id: string) => {
      set({ singleItemLoading: true, singleItemError: null });
      try {
        const response = await gqlClient.request(config.queries.getItemById, { id } as any);
        const item = config.extractSingleItem(response);
        set({ 
          currentItem: item, 
          singleItemLoading: false, 
          singleItemError: null 
        });
      } catch (error: unknown) {
        console.error(`Error fetching ${config.entityName} by ID:`, error);
        let message = `Failed to fetch ${config.entityName}`;
        
        if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
          message = error.response.errors[0].message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        
        set({ 
          singleItemLoading: false, 
          singleItemError: message, 
          currentItem: null 
        });
      }
    },

    // Create new item
    createItem: async (input: TInput): Promise<T | null> => {
      set({ loading: true, error: null });
      try {
        const response = await gqlClient.request(config.mutations.create, { input } as any);
        const newItem = config.extractCreatedItem(response);
        
        if (newItem) {
          // Add to items list
          set(state => ({ 
            items: [...state.items, newItem],
            loading: false,
            error: null
          }));
          return newItem;
        } else {
          set({ loading: false, error: `Failed to create ${config.entityName}` });
          return null;
        }
      } catch (error: unknown) {
        console.error(`Error creating ${config.entityName}:`, error);
        let message = `Failed to create ${config.entityName}`;
        
        if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
          message = error.response.errors[0].message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        
        set({ loading: false, error: message });
        return null;
      }
    },

    // Update existing item
    updateItem: async (id: string, input: TUpdateInput): Promise<T | null> => {
      set({ loading: true, error: null });
      try {
        const response = await gqlClient.request(config.mutations.update, { id, input } as any);
        const updatedItem = config.extractUpdatedItem(response);
        
        if (updatedItem) {
          // Update in items list
          set(state => ({
            items: state.items.map(item => 
              item.id === id ? updatedItem : item
            ),
            currentItem: state.currentItem?.id === id ? updatedItem : state.currentItem,
            loading: false,
            error: null
          }));
          return updatedItem;
        } else {
          set({ loading: false, error: `Failed to update ${config.entityName}` });
          return null;
        }
      } catch (error: unknown) {
        console.error(`Error updating ${config.entityName}:`, error);
        let message = `Failed to update ${config.entityName}`;
        
        if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
          message = error.response.errors[0].message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        
        set({ loading: false, error: message });
        return null;
      }
    },

    // Delete item
    deleteItem: async (id: string): Promise<boolean> => {
      set({ loading: true, error: null });
      try {
        const response = await gqlClient.request(config.mutations.delete, { id } as any);
        const success = config.extractDeleteResult(response);
        
        if (success) {
          // Remove from items list
          set(state => ({
            items: state.items.filter(item => item.id !== id),
            currentItem: state.currentItem?.id === id ? null : state.currentItem,
            loading: false,
            error: null
          }));
          return true;
        } else {
          set({ loading: false, error: `Failed to delete ${config.entityName}` });
          return false;
        }
      } catch (error: unknown) {
        console.error(`Error deleting ${config.entityName}:`, error);
        let message = `Failed to delete ${config.entityName}`;
        
        if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
          message = error.response.errors[0].message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        
        set({ loading: false, error: message });
        return false;
      }
    },

    // Utility actions
    clearItems: () => {
      set({ 
        items: [], 
        currentItem: null, 
        loading: false, 
        error: null, 
        hasInitiallyFetched: false 
      });
    },

    setCurrentItem: (item: T | null) => {
      set({ currentItem: item });
    },
  }));
}

// Utility function to create GraphQL fragments
export function createGraphQLFragments(entityName: string, fields: Record<string, string[]>) {
  const fragments: Record<string, string> = {};
  
  Object.entries(fields).forEach(([fragmentName, fieldList]) => {
    fragments[fragmentName] = gql`
      fragment ${fragmentName} on ${entityName} {
        ${fieldList.join('\n        ')}
      }
    `;
  });
  
  return fragments;
}

// Common response extractors
export const commonExtractors = {
  items: (entityNamePlural: string) => (response: any) => response[entityNamePlural] || [],
  singleItem: (entityName: string) => (response: any) => response[entityName] || null,
  createdItem: (mutationName: string) => (response: any) => response[mutationName] || null,
  updatedItem: (mutationName: string) => (response: any) => response[mutationName] || null,
  deleteResult: (mutationName: string) => (response: any) => !!response[mutationName],
}; 