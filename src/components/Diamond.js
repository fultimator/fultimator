import { Typography } from "@mui/material";

export default function Diamond({ color }) {
  if (!color) {
    color = "#794a75";
  }
  return (
    <Typography
      color={color}
      component="span"
      fontSize="smaller"
      sx={{ verticalAlign: "text-bottom" }}
    >
      ⬥
    </Typography>
  );
}
