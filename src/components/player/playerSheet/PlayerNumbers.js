import React from "react";
import { Paper, Grid, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { ReactComponent as ZenitIcon } from "../../svgs/zenit.svg";
import { ReactComponent as ExpIcon } from "../../svgs/exp.svg";
import { ReactComponent as FabulaIcon } from "../../svgs/fabula.svg";

export default function PlayerNumbers({ player, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      <Grid container spacing={{ xs: 1, md: 2 }} sx={{ padding: "1em" }} alignItems="center" justifyContent="center" direction={{ xs: "row", md: "row" }}>
        <Grid item xs={4} md={4}>
          <Typography variant="h6" sx={{ fontSize: { xs: "1.2em", md: "1.6em" }, textAlign: "center" }}>
            <span
              style={{
                fontWeight: "bolder",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>
                {t("Fabula Points")}
                {":"}
              </span>
              <span style={{ marginLeft: "4px", fontSize: { xs: "1em", md: "1.4em" } }}>
                {player.info.fabulapoints}
              </span>
              <FabulaIcon
                style={{ width: "24px", height: "24px", marginLeft: "4px" }}
              />
            </span>
          </Typography>
        </Grid>
        <Grid item xs={4} md={4}>
          <Typography variant="h6" sx={{ fontSize: { xs: "1.2em", md: "1.6em" }, textAlign: "center" }}>
            <span
              style={{
                fontWeight: "bolder",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>
                {isMobile ? t("Exp") : t("Experience")}
                {":"}
              </span>
              <span style={{ marginLeft: "4px", fontSize: { xs: "1em", md: "1.4em" } }}>
                {player.info.exp}
              </span>
              <ExpIcon
                style={{ width: "24px", height: "24px", marginLeft: "4px" }}
              />
            </span>
          </Typography>
        </Grid>
        <Grid item xs={4} md={4}>
          <Typography variant="h6" sx={{ fontSize: { xs: "1.2em", md: "1.6em" }, textAlign: "center" }}>
            <span
              style={{
                fontWeight: "bolder",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>
                {t("Zenit")}
                {":"}
              </span>
              <span style={{ marginLeft: "4px", fontSize: { xs: "1em", md: "1.4em" } }}>
                {player.info.zenit}
              </span>
              <ZenitIcon
                style={{ width: "24px", height: "24px", marginLeft: "4px" }}
              />
            </span>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
