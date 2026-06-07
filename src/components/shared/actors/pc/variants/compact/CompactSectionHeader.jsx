import { Box, IconButton, Typography } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

export default function CompactSectionHeader({ title, children, onToggle, isCollapsed }) {
  const theme = useCustomTheme();
  const collapsible = typeof onToggle === "function";
  return (
    <Box
      onClick={collapsible ? onToggle : undefined}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        pl: "46px",
        pr: "6px",
        pt: "2.8px",
        pb: "2.8px",
        background: theme.primary,
        ...(collapsible ? { cursor: "pointer", userSelect: "none" } : {}),
      }}
    >
      {collapsible && (
        <IconButton
          size="small"
          sx={{ position: "absolute", left: "6px", color: "#fff", p: "2px", pointerEvents: "none" }}
        >
          {isCollapsed ? (
            <KeyboardArrowDown sx={{ fontSize: "1.15rem" }} />
          ) : (
            <KeyboardArrowUp sx={{ fontSize: "1.15rem" }} />
          )}
        </IconButton>
      )}
      <Typography
        sx={{
          flex: 1,
          color: "#fff",
          fontFamily: "Antonio",
          fontSize: "0.9rem",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      {children && (
        <Box
          sx={{ display: "flex", gap: 0.25 }}
          onClick={collapsible ? (e) => e.stopPropagation() : undefined}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
