import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  ToggleButton,
  Select,
  MenuItem,
  IconButton,
  FormControlLabel,
  Switch,
  Autocomplete
} from "@mui/material";
import attributes from "../../../libs/attributes";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { OffensiveSpellIcon } from "../../icons";
import { Close } from "@mui/icons-material";

export default function SpellDefaultModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
}) {
  const { t } = useTranslate();
  const [editedSpell, setEditedSpell] = useState(spell || {});
  const [inputDuration, setInputDuration] = useState(editedSpell.duration || "");
  const [inputTarget, setInputTarget] = useState(editedSpell.targetDesc || "");

  const duration = [
    t("Scene"),
    t("Instantaneous"),
    t("Special"),
  ];

  const target = [
    t("Self"),
    t("One creature"),
    t("Up to two creatures"),
    t("Up to three creatures"),
    t("Up to four creatures"),
    t("Up to five creatures"),
    t("One equipped weapon"),
    t("Special"),
  ];

  // useEffect(() => {
  //   setEditedSpell(spell || {});
  // }, [spell]);

  useEffect(() => {
    if (spell) {
      setEditedSpell(spell || {});
      setInputDuration(spell.duration || "");
      setInputTarget(spell.targetDesc || "");
    }
  }, [spell]);

  const handleChange = (field, value) => {
    setEditedSpell((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(spell.index, editedSpell);
  };

  const handleDelete = () => {
    onDelete(spell.index);
  };

  const handleDurationChange = (event, newValue) => {
    setInputDuration(newValue);
    handleChange("duration", newValue);
  };

  const handleDurationInputChange = (event, newValue) => {
    setInputDuration(newValue);
    handleChange("duration", newValue);
  };

  const handleTargetChange = (event, newValue) => {
    setInputTarget(newValue);
    handleChange("targetDesc", newValue);
  };

  const handleTargetInputChange = (event, newValue) => {
    setInputTarget(newValue);
    handleChange("targetDesc", newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Spell")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={7}>
            <TextField
              label={t("Spell Name")}
              variant="outlined"
              fullWidth
              value={editedSpell.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <FormControl
              variant="standard"
              fullWidth
              style={{ height: "100%" }}
            >
              <ToggleButton
                value={editedSpell.isOffensive}
                selected={editedSpell.isOffensive}
                onChange={() =>
                  handleChange("isOffensive", !editedSpell.isOffensive)
                }
                aria-label="offensive-toggle"
                style={{
                  height: "100%",
                }}
              >
                <OffensiveSpellIcon />
              </ToggleButton>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              type="number"
              label={t("MP x Target")}
              variant="outlined"
              fullWidth
              value={
                editedSpell.mp === null || editedSpell.mp === undefined
                  ? ""
                  : editedSpell.mp.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 999)
                ) {
                  handleChange("mp", value === "" ? 0 : parseInt(value, 10));
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                } else if (value > 999) {
                  value = 999;
                }
                handleChange("mp", value);
              }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              type="number"
              label={t("Max Targets")}
              variant="outlined"
              fullWidth
              value={
                editedSpell.maxTargets === null ||
                  editedSpell.maxTargets === undefined
                  ? ""
                  : editedSpell.maxTargets.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 999)
                ) {
                  handleChange(
                    "maxTargets",
                    value === "" ? 0 : parseInt(value, 10)
                  );
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                } else if (value > 999) {
                  value = 999;
                }
                handleChange("maxTargets", value);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* <TextField
              label={t("Target Description")}
              variant="outlined"
              fullWidth
              value={editedSpell.targetDesc || ""}
              onChange={(e) => handleChange("targetDesc", e.target.value)}
              inputProps={{ maxLength: 100 }}
            /> */}
            <Autocomplete
              id="target-autocomplete"
              options={target}
              value={inputTarget}
              onChange={handleTargetChange}
              onInputChange={handleTargetInputChange}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Target Description")}
                  fullWidth
                  inputProps={{ ...params.inputProps, maxLength: 100 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* <TextField
              label={t("Duration")}
              variant="outlined"
              fullWidth
              value={editedSpell.duration || ""}
              onChange={(e) => handleChange("duration", e.target.value)}
              inputProps={{ maxLength: 100 }}
            /> */}
            <Autocomplete
              id="duration-autocomplete"
              options={duration}
              value={inputDuration}
              onChange={handleDurationChange}
              onInputChange={handleDurationInputChange}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Duration")}
                  fullWidth
                  inputProps={{ ...params.inputProps, maxLength: 50 }}
                />
              )}
            />
          </Grid>
          {editedSpell.isOffensive ? (
            <>
              <Grid item xs={6} sm={6}>
                <Select
                  fullWidth
                  value={editedSpell.attr1 || "dexterity"}
                  onChange={(e) => handleChange("attr1", e.target.value)}
                >
                  <MenuItem value={"dexterity"}>
                    {attributes["dexterity"].shortcaps}
                  </MenuItem>
                  <MenuItem value={"insight"}>
                    {attributes["insight"].shortcaps}
                  </MenuItem>
                  <MenuItem value={"might"}>
                    {attributes["might"].shortcaps}
                  </MenuItem>
                  <MenuItem value={"will"}>
                    {attributes["will"].shortcaps}
                  </MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6} sm={6}>
                <Select
                  fullWidth
                  value={editedSpell.attr2 || "dexterity"}
                  onChange={(e) => handleChange("attr2", e.target.value)}
                >
                  <MenuItem value={"dexterity"}>
                    {attributes["dexterity"].shortcaps}
                  </MenuItem>
                  <MenuItem value={"insight"}>
                    {attributes["insight"].shortcaps}
                  </MenuItem>
                  <MenuItem value={"might"}>
                    {attributes["might"].shortcaps}
                  </MenuItem>
                  <MenuItem value={"will"}>
                    {attributes["will"].shortcaps}
                  </MenuItem>
                </Select>
              </Grid>
            </>
          ) : null}
          <Grid item xs={12} sm={12}>
            <CustomTextarea
              label={t("Description")}
              fullWidth
              value={editedSpell.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              maxRows={10}
              maxLength={1500}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    editedSpell.showInPlayerSheet === undefined ||
                    editedSpell.showInPlayerSheet ||
                    false
                  }
                  onChange={(e) =>
                    handleChange("showInPlayerSheet", e.target.checked)
                  }
                />
              }
              label={t("Show in Character Sheet")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Spell")}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
