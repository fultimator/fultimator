import React from "react";
import { Paper, Grid, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerTraits({ player, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <Paper
        elevation={3}
        sx={
          isCharacterSheet
            ? {
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
              }
            : {
                borderRadius: "8px",
                border: "2px solid",
                borderColor: secondary,
                display: "flex",
              }
        }
      >
        {isCharacterSheet ? (
          <Typography
            variant="h1"
            sx={{
              textTransform: "uppercase",
              padding: "5px", // Adjust padding instead of margins
              backgroundColor: primary,
              color: custom.white,
              borderRadius: "8px 8px 0 0", // Rounded corners only at the top
              fontSize: "1.5em",
            }}
            align="center"
          >
            {t("Traits")}
          </Typography>
        ) : (
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
              color: custom.white,
              borderRadius: "0 8px 8px 0",
              transform: "rotate(180deg)",
              fontSize: "2em",
            }}
            align="center"
          >
            {t("Traits")}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ padding: "1em" }}>
          <Grid item xs={12} md={12}>
            <Typography variant="h4">
              <span
                style={{
                  fontWeight: "bolder",
                  fontSize: "1.6em",
                  textTransform: "uppercase",
                }}
              >
                {t("Identity") + ": "}
              </span>
              <span
                style={{
                  fontSize: "1.4em",
                  textTransform: "uppercase",
                }}
              >
                {player.info.identity}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">
              <span
                style={{
                  fontWeight: "bolder",
                  fontSize: "1.6em",
                  textTransform: "uppercase",
                }}
              >
                {t("Theme") + ": "}
              </span>
              <span
                style={{
                  fontSize: "1.4em",
                  textTransform: "uppercase",
                }}
              >
                {t(player.info.theme)}
              </span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">
              <span
                style={{
                  fontWeight: "bolder",
                  fontSize: "1.6em",
                  textTransform: "uppercase",
                }}
              >
                {t("Origin") + ": "}
              </span>
              <span
                style={{
                  fontSize: "1.4em",
                  textTransform: "uppercase",
                }}
              >
                {player.info.origin}
              </span>
            </Typography>
          </Grid>
          {player.info.description && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h4">
                  <span
                    style={{
                      fontWeight: "bolder",
                      fontSize: "1.6em",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("Description") + ": "}
                  </span>
                </Typography>
                <StyledMarkdown
                  sx={{
                    fontFamily: "PT Sans Narrow",
                    fontSize: "1rem",
                  }}
                >
                  {player.info.description}
                </StyledMarkdown>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
    </>
  );
}
