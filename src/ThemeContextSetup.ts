import { createContext } from "react";

export interface ThemeContextProps {
  selectedTheme: ThemeValue;
  isDarkMode: boolean;
  setTheme: (theme: ThemeValue) => void;
  toggleDarkMode: () => void;
}

export type ThemeValue =
  | "Fabula"
  | "High"
  | "Techno"
  | "Natural"
  | "Bravely"
  | "Obscura";

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined,
);
