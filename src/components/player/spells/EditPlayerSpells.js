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
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import CustomTextarea from "../../common/CustomTextarea";
import { OffensiveSpellIcon } from "../../icons";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const [isOffensiveSpell, setIsOffensiveSpell] = useState(false);
  const [isReworkArcanist, setIsReworkArcanist] = useState(false);

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
            <Grid container >
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("Duration")} variant="outlined" fullWidth />
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("Domain")} variant="outlined" fullWidth />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Description")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Merge Name")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextarea label={t("Merge Benefit")} fullWidth />
              </Grid>
              {isReworkArcanist && (
                <>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      label={t("Pulse Name")}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <CustomTextarea label={t("Pulse Benefit")} fullWidth />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Dismiss Name")}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextarea label={t("Dismiss Benefit")} fullWidth />
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
    </>
  );
}
