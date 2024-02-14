import React, { createContext, useContext, ReactNode, useState } from 'react';
import Fabula from './themes/Fabula';
import High from './themes/High';
import Techno from './themes/Techno';
import Natural from './themes/Natural';
import Midnight from './themes/Midnight';

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeContextProps {
  selectedTheme: string;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const storedTheme = localStorage.getItem('selectedTheme') || 'Fabula';
  const [selectedTheme, setSelectedTheme] = useState<string>(storedTheme);
  const themes = {
    Fabula,
    High,
    Techno,
    Natural,
    Midnight,
  };

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setSelectedTheme(themeName);
      localStorage.setItem('selectedTheme', themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ selectedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Oops! It seems like useThemeContext is not wrapped in a ThemeProvider.');
  }
  return context;
};

export { ThemeProvider, useThemeContext };
