import {createTheme} from "@mui/material/styles";
import ExtendedTheme from "./../types/Theme";

const Midnight = createTheme({
  palette: {
    primary: {
      main: "#1B1F47",
    },
    secondary: {
      main: "#9176AC",
    },
    ternary: {
      main: "#E1E7FF",
    },
    quaternary: {
      main: "#4C5D8B",
    },
    background: {
      default: "#D9E3FF",
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
  } as ExtendedTheme['palette'],
  typography: {
    fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
    h1: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
      fontSize: "2rem"
    },
    h2: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
    },
    h3: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
    },
    h4: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
    },
    h5: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
    },
    h6: {
      fontFamily: ["Antonio", "sans-serif"].join(","),
    },
  },
});

export default Midnight;
