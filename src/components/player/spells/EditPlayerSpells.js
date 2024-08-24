import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, TextField, Button, Divider } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import SpellDefault from "./SpellDefault";
import SpellArcanistModal from "./SpellArcanistModal";
import SpellArcanist from "./SpellArcanist";
import CustomHeader2 from "../../common/CustomHeader2";
import SpellDefaultModal from "./SpellDefaultModal";
import SpellTinkererAlchemy from "./SpellTinkererAlchemy";
import SpellTinkererAlchemyRankModal from "./SpellTinkererAlchemyRankModal";
import SpellTinkererAlchemyTargetModal from "./SpellTinkererAlchemyTargetModal";
import SpellTinkererAlchemyEffectsModal from "./SpellTinkererAlchemyEffectsModal";
import {
  tinkererAlchemy,
  tinkererInfusion,
} from "../../../libs/classes";
import SpellTinkererInfusion from "./SpellTinkererInfusion";
import SpellTinkererInfusionModal from "./SpellTinkererInfusionModal";
import SpellCompendiumModal from "./SpellCompendiumModal";
import SpellTinkererMagitech from "./SpellTinkererMagitech";
import SpellTinkererMagitechRankModal from "./SpellTinkererMagitechRankModal";
import SpellEntropistGambleModal from "./SpellEntropistGambleModal";
import SpellEntropistGamble from "./SpellEntropistGamble";
import GambleExplain from "./GambleExplain";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const [openSpellDefaultModal, setOpenSpellDefaultModal] = useState(false);
  const [openSpellArcanistModal, setOpenSpellArcanistModal] = useState(false);
  const [openAlchemyRankModal, setOpenAlchemyRankModal] = useState(false);
  const [openAlchemyTargetModal, setOpenAlchemyTargetModal] = useState(false);
  const [openAlchemyEffectsModal, setOpenAlchemyEffectsModal] = useState(false);
  const [openInfusionModal, setOpenInfusionModal] = useState(false);
  const [openMagitechRankModal, setOpenMagitechRankModal] = useState(false);
  const [openGambleModal, setOpenGambleModal] = useState(false);
  const [spellBeingEdited, setSpellBeingEdited] = useState(null);
  const [editingSpellClass, setEditingSpellClass] = useState(null);
  const [editingSpellIndex, setEditingSpellIndex] = useState(null);

  const [openCompendiumModal, setOpenCompendiumModal] = useState(false);

  const handleClassChange = (event, newValue) => {
    setSelectedClass(
      newValue
        ? player.classes.find((cls) => t(cls.name) === newValue)?.name
        : null
    );
    setSelectedSpell(null); // Reset selected spell when class changes
  };

  const handleSpellChange = (event, newValue) => {
    setSelectedSpell(newValue);
  };

  const filteredSpells = selectedClass
    ? player.classes.find((cls) => cls.name === selectedClass)?.benefits
        .spellClasses || []
    : [];

  const addNewSpell = (spell) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === selectedClass) {
          if (spell === "default") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  name: "New Spell",
                  mp: 0,
                  maxTargets: 0,
                  targetDesc: "",
                  duration: "",
                  description: "",
                  isOffensive: false,
                  attr1: "dexterity",
                  attr2: "dexterity",
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell === "arcanist") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  name: "New Arcana",
                  domain: "",
                  description: "",
                  domainDesc: "",
                  merge: "",
                  mergeDesc: "",
                  dismiss: "",
                  dismissDesc: "",
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell === "arcanist-rework") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  name: "New Arcana",
                  domain: "",
                  description: "",
                  domainDesc: "",
                  merge: "",
                  mergeDesc: "",
                  pulse: "",
                  pulseDesc: "",
                  dismiss: "",
                  dismissDesc: "",
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell === "tinkerer-alchemy") {
            // Check if there's already a tinkerer-alchemy spell
            const hasTinkererAlchemy = cls.spells.some(
              (sp) => sp.spellType === "tinkerer-alchemy"
            );

            if (hasTinkererAlchemy) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-alchemy spell"
                );
              } else {
                alert("You already have a tinkerer-alchemy spell");
              }

              return cls;
            } else {
              // Add a new tinkerer-alchemy spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    // add from tinkererAlchemy const
                    ...tinkererAlchemy,
                  },
                ],
              };
            }
          } else if (spell === "tinkerer-infusion") {
            // Check if there's already a tinkerer-infusion spell
            const hasTinkererInfusion = cls.spells.some(
              (sp) => sp.spellType === "tinkerer-infusion"
            );

            if (hasTinkererInfusion) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-infusion spell"
                );
              } else {
                alert("You already have a tinkerer-infusion spell");
              }
              return cls;
            } else {
              // Add a new tinkerer-infusion spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    // add from tinkererAlchemy const
                    ...tinkererInfusion,
                  },
                ],
              };
            }
          } else if (spell === "tinkerer-magitech") {
            // Check if there's already a tinkerer-magitech spell
            const hasTinkererMagitech = cls.spells.some(
              (sp) => sp.spellType === "tinkerer-magitech"
            );

            if (hasTinkererMagitech) {
              if (window.electron) {
                window.electron.alert(
                  "You already have a tinkerer-magitech spell"
                );
              } else {
                alert("You already have a tinkerer-magitech spell");
              }
              return cls;
            } else {
              // Add a new tinkerer-magitech spell
              return {
                ...cls,
                spells: [
                  ...cls.spells,
                  {
                    spellType: spell,
                    showInPlayerSheet: true,
                    rank: 1,
                    magispheres: [],
                  },
                ],
              };
            }
          } else if (spell === "gamble") {
            // Add a new gamble spell
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell,
                  showInPlayerSheet: true,

                  spellName: "New Gamble",
                  mp: 10,
                  maxTargets: 2,
                  targetDesc: "Special",
                  duration: "Instantaneous",
                  attr: "will",
                  targets: [
                    {
                      rangeFrom: 1,
                      rangeTo: 6,
                      effect: "First Effect",
                      secondRoll: false,
                      secondEffects: [],
                    },
                    {
                      rangeFrom: 7,
                      rangeTo: 12,
                      effect: "Second Effect",
                      secondRoll: false,
                      secondEffects: [],
                    },
                  ],
                },
              ],
            };
          } else {
            if (window.electron) {
              window.electron.alert(
                spell.toUpperCase() + " spell not implemented yet"
              );
            } else {
              alert(spell.toUpperCase() + " spell not implemented yet");
            }

            return cls;
          }
        }
        return cls;
      }),
    }));

    setSelectedClass(null);
    setSelectedSpell(null);
  };

  const addSpellFromCompendium = (spell) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === selectedClass) {
          if (spell.spellType === "default") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell.spellType,
                  name: t(spell.name),
                  mp: spell.mp,
                  maxTargets: spell.maxTargets,
                  targetDesc: t(spell.targetDesc),
                  duration: t(spell.duration),
                  description: t(spell.description),
                  isOffensive: spell.isOffensive,
                  attr1: spell.attr1,
                  attr2: spell.attr2,
                  isMagisphere: spell.isMagisphere || false,
                  showInPlayerSheet: true,
                },
              ],
            };
          } else if (spell.spellType === "gamble") {
            return {
              ...cls,
              spells: [
                ...cls.spells,
                {
                  spellType: spell.spellType,
                  spellName: t(spell.name),
                  mp: spell.mp,
                  maxTargets: spell.maxTargets,
                  targetDesc: t(spell.targetDesc),
                  duration: t(spell.duration),
                  attr: spell.attr,
                  targets: spell.targets,
                  isMagisphere: spell.isMagisphere || false,
                  showInPlayerSheet: true,
                },
              ],
            };
          }
        }
        return cls;
      }),
    }));
    setSelectedClass(null);
    setSelectedSpell(null);
  };

  const handleEditDefaultSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenSpellDefaultModal(true);
  };

  const handleEditArcanistSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenSpellArcanistModal(true);
  };

  const handleEditAlchemyRank = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenAlchemyRankModal(true);
  };

  const handleEditAlchemyTarget = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenAlchemyTargetModal(true);
  };

  const handleEditAlchemyEffects = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenAlchemyEffectsModal(true);
  };

  const handleEditInfusionSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenInfusionModal(true);
  };

  const handleEditMagitechRank = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenMagitechRankModal(true);
  };

  const handleEditGambleSpell = (spell, spellClass, spellIndex) => {
    setSpellBeingEdited(spell);
    setEditingSpellClass(spellClass);
    setEditingSpellIndex(spellIndex);
    setOpenGambleModal(true);
  };

  const handleSaveEditedSpell = (spellIndex, editedSpell) => {
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === editingSpellClass) {
          return {
            ...cls,
            spells: cls.spells.map((spell, index) => {
              if (index === spellIndex) {
                return editedSpell;
              }
              return spell;
            }),
          };
        }
        return cls;
      }),
    }));

    closeModals();
  };

  const handleDeleteSpell = (spellIndex) => {
    console.log(
      "spellIndex",
      spellIndex,
      "editingSpellClass",
      editingSpellClass
    );
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls) => {
        if (cls.name === editingSpellClass) {
          return {
            ...cls,
            spells: cls.spells.filter((_, index) => index !== spellIndex),
          };
        }
        return cls;
      }),
    }));
    closeModals();
  };

  const closeModals = () => {
    setOpenSpellDefaultModal(false);
    setOpenSpellArcanistModal(false);
    setOpenAlchemyRankModal(false);
    setOpenAlchemyTargetModal(false);
    setOpenAlchemyEffectsModal(false);
    setOpenInfusionModal(false);
    setOpenGambleModal(false);
    setSpellBeingEdited(null);
    setOpenMagitechRankModal(false);
    setEditingSpellClass(null);
  };

  return (
    <>
      {isEditMode ? (
        <>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container>
              <Grid item xs={12}>
                <CustomHeader
                  type="top"
                  headerText={t("Spells")}
                  showIconButton={false}
                />
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    options={player.classes
                      .filter(
                        (cls) =>
                          cls.benefits.spellClasses &&
                          cls.benefits.spellClasses.length > 0
                      )
                      .map((cls) => t(cls.name))}
                    value={
                      selectedClass
                        ? t(
                            player.classes.find(
                              (cls) => cls.name === selectedClass
                            )?.name
                          )
                        : null
                    }
                    onChange={handleClassChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Class")}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    options={filteredSpells}
                    value={selectedSpell}
                    onChange={handleSpellChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Select Spell")}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    disabled={!selectedClass}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Button
                    variant="contained"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedSpell}
                    onClick={() => addNewSpell(selectedSpell)}
                  >
                    {t("Add Blank Spell")}
                  </Button>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <Button
                    variant="outlined"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedClass}
                    onClick={() => setOpenCompendiumModal(true)}
                  >
                    {t("Add from Compendium")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
        </>
      ) : null}
      {player.classes
        .filter((cls) => cls.spells && cls.spells.length > 0)
        .filter(
          (cls) =>
            cls.benefits.spellClasses && cls.benefits.spellClasses.length > 0
        )
        .map((cls) => {
          const spellTypeHeaders = {
            default: false,
            arcanist: false,
            arcanistRework: false,
            tinkererAlchemy: false,
            tinkererInfusion: false,
            tinkererMagitech: false,
            gamble: false,
          };

          return (
            <React.Fragment key={cls.name}>
              <Paper
                elevation={3}
                sx={{
                  p: "15px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                }}
              >
                <Grid container>
                  <Grid item xs={12}>
                    <CustomHeader
                      type="top"
                      headerText={t("Spells") + " - " + t(cls.name)}
                      showIconButton={false}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {cls.spells
                      .sort((a, b) => a.spellType.localeCompare(b.spellType))
                      .map((spell, index) => (
                        <React.Fragment key={index}>
                          <div
                            style={{
                              marginTop:
                                index === 0 ||
                                spell.spellType === "default" ||
                                spell.spellType === "gamble"
                                  ? 0
                                  : 50,
                            }}
                          >
                            {spell.spellType === "default" &&
                              !spellTypeHeaders.default && (
                                <>
                                  <CustomHeader2
                                    headerText={t("Default Spells")}
                                  />
                                  {(spellTypeHeaders.default = true)}
                                </>
                              )}
                            {spell.spellType === "arcanist" &&
                              !spellTypeHeaders.arcanist && (
                                <>
                                  <CustomHeader2 headerText={t("Arcana")} />
                                  {(spellTypeHeaders.arcanist = true)}
                                </>
                              )}
                            {spell.spellType === "arcanist-rework" &&
                              !spellTypeHeaders.arcanistRework && (
                                <>
                                  <CustomHeader2
                                    headerText={t("Arcana - Rework")}
                                  />
                                  {(spellTypeHeaders.arcanistRework = true)}
                                </>
                              )}
                            {spell.spellType === "tinkerer-alchemy" &&
                              !spellTypeHeaders.tinkererAlchemy && (
                                <>
                                  <CustomHeader2 headerText={t("Alchemy")} />
                                  {(spellTypeHeaders.tinkererAlchemy = true)}
                                </>
                              )}
                            {spell.spellType === "tinkerer-infusion" &&
                              !spellTypeHeaders.tinkererInfusion && (
                                <>
                                  <CustomHeader2 headerText={t("Infusions")} />
                                  {(spellTypeHeaders.tinkererInfusion = true)}
                                </>
                              )}
                            {spell.spellType === "tinkerer-magitech" &&
                              !spellTypeHeaders.tinkererMagitech && (
                                <>
                                  <CustomHeader2 headerText={t("Magitech")} />
                                  {(spellTypeHeaders.tinkererMagitech = true)}
                                </>
                              )}
                            {spell.spellType === "gamble" &&
                              !spellTypeHeaders.gamble && (
                                <>
                                  <CustomHeader2 headerText={t("Gamble")} />
                                  {(spellTypeHeaders.gamble = true)}
                                  <GambleExplain />
                                </>
                              )}
                          </div>
                          {spell.spellType === "default" && (
                            <SpellDefault
                              spellName={spell.name}
                              mp={spell.mp}
                              maxTargets={spell.maxTargets}
                              targetDesc={spell.targetDesc}
                              duration={spell.duration}
                              description={spell.description}
                              onEdit={() =>
                                handleEditDefaultSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                              isOffensive={spell.isOffensive}
                              attr1={spell.attr1}
                              attr2={spell.attr2}
                              isMagisphere={spell.isMagisphere || false}
                              showInPlayerSheet={
                                spell.showInPlayerSheet ||
                                spell.showInPlayerSheet === undefined
                              }
                              index={index}
                              key={index}
                            />
                          )}
                          {spell.spellType === "arcanist" && (
                            <SpellArcanist
                              arcana={spell}
                              rework={false}
                              key={index}
                              onEdit={() =>
                                handleEditArcanistSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "arcanist-rework" && (
                            <SpellArcanist
                              arcana={spell}
                              rework={true}
                              key={index}
                              onEdit={() =>
                                handleEditArcanistSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "tinkerer-alchemy" && (
                            <SpellTinkererAlchemy
                              alchemy={spell}
                              key={index}
                              onEditRank={() => {
                                handleEditAlchemyRank(spell, cls.name, index);
                              }}
                              onEditTargets={() => {
                                handleEditAlchemyTarget(spell, cls.name, index);
                              }}
                              onEditEffects={() => {
                                handleEditAlchemyEffects(
                                  spell,
                                  cls.name,
                                  index
                                );
                              }}
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "tinkerer-infusion" && (
                            <SpellTinkererInfusion
                              infusion={spell}
                              key={index}
                              onEdit={() =>
                                handleEditInfusionSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "tinkerer-magitech" && (
                            <SpellTinkererMagitech
                              magitech={spell}
                              key={index}
                              onEdit={() =>
                                handleEditMagitechRank(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                          {spell.spellType === "gamble" && (
                            <SpellEntropistGamble
                              gamble={spell}
                              key={index}
                              onEdit={() =>
                                handleEditGambleSpell(spell, cls.name, index)
                              }
                              isEditMode={isEditMode}
                            />
                          )}
                        </React.Fragment>
                      ))}
                  </Grid>
                </Grid>
              </Paper>
              <Divider sx={{ my: 2 }} />
            </React.Fragment>
          );
        })}
      <SpellDefaultModal
        isEditMode={isEditMode}
        open={openSpellDefaultModal}
        onClose={() => {
          setOpenSpellDefaultModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellArcanistModal
        open={openSpellArcanistModal}
        onClose={() => {
          setOpenSpellArcanistModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        spell={{ ...spellBeingEdited, index: editingSpellIndex }}
        isRework={spellBeingEdited?.spellType === "arcanist-rework"}
      />
      <SpellTinkererAlchemyRankModal
        open={openAlchemyRankModal}
        onClose={() => {
          setOpenAlchemyRankModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererAlchemyTargetModal
        open={openAlchemyTargetModal}
        onClose={() => {
          setOpenAlchemyTargetModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererAlchemyEffectsModal
        open={openAlchemyEffectsModal}
        onClose={() => {
          setOpenAlchemyEffectsModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        alchemy={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererInfusionModal
        open={openInfusionModal}
        onClose={() => {
          setOpenInfusionModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        infusion={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellTinkererMagitechRankModal
        open={openMagitechRankModal}
        onClose={() => {
          setOpenMagitechRankModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        magitech={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellEntropistGambleModal
        open={openGambleModal}
        onClose={() => {
          setOpenGambleModal(false);
          setEditingSpellClass(null);
          setSpellBeingEdited(null);
        }}
        onSave={handleSaveEditedSpell}
        onDelete={handleDeleteSpell}
        gamble={{ ...spellBeingEdited, index: editingSpellIndex }}
      />
      <SpellCompendiumModal
        open={openCompendiumModal}
        onClose={() => setOpenCompendiumModal(false)}
        typeName={selectedClass}
        onSave={(spell) => addSpellFromCompendium(spell)}
      />
    </>
  );
}
