import React from "react";
import { Typography, Paper, Divider, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import SpellArcanist from "../spells/SpellArcanist";

export default function PlayerArcana({ player }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  /* All arcana from all classes */
  const arcana = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        (spell.spellType === "arcanist" ||
          spell.spellType === "arcanist-rework") &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
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
                color: "#fff",
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("Arcana")}
            </Typography>
            <Box
              sx={{
                padding: "1em",
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1,
                alignItems: "start",
              }}
            >
              {arcana.map((spell, index) => (
                <Box key={index}>
                  <SpellArcanist
                    arcana={spell}
                    isEditMode={false}
                    rework={spell.spellType === "arcanist-rework"}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </>
      )}
    </>
  );
}
