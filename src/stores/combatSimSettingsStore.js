import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultSettings } from '../utility/combatSimSettings';

// Create a store with persistence
export const useCombatSimSettingsStore = create(
  persist(
    (set, get) => ({
      // Initialize with empty settings, we'll load defaults on first access
      settings: {},
      
      // Check if store is initialized with defaults
      isInitialized: false,
      
      // Initialize settings with defaults
      initializeSettings: () => {
        const defaultSettings = getDefaultSettings();
        set({ settings: defaultSettings, isInitialized: true });
      },
      
      // Get the current settings
      getSettings: () => get().settings,
      
      // Update a single setting
      updateSetting: (name, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [name]: value
          }
        }));
      },
      
      // Update multiple settings at once
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings
          }
        }));
      },
      
      // Reset all settings to defaults
      resetToDefaults: () => {
        const defaultSettings = getDefaultSettings();
        set({ settings: defaultSettings });
      }
    }),
    {
      name: 'combat-sim-settings', // localStorage key
      partialize: (state) => ({ settings: state.settings }) // Only persist the settings
    }
  )
);