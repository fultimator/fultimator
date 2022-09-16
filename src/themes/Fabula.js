import {createTheme} from "@mui/material/styles";

const Fabula = createTheme({
  palette: {
    primary: {
      main: "#264137",
    },
    secondary: {
      main: "#85C3B1",
    },
    background: {
      default: "#E2F3EE",
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
  },
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

export default Fabula;
