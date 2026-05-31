import { Box, Typography } from "@mui/material";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

/**
 * Standard section header bar used across compact panels.
 * Matches the standardized pl/pr/pt/pb padding from BackpackTab spec.
 *
 * @param {string}    title    - section title text
 * @param {ReactNode} children - optional action buttons rendered after the title
 */
export default function CompactSectionHeader({ title, children }) {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        pl: "46px",
        pr: "6px",
        pt: "2.8px",
        pb: "2.8px",
        background: theme.primary,
      }}
    >
      <Typography
        sx={{
          flex: 1,
          color: "#fff",
          fontFamily: "Antonio",
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
