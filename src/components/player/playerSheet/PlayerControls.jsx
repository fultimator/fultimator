import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";

export default function PlayerControls({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [zenitChange, setZenitChange] = useState(0);
  const [changeType, setChangeType] = useState("+");

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

  const changeFabulaPoints = (value) => () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      info: {
        ...prevPlayer.info,
        fabulapoints: Math.max(
          0,
          Math.min(9999, prevPlayer.info.fabulapoints + value)
        ),
      },
    }));
  };

  const changeZenit = () => {
    const changeValue = changeType === "+" ? zenitChange : -zenitChange;
    setPlayer((prevPlayer) => {
      const newZenit = Math.max(0, Math.min(99999999, prevPlayer.info.zenit + changeValue));
      return {
        ...prevPlayer,
        info: {
          ...prevPlayer.info,
          zenit: newZenit,
        },
      };
    });
    setZenitChange(0); // Reset the input field after applying the change
  };  

  const renderStatControls = (stat, label, color, increments) => {
    const negativeIncrements = increments.filter((val) => val < 0);
    const positiveIncrements = increments.filter((val) => val > 0);

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4} sm={2}>
          <Typography variant="h2" sx={{ minWidth: "50px" }}>
            {t(label) + "【" + player.stats[stat].current + "/" + player.stats[stat].max + "】"}
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
          {/* Fabula Points Section */}
          <Grid item xs={12}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={5} sm={4}>
                <Typography variant="h2" sx={{ minWidth: "100px" }}>
                  {t("Fabula Points") + "【" + player.info.fabulapoints + "】"}
                </Typography>
              </Grid>
              <Grid item xs={7} sm={8} sx={{ textAlign: "left" }}>
                <ButtonGroup variant="outlined" size="small" color="primary">
                  <Button onClick={changeFabulaPoints(-1)}>-1</Button>
                  <Button onClick={changeFabulaPoints(1)}>+1</Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </Grid>
          {/* Zenit Section */}
<Grid item xs={12}>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} sm={4}>
      <Typography variant="h2" sx={{ minWidth: "100px" }}>
        {t("Zenit") + "【" + player.info.zenit + "】"}
      </Typography>
    </Grid>
    <Grid item xs={12} sm={8} container spacing={2} alignItems="center">
      <Grid item>
        <ToggleButtonGroup
          value={changeType}
          exclusive
          onChange={(event, newChangeType) =>
            newChangeType !== null && setChangeType(newChangeType)
          }
          aria-label="zenit-change-type"
        >
          <ToggleButton value="+" sx={{ fontWeight: "bold", fontSize: 20, height: 40 }}>
            {t("+")}
          </ToggleButton>
          <ToggleButton value="-" sx={{ fontWeight: "bold", fontSize: 20, height: 40 }}>
            {t("-")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid item>
        <TextField
          type="number"
          size="small"
          value={zenitChange}
          onChange={(e) => setZenitChange(parseInt(e.target.value))}
          inputProps={{ min: 0 }}
          sx={{ width: 80 }}
        />
      </Grid>
      <Grid item>
        <Button
          variant="outlined"
          color="primary"
          onClick={changeZenit}
          sx={{ height: 40 }}
        >
          {t("Apply")}
        </Button>
      </Grid>
    </Grid>
  </Grid>
</Grid>

        </Grid>
      </Paper>
    </>
  );
}
