import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CUSTOMIZATION,
  ThemeCustomization,
} from "../themes/themeCustomization";

/**
 * Theme System Architecture
 *
 * THEMES (ThemeValue): Color schemes - Fabula, High, Techno, etc.
 *   - Controls: palette colors (primary, secondary, ternary, quaternary)
 *
 * STYLES (StyleProfileValue): Visual moods - Flat, Regalia, Dystopian, Noir, etc.
 *   - Controls: gradients, border-radius, decorative patterns
 *
 * CUSTOMIZATION (ThemeCustomization): User overrides applied on top of theme/style
 *   - Color overrides (primary, secondary, ternary, quaternary)
 *   - Radius overrides (panelRadius, controlRadius)
 *   - Null values mean "inherit from theme preset"
 *
 * This separation ensures:
 * - Color consistency within a theme (base layer)
 * - Visual variety via style profiles without breaking readability (style layer)
 * - User customization without losing preset structure (override layer)
 */

export type ThemeValue =
  | "Fabula"
  | "High"
  | "Techno"
  | "Natural"
  | "Bravely"
  | "Obscura"
  | "Noir"
  | "ClearBlue"
  | "MidnightBlue";

export type StyleProfileValue =
  "ThemeDefault" | "Flat" | "Regalia" | "Dystopian" | "Noir";

interface ThemeStore {
  selectedTheme: ThemeValue;
  selectedStyleProfile: StyleProfileValue;
  isDarkMode: boolean;
  customization: ThemeCustomization;
  drawerOpen: boolean;
  unsavedChanges: boolean;

  setTheme: (theme: ThemeValue) => void;
  setStyleProfile: (profile: StyleProfileValue) => void;
  toggleDarkMode: () => void;
  setCustomization: (patch: Partial<ThemeCustomization>) => void;
  resetCustomization: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setUnsavedChanges: (unsaved: boolean) => void;
}

const THEME_VALUES: readonly ThemeValue[] = [
  "Fabula",
  "High",
  "Techno",
  "Natural",
  "Bravely",
  "Obscura",
  "Noir",
  "ClearBlue",
  "MidnightBlue",
];

function readLegacyThemePrefs(): {
  selectedTheme: ThemeValue;
  isDarkMode: boolean;
} {
  let selectedTheme: ThemeValue = "Fabula";
  let isDarkMode = false;
  try {
    const storedTheme = localStorage.getItem("selectedTheme");
    if (
      storedTheme &&
      (THEME_VALUES as readonly string[]).includes(storedTheme)
    ) {
      selectedTheme = storedTheme as ThemeValue;
    }
    const storedDark = localStorage.getItem("isDarkMode");
    if (storedDark) isDarkMode = JSON.parse(storedDark) === true;
  } catch {
    // Storage unavailable or value malformed; keep defaults.
  }
  return { selectedTheme, isDarkMode };
}

const legacyThemePrefs = readLegacyThemePrefs();

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      selectedTheme: legacyThemePrefs.selectedTheme,
      selectedStyleProfile: "ThemeDefault",
      isDarkMode: legacyThemePrefs.isDarkMode,
      customization: DEFAULT_CUSTOMIZATION,
      drawerOpen: false,
      unsavedChanges: false,

      setTheme: (theme) => set({ selectedTheme: theme }),
      setStyleProfile: (profile) => set({ selectedStyleProfile: profile }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

      setCustomization: (patch) =>
        set((s) => ({ customization: { ...s.customization, ...patch } })),
      resetCustomization: () => set({ customization: DEFAULT_CUSTOMIZATION }),

      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      setUnsavedChanges: (unsaved) => set({ unsavedChanges: unsaved }),
    }),
    {
      name: "theme-store",
      partialize: (state) => ({
        selectedTheme: state.selectedTheme,
        selectedStyleProfile: state.selectedStyleProfile,
        isDarkMode: state.isDarkMode,
        customization: state.customization,
      }),
    },
  ),
);
