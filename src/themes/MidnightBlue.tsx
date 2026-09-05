import { createTheme } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles";
import { createThemeComponents } from "./themeComponentFactory";

// Light Mode Theme
const lightMidnightBlue = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#31459a",
    },
    secondary: {
      main: "#4f65ba",
    },
    ternary: {
      main: "#d3d9ff",
    },
    quaternary: {
      main: "#141f63",
    },
    background: {
      default: "#c8d0ff",
      paper: "#e8ecff",
    },
    text: {
      primary: "#111a4a",
      secondary: "#2f3f78",
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
      color: "#111a4a",
    },
    body2: {
      lineHeight: 1.45,
      color: "#2f3f78",
    },
    h1: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "2em",
      lineHeight: 1.618,
    },
    h2: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "1.2em",
      lineHeight: 1.5,
    },
    h3: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "1.05em",
      lineHeight: 1.5,
    },
    h4: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "1em",
      lineHeight: 1.5,
    },
    h5: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "0.83em",
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "0.75em",
      lineHeight: 1.5,
    },
  },
  components: {
    ...createThemeComponents({
      mode: "light",
      primary: "#31459a",
      secondary: "#4f65ba",
      ternary: "#d3d9ff",
      quaternary: "#141f63",
      paper: "#e8ecff",
      profile: "dystopian",
      appBarGradient: true,
    }),
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "inherit",
          textShadow: "none",
        },
      },
    },
  },
});

// Dark Mode Theme
const darkMidnightBlue = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#31459a",
    },
    secondary: {
      main: "#4f65ba",
    },
    ternary: {
      main: "#101a58",
    },
    quaternary: {
      main: "#0d164a",
    },
    background: {
      default: "#0b1240",
      paper: "#141f63",
    },
    text: {
      primary: "#f3f8ff",
      secondary: "#dbe8ff",
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
      color: "#f3f8ff",
    },
    body2: {
      lineHeight: 1.45,
      color: "#dbe8ff",
    },
    h1: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "2em",
      lineHeight: 1.618,
    },
    h2: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "1.2em",
      lineHeight: 1.5,
    },
    h3: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "1.05em",
      lineHeight: 1.5,
    },
    h4: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "1em",
      lineHeight: 1.5,
    },
    h5: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "0.83em",
      lineHeight: 1.5,
    },
    h6: {
      fontFamily: ['"PT Sans Narrow"', "sans-serif"].join(","),
      fontSize: "0.75em",
      lineHeight: 1.5,
    },
  },
  components: {
    ...createThemeComponents({
      mode: "dark",
      primary: "#31459a",
      secondary: "#4f65ba",
      ternary: "#101a58",
      quaternary: "#0d164a",
      paper: "#141f63",
      profile: "dystopian",
      appBarGradient: true,
    }),
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#f3f8ff",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)",
        },
      },
    },
  },
});

export { lightMidnightBlue, darkMidnightBlue };
