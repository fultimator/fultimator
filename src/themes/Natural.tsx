import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";

// Light Mode Theme
const lightNatural = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#8d4c24",
    },
    secondary: {
      main: "#dccdc4",
    },
    ternary: {
      main: "#f4e0c1",
    },
    quaternary: {
      main: "#756449",
    },
    background: {
      default: "#fdf6eb",
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
const darkNatural = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#8d4c24",
    },
    secondary: {
      main: "#dccdc4",
    },
    ternary: {
      main: "#51370E",
    },
    quaternary: {
      main: "#756449",
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
            backgroundColor: "#8d4c24",
            "&:hover": {
              backgroundColor: "#756449",
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
          color: "#dccdc4",
          "&.Mui-checked": {
            color: "#dccdc4",
          },
          "&.Mui-disabled": {
            color: "#7564491A",
          },
          "&:hover": {
            backgroundColor: "#51370E1A",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#dccdc4",
            "& + .MuiSwitch-track": {
              backgroundColor: "#756449",
            },
          },
        },
        thumb: {
          backgroundColor: "#dccdc4", 
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
          color: "#dccdc4",
        },
        thumb: {
          backgroundColor: "#dccdc4",
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "#756449", 
          },
          "&.Mui-disabled": {
            backgroundColor: "#7564491A", 
          },
        },
        track: {
          backgroundColor: "#dccdc4",
        },
        rail: {
          backgroundColor: "#756449",
        },
        mark: {
          backgroundColor: "#756449", 
        },
        markActive: {
          backgroundColor: "#dccdc4", 
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#dccdc4", // Secondary
          "&.Mui-checked": {
            color: "#dccdc4", // Secondary
          },
          "&.Mui-disabled": {
            color: "#7564491A", // Quaternary with 10% opacity
          },
          "&:hover": {
            backgroundColor: "#51370E1A", // Ternary with 10% opacity
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

export { lightNatural, darkNatural };
