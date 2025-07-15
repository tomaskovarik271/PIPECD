import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedFilter, FilterCriteria } from '../types/filters';
import { v4 as uuidv4 } from 'uuid';

interface SavedFiltersState {
  savedFilters: SavedFilter[];
  addSavedFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeSavedFilter: (id: string) => void;
  updateSavedFilter: (id: string, updates: Partial<SavedFilter>) => void;
  getSavedFilterById: (id: string) => SavedFilter | undefined;
  clearAllSavedFilters: () => void;
}

export const useSavedFiltersStore = create<SavedFiltersState>()(
  persist(
    (set, get) => ({
      savedFilters: [],

      addSavedFilter: (filter) => {
        const newFilter: SavedFilter = {
          ...filter,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          savedFilters: [...state.savedFilters, newFilter],
        }));
      },

      removeSavedFilter: (id) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter(filter => filter.id !== id),
        }));
      },

      updateSavedFilter: (id, updates) => {
        set((state) => ({
          savedFilters: state.savedFilters.map(filter =>
            filter.id === id
              ? { ...filter, ...updates, updatedAt: new Date().toISOString() }
              : filter
          ),
        }));
      },

      getSavedFilterById: (id) => {
        return get().savedFilters.find(filter => filter.id === id);
      },

      clearAllSavedFilters: () => {
        set({ savedFilters: [] });
      },
    }),
    {
      name: 'pipecd-saved-filters', // localStorage key
      version: 1,
    }
  )
); 