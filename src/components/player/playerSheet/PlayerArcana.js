import React from "react";
import { Grid, Typography, Paper, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import SpellArcanist from "../spells/SpellArcanist";

export default function PlayerArcana({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  /* All arcana from all classes */
  const arcana = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        (spell.spellType === "arcanist" ||
          spell.spellType === "arcanist-rework") &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {arcana.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                writingMode: "vertical-lr",
                textTransform: "uppercase",
                marginLeft: "-1px",
                marginRight: "10px",
                marginTop: "-1px",
                marginBottom: "-1px",
                paddingY: "10px",
                backgroundColor: primary,
                color: ternary,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("Arcana")}
            </Typography>
            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {arcana.map((spell, index) => (
                <Grid item container xs={12} md={6} key={index}>
                  <SpellArcanist
                    arcana={spell}
                    isEditMode={false}
                    rework={spell.spellType === "arcanist-rework"}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
