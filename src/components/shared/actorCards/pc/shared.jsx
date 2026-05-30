import { styled } from "@mui/system";
import { Box, LinearProgress, Paper, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";

export const GradientLinearProgress = styled(LinearProgress)(
  ({ theme, color1, color2 }) => ({
    height: 18,
    [theme.breakpoints.down("sm")]: { height: 14 },
    borderRadius: 0,
    backgroundColor: "transparent",
    "& .MuiLinearProgress-bar": {
      background: `linear-gradient(to right, ${color1}, ${color2})`,
      borderRadius: 0,
      transition: "width 1s ease-in-out",
    },
  }),
);

export const StatBarWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  "& .stat-label": {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    fontFamily: "'Antonio', fantasy, sans-serif",
    fontWeight: "bold",
    fontSize: "0.72rem",
    [theme.breakpoints.down("sm")]: { fontSize: "0.6rem" },
    [theme.breakpoints.up("md")]: { fontSize: "0.8rem" },
    [theme.breakpoints.up("lg")]: { fontSize: "0.88rem" },
    letterSpacing: "0.04em",
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.6)",
  },
}));

export const CombatStatCard = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  border: `0.5px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: "3px 6px",
  [theme.breakpoints.up("md")]: { padding: "4px 8px" },
  [theme.breakpoints.up("lg")]: { padding: "5px 10px" },
  textAlign: "center",
  flex: 1,
}));

export const AffinityStrip = styled(Box)(() => ({
  display: "grid",
  gridTemplateColumns: "repeat(9, 1fr)",
  // container query: collapse to 3-col only on very narrow containers (<320px)
  "@container (max-width: 319px)": { gridTemplateColumns: "repeat(3, 1fr)" },
}));

export const AffinityCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 2px",
  borderTop: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  // 3-col wrap rules only kick in when the strip itself is 3-col
  "@container (max-width: 319px)": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:nth-of-type(3n)": { borderRight: "none" },
    "&:nth-last-of-type(-n+3)": { borderBottom: "none" },
  },
  "&:last-child": { borderRight: "none" },
}));

export const StyledMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  whiteSpace: "pre-line",
  fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
  "& p": {
    margin: "4px 0",
    fontSize: "0.8rem",
    lineHeight: 1.45,
    fontFamily: ["PT Sans Narrow", "sans-serif"].join(","),
    [theme.breakpoints.up("sm")]: { fontSize: "0.9rem" },
    [theme.breakpoints.up("md")]: { fontSize: "0.95rem" },
    [theme.breakpoints.up("lg")]: { fontSize: "1rem", lineHeight: 1.55 },
  },
  "& p:first-of-type": { marginTop: 0 },
  "& p:last-of-type": { marginBottom: 0 },
}));

export const SectionHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  padding: "2px 8px",
}));

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
