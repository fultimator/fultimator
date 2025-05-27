import React from "react";
import { Grid, Typography, Paper, Divider, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import Pretty from "../../npc/Pretty";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerCompanion({
  player,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const navigate = useNavigate(); // useNavigate instead of useHistory

  // Check if the player has a faithful companion skill
  const faithfulCompanionSkills = player.classes
    .flatMap((cls) => cls.skills)
    .filter(
      (skill) =>
        skill.specialSkill === "Faithful Companion" && skill.currentLvl > 0
    );

  // Assume you want to get the first companion found in any class
  let companion = null;

  // Find the first class with a companion and retrieve it
  for (let i = 0; i < player.classes.length; i++) {
    if (player.classes[i].companion) {
      companion = player.classes[i].companion;
      break;
    }
  }

  return (
    <>
      {faithfulCompanionSkills.length === 1 && companion !== null && (
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
                {t("Faithful Companion") +
                  " - " +
                  t("SL") +
                  ": " +
                  faithfulCompanionSkills[0].currentLvl}
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
                  minHeight: "100px",
                }}
                align="center"
              >
                {t("Companion")}
              </Typography>
            )}
            <Grid container spacing={2} sx={{ padding: "0.7em" }}>
              {!isCharacterSheet && (
                <Grid item xs={12}>
                  <Typography
                    variant="h3"
                    fontWeight={"bold"}
                    sx={{ textTransform: "uppercase" }}
                  >
                    {t("Faithful Companion") +
                      " - " +
                      t("SL") +
                      ": " +
                      faithfulCompanionSkills[0].currentLvl}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Pretty npc={companion} collapse={true} />
              </Grid>
              {isEditMode && (
                <>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/npc-gallery/${companion.id}`,
                        {
                          state: {
                            from: `/pc-gallery/${player.id}`,
                          }
                        }
                      )}
                      sx={{ marginTop: 2 }}
                    >
                      {t("View Companion")}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="body2" sx={{ marginTop: 2 }}>
                      {t(
                        "If you edit the Companion, remember to select it again in the corrisponding class page."
                      )}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
