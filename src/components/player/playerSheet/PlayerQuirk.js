import React from "react";
import { Paper, Grid, Typography, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";

export default function PlayerQuirk({ player, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const DescriptionMarkdown = styled(ReactMarkdown)(({ theme }) => ({
    whiteSpace: "pre-line",
    background: `linear-gradient(to right, ${theme.palette.ternary.main}, white)`,
  }));

  const EffectMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      {player.quirk?.name && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
              flexDirection: "column",
              boxShadow: "none",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                textTransform: "uppercase",
                padding: "5px", // Adjust padding instead of margins
                backgroundColor: primary,
                color: ternary,
                borderRadius: "8px 8px 0 0", // Rounded corners only at the top
                fontSize: "1.5em",
              }}
              align="center"
            >
              {t("Quirk") + ": " + player.quirk.name}
            </Typography>

            <Grid container >
              {player.quirk.description && (
                <Grid item xs={12}>
                  <DescriptionMarkdown
                    sx={{
                      fontFamily: "PT Sans Narrow",
                      fontSize: "1rem",
                      fontStyle: "italic",
                      paddingX: "10px",
                      paddingY: "5px",
                      
                    }}
                  >
                    {player.quirk.description}
                  </DescriptionMarkdown>
                </Grid>
              )}
              {player.quirk.effect && (
                <Grid item xs={12}>
                  <EffectMarkdown
                    sx={{
                      fontFamily: "PT Sans Narrow",
                      fontSize: "1rem",
                      paddingX: "10px",
                      paddingY: "5px",
                    }}
                  >
                    {player.quirk.effect}
                  </EffectMarkdown>
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
