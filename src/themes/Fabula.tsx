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
      paper: "#1e1e1e",
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
            backgroundColor: "#2b2b2b", // Darker background for textfield
            borderColor: "#555555", // Lighter border color for better contrast
            '&:hover fieldset': {
              borderColor: "#ffffff", // White border on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: "#ffffff", // White border when focused
            },
            '& .MuiInputBase-input': {
              color: "#ffffff", // White text color for better readability in dark mode
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
            backgroundColor: "#2b4b42",
            "&:hover": {
              backgroundColor: "#47645b",
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
          color: "#85C3B1",
          "&.Mui-checked": {
            color: "#85C3B1",
          },
          "&.Mui-disabled": {
            color: "#47645b1A",
          },
          "&:hover": {
            backgroundColor: "#192E201A",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#85C3B1",
            "& + .MuiSwitch-track": {
              backgroundColor: "#47645b",
            },
          },
        },
        thumb: {
          backgroundColor: "#85C3B1", 
        },
        track: {
          backgroundColor: "#1e1e1e",
          transition: "background-color 0.3s",
          border: "1px solid #47645b",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#85C3B1",
        },
        thumb: {
          backgroundColor: "#85C3B1",
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "#47645b", 
          },
          "&.Mui-disabled": {
            backgroundColor: "#47645b1A", 
          },
        },
        track: {
          backgroundColor: "#85C3B1",
        },
        rail: {
          backgroundColor: "#47645b",
        },
        mark: {
          backgroundColor: "#47645b", 
        },
        markActive: {
          backgroundColor: "#85C3B1", 
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#85C3B1", // Secondary
          "&.Mui-checked": {
            color: "#85C3B1",  // Secondary
          },
          "&.Mui-disabled": {
            color: "#47645b1A", // Quaternary with 10% opacity
          },
          "&:hover": {
            backgroundColor: "#192E201A", // Ternary with 10% opacity
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

export { lightFabula, darkFabula };
