import React from "react";
import { Grid, Typography, Divider } from "@mui/material";
import SectionCard from "../../../common/SectionCard";
import { useTranslate } from "../../../../../../translation/translate";
import { useCustomTheme } from "../../../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../../../common/NotesMarkdown";

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
          <SectionCard title={t("Camp Activity") + ": " + activity.name} noShadow>

            <Grid container>
              {activity.description && (
                <Grid
                  sx={{
                    background: `linear-gradient(to right, ${theme.ternary}, ${isDarkMode ? "#252525" : "white"})`,
                    borderTop: `1px solid ${theme.secondary}`,
                    px: "10px",
                    py: "5px",
                  }}
                  size={12}
                >
                  <Typography
                    sx={{ fontFamily: "PT Sans Narrow", fontSize: "1rem" }}
                  >
                    <strong>{t("Target")}: </strong>
                    {activity.description}
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
                  size={12}
                >
                  <NotesMarkdown>{activity.effect}</NotesMarkdown>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        </React.Fragment>
      ))}
    </>
  );
}
