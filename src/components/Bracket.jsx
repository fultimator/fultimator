import { Typography } from "@mui/material";

// The lenticular brackets were designed for Japanese text and carry a lot of
// horizontal space in PT Sans Narrow, so negative margins pulled them in.
// The PFU Sans Narrow body font doesn't need that. Set to true to restore the
// compensation (e.g. if the body font is switched back).
const COMPENSATE_BRACKET_SPACING = false;

export function OpenBracket() {
  return (
    <Typography
      component="span"
      sx={COMPENSATE_BRACKET_SPACING ? { ml: -1, mr: 0 } : undefined}
    >
      【
    </Typography>
  );
}

export function CloseBracket() {
  return (
    <Typography
      component="span"
      // small gap so a following bonus ("】+8") doesn't touch the bracket
      sx={COMPENSATE_BRACKET_SPACING ? { mr: -0.7 } : { mr: "0.15em" }}
    >
      】
    </Typography>
  );
}
