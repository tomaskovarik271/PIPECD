import { create } from 'zustand';

export type ThemeMode = 'modern' | 'industrialMetal';

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    try {
      const storedTheme = localStorage.getItem('app-theme') as ThemeMode | null;
      if (storedTheme && ['modern', 'industrialMetal'].includes(storedTheme)) {
        return storedTheme;
      }
    } catch (error: unknown) {
      console.error("Error reading theme from localStorage:", error);
    }
  }
  return 'modern';
};

export interface ThemeState {
  currentTheme: ThemeMode;
  setCurrentTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: getInitialTheme(),
  setCurrentTheme: (theme: ThemeMode) => {
    try {
      localStorage.setItem('app-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      set({ currentTheme: theme });
    } catch (error) {
      console.error("Error setting theme:", error);
      // Still set in-memory theme and on document if localStorage fails
      document.documentElement.setAttribute('data-theme', theme);
      set({ currentTheme: theme });
    }
  },
}));

// Initialize theme on load (client-side only)
if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-theme', useThemeStore.getState().currentTheme);
}

export default useThemeStore; 