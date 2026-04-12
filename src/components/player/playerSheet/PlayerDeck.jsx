import React from "react";
import {
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import SpellDeck from "../spells/SpellDeck";

export default function PlayerDeck({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const deckSpells = player.classes
    .flatMap((c) => c.spells.map((spell) => ({ ...spell, className: c.name })))
    .filter(
      (spell) =>
        spell !== undefined &&
        spell.spellType === "deck" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    );

  const handleDeckUpdate = (deckSpell, updatedDeck) => {
    if (!setPlayer) return;
    setPlayer((prevPlayer) => {
      const newClasses = prevPlayer.classes.map((cls) => {
        if (cls.name !== deckSpell.className) return cls;
        const newSpells = cls.spells.map((spell) => {
          if (spell.name === deckSpell.name) {
            return { ...spell, ...updatedDeck };
          }
          return spell;
        });
        return { ...cls, spells: newSpells };
      });
      return { ...prevPlayer, classes: newClasses };
    });
  };

  return (
    <>
      {deckSpells.length > 0 && (
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
                color: custom.white,
                borderRadius: "0 8px 8px 0",
                transform: "rotate(180deg)",
                fontSize: "2em",
              }}
              align="center"
            >
              {t("ace_deck_management")}
            </Typography>

            <Grid container spacing={1} sx={{ padding: "1em" }}>
              {deckSpells.map((deckSpell, index) => (
                <Grid  key={index} size={12}>
                  {deckSpells.length > 1 && (
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1 }}
                    >
                      {t(deckSpell.className)}
                    </Typography>
                  )}
                  <SpellDeck
                    deck={deckSpell}
                    onDeckUpdate={(updatedDeck) => handleDeckUpdate(deckSpell, updatedDeck)}
                    isEditMode={isEditMode}
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