import { useTheme } from "@mui/material/styles";
import { Theme } from "@mui/material/styles/createTheme";

// Define a CustomTheme interface to include all theme properties you need
interface CustomTheme {
  primary: string;
  secondary: string;
  ternary: string;
  quaternary: string;
  white: string;
  transparent: string;
  mode: 'light' | 'dark';
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  breakpoints: Theme['breakpoints'];
  spacing: Theme['spacing'];
  typography: Theme['typography'];
  zIndex: Theme['zIndex'];
}

// Custom hook to access theme variables
export const useCustomTheme = (): CustomTheme => {
  const theme = useTheme<Theme>();

  return {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    ternary: theme.palette.ternary?.main || '',
    quaternary: theme.palette.quaternary?.main || '',
    white: theme.palette.common.white,
    transparent: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)',
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
