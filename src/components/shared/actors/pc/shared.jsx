import { Box, Paper, Typography } from "@mui/material";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

/**
 * Section-style Paper wrapper with a primary-color header bar.
 * Used by panels like PcClasses and PcTraitsDescription.
 *
 * Props:
 *   title    - section title text (string)
 *   actions  - optional node rendered on the right side of the header
 *   bodyPx/Py- padding for the body box (defaults match existing panels)
 *   children - body content
 */
export function SectionPanel({
  title,
  actions,
  bodyPx = 1,
  bodyPy = 1,
  children,
  paperSx,
  headerSx,
  bodySx,
}) {
  const theme = useCustomTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "8px",
        overflow: "hidden",
        border: "2px solid",
        borderColor: theme.secondary,
        ...paperSx,
      }}
    >
      <Box
        sx={{
          background: theme.primary,
          px: 1,
          py: "2px",
          display: "flex",
          alignItems: "center",
          borderRadius: "8px 8px 0 0",
          ...headerSx,
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
            flex: 1,
          }}
        >
          {title}
        </Typography>
        {actions}
      </Box>
      <Box sx={{ px: bodyPx, py: bodyPy, ...bodySx }}>{children}</Box>
    </Paper>
  );
}
