import {createTheme} from "@mui/material/styles";

const Natural = createTheme({
  palette: {
    primary: {
      main: "#765f43",
    },
    secondary: {
      main: "#dccdc4",
    },
    ternary: {
      main: "#fff3ec",
    },
    quaternary: {
      main: "#756449",
    },
    background: {
      default: "#fdf6eb",
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

export default Natural;
