import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  /* 
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  Checkbox,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  */
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
//import CustomTextarea from "../../common/CustomTextarea";
//import { OffensiveSpellIcon } from "../../icons";
import SpellDefault from "./SpellDefault";
import CustomHeader2 from "../../common/CustomHeader2";
//import { Delete } from "@mui/icons-material";
import SpellDefaultModal from "./SpellDefaultModal";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const [openSpellDefaultModal, setOpenSpellDefaultModal] = useState(false);

  //const [isOffensiveSpell, setIsOffensiveSpell] = useState(false);
  //const [isReworkArcanist, setIsReworkArcanist] = useState(false);

  //const [openAlchemyTargetModal, setOpenAlchemyTargetModal] = useState(false);
  //const [openAlchemyEffectModal, setOpenAlchemyEffectModal] = useState(false);

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
                  attr1: "dex",
                  attr2: "dex",
                },
              ],
            };
          } else {
            return cls;
          }
        }
        return cls;
      }),
    }));

    setSelectedClass(null);
    setSelectedSpell(null);
  };

  const handleEditDefaultSpell = (spell) => {
    setOpenSpellDefaultModal(true);
    console.log("Edit default spell:", spell.name);
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
                <CustomHeader type="top" headerText={t("Spells")} />
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
          {/*Sample Default Spell*/}
          {/*}
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CustomHeader type="top" headerText={t("CLASS NAME")} />
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  label={t("Spell Name")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <FormControl variant="standard" fullWidth>
                  <ToggleButtonGroup
                    size="large"
                    value={isOffensiveSpell}
                    exclusive
                    onChange={(event, newValue) =>
                      setIsOffensiveSpell(newValue)
                    }
                    aria-label="text alignment"
                  >
                    <ToggleButton value="offensive" aria-label="left aligned">
                      <OffensiveSpellIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  type="number"
                  label={t("MP x Target")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  type="number"
                  label={t("Max Targets")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Target Description")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Duration")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>
              {isOffensiveSpell ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <Select fullWidth defaultValue={"dexterity"}>
                      <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
                      <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
                      <MenuItem value={"might"}>{t("Mig")}</MenuItem>
                      <MenuItem value={"will"}>{t("Wil")}</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select fullWidth defaultValue={"dexterity"}>
                      <MenuItem value={"dexterity"}>{t("Dex")}</MenuItem>
                      <MenuItem value={"insight"}>{t("Ins")}</MenuItem>
                      <MenuItem value={"might"}>{t("Mig")}</MenuItem>
                      <MenuItem value={"will"}>{t("Wil")}</MenuItem>
                    </Select>
                  </Grid>
                </>
              ) : null}
              <Grid item xs={12} sm={12}>
                <CustomTextarea label={t("Description")} fullWidth />
              </Grid>
            </Grid>
          </Paper>*/}
          <Divider sx={{ my: 2 }} />
        </>
      ) : null}
      {player.classes
        .filter((cls) => cls.spells && cls.spells.length > 0)
        .filter(
          (cls) =>
            cls.benefits.spellClasses && cls.benefits.spellClasses.length > 0
        )
        .map((cls) => (
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
                    headerText={t("Spells") + " - " + cls.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  {cls.spells.some((spl) => spl.spellType === "default") && (
                    <CustomHeader2 headerText={t("Default Spells")} />
                  )}
                  {cls.spells.map((spell, index) => (
                    <SpellDefault
                      spellName={spell.name}
                      mp={spell.mp}
                      maxTargets={spell.maxTargets}
                      targetDesc={spell.targetDesc}
                      duration={spell.duration}
                      description={spell.description}
                      onEdit={() => handleEditDefaultSpell(spell, index)}
                      isEditMode={isEditMode}
                      isOffensive={spell.isOffensiveSpell}
                      attr1={spell.attr1}
                      attr2={spell.attr2}
                      key={index}
                    />
                  ))}
                </Grid>
              </Grid>
            </Paper>
            <Divider sx={{ my: 2 }} />
          </React.Fragment>
        ))}
        <SpellDefaultModal isEditMode={isEditMode} open={openSpellDefaultModal} onClose={() => setOpenSpellDefaultModal(false)}  />
    </>
  );
}
