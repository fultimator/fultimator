import React from "react";
import { Paper, Typography, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import SpellDefault from "../spells/SpellDefault";
import SpellArcanist from "../spells/SpellArcanist";
import SpellEntropistGamble from "../spells/SpellEntropistGamble";

export default function PlayerSpellsFull({ player, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  return (
    <>
      {player.classes.length > 0 &&
        player.classes.some((c) =>
          c.spells.some(
            (spell) =>
              (spell.spellType === "default" || spell.spellType === "gamble") &&
              (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
          )
        ) && (
          <Grid container spacing={2}>
            {player.classes
              .filter((c) =>
                c.spells.some(
                  (spell) =>
                    (spell.spellType === "default" ||
                      spell.spellType === "gamble") &&
                    (spell.showInPlayerSheet ||
                      spell.showInPlayerSheet === undefined)
                )
              )
              .map((c, index) => (
                <Grid item xs={12} md={6} key={index}>
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
                            marginBottom: "1em",
                            boxShadow: "none",
                          }
                        : {
                            borderRadius: "8px",
                            border: "2px solid",
                            borderColor: secondary,
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "1em",
                          }
                    }
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

                    {c.spells
                      .filter(
                        (spell) =>
                          spell.spellType === "default" &&
                          (spell.showInPlayerSheet ||
                            spell.showInPlayerSheet === undefined)
                      )
                      .map((spell, spellIndex) => (
                        <React.Fragment key={spellIndex}>
                          {spellIndex === 0 && (
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
                                  <Typography variant="h3">
                                    {t("MP")}
                                  </Typography>
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
                                  <Typography variant="h3">
                                    {t("Target")}
                                  </Typography>
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
                                  <Typography variant="h3">
                                    {t("Duration")}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </div>
                          )}
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
                            isMagisphere={spell.isMagisphere || false}
                            attr1={spell.attr1}
                            attr2={spell.attr2}
                          />
                        </React.Fragment>
                      ))}

                    {c.spells
                      .filter(
                        (spell) =>
                          spell.spellType === "gamble" &&
                          (spell.showInPlayerSheet ||
                            spell.showInPlayerSheet === undefined)
                      )
                      .map((spell, spellIndex) => (
                        <SpellEntropistGamble
                          key={spellIndex}
                          gamble={spell}
                          isEditMode={false}
                        />
                      ))}
                  </Paper>
                </Grid>
              ))}
            {player.classes
              .filter((c) =>
                c.spells.some(
                  (spell) =>
                    (spell.spellType === "arcanist" ||
                      spell.spellType === "arcanist-rework") &&
                    (spell.showInPlayerSheet ||
                      spell.showInPlayerSheet === undefined)
                )
              )
              .map((c, index) => (
                <Grid item xs={12} md={6} key={index}>
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
                            marginBottom: "1em",
                            boxShadow: "none",
                          }
                        : {
                            borderRadius: "8px",
                            border: "2px solid",
                            borderColor: secondary,
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "1em",
                          }
                    }
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
                      {t("Arcana") + " - " + t(c.name)}
                    </Typography>

                    {c.spells
                      .filter(
                        (spell) =>
                          (spell.spellType === "arcanist" ||
                            spell.spellType === "arcanist-rework") &&
                          (spell.showInPlayerSheet ||
                            spell.showInPlayerSheet === undefined)
                      )
                      .map((spell, spellIndex) => (
                        <div
                          key={spellIndex}
                          style={{ marginTop: "0.5em", padding: "0.5em" }}
                        >
                          <SpellArcanist
                            arcana={spell}
                            isEditMode={false}
                            rework={spell.spellType === "arcanist-rework"}
                          />
                        </div>
                      ))}
                  </Paper>
                </Grid>
              ))}
          </Grid>
        )}
    </>
  );
}
