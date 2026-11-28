import { Typography } from "@mui/material";

export default function Diamond({ color }) {
  if (!color) {
    color = "#794a75";
  }
  return (
    <Typography
      component="span"
      sx={{
        color,
        display: "inline-block",
        width: "0.6em",
        height: "0.6em",
        lineHeight: 0,
        verticalAlign: "0.02em",
        mx: "0.05em",
      }}
    >
      <svg
        viewBox="0 0 10 10"
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
      </svg>
    </Typography>
  );
}
