import React, { useEffect } from "react";
import { Paper, Grid, Typography, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../translation/translate";
import avatar_image from "../avatar.jpg";

export default function PlayerCard({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  /* STATUS LIST
    Slow - Dexterity attribute is lowered by 2 points to maximum 6
    Dazed - Insight attribute is lowered by 2 points to maximum 6
    Enraged - Both Dexterity and Insight attributes are lowered by 2 points to maximum 6
    Weak - Might attribute is lowered by 2 points to maximum 6
    Shaken - Willpower attribute is lowered by 2 points to maximum 6
    Poisoned - Both Might and Willpower attributes are lowered by 2 points to maximum 6
    
    Dex Up - Dexterity attribute is increased by 2 points to maximum 12
    Ins Up - Insight attribute is increased by 2 points to maximum 12
    Mig Up - Might attribute is increased by 2 points to maximum 12
    Wlp Up - Willpower attribute is increased by 2 points to maximum 12
  */

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const calculateAttribute = (
    base,
    decreaseStatuses,
    increaseStatuses,
    min,
    max
  ) => {
    let adjustedValue = base;

    decreaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue -= 2;
    });

    increaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue += 2;
    });

    return clamp(adjustedValue, min, max);
  };

  const currDex = calculateAttribute(
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12
  );
  const currInsight = calculateAttribute(
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12
  );
  const currMight = calculateAttribute(
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12
  );
  const currWillpower = calculateAttribute(
    player.attributes.willpower,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12
  );

  // Function to determine the color
  const getAttributeColor = (base, current) => {
    if (current < base) return theme.palette.error.main;
    if (current > base) return theme.palette.success.main;
    return theme.palette.text.primary;
  };

  const renderStatBar = (label, value, max, color) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
      <Typography
        variant="body2"
        style={{
          minWidth: 30,
          fontFamily: "fantasy",
          fontSize: "0.8rem",
          marginRight: 5,
          color: theme.palette.text.secondary,
        }}
      >
        {label}
      </Typography>
      <div style={{ flexGrow: 1 }}>
        <LinearProgress
          variant="determinate"
          value={(value / max) * 100}
          sx={{
            height: 8,
            borderRadius: 5,
            backgroundColor: theme.palette.grey[800],
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      </div>
      <Typography
        variant="body2"
        style={{
          minWidth: 40,
          fontFamily: "fantasy",
          fontSize: "0.8rem",
          marginLeft: 5,
          color: theme.palette.text.secondary,
        }}
      >{`${value}/${max}`}</Typography>
    </div>
  );

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
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={4}>
          <img
            src={player.info.imgurl ? player.info.imgurl : avatar_image}
            alt={"Player Avatar"}
            style={{
              width: "100%",
              aspectRatio: "1",
              objectFit: "cover",
              borderRadius: "8px",
              border: `2px solid ${theme.palette.divider}`,
            }}
          />
        </Grid>
        <Grid item xs={8}>
          <Typography
            variant="h5"
            style={{
              fontFamily: "fantasy",
              fontSize: "1.5rem",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "5px" }}>{player.name}</span>
            {player.info.pronouns && (
              <span
                style={{
                  fontFamily: "fantasy",
                  fontSize: "1rem",
                  color: theme.palette.text.disabled,
                  marginRight: "5px",
                }}
              >
                ({player.info.pronouns})
              </span>
            )}
            <span style={{ marginLeft: "auto" }}>LVL. {player.lvl}</span>
          </Typography>
          {renderStatBar(
            "HP",
            player.stats.hp.current,
            player.stats.hp.max,
            theme.palette.error.main
          )}
          {renderStatBar(
            "MP",
            player.stats.mp.current,
            player.stats.mp.max,
            theme.palette.info.main
          )}
          {renderStatBar(
            "IP",
            player.stats.ip.current,
            player.stats.ip.max,
            theme.palette.success.main
          )}
          <Grid container spacing={2} style={{ marginTop: "10px" }}>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "1rem" }}
              >
                {t("DEX")}:{" "}
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "fantasy",
                    fontSize: "1.3rem",
                    color: getAttributeColor(
                      player.attributes.dexterity,
                      currDex
                    ),
                  }}
                >
                  d{currDex}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "1rem" }}
              >
                {t("INS")}:{" "}
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "fantasy",
                    fontSize: "1.3rem",
                    color: getAttributeColor(
                      player.attributes.insight,
                      currInsight
                    ),
                  }}
                >
                  d{currInsight}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "1rem" }}
              >
                {t("MIG")}:{" "}
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "fantasy",
                    fontSize: "1.3rem",
                    color: getAttributeColor(
                      player.attributes.might,
                      currMight
                    ),
                  }}
                >
                  d{currMight}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "1rem" }}
              >
                {t("WLP")}:{" "}
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "fantasy",
                    fontSize: "1.3rem",
                    color: getAttributeColor(
                      player.attributes.willpower,
                      currWillpower
                    ),
                  }}
                >
                  d{currWillpower}
                </Typography>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
