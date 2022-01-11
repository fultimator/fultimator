import { Typography } from "@mui/material";

export function OpenBracket() {
  return (
    <Typography component="span" sx={{ ml: -1, mr: 0.3 }}>
      【
    </Typography>
  );
}

export function CloseBracket() {
  return (
    <Typography component="span" sx={{ mr: -0.7 }}>
      】
    </Typography>
  );
}
