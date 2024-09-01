import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";

// Light Mode Theme
const lightFabula = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#2b4b42",
    },
    secondary: {
      main: "#85C3B1",
    },
    ternary: {
      main: "#e9f3ea",
    },
    quaternary: {
      main: "#47645b",
    },
    background: {
      default: "#e2f3ee",
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
    }
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
});

// Dark Mode Theme
const darkFabula = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#2b4b42",
    },
    secondary: {
      main: "#85C3B1",
    },
    ternary: {
      main: "#192E20",
    },
    quaternary: {
      main: "#47645b",
    },
    background: {
      default: "#1a1a1a",
      paper: "#121212",
    },
    red: {
      main: "#A71C22",
    },
    cyan: {
      main: "#008BBF",
    },
    black: {
      main: "#0E0F0F",
    },
    white: {
      main: "#ffffff",
    },
    purple: {
      main: "#794a75",
    },
    error: {
      main: "#d1232a",
    }
  } as PaletteOptions,
  typography: {
    fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
    body1: {
      lineHeight: 1.45,
      color: "#e0e0e0",
    },
    body2: {
      lineHeight: 1.43,
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
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#b0b0b0",
          '&.Mui-focused': {
            color: "#ffffff",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.23)",
          color: "#ffffff",
          '&:hover': {
            borderColor: "#ffffff",
            backgroundColor: "#333333",
            color: "#ffffff",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {},
            '&:hover fieldset': {},
            '&.Mui-focused fieldset': {
              borderColor: "#ffffff",
            },
          },
        },
      },
    },
  },
});

export { lightFabula, darkFabula };
