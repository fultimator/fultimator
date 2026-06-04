import { alpha, useTheme } from "@mui/material/styles";

export const DAMAGE_TYPES = [
  "physical",
  "air",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
  "untyped",
];

export function useBarShell() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return {
    theme,
    isDark,
    shellBg: alpha(theme.palette.primary.main, isDark ? 0.26 : 0.16),
    shellBorder: alpha(theme.palette.primary.main, isDark ? 0.72 : 0.45),
    labelBg: alpha(theme.palette.primary.main, isDark ? 0.62 : 0.5),
    labelBorder: alpha(theme.palette.common.white, isDark ? 0.3 : 0.5),
    trackBg: alpha(theme.palette.primary.main, isDark ? 0.4 : 0.28),
  };
}

export const LABEL_SX = {
  width: 64,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  fontFamily: "Antonio",
  fontWeight: "bold",
  fontSize: "0.95rem",
  color: "#fff",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export const VALUE_SX = {
  width: 64,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Antonio",
  fontWeight: "bold",
  fontSize: "0.95rem",
  color: "#fff",
};
