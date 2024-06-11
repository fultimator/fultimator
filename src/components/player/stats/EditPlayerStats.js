import React from "react";
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Button,
  ButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerStats({ player, setPlayer, updateMaxStats, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

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
    updateMaxStats();
  };

  const renderStatControls = (stat, label, color, increments) => {
    const negativeIncrements = increments.filter((val) => val < 0);
    const positiveIncrements = increments.filter((val) => val > 0);

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={1}>
          <Typography variant="h2" sx={{ minWidth: "50px" }}>
            {t(label)}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            label={t("Max")}
            value={player.stats[stat].max}
            variant="outlined"
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            label={t("Current")}
            value={player.stats[stat].current}
            error={
              stat === "hp" &&
              player.stats.hp.current <= Math.floor(player.stats.hp.max / 2)
            }
            variant="outlined"
            fullWidth
          />
        </Grid>
        {isEditMode && (
          <Grid item xs={12} sm={6}>
            <Grid container spacing={1} justifyContent="center">
              <Grid item xs={12} sm="auto">
                <ButtonGroup
                  variant="outlined"
                  size="small"
                  color={color}
                  sx={{ flexWrap: "wrap" }}
                >
                  {negativeIncrements.map((val) => (
                    <Button key={val} onClick={changeStat(stat, val)}>
                      {val}
                    </Button>
                  ))}
                </ButtonGroup>
              </Grid>
              <Grid item xs={12} sm="auto">
                <ButtonGroup
                  variant="outlined"
                  size="small"
                  color={color}
                  sx={{ flexWrap: "wrap" }}
                >
                  {positiveIncrements.map((val) => (
                    <Button key={val} onClick={changeStat(stat, val)}>
                      +{val}
                    </Button>
                  ))}
                </ButtonGroup>
              </Grid>
              {stat === "hp" && (
                <Grid item xs={12} sm="auto">
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={changeStat(
                      "hp",
                      Math.floor(player.stats.hp.max / 2) -
                        player.stats.hp.current
                    )}
                  >
                    {t("Half")}
                  </Button>
                </Grid>
              )}
              <Grid item xs={12} sm="auto">
                <Button
                  variant="contained"
                  color={color}
                  onClick={changeStat(stat, player.stats[stat].max)}
                >
                  {t("Full")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
        {stat === "hp" &&
          player.stats.hp.current <= Math.floor(player.stats.hp.max / 2) && (
            <Grid item xs={12}>
              <Typography
                variant="body1"
                color="error"
                sx={{ textAlign: { xs: "center", sm: "left" } }}
              >
                CRISIS
              </Typography>
            </Grid>
          )}
      </Grid>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Statistics")}
            showIconButton={false}
          />
        </Grid>
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
  );
}
