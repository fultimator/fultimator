import { Theme } from "@mui/material/styles";
import { ThemeCustomization } from "./themeCustomization";

export interface ResolvedPalette {
  primary: string;
  secondary: string;
  ternary: string;
  quaternary: string;
  paper: string;
}

export function resolveThemePalette(
  baseTheme: Theme,
  customization: ThemeCustomization,
): ResolvedPalette {
  return {
    primary: customization.primaryColor ?? baseTheme.palette.primary.main,
    secondary: customization.secondaryColor ?? baseTheme.palette.secondary.main,
    ternary: customization.ternaryColor ?? baseTheme.palette.ternary.main,
    quaternary:
      customization.quaternaryColor ?? baseTheme.palette.quaternary.main,
    paper: baseTheme.palette.background.paper,
  };
}
