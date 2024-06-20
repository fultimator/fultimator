import React from "react";
import { Grid, Typography, Paper, Button, ButtonGroup, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";

export default function PlayerControls({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const changeStat = (stat, value) => () => {
    setPlayer((prevPlayer) => {
      const current = Math.max(
        0,
        Math.min(
          prevPlayer.stats[stat].current + value,
          prevPlayer.stats[stat].max
        )
      );
      return {
        ...prevPlayer,
        stats: {
          ...prevPlayer.stats,
          [stat]: { ...prevPlayer.stats[stat], current },
        },
      };
    });
  };

  const renderStatControls = (stat, label, color, increments) => {
    const negativeIncrements = increments.filter((val) => val < 0);
    const positiveIncrements = increments.filter((val) => val > 0);

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4} sm={1}>
          <Typography variant="h2" sx={{ minWidth: "50px" }}>
            {t(label)}
          </Typography>
        </Grid>
        <Grid item xs={4} sm={stat === "hp" ? 1 : 2}>
          <Button
            variant="contained"
            color={color}
            onClick={changeStat(stat, player.stats[stat].max)}
          >
            {t("Full")}
          </Button>
        </Grid>
        {stat === "hp" && (
          <Grid item xs={4} sm={1}>
            <Button
              variant="contained"
              color="warning"
              onClick={changeStat(
                "hp",
                Math.floor(player.stats.hp.max / 2) - player.stats.hp.current
              )}
            >
              {t("Half")}
            </Button>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm="auto">
              <ButtonGroup variant="outlined" size="small" color={color}>
                {negativeIncrements.map((val) => (
                  <Button key={val} onClick={changeStat(stat, val)}>
                    {val}
                  </Button>
                ))}
              </ButtonGroup>
            </Grid>
            <Grid item xs={12} sm="auto">
              <ButtonGroup variant="outlined" size="small" color={color}>
                {positiveIncrements.map((val) => (
                  <Button key={val} onClick={changeStat(stat, val)}>
                    +{val}
                  </Button>
                ))}
              </ButtonGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <Divider sx={{ my: 1 }} />
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
            backgroundColor: primary,
            color: ternary,
            borderRadius: "0 8px 8px 0",
            transform: "rotate(180deg)",
            fontSize: "2em",
          }}
          align="center"
        >
          {t("Controls")}
        </Typography>
        <Grid container spacing={2} sx={{ padding: "1em" }}>
          <Grid item xs={12}>
            {renderStatControls(
              "hp",
              "HP",
              "error",
              [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20]
            )}
          </Grid>
          <Grid item xs={12}>
            {renderStatControls(
              "mp",
              "MP",
              "info",
              [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20]
            )}
          </Grid>
          <Grid item xs={12}>
            {renderStatControls("ip", "IP", "success", [-3, -2, -1, 1, 2, 3])}
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
