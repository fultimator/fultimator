// Styled primitives shared by the PC sheets.
import { styled } from "@mui/system";
import { Box, LinearProgress } from "@mui/material";
import ReactMarkdown from "/src/components/common/Markdown";

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
  "@container (max-width: 319px)": { gridTemplateColumns: "repeat(3, 1fr)" },
}));

export const AffinityCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 2px",
  borderTop: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  "@container (max-width: 319px)": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:nth-of-type(3n)": { borderRight: "none" },
    "&:nth-last-of-type(-n+3)": { borderBottom: "none" },
  },
  "&:last-child": { borderRight: "none" },
}));

export const StyledMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  whiteSpace: "pre-line",
  fontFamily: ["PFU Sans Narrow", "sans-serif"].join(","),
  "& p": {
    margin: "4px 0",
    fontSize: "0.8rem",
    lineHeight: 1.45,
    fontFamily: ["PFU Sans Narrow", "sans-serif"].join(","),
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
