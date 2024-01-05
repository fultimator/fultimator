import {createTheme} from "@mui/material/styles";

const High = createTheme({
  palette: {
    primary: {
      main: "#861628",
    },
    secondary: {
      main: "#cd9c9f",
    },
    ternary: {
      main: "#fdeae1",
    },
    quaternary: {
      main: "#a24b4d",
    },
    background: {
      default: "#fef3ee",
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

export default High;
