import React, { createContext, useContext, ReactNode, useState } from 'react';

interface ThemeContextProps {
  selectedTheme: ThemeValue;
  isDarkMode: boolean;
  setTheme: (theme: ThemeValue) => void;
  toggleDarkMode: () => void;
}

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Bravely" | "Obscura";

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>(() => {
    return (localStorage.getItem("selectedTheme") as ThemeValue) || "Fabula";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem("isDarkMode");
      return storedValue ? JSON.parse(storedValue) : false;
    } catch {
      // If parsing fails, fallback to default value
      return false;
    }
  });

  const setTheme = (theme: ThemeValue) => {
    setSelectedTheme(theme);
    localStorage.setItem("selectedTheme", theme);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem("isDarkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ selectedTheme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Oops! It seems like useThemeContext is not wrapped in a ThemeProvider.');
  }
  return context;
};
