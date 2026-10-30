import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";
import { createThemeComponents } from "./themeComponentFactory";

const lightNoir = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f1f1f",
    },
    secondary: {
      main: "#4a4a4a",
    },
    ternary: {
      main: "#f0f0f0",
    },
    quaternary: {
      main: "#2f2f2f",
    },
    background: {
      default: "#dcdcdc",
      paper: "#f7f7f7",
    },
    text: {
      primary: "#151515",
      secondary: "#333333",
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
      color: "#1a1a1a",
    },
    body2: {
      lineHeight: 1.45,
      color: "#353535",
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
    primary: "#1f1f1f",
    secondary: "#4a4a4a",
    ternary: "#f0f0f0",
    quaternary: "#2f2f2f",
    paper: "#f7f7f7",
    profile: "noir",
  }),
});

const darkNoir = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0f0f0f",
    },
    secondary: {
      main: "#2b2b2b",
    },
    ternary: {
      main: "#070707",
    },
    quaternary: {
      main: "#4d4d4d",
    },
    background: {
      default: "#000000",
      paper: "#050505",
    },
    text: {
      primary: "#f2f2f2",
      secondary: "#cdcdcd",
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
      color: "#f2f2f2",
    },
    body2: {
      lineHeight: 1.45,
      color: "#cdcdcd",
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
    primary: "#0f0f0f",
    secondary: "#2b2b2b",
    ternary: "#070707",
    quaternary: "#4d4d4d",
    paper: "#050505",
    profile: "noir",
  }),
});

export { lightNoir, darkNoir };
