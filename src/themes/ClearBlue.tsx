import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";
import { createThemeComponents } from "./themeComponentFactory";

// Light Mode Theme
const lightClearBlue = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2d5f94",
    },
    secondary: {
      main: "#9fc8ea",
    },
    ternary: {
      main: "#edf5ff",
    },
    quaternary: {
      main: "#5f88b4",
    },
    background: {
      default: "#dcecff",
      paper: "#f7fbff",
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
      color: "#1f3044",
    },
    body2: {
      lineHeight: 1.45,
      color: "#3f5874",
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
    primary: "#2d5f94",
    secondary: "#9fc8ea",
    ternary: "#edf5ff",
    quaternary: "#5f88b4",
    paper: "#f7fbff",
    profile: "default",
  }),
});

// Dark Mode Theme
const darkClearBlue = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#295a8f",
    },
    secondary: {
      main: "#0a2b4a",
    },
    success: {
      main: "#98ee99",
    },
    ternary: {
      main: "#13263d",
    },
    quaternary: {
      main: "#4f7aa9",
    },
    background: {
      default: "#0d1828",
      paper: "#13233a",
    },
    red: {
      main: "#a71c22",
    },
    cyan: {
      main: "#008bbf",
    },
    black: {
      main: "#0e0f0f",
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
      color: "#d5e7fb",
    },
    body2: {
      lineHeight: 1.43,
      color: "#a9c0dc",
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
    primary: "#295a8f",
    secondary: "#0a2b4a",
    ternary: "#13263d",
    quaternary: "#4f7aa9",
    paper: "#13233a",
    profile: "default",
    successColor: "#98ee99",
  }),
});

export { lightClearBlue, darkClearBlue };
