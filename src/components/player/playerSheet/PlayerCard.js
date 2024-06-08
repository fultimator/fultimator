import React from "react";
import {
  Paper,
  Grid,
  Typography,
  LinearProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import avatar_image from "../../avatar.jpg";

export default function PlayerCard({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

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
          fontFamily: "'Antonio', fantasy, sans-serif",
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
          fontFamily: "'Antonio', fantasy, sans-serif",
          fontSize: "0.8rem",
          marginLeft: 5,
          color: theme.palette.text.secondary,
        }}
      >{`${value}/${max}`}</Typography>
    </div>
  );

  // Calculate DEF and MDEF
  const currDef = currDex;
  const currMDef = currInsight;

  // Initialize INIT to 0
  const currInit = 0;

  // Function to render DEF, MDEF, and INIT as numbers
  const renderAdditionalStats = () => (
    <>
      <Grid item xs={12} sm={4}>
        <Typography
          variant="body2"
          style={{
            fontSize: "1rem",
            marginBottom: "5px",
          }}
        >
          <span style={{ fontFamily: "Antonio", fontWeight: "bold" }}>
            DEF:
          </span>
          <span style={{ fontFamily: "'Antonio', sans-serif" }}>
            {" "}
            {currDef}
          </span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography
          variant="body2"
          style={{
            fontSize: "1rem",
            marginBottom: "5px",
          }}
        >
          <span style={{ fontFamily: "Antonio", fontWeight: "bold" }}>
            MDEF:
          </span>
          <span style={{ fontFamily: "'Antonio', sans-serif" }}>
            {" "}
            {currMDef}
          </span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography
          variant="body2"
          style={{
            fontSize: "1rem",
            marginBottom: "5px",
          }}
        >
          <span style={{ fontFamily: "Antonio", fontWeight: "bold" }}>
            INIT:
          </span>
          <span style={{ fontFamily: "'Antonio', sans-serif" }}>
            {" "}
            {currInit}
          </span>
        </Typography>
      </Grid>
    </>
  );

  const onStatusChange = (status) => (event) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      statuses: {
        ...prevPlayer.statuses,
        [status]: event.target.checked,
      },
    }));
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
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={4} sm={4}>
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
              fontFamily: "'Antonio'",
              fontWeight: "bold",
              fontSize: "1.5rem",
              marginBottom: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span
                style={{
                  marginRight: "5px",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "calc(100% - 130px)", // Adjust according to the layout
                }}
              >
                {player.name}
              </span>
              {player.info.pronouns && (
                <span
                  style={{
                    fontFamily: "'Antonio'",
                    fontSize: "1rem",
                    color: theme.palette.text.disabled,
                    marginRight: "5px",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    maxWidth: "calc(100% - 50px)", // Adjust according to the layout
                  }}
                >
                  ({player.info.pronouns})
                </span>
              )}
              <span style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>LVL. {player.lvl}</span>
            </div>
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
          <Grid container spacing={1} style={{ marginTop: "10px" }}>
            <Grid
              item
              xs={1}
              sx={{
                marginRight: 2,
                marginTop: 0.4,
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio'",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {t("DEX")}:{" "}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1.2,
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio'",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {t("INS")}:{" "}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1.2,
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio'",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {t("MIG")}:{" "}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1.3,
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio'",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {t("WLP")}:{" "}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              xs={2}
              sx={{
                marginRight: 1,
                marginTop: 0.4,
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio', fantasy, sans-serif",
                    fontSize: "1rem",
                    color: getAttributeColor(
                      player.attributes.dexterity,
                      currDex
                    ),
                  }}
                >
                  d{currDex}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio', fantasy, sans-serif",
                    fontSize: "1rem",
                    color: getAttributeColor(
                      player.attributes.insight,
                      currInsight
                    ),
                  }}
                >
                  d{currInsight}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio', fantasy, sans-serif",
                    fontSize: "1rem",
                    color: getAttributeColor(
                      player.attributes.might,
                      currMight
                    ),
                  }}
                >
                  d{currMight}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  style={{
                    fontFamily: "'Antonio', fantasy, sans-serif",
                    fontSize: "1rem",
                    color: getAttributeColor(
                      player.attributes.willpower,
                      currWillpower
                    ),
                  }}
                >
                  d{currWillpower}
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              xs={2}
              sx={{
                marginRight: 3.5,
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        margin: 0,
                        padding: 0,
                      }}
                      checked={player.statuses.slow}
                      onChange={onStatusChange("slow")}
                      disabled={!isEditMode}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      style={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("Slow")}
                    </Typography>
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        margin: 0,
                        padding: 0,
                      }}
                      checked={player.statuses.dazed}
                      onChange={onStatusChange("dazed")}
                      disabled={!isEditMode}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      style={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("Dazed")}
                    </Typography>
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        margin: 0,
                        padding: 0,
                      }}
                      checked={player.statuses.weak}
                      onChange={onStatusChange("weak")}
                      disabled={!isEditMode}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      style={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("Weak")}
                    </Typography>
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        margin: 0,
                        padding: 0,
                      }}
                      checked={player.statuses.shaken}
                      onChange={onStatusChange("shaken")}
                      disabled={!isEditMode}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      style={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("Shaken")}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={2}
              sx={{
                marginRight: 2.5,
              }}
            >
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <FormControlLabel
                  sx={{
                    marginY: 1.8,
                  }}
                  control={
                    <Checkbox
                      sx={{
                        margin: 0,
                        padding: 0,
                      }}
                      checked={player.statuses.enraged}
                      onChange={onStatusChange("enraged")}
                      disabled={!isEditMode}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      style={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("Enraged")}
                    </Typography>
                  }
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  marginY: 1,
                }}
              >
                <FormControlLabel
                  sx={{
                    marginY: 1.8,
                  }}
                  control={
                    <Checkbox
                      sx={{
                        margin: 0,
                        padding: 0,
                      }}
                      checked={player.statuses.poisoned}
                      onChange={onStatusChange("poisoned")}
                      disabled={!isEditMode}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      style={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t("Poisoned")}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            <Grid container sx={{ marginTop: 2, marginLeft: 1 }}>
              {renderAdditionalStats()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
