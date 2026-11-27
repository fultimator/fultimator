import { Typography } from "@mui/material";

export default function EmptySectionText({ children }) {
  return (
    <Typography
      color="text.secondary"
      variant="body2"
      sx={{ px: 0.5, py: 0.25 }}
    >
      {children}
    </Typography>
  );
}
