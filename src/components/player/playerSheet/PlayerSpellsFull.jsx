import React from "react";
import { Paper, Typography, Grid } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import SpellDefault from "../spells/SpellDefault";
import SpellArcanist from "../spells/SpellArcanist";
import SpellEntropistGamble from "../spells/SpellEntropistGamble";
import SpellTinkererAlchemy from "../spells/SpellTinkererAlchemy";
import SpellTinkererInfusion from "../spells/SpellTinkererInfusion";
import SpellTinkererMagitech from "../spells/SpellTinkererMagitech";
import SpellChanter from "../spells/SpellChanter";
import SpellSymbolist from "../spells/SpellSymbolist";
import SpellDancer from "../spells/SpellDancer";
import SpellGift from "../spells/SpellGift";
import SpellMutant from "../spells/SpellMutant";
import SpellMagiseed from "../spells/SpellMagiseed";
import SpellGourmet from "../spells/SpellGourmet";
import SpellInvoker from "../spells/SpellInvoker";
import SpellDeck from "../spells/SpellDeck";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerSpellsFull({ player, isEditMode, isCharacterSheet }) {
  const { t } = useTranslate();
  const custom = useCustomTheme();
  const primary = custom.primary;
  const secondary = custom.secondary;

  return (
    <>
      {player.classes.length > 0 && (
        <Grid container spacing={0}>
          {player.classes
            .filter((c) => c.spells && c.spells.length > 0)
            .map((c, classIndex) => (
              <Grid item xs={12} key={classIndex}>
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
                      padding: "5px",
                      backgroundColor: primary,
                      color: custom.white,
                      borderRadius: "8px 8px 0 0",
                      fontSize: "1.5em",
                    }}
                    align="center"
                  >
                    {t("Spells") + " - " + t(c.name)}
                  </Typography>

                  {c.spells
                    .filter(
                      (spell) =>
                        spell.showInPlayerSheet ||
                        spell.showInPlayerSheet === undefined
                    )
                    .map((spell, spellIndex) => (
                      <React.Fragment key={spellIndex}>
                        {spell.spellType === "default" && (
                          <SpellDefault
                            key={spellIndex}
                            spellName={spell.name}
                            mp={spell.mp}
                            maxTargets={spell.maxTargets}
                            targetDesc={spell.targetDesc}
                            duration={spell.duration}
                            description={spell.description}
                            isEditMode={isEditMode}
                            isOffensive={spell.isOffensive}
                            isMagisphere={spell.isMagisphere || false}
                            attr1={spell.attr1}
                            attr2={spell.attr2}
                            index={spellIndex}
                          />
                        )}
                        {spell.spellType === "gamble" && (
                          <SpellEntropistGamble
                            key={spellIndex}
                            gamble={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {(spell.spellType === "arcanist" ||
                          spell.spellType === "arcanist-rework") && (
                          <div style={{ marginTop: "0.5em", padding: "0.5em" }}>
                            <SpellArcanist
                              arcana={spell}
                              isEditMode={isEditMode}
                              rework={spell.spellType === "arcanist-rework"}
                            />
                          </div>
                        )}
                        {spell.spellType === "tinkerer-alchemy" && (
                          <SpellTinkererAlchemy
                            alchemy={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "tinkerer-infusion" && (
                          <SpellTinkererInfusion
                            infusion={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "tinkerer-magitech" && (
                          <SpellTinkererMagitech
                            magitech={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "magichant" && (
                          <SpellChanter
                            magichant={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "symbol" && (
                          <SpellSymbolist
                            symbol={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "dance" && (
                          <SpellDancer
                            dance={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "gift" && (
                          <SpellGift
                            gift={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "therioform" && (
                          <SpellMutant
                            mutant={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "magiseed" && (
                          <SpellMagiseed
                            magiseed={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "cooking" && (
                          <SpellGourmet
                            spell={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "invocation" && (
                          <SpellInvoker
                            invoker={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                        {spell.spellType === "deck" && (
                          <SpellDeck
                            deck={spell}
                            isEditMode={isEditMode}
                          />
                        )}
                      </React.Fragment>
                    ))}
                </Paper>
              </Grid>
            ))}
        </Grid>
      )}
    </>
  );
}
