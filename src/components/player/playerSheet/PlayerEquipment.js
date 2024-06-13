import React from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";

export default function PlayerEquipment({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        display: "flex",
      }}
    >
      <Typography
        variant="h1"
        sx={{
          writingMode: "vertical-lr",
          textTransform: "uppercase",
          marginLeft: "-1px",
          marginRight: "10px",
          marginTop: "-1px",
          marginBottom: "-1px",
          paddingY: "10px",
          backgroundColor: primary,
          color: ternary,
          borderRadius: "0 8px 8px 0",
          transform: "rotate(180deg)",
          fontSize: "2em",
        }}
        align="center"
      >
        {t("Equipment")}
      </Typography>
      <Grid container spacing={2} sx={{ padding: "1em" }}>
        <Grid item xs={12}>
          <Typography variant="h3">{t("Main Hand")}</Typography>
          
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h3">{t("Off Hand")}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
