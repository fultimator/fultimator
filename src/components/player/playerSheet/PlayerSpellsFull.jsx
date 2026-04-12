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
import SpellPilot from "../spells/SpellPilot";
import SpellMagiseed from "../spells/SpellMagiseed";
import SpellGourmet from "../spells/SpellGourmet";
import SpellInvoker from "../spells/SpellInvoker";
import SpellDeck from "../spells/SpellDeck";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { useSpellModals } from "../common/hooks/useSpellModals";
import SpellDefaultModal from "../spells/SpellDefaultModal";
import SpellArcanistModal from "../spells/SpellArcanistModal";
import SpellEntropistGambleModal from "../spells/SpellEntropistGambleModal";
import SpellSymbolistModal from "../spells/SpellSymbolistModal";
import SpellDancerModal from "../spells/SpellDancerModal";
import SpellGiftModal from "../spells/SpellGiftModal";
import SpellMutantModal from "../spells/SpellMutantModal";
import SpellPilotModal from "../spells/SpellPilotModal";
import SpellMagiseedModal from "../spells/SpellMagiseedModal";
import SpellGourmetModal from "../spells/SpellGourmetModal";
import SpellInvokerModal from "../spells/SpellInvokerModal";
import SpellDeckModal from "../spells/SpellDeckModal";
import SpellTinkererAlchemyRankModal from "../spells/SpellTinkererAlchemyRankModal";
import SpellTinkererAlchemyTargetModal from "../spells/SpellTinkererAlchemyTargetModal";
import SpellTinkererAlchemyEffectsModal from "../spells/SpellTinkererAlchemyEffectsModal";
import SpellTinkererInfusionModal from "../spells/SpellTinkererInfusionModal";
import SpellTinkererMagitechRankModal from "../spells/SpellTinkererMagitechRankModal";
import UnifiedSpellModal from "../spells/modals/UnifiedSpellModal";
import GeneralSection from "../spells/sections/GeneralSection";
import MagichantKeysContentSection from "../spells/sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "../spells/sections/MagichantTonesContentSection";

export default function PlayerSpellsFull({ player, setPlayer, isEditMode, isCharacterSheet }) {
  const { t } = useTranslate();
  const custom = useCustomTheme();
  const primary = custom.primary;
  const secondary = custom.secondary;
  const {
    isOpen,
    openModal,
    closeModal,
    spellBeingEdited,
    editingSpellClass,
    editingSpellIndex,
  } = useSpellModals();

  const canEdit = Boolean(isEditMode && setPlayer);

  const handleEditSpell = (classIdx, spellIdx, spell) => {
    if (!canEdit) return;
    const spellType = spell.spellType;
    let modalName = "default";
    if (spellType === "arcanist" || spellType === "arcanist-rework") modalName = "arcanist";
    else if (spellType === "gamble") modalName = "gamble";
    else if (spellType === "magichant") modalName = "chanter";
    else if (spellType === "symbol") modalName = "symbolist";
    else if (spellType === "dance") modalName = "dancer";
    else if (spellType === "gift") modalName = "gift";
    else if (spellType === "therioform") modalName = "mutant";
    else if (spellType === "pilot-vehicle") modalName = "pilot";
    else if (spellType === "magiseed") modalName = "magiseed";
    else if (spellType === "cooking") modalName = "gourmet";
    else if (spellType === "invocation") modalName = "invoker";
    else if (spellType?.startsWith("tinkerer-alchemy")) modalName = "tinkerer-alchemy";
    else if (spellType?.startsWith("tinkerer-infusion")) modalName = "tinkerer-infusion";
    else if (spellType?.startsWith("tinkerer-magitech")) modalName = "tinkerer-magitech";
    else if (spellType === "deck") modalName = "deck";
    openModal(modalName, spell, classIdx, spellIdx);
  };

  const handleOpenSpellSubModal = (modalName, classIdx, spellIdx, spell) => {
    if (!canEdit) return;
    openModal(modalName, spell, classIdx, spellIdx);
  };

  const saveSpell = (maybeIndexOrSpell, maybeSpell) => {
    if (!setPlayer || editingSpellClass === null || editingSpellIndex === null) return;
    const targetIndex = maybeSpell !== undefined ? maybeIndexOrSpell : editingSpellIndex;
    const updatedSpell = maybeSpell !== undefined ? maybeSpell : maybeIndexOrSpell;
    if (typeof targetIndex !== "number" || !updatedSpell) return;

    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === editingSpellClass
          ? {
              ...cls,
              spells: cls.spells.map((spell, spellIdx) =>
                spellIdx === targetIndex ? updatedSpell : spell
              ),
            }
          : cls
      ),
    }));
    closeModal();
  };

  const deleteSpell = (spellIndex) => {
    if (!setPlayer || editingSpellClass === null) return;
    const targetIndex = typeof spellIndex === "number" ? spellIndex : editingSpellIndex;
    if (typeof targetIndex !== "number") return;

    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === editingSpellClass
          ? { ...cls, spells: cls.spells.filter((_, idx) => idx !== targetIndex) }
          : cls
      ),
    }));
    closeModal();
  };

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
                            showInPlayerSheet={spell.showInPlayerSheet}
                            index={spellIndex}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "gamble" && (
                          <SpellEntropistGamble
                            key={spellIndex}
                            gamble={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {(spell.spellType === "arcanist" ||
                          spell.spellType === "arcanist-rework") && (
                          <div style={{ marginTop: "0.5em", padding: "0.5em" }}>
                            <SpellArcanist
                              arcana={spell}
                              isEditMode={isEditMode}
                              rework={spell.spellType === "arcanist-rework"}
                              onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                            />
                          </div>
                        )}
                        {spell.spellType === "tinkerer-alchemy" && (
                          <SpellTinkererAlchemy
                            alchemy={spell}
                            isEditMode={isEditMode}
                            onEditRank={() => handleEditSpell(classIndex, spellIndex, spell)}
                            onEditTargets={() => handleOpenSpellSubModal("alchemyTarget", classIndex, spellIndex, spell)}
                            onEditEffects={() => handleOpenSpellSubModal("alchemyEffects", classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "tinkerer-infusion" && (
                          <SpellTinkererInfusion
                            infusion={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "tinkerer-magitech" && (
                          <SpellTinkererMagitech
                            magitech={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "magichant" && (
                          <SpellChanter
                            magichant={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                            onEditKeys={() => handleOpenSpellSubModal("chantKey", classIndex, spellIndex, spell)}
                            onEditTones={() => handleOpenSpellSubModal("chantTone", classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "symbol" && (
                          <SpellSymbolist
                            symbol={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "dance" && (
                          <SpellDancer
                            dance={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "gift" && (
                          <SpellGift
                            gift={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "therioform" && (
                          <SpellMutant
                            mutant={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "pilot-vehicle" && (
                          <SpellPilot
                            pilot={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "magiseed" && (
                          <SpellMagiseed
                            magiseed={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "cooking" && (
                          <SpellGourmet
                            spell={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "invocation" && (
                          <SpellInvoker
                            invoker={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                        {spell.spellType === "deck" && (
                          <SpellDeck
                            deck={spell}
                            isEditMode={isEditMode}
                            onEdit={() => handleEditSpell(classIndex, spellIndex, spell)}
                          />
                        )}
                      </React.Fragment>
                    ))}
                </Paper>
              </Grid>
            ))}
        </Grid>
      )}

      {canEdit && spellBeingEdited && (
        <>
          <SpellDefaultModal
            isEditMode={isEditMode}
            open={isOpen("default")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellArcanistModal
            open={isOpen("arcanist")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
            isRework={spellBeingEdited?.spellType === "arcanist-rework"}
          />
          <SpellEntropistGambleModal
            open={isOpen("gamble")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            gamble={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellTinkererAlchemyRankModal
            open={isOpen("tinkerer-alchemy")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellTinkererAlchemyTargetModal
            open={isOpen("alchemyTarget")}
            onClose={closeModal}
            onSave={saveSpell}
            alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellTinkererAlchemyEffectsModal
            open={isOpen("alchemyEffects")}
            onClose={closeModal}
            onSave={saveSpell}
            alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellTinkererInfusionModal
            open={isOpen("tinkerer-infusion")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            infusion={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellTinkererMagitechRankModal
            open={isOpen("tinkerer-magitech")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            magitech={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <UnifiedSpellModal
            open={isOpen("chanter")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spellType="magichant"
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
            initialSectionId="general"
            sections={[
              {
                id: "keys",
                title: "magichant_edit_keys_button",
                component: MagichantKeysContentSection,
                props: {},
                order: 0,
              },
              {
                id: "tones",
                title: "magichant_edit_tones_button",
                component: MagichantTonesContentSection,
                props: {},
                order: 1,
              },
              {
                id: "general",
                title: "magichant_settings_button",
                component: GeneralSection,
                props: { customFields: [] },
                order: 2,
              },
            ]}
          />
          <UnifiedSpellModal
            open={isOpen("chantKey")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spellType="magichant"
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
            initialSectionId="keys"
            sections={[
              {
                id: "keys",
                title: "magichant_edit_keys_button",
                component: MagichantKeysContentSection,
                props: {},
                order: 0,
              },
              {
                id: "tones",
                title: "magichant_edit_tones_button",
                component: MagichantTonesContentSection,
                props: {},
                order: 1,
              },
              {
                id: "general",
                title: "magichant_settings_button",
                component: GeneralSection,
                props: { customFields: [] },
                order: 2,
              },
            ]}
          />
          <UnifiedSpellModal
            open={isOpen("chantTone")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spellType="magichant"
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
            initialSectionId="tones"
            sections={[
              {
                id: "keys",
                title: "magichant_edit_keys_button",
                component: MagichantKeysContentSection,
                props: {},
                order: 0,
              },
              {
                id: "tones",
                title: "magichant_edit_tones_button",
                component: MagichantTonesContentSection,
                props: {},
                order: 1,
              },
              {
                id: "general",
                title: "magichant_settings_button",
                component: GeneralSection,
                props: { customFields: [] },
                order: 2,
              },
            ]}
          />
          <SpellSymbolistModal
            open={isOpen("symbolist")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            symbol={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellDancerModal
            open={isOpen("dancer")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            dance={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellGiftModal
            open={isOpen("gift")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            gift={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellMutantModal
            open={isOpen("mutant")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            mutant={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellPilotModal
            open={isOpen("pilot")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            pilot={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellMagiseedModal
            open={isOpen("magiseed")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            magiseed={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellGourmetModal
            open={isOpen("gourmet")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellInvokerModal
            open={isOpen("invoker")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            spell={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
          <SpellDeckModal
            open={isOpen("deck")}
            onClose={closeModal}
            onSave={saveSpell}
            onDelete={deleteSpell}
            deck={{ ...spellBeingEdited, index: editingSpellIndex }}
          />
        </>
      )}
    </>
  );
}
