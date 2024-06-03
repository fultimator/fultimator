import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, TextField, Button, Divider } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerSpells({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);

  const handleClassChange = (event, newValue) => {
    setSelectedClass(newValue ? player.classes.find(cls => t(cls.name) === newValue)?.name : null);
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
            <Grid container spacing={2}>
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
                    value={selectedClass ? t(player.classes.find(cls => cls.name === selectedClass)?.name) : null}
                    onChange={handleClassChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Class")}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    sx={{ marginLeft: "20px" }}
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
          <Divider sx={{ my: 2 }} />{" "}
        </>
      ) : null}
    </>
  );
}
