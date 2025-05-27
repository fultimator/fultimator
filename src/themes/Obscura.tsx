import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";

// Light Mode Theme
const lightObscura = createTheme({
  palette: {
    mode: 'light',
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
const darkObscura = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#1B1F47",
    },
    secondary: {
      main: "#9176AC",
    },
    ternary: {
      main: "#202325",
    },
    quaternary: {
      main: "#4C5D8B",
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
            backgroundColor: "#1B1F47",
            "&:hover": {
              backgroundColor: "#4C5D8B",
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
          color: "#9176AC",
          "&.Mui-checked": {
            color: "#9176AC",
          },
          "&.Mui-disabled": {
            color: "#4C5D8B1A",
          },
          "&:hover": {
            backgroundColor: "#2023251A",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#9176AC",
            "& + .MuiSwitch-track": {
              backgroundColor: "#4C5D8B",
            },
          },
        },
        thumb: {
          backgroundColor: "#9176AC", 
        },
        track: {
          backgroundColor: "#1e1e1e",
          transition: "background-color 0.3s",
          border: "1px solid #4C5D8B",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#9176AC",
        },
        thumb: {
          backgroundColor: "#9176AC",
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "#4C5D8B", 
          },
          "&.Mui-disabled": {
            backgroundColor: "#4C5D8B1A", 
          },
        },
        track: {
          backgroundColor: "#9176AC",
        },
        rail: {
          backgroundColor: "#4C5D8B",
        },
        mark: {
          backgroundColor: "#4C5D8B", 
        },
        markActive: {
          backgroundColor: "#9176AC", 
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#9176AC", // Secondary
          "&.Mui-checked": {
            color: "#9176AC", // Secondary
          },
          "&.Mui-disabled": {
            color: "#4C5D8B1A", // Quaternary with 10% opacity
          },
          "&:hover": {
            backgroundColor: "#2023251A", // Ternary with 10% opacity
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

export { lightObscura, darkObscura };
