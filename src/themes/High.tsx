import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";

// Light Mode Theme
const lightHigh = createTheme({
  palette: {
    mode: 'light',
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
});

// Dark Mode Theme
const darkHigh = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#6B1220",
    },
    secondary: {
      main: "#725759",
    },
    ternary: {
      main: "#421804",
    },
    quaternary: {
      main: "#a24b4d",
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: () => ({
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor:  "#fff",
          },
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#2b2b2b",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#6B1220",
            "&:hover": {
              backgroundColor: "#a24b4d",
            },
          },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e",
          color: "#ffffff",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#725759",
          "&.Mui-checked": {
            color: "#725759",
          },
          "&.Mui-disabled": {
            color: "#a24b4d1A",
          },
          "&:hover": {
            backgroundColor: "#4218041A",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#725759",
            "& + .MuiSwitch-track": {
              backgroundColor: "#a24b4d",
            },
          },
        },
        thumb: {
          backgroundColor: "#725759", 
        },
        track: {
          backgroundColor: "#1e1e1e",
          transition: "background-color 0.3s",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#725759",
        },
        thumb: {
          backgroundColor: "#725759",
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "#a24b4d", 
          },
          "&.Mui-disabled": {
            backgroundColor: "#a24b4d1A", 
          },
        },
        track: {
          backgroundColor: "#725759",
        },
        rail: {
          backgroundColor: "#a24b4d",
        },
        mark: {
          backgroundColor: "#a24b4d", 
        },
        markActive: {
          backgroundColor: "#725759", 
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#725759", // Secondary
          "&.Mui-checked": {
            color: "#725759", // Secondary
          },
          "&.Mui-disabled": {
            color: "#a24b4d1A", // Quaternary with 10% opacity
          },
          "&:hover": {
            backgroundColor: "#4218041A", // Ternary with 10% opacity
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#fff",
          "&.Mui-focused": {
            color: "#fff",
          },
        },
      },
    },
  },
});

export { lightHigh, darkHigh };
