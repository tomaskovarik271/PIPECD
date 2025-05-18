import { create } from 'zustand';

const LOCAL_STORAGE_PREFIX = 'tableColumnPreferences_';

interface TablePreference {
  visibleColumnKeys: string[];
}

interface ViewPreferencesState {
  tableColumnPreferences: Record<string, TablePreference>;
  initializeTable: (tableKey: string, defaultVisibleColumnKeys: string[]) => void;
  setVisibleColumnKeys: (tableKey: string, newVisibleColumnKeys: string[]) => void;
  resetTableToDefaults: (tableKey: string, defaultVisibleColumnKeys: string[]) => void;
}

const loadFromLocalStorage = (tableKey: string): string[] | null => {
  try {
    const item = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${tableKey}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Error reading localStorage key "${LOCAL_STORAGE_PREFIX}${tableKey}":`, error);
    return null;
  }
};

const saveToLocalStorage = (tableKey: string, visibleColumnKeys: string[]): void => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${tableKey}`, JSON.stringify(visibleColumnKeys));
  } catch (error) {
    console.warn(`Error setting localStorage key "${LOCAL_STORAGE_PREFIX}${tableKey}":`, error);
  }
};

export const useViewPreferencesStore = create<ViewPreferencesState>((set, get) => ({
  tableColumnPreferences: {},

  initializeTable: (tableKey, defaultVisibleColumnKeys) => {
    const currentGlobalState = get().tableColumnPreferences[tableKey];
    const storedKeysFromLocalStorage = loadFromLocalStorage(tableKey);
    
    // Determine the effective keys: localStorage first, then defaults.
    const effectiveKeys = storedKeysFromLocalStorage !== null ? storedKeysFromLocalStorage : defaultVisibleColumnKeys;

    // Check if the current global state already matches the effective keys.
    // Comparing arrays by stringifying them. Assumes order matters and elements are simple enough for this.
    const globalStateMatchesEffectiveKeys = 
      currentGlobalState && 
      JSON.stringify(currentGlobalState.visibleColumnKeys) === JSON.stringify(effectiveKeys);

    if (!globalStateMatchesEffectiveKeys) {
      set((state) => ({
        tableColumnPreferences: {
          ...state.tableColumnPreferences,
          [tableKey]: { visibleColumnKeys: effectiveKeys },
        },
      }));
    }

    // Ensure localStorage is also up-to-date with effectiveKeys.
    // This is important if we initialized from defaults (localStorage was empty)
    // or if localStorage somehow got out of sync.
    const currentLocalStorageValue = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${tableKey}`);
    if (currentLocalStorageValue !== JSON.stringify(effectiveKeys)) {
        saveToLocalStorage(tableKey, effectiveKeys);
    }
  },

  setVisibleColumnKeys: (tableKey, newVisibleColumnKeys) => {
    set((state) => ({
      tableColumnPreferences: {
        ...state.tableColumnPreferences,
        [tableKey]: { visibleColumnKeys: newVisibleColumnKeys },
      },
    }));
    saveToLocalStorage(tableKey, newVisibleColumnKeys);
  },

  resetTableToDefaults: (tableKey, defaultVisibleColumnKeys) => {
    set((state) => ({
      tableColumnPreferences: {
        ...state.tableColumnPreferences,
        [tableKey]: { visibleColumnKeys: defaultVisibleColumnKeys },
      },
    }));
    saveToLocalStorage(tableKey, defaultVisibleColumnKeys);
  },
}));

// Example usage (for illustration, not part of the store itself):
// const { initializeTable, setVisibleColumnKeys, tableColumnPreferences } = useViewPreferencesStore();
// const peopleTablePrefs = tableColumnPreferences['people_list'];
// if (peopleTablePrefs) { console.log(peopleTablePrefs.visibleColumnKeys); } 