import { Theme } from "@mui/material/styles";

interface ExtendedTheme extends Theme {
  palette: {
    primary: {
      main: string;
    };
    secondary: {
      main: string;
    };
    ternary: {
      main: string;
    };
    quaternary: {
      main: string;
    };
    background: {
      default: string;
    };
    red: {
      main: string;
    };
    cyan: {
      main: string;
    };
    black: {
      main: string;
    };
    white: {
      main: string;
    };
    purple: {
      main: string;
    };
  };
}

export default ExtendedTheme;
