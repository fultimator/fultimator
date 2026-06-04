import { Box } from "@mui/material";

export default function BarShell({ shellBg, shellBorder, minHeight, children }) {
  return (
    <Box
      sx={{
        minHeight: minHeight ?? 34,
        height: minHeight ? undefined : 34,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        bgcolor: shellBg,
        border: `1px solid ${shellBorder}`,
        borderRadius: "3px",
      }}
    >
      {children}
    </Box>
  );
}
