import { useContext } from "react";
import { ThemeContext } from "../ThemeContextSetup";

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "Oops! It seems like useThemeContext is not wrapped in a ThemeProvider.",
    );
  }
  return context;
};
