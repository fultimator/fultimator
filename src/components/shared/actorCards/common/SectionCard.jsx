import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Shared card shell used by all player-sheet section cards.
 * Renders the primary-colored header bar + bordered Paper wrapper.
 *
 * @param {string}    title        - Header text (already translated by caller)
 * @param {ReactNode} actions      - Optional content rendered after the title (buttons, icons)
 * @param {ReactNode} children     - Card body content
 * @param {boolean}   noShadow     - Suppress elevation shadow (e.g. when embedded in a character sheet)
 * @param {object}    sx           - Extra sx forwarded to the outer Paper
 */
export default function SectionCard({ title, actions, children, noShadow = false, onHeaderClick, sx }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        border: "2px solid",
        borderColor: secondary,
        overflow: "hidden",
        ...(noShadow ? { boxShadow: "none" } : {}),
        ...sx,
      }}
    >
      <Box
        onClick={onHeaderClick}
        sx={{
          background: primary,
          px: 1,
          py: "6px",
          display: "flex",
          alignItems: "center",
          gap: 1,
          ...(onHeaderClick ? { cursor: "pointer", userSelect: "none" } : {}),
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontFamily: "Antonio",
            fontSize: { xs: "1.1rem", sm: "1.2rem" },
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            minWidth: 0,
          }}
        >
          {title}
        </Typography>
        {actions && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              "& .MuiIconButton-root": { p: "6px" },
              "& .MuiSvgIcon-root": { fontSize: "1.4rem" },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
      {children}
    </Paper>
  );
}
