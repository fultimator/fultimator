import React from "react";
import { Paper, Grid, Typography, Divider } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerCampActivities({ player }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";

  const activities = (player.campActivities ?? []).filter((a) => a?.name);
  if (activities.length === 0) return null;

  return (
    <>
      {activities.map((activity, index) => (
        <React.Fragment key={index}>
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
                padding: "5px",
                backgroundColor: theme.primary,
                color: theme.white,
                borderRadius: "8px 8px 0 0",
                fontSize: "1.5em",
              }}
              align="center"
            >
              {t("Camp Activity") + ": " + activity.name}
            </Typography>

            <Grid container>
              {activity.targetDescription && (
                <Grid
                  sx={{
                    background: `linear-gradient(to right, ${theme.ternary}, ${isDarkMode ? "#252525" : "white"})`,
                    borderTop: `1px solid ${theme.secondary}`,
                    px: "10px",
                    py: "5px",
                  }}
                  size={12}>
                  <Typography sx={{ fontFamily: "PT Sans Narrow", fontSize: "1rem" }}>
                    <strong>{t("Target")}: </strong>
                    {activity.targetDescription}
                  </Typography>
                </Grid>
              )}

              {activity.effect && (
                <Grid
                  sx={{
                    borderTop: `1px solid ${theme.secondary}`,
                    px: "10px",
                    py: "5px",
                  }}
                  size={12}>
                  <div
                    style={{
                      whiteSpace: "pre-line",
                      fontFamily: "PT Sans Narrow",
                      fontSize: "1rem",
                    }}
                  >
                    <ReactMarkdown>{activity.effect}</ReactMarkdown>
                  </div>
                </Grid>
              )}
            </Grid>
          </Paper>
        </React.Fragment>
      ))}
    </>
  );
}
