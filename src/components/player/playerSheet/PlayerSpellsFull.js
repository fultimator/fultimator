import React from "react";
import { Paper, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import SpellDefault from "../spells/SpellDefault";

export default function PlayerSpellsFull({ player, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  return (
    <>
      {player.classes.length > 0 &&
        player.classes.some((c) => c.spells.length > 0) && (
          <Grid container spacing={2}>
            {player.classes
              .filter((c) => c.spells.length > 0)
              .map((c, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: secondary,
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "1em",
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
                      {t("Spells") + " - " + t(c.name)}
                    </Typography>
                    <div
                      style={{
                        backgroundColor: primary,
                        fontFamily: "Antonio",
                        fontWeight: "normal",
                        fontSize: "1.1em",
                        padding: "2px 17px",
                        color: "white",
                        textTransform: "uppercase",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Grid container style={{ flexGrow: 1 }}>
                        <Grid
                          item
                          xs
                          flexGrow
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "left",
                          }}
                        >
                          <Typography
                            variant="h3"
                            style={{ flexGrow: 1, marginRight: "5px" }}
                          >
                            {t("Spell")}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h3">{t("MP")}</Typography>
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h3">{t("Target")}</Typography>
                        </Grid>
                        <Grid
                          item
                          xs={3}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="h3">{t("Duration")}</Typography>
                        </Grid>
                      </Grid>
                    </div>
                    {c.spells.map((spell, spellIndex) => (
                      <SpellDefault
                        key={spellIndex}
                        spellName={spell.name}
                        mp={spell.mp}
                        maxTargets={spell.maxTargets}
                        targetDesc={spell.targetDesc}
                        duration={spell.duration}
                        description={spell.description}
                        isEditMode={false}
                        isOffensive={spell.isOffensive}
                        attr1={spell.attr1}
                        attr2={spell.attr2}
                      />
                    ))}
                  </Paper>
                </Grid>
              ))}
          </Grid>
        )}
    </>
  );
}
