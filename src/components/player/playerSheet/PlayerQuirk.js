import React from "react";
import { Paper, Grid, Typography, Divider } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerQuirk({ player, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";

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
              borderColor: theme.secondary,
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
                backgroundColor: theme.primary,
                color: theme.white,
                borderRadius: "8px 8px 0 0", // Rounded corners only at the top
                fontSize: "1.5em",
              }}
              align="center"
            >
              {t("Quirk") + ": " + player.quirk.name}
            </Typography>

            <Grid container>
              {player.quirk.description && (
                <Grid item xs={12}>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      background: `linear-gradient(to right, ${theme.ternary}, ${isDarkMode ? "#252525" : "white"})`,
                      fontFamily: "PT Sans Narrow",
                      fontSize: "1rem",
                      fontStyle: "italic",
                      padding: "5px 10px",
                    }}
                  >
                    <ReactMarkdown>
                      {player.quirk.description}
                    </ReactMarkdown>
                  </div>
                </Grid>
              )}
              {player.quirk.effect && (
                <Grid item xs={12}>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      fontFamily: "PT Sans Narrow",
                      fontSize: "1rem",
                      padding: "5px 10px",
                    }}
                  >
                    <ReactMarkdown>
                      {player.quirk.effect}
                    </ReactMarkdown>
                  </div>
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
