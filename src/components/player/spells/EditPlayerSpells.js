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

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const [openSpellDefaultModal, setOpenSpellDefaultModal] = useState(false);
  const [openSpellArcanistModal, setOpenSpellArcanistModal] = useState(false);
  const [spellBeingEdited, setSpellBeingEdited] = useState(null);
  const [editingSpellClass, setEditingSpellClass] = useState(null);
  const [editingSpellIndex, setEditingSpellIndex] = useState(null);

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
          } else {
            alert(spell.toUpperCase() + " spell not implemented yet");
            return cls;
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

    setOpenSpellDefaultModal(false);
    setOpenSpellArcanistModal(false);
    setSpellBeingEdited(null);
    setEditingSpellClass(null);
  };

  const handleDeleteSpell = (spellIndex) => {
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
    setOpenSpellDefaultModal(false);
    setOpenSpellArcanistModal(false);
    setSpellBeingEdited(null);
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
                <Grid item xs={12} sm={5}>
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
                <Grid item xs={12} sm={5}>
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
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    sx={{ width: "100%", height: "100%" }}
                    disabled={!selectedSpell}
                    onClick={() => addNewSpell(selectedSpell)}
                  >
                    {t("Add Spell")}
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
    </>
  );
}
