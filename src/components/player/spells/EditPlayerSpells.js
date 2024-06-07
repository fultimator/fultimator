import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import CustomTextarea from "../../common/CustomTextarea";
import { OffensiveSpellIcon } from "../../icons";
import { Delete } from "@mui/icons-material";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const [isOffensiveSpell, setIsOffensiveSpell] = useState(false);
  const [isReworkArcanist, setIsReworkArcanist] = useState(false);

  const [openAlchemyTargetModal, setOpenAlchemyTargetModal] = useState(false);
  const [openAlchemyEffectModal, setOpenAlchemyEffectModal] = useState(false);

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
                  >
                    {t("Add Spell")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
          {/*Sample Default Spell*/}
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
                <CustomHeader
                  type="top"
                  headerText={t("Sample Default Spell")}
                />
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
          </Paper>
          <Divider sx={{ my: 2 }} />
          {/*Sample Arcana Spell*/}
          {/*
          ## ARCANIST
          Arcanum: (class: "arcanist")
          {
            name: Spell.name,
            domains: Spell.effect1,
            merge: Spell.effect2,
            dismiss: Spell.effect3
          }

          ## ARCANIST REWORK
          Arcanum: (class: "arcanist-rework")
          {
            name: Spell.name,
            domains: Spell.effect1,
            merge: Spell.effect2,
            dismiss: Spell.effect3,
            pulse: Spell.effect4 //Placed it on 4 for easy switch rework/non-rework
          }
          */}
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
                <CustomHeader
                  type="top"
                  headerText={t("Sample Arcana Spell")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Arcana Name")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Domain")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Description")}
                  variant="outlined"
                  fullWidth
                  maxRows={10}
                  maxLength={1000}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Merge Name")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextarea
                  label={t("Merge Benefit")}
                  fullWidth
                  maxRows={10}
                  maxLength={1000}
                />
              </Grid>
              {isReworkArcanist && (
                <>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      label={t("Pulse Name")}
                      variant="outlined"
                      fullWidth
                      inputProps={{ maxLength: 50 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <CustomTextarea
                      label={t("Pulse Benefit")}
                      fullWidth
                      maxRows={10}
                      maxLength={1000}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Dismiss Name")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextarea
                  label={t("Dismiss Benefit")}
                  fullWidth
                  maxRows={10}
                  maxLength={1000}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Checkbox
                  checked={isReworkArcanist}
                  onChange={(e) => {
                    setIsReworkArcanist(e.target.checked);
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
          {/*Sample Tinkerer-Alchemy Spell*/}
          {/*
          Alchemy: (class: "tinkerer-alchemy")
          {
            name: Spell.name,
            rank: Spell.mpCostTarget, //rank in number for easier automation, description is bound to rank
            targets: [{
              minDie,
              maxDie,
              target
            }],
            effects: [{
              die (if 0 then = any die),
              effect
            }]
          }
          */}
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
                <CustomHeader
                  type="top"
                  headerText={t("Sample Tinkerer-Alchemy Spell")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t("Alchemy Name")}
                  variant="outlined"
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="max-rank">
                    {t("Max Rank Unlocked")}
                  </InputLabel>
                  <Select defaultValue={"1"} id="max-rank" labelId="max-rank">
                    <MenuItem value={1}>
                      {t("Basic") + "   [" + t("IP Cost") + ": " + 3 + "]"}
                    </MenuItem>
                    <MenuItem value={2}>
                      {t("Advanced") + "   [" + t("IP Cost") + ": " + 4 + "]"}
                    </MenuItem>
                    <MenuItem value={3}>
                      {t("Superior") + "   [" + t("IP Cost") + ": " + 5 + "]"}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  sx={{ width: "100%" }}
                  onClick={() => setOpenAlchemyTargetModal(true)}
                >
                  {t("Edit Targets")}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  sx={{ width: "100%" }}
                  onClick={() => setOpenAlchemyEffectModal(true)}
                >
                  {t("Edit Effects")}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div>Display Target lists</div>
                <div>Display Die effects</div>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
          {/*Sample Tinkerer-Infusion Spell*/}
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
                <CustomHeader
                  type="top"
                  headerText={t("Sample Tinkerer-Infusion Spell")}
                />
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ my: 2 }} />
          {/*Sample Tinkerer-Magitech Spell*/}
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
                <CustomHeader
                  type="top"
                  headerText={t("Sample Tinkerer-Magitech Spell")}
                />
              </Grid>
            </Grid>
          </Paper>
        </>
      ) : null}

      {/* DIALOGS */}
      {/* Alchemy Target Modal */}
      <Dialog
        open={openAlchemyTargetModal}
        onClose={() => setOpenAlchemyTargetModal(false)}
        PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {t("Edit Alchemy Targets")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ marginTop: "10px" }}>
            {/* map 4 times*/}
            {[...Array(4)].map((e, i) => (
              <>
                <Grid item xs={2} md={1}>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </Grid>
                <Grid item xs={5} md={1}>
                  <TextField
                    label={t("Min Die")}
                    variant="outlined"
                    type="number"
                    fullWidth
                  ></TextField>
                </Grid>
                <Grid item xs={5} md={1}>
                  <TextField
                    label={t("Max Die")}
                    variant="outlined"
                    type="number"
                    fullWidth
                  ></TextField>
                </Grid>
                <Grid item xs={12} md={9}>
                  <TextField
                    label={t("The alchemy affects...")}
                    variant="outlined"
                    inputProps={{ maxLength: 300 }}
                    fullWidth
                  ></TextField>
                </Grid>
              </>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" sx={{ width: "100%" }}>
                {t("Add new target")}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained">{t("Save Changes")}</Button>
        </DialogActions>
      </Dialog>
      {/* Alchemy Effect Modal */}
      <Dialog
        open={openAlchemyEffectModal}
        onClose={() => setOpenAlchemyEffectModal(false)}
        PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {t("Edit Alchemy Effects")}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ marginTop: "10px" }}>
            {/* map 22 times*/}
            {[...Array(22)].map((e, i) => (
              <>
                <Grid item xs={2} md={1}>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </Grid>
                <Grid item xs={3} md={3}>
                  <TextField
                    label={t("Die")}
                    variant="outlined"
                    type="number"
                    fullWidth
                  ></TextField>
                </Grid>
                <Grid item xs={7} md={8}>
                  <TextField
                    label={t("Each creature affected by the potion...")}
                    variant="outlined"
                    inputProps={{ maxLength: 300 }}
                    fullWidth
                  ></TextField>
                </Grid>
              </>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" sx={{ width: "100%" }}>
                {t("Add new effect")}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained">{t("Save Changes")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
