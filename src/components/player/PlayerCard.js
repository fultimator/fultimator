import React from "react";
import { Paper, Grid, Typography, LinearProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function PlayerCard({ player }) {
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  /* Player Example
  const player = {
    name: "Hero",
    lvl: 5,
    info: {
        pronouns: "He/Him",
        imgurl: "https://i.imgur.com/OsdL3nE.jpeg"
    },
    stats: {
      hp: { current: 80, max: 100 },
      mp: { current: 50, max: 100 },
      ip: { current: 4, max: 6 },
    },
    attributes: {
        dexterity: 8,
        insight: 8,
        might: 8,
        willpower: 8,
    }
  };
  */

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
            src={player.info.imgurl}
            alt={player.name}
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
                style={{ fontFamily: "fantasy", fontSize: "0.8rem" }}
              >
                Dexterity: {player.attributes.dexterity}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "0.8rem" }}
              >
                Insight: {player.attributes.insight}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "0.8rem" }}
              >
                Might: {player.attributes.might}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                style={{ fontFamily: "fantasy", fontSize: "0.8rem" }}
              >
                Willpower: {player.attributes.willpower}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
