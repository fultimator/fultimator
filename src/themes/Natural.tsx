import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";
import { createThemeComponents } from "./themeComponentFactory";

// Light Mode Theme
const lightNatural = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8d4c24",
    },
    secondary: {
      main: "#dccdc4",
    },
    ternary: {
      main: "#f4e0c1",
    },
    quaternary: {
      main: "#756449",
    },
    background: {
      default: "#fdf6eb",
      paper: "#ffffff",
    },
    red: {
      main: "#d1232a",
    },
    cyan: {
      main: "#00aeef",
    },
    black: {
      main: "#000000",
    },
    white: {
      main: "#ffffff",
    },
    purple: {
      main: "#794a75",
    },
    error: {
      main: "#d1232a",
    },
  } as PaletteOptions,
  typography: {
    fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
    body1: {
      lineHeight: 1.45,
      color: "#333333",
    },
    body2: {
      lineHeight: 1.45,
      color: "#555555",
    },
    h1: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "2em",
      lineHeight: 1.618,
    },
    h2: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "1.5em",
      lineHeight: 1.618,
    },
    h3: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "1.17em",
      lineHeight: 1.618,
    },
    h4: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "1em",
      lineHeight: 1.618,
    },
    h5: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "0.83em",
      lineHeight: 1.618,
    },
    h6: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "0.75em",
      lineHeight: 1.618,
    },
  },
  components: createThemeComponents({
    mode: "light",
    primary: "#8d4c24",
    secondary: "#dccdc4",
    ternary: "#f4e0c1",
    quaternary: "#756449",
    paper: "#ffffff",
    profile: "flat",
  }),
});

// Dark Mode Theme
const darkNatural = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8d4c24",
    },
    secondary: {
      main: "#dccdc4",
    },
    ternary: {
      main: "#51370E",
    },
    quaternary: {
      main: "#756449",
    },
    background: {
      default: "#1a1a1a",
      paper: "#1e1e1e",
    },
    red: {
      main: "#d1232a",
    },
    cyan: {
      main: "#00aeef",
    },
    black: {
      main: "#000000",
    },
    white: {
      main: "#ffffff",
    },
    purple: {
      main: "#794a75",
    },
    error: {
      main: "#d1232a",
    },
  } as PaletteOptions,
  typography: {
    fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
    body1: {
      lineHeight: 1.45,
      color: "#e0e0e0",
    },
    body2: {
      lineHeight: 1.45,
      color: "#b0b0b0",
    },
    h1: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "2em",
      lineHeight: 1.618,
    },
    h2: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "1.5em",
      lineHeight: 1.618,
    },
    h3: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "1.17em",
      lineHeight: 1.618,
    },
    h4: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "1em",
      lineHeight: 1.618,
    },
    h5: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "0.83em",
      lineHeight: 1.618,
    },
    h6: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "0.75em",
      lineHeight: 1.618,
    },
  },
  components: createThemeComponents({
    mode: "dark",
    primary: "#8d4c24",
    secondary: "#dccdc4",
    ternary: "#51370E",
    quaternary: "#756449",
    paper: "#1e1e1e",
    profile: "flat",
  }),
});

export { lightNatural, darkNatural };
