import {createTheme} from "@mui/material/styles";
import ExtendedTheme from "./../types/Theme";

const Techno = createTheme({
  palette: {
    primary: {
      main: "#406376",
    },
    secondary: {
      main: "#879da9",
    },
    ternary: {
      main: "#eaf0f4",
    },
    quaternary: {
      main: "#607989",
    },
    background: {
      default: "#e3edf4",
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

export default Techno;
