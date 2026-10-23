import { useTheme } from "@mui/material/styles";
import type { Components, Theme } from "@mui/material/styles";

// Define a CustomTheme interface to include all theme properties you need
interface CustomTheme {
  primary: string;
  secondary: string;
  ternary: string;
  quaternary: string;
  white: string;
  transparent: string;
  mode: "light" | "dark";
  panelRadius: number;
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  breakpoints: Theme["breakpoints"];
  spacing: Theme["spacing"];
  typography: Theme["typography"];
  zIndex: Theme["zIndex"];
}

// Custom hook to access theme variables
export const useCustomTheme = (): CustomTheme => {
  const theme = useTheme<Theme>();

  const paperOverrides = (
    theme.components?.MuiPaper as Components<Theme>["MuiPaper"]
  )?.styleOverrides?.root;
  const panelRadius =
    typeof paperOverrides === "object" &&
    paperOverrides !== null &&
    !Array.isArray(paperOverrides) &&
    "borderRadius" in paperOverrides &&
    typeof (paperOverrides as { borderRadius?: unknown }).borderRadius ===
      "number"
      ? ((paperOverrides as { borderRadius: number }).borderRadius ?? 4)
      : 4;

  return {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    ternary: theme.palette.ternary?.main || "",
    quaternary: theme.palette.quaternary?.main || "",
    white: theme.palette.common.white,
    panelRadius,
    transparent:
      theme.palette.mode === "dark"
        ? "rgba(0, 0, 0, 0)"
        : "rgba(255, 255, 255, 0)",
    mode: theme.palette.mode,
    background: {
      default: theme.palette.background.default,
      paper: theme.palette.background.paper,
    },
    text: {
      primary: theme.palette.text.primary,
      secondary: theme.palette.text.secondary,
    },
    breakpoints: theme.breakpoints,
    spacing: theme.spacing,
    typography: theme.typography,
    zIndex: theme.zIndex,
  };
};
