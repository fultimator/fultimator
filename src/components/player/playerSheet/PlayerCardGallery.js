import React from "react";
import {
  Grid,
  Typography,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Card,
  Box,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import avatar_image from "../../avatar.jpg";
import Diamond from "../../Diamond";
import { styled } from "@mui/system";

export default function PlayerCardGallery({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const isMobile = window.innerWidth < 900;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const newShade = (hexColor, magnitude) => {
    hexColor = hexColor.replace(`#`, ``);
    if (hexColor.length === 6) {
      const decimalColor = parseInt(hexColor, 16);
      let r = (decimalColor >> 16) + magnitude;
      r > 255 && (r = 255);
      r < 0 && (r = 0);
      let g = (decimalColor & 0x0000ff) + magnitude;
      g > 255 && (g = 255);
      g < 0 && (g = 0);
      let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
      b > 255 && (b = 255);
      b < 0 && (b = 0);
      return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
      return hexColor;
    }
  };

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

  const GradientLinearProgress = styled(LinearProgress)(
    ({ theme, color1, color2 }) => ({
      height: 15,
      borderRadius: 0,
      backgroundColor: theme.palette.grey[200],
      position: "relative",
      overflow: "hidden",
      "& .MuiLinearProgress-bar": {
        background: `linear-gradient(to right, ${color1}, ${color2})`,
        borderRadius: 0,
      },
    })
  );

  const ProgressBarWithLabel = styled(Box)(({ theme }) => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.palette.text.secondary,
    fontFamily: "'Antonio', fantasy, sans-serif",
    fontSize: "0.7rem",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  }));

  const renderStatBar = (label, value, max, color1, color2) => (
    <Box sx={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <GradientLinearProgress
          variant="determinate"
          value={(value / max) * 100}
          color1={color1}
          color2={color2}
          sx={{
            "& .MuiLinearProgress-bar": {
              transition: "width 1s ease-in-out",
            },
            padding: "0.6rem",
          }}
        />
        <ProgressBarWithLabel sx={{ fontWeight: "bold", fontSize: "0.8rem" }}>
          {label} {`${value}/${max}`}
        </ProgressBarWithLabel>
      </Box>
    </Box>
  );

  let crisis =
    player.stats.hp.current <= player.stats.hp.max / 2 ? true : false;
  const crisisText = crisis ? (
    <Grid
      container
      justifyContent="center"
      alignItems="flex-end"
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        color: "white", // Text color changed to white
        padding: "6px",
        fontFamily: "Antonio",
        textShadow: "0 0 3px red", // Red shadow around the text
      }}
    >
      !! {t("CRISIS")} !!
    </Grid>
  ) : null;

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
    <Card
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid
          item
          xs
          sx={{
            background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%);`,
            borderRight: "4px solid white",
            px: 2,
          }}
        >
          <Typography
            color="#fff"
            fontFamily="Antonio"
            fontSize="1.5rem"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            {player.name}
          </Typography>
        </Grid>
        <Grid
          item
          sx={{
            px: 2,
            py: 0.5,
            borderLeft: `2px solid ${primary} `,
            borderBottom: `2px solid ${primary} `,
            borderImage: `linear-gradient(45deg, ${secondary} , ${ternary}) 1;`,
          }}
        >
          <Typography
            fontFamily="Antonio"
            fontSize="1.25rem"
            fontWeight="medium"
            sx={{ textTransform: "uppercase" }}
          >
            {player.info.pronouns && (
              <>
                {player.info.pronouns} <Diamond color={primary} />{" "}
              </>
            )}
            {t("Lvl")} {player.lvl}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={4} sm={4}>
          <div style={{ position: "relative" }}>
            <img
              src={player.info.imgurl ? player.info.imgurl : avatar_image}
              alt="Player Avatar"
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                marginBottom: "-6px",
              }}
            />
            {crisisText}
          </div>
          {renderStatBar(
            t("HP"),
            player.stats.hp.current,
            player.stats.hp.max,
            newShade(theme.palette.error.main, 80),
            theme.palette.error.main
          )}
          {renderStatBar(
            t("MP"),
            player.stats.mp.current,
            player.stats.mp.max,
            newShade(theme.palette.info.main, 80),
            theme.palette.info.main
          )}
          {renderStatBar(
            t("IP"),
            player.stats.ip.current,
            player.stats.ip.max,
            newShade(theme.palette.success.main, 80),
            theme.palette.success.main
          )}
        </Grid>
        <Grid item xs={8} sx={{ marginTop: "5px", marginX: "-5px" }}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "1px solid",
              borderColor: secondary,
              display: "flex",
              marginRight: "5px",
              boxShadow: "none",
            }}
          >
            <Typography
              variant="h4"
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
                fontSize: "1.2rem",
              }}
              align="center"
            >
              {t("Traits")}
            </Typography>

            <Grid container spacing={1} sx={{ padding: "0.3rem" }}>
              <Grid item xs={12} md={12}>
                <Typography variant="h4">
                  <span
                    style={{
                      fontWeight: "bolder",
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("Identity") + ": "}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {player.info.identity.length > 40
                      ? player.info.identity.slice(0, 40) + "..."
                      : player.info.identity}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4">
                  <span
                    style={{
                      fontWeight: "bolder",
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("Theme") + ": "}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {player.info.theme && t(player.info.theme).length > 20
                      ? t(player.info.theme).slice(0, 20) + "..."
                      : t(player.info.theme)}
                  </span>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h4">
                  <span
                    style={{
                      fontWeight: "bolder",
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("Origin") + ": "}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? "0.8rem" : "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {player.info.origin.length > 20
                      ? player.info.origin.slice(0, 20) + "..."
                      : player.info.origin}
                  </span>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={1}>
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
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
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
                      disabled={true}
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
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
