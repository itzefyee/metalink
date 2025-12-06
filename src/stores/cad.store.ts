/**
 * CAD State Store
 * 
 * Zustand store for CAD generation preferences and UI state
 * Persists user preferences to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CADPreferences } from '@/types/cad.types';

interface CADState extends CADPreferences {
  // Actions
  setDefaultFormat: (format: CADPreferences['defaultFormat']) => void;
  setDefaultUnits: (units: CADPreferences['defaultUnits']) => void;
  setDefaultCategory: (category: CADPreferences['defaultCategory']) => void;
  addToRecentPrompts: (prompt: string) => void;
  clearRecentPrompts: () => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: CADPreferences = {
  defaultFormat: 'step',
  defaultUnits: 'mm',
  defaultCategory: 'custom',
  recentPrompts: [],
};

/**
 * CAD Store
 * Manages user preferences and recent prompts
 */
export const useCADStore = create<CADState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,

      setDefaultFormat: (format) =>
        set({ defaultFormat: format }),

      setDefaultUnits: (units) =>
        set({ defaultUnits: units }),

      setDefaultCategory: (category) =>
        set({ defaultCategory: category }),

      addToRecentPrompts: (prompt) =>
        set((state) => {
          // Remove duplicates and limit to 10
          const newPrompts = [
            prompt,
            ...state.recentPrompts.filter((p) => p !== prompt),
          ].slice(0, 10);

          return { recentPrompts: newPrompts };
        }),

      clearRecentPrompts: () =>
        set({ recentPrompts: [] }),

      resetPreferences: () =>
        set(DEFAULT_PREFERENCES),
    }),
    {
      name: 'metalink-cad-preferences',
      partialize: (state) => ({
        defaultFormat: state.defaultFormat,
        defaultUnits: state.defaultUnits,
        defaultCategory: state.defaultCategory,
        recentPrompts: state.recentPrompts,
      }),
    }
  )
);


