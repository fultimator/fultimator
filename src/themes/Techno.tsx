import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";

// Light Mode Theme
const lightTechno = createTheme({
  palette: {
    mode: "light",
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
      main: "#2f4f4f",
    },
    background: {
      default: "#e0e6e9",
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
const darkTechno = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#406376",
    },
    secondary: {
      main: "#879da9",
    },
    ternary: {
      main: "#212425",
    },
    quaternary: {
      main: "#1A1D1E",
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
          "&.Mui-focused": {
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
          "&:hover": {
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
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#2b2b2b", // Darker background for textfield
            borderColor: "#555555", // Lighter border color for better contrast
            "&:hover fieldset": {
              borderColor: "#ffffff", // White border on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ffffff", // White border when focused
            },
            "& .MuiInputBase-input": {
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
            borderColor: "#fff",
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
            backgroundColor: "#406376",
            "&:hover": {
              backgroundColor: "#1A1D1E",
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
          color: "#879da9",
          "&.Mui-checked": {
            color: "#879da9",
          },
          "&.Mui-disabled": {
            color: "#1A1D1E1A",
          },
          "&:hover": {
            backgroundColor: "#2124251A",
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#879da9",
            "& + .MuiSwitch-track": {
              backgroundColor: "#879da9",
            },
          },
        },
        thumb: {
          backgroundColor: "#406376",
        },
        track: {
          backgroundColor: "#1e1e1e",
          transition: "background-color 0.3s",
          border: "1px solid  #879da9",
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#879da9",
        },
        thumb: {
          backgroundColor: "#879da9",
          "&:hover, &.Mui-focusVisible": {
            backgroundColor: "#1A1D1E",
          },
          "&.Mui-disabled": {
            backgroundColor: "#1A1D1E1A",
          },
        },
        track: {
          backgroundColor: "#879da9",
        },
        rail: {
          backgroundColor: "#1A1D1E",
        },
        mark: {
          backgroundColor: "#1A1D1E",
        },
        markActive: {
          backgroundColor: "#879da9",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#879da9", // Secondary
          "&.Mui-checked": {
            color: "#879da9", // Secondary
          },
          "&.Mui-disabled": {
            color: "#1A1D1E1A", // Quaternary with 10% opacity
          },
          "&:hover": {
            backgroundColor: "#2124251A", // Ternary with 10% opacity
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

export { lightTechno, darkTechno };
