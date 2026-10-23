import { Theme } from "@mui/material/styles";

import { lightFabula, darkFabula } from "./Fabula";
import { lightHigh, darkHigh } from "./High";
import { lightTechno, darkTechno } from "./Techno";
import { lightNatural, darkNatural } from "./Natural";
import { lightBravely, darkBravely } from "./Bravely";
import { lightObscura, darkObscura } from "./Obscura";
import { lightNoir, darkNoir } from "./Noir";
import { lightClearBlue, darkClearBlue } from "./ClearBlue";
import { lightMidnightBlue, darkMidnightBlue } from "./MidnightBlue";

import type { ThemeValue, StyleProfileValue } from "../store/themeStore";

export const THEMES_REGISTRY: Record<
  ThemeValue,
  { light: Theme; dark: Theme }
> = {
  Fabula: { light: lightFabula, dark: darkFabula },
  High: { light: lightHigh, dark: darkHigh },
  Techno: { light: lightTechno, dark: darkTechno },
  Natural: { light: lightNatural, dark: darkNatural },
  Bravely: { light: lightBravely, dark: darkBravely },
  Obscura: { light: lightObscura, dark: darkObscura },
  Noir: { light: lightNoir, dark: darkNoir },
  ClearBlue: { light: lightClearBlue, dark: darkClearBlue },
  MidnightBlue: { light: lightMidnightBlue, dark: darkMidnightBlue },
};

export const THEME_DEFAULT_PROFILE_MAP: Record<ThemeValue, string> = {
  Fabula: "flat",
  High: "flat",
  Techno: "flat",
  Natural: "flat",
  Bravely: "regalia",
  Obscura: "noir",
  Noir: "noir",
  ClearBlue: "dystopian",
  MidnightBlue: "dystopian",
};

export const STYLE_PROFILE_MAP: Record<StyleProfileValue, string> = {
  ThemeDefault: "default",
  Flat: "flat",
  Regalia: "regalia",
  Dystopian: "dystopian",
  Noir: "noir",
};
