import React from "react";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { useTranslate } from "../../../translation/translate";

export default function PlayerWeapons() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  return (
    <Typography
      variant="h2"
      component="legend"
      sx={{
        color: primary,
        textTransform: "uppercase",
        padding: "5px 10px",
        borderRadius: 0,
        margin: "0 0 0 0",
        fontSize: "1.5em",
      }}
    >
      {t("Weapons")}
    </Typography>
  );
}
