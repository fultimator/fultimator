import type { Theme } from "@mui/material/styles";

export function selectedToggleSx(theme: Theme) {
  const isDark = theme.palette.mode === "dark";
  return {
    color: isDark ? theme.palette.text.primary : theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
    borderColor: isDark
      ? theme.palette.text.secondary
      : theme.palette.primary.main,
  };
}
