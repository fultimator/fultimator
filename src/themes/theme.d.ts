import '@mui/material/styles';

// Extend the Palette and PaletteOptions interfaces
declare module '@mui/material/styles' {
  interface Palette {
    ternary: PaletteColor;
    quaternary: PaletteColor;
    red: PaletteColor;
    cyan: PaletteColor;
    black: PaletteColor;
    white: PaletteColor;
    purple: PaletteColor;
    transparent: PaletteColor;
  }

  interface PaletteOptions {
    ternary?: PaletteColorOptions;
    quaternary?: PaletteColorOptions;
    red?: PaletteColorOptions;
    cyan?: PaletteColorOptions;
    black?: PaletteColorOptions;
    white?: PaletteColorOptions;
    purple?: PaletteColorOptions;
    transparent?: PaletteColorOptions;
  }
}
