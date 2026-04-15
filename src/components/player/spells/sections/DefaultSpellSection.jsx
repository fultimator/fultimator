import { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  FormControl,
  ToggleButton,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { OffensiveSpellIcon } from "../../../icons";
import CustomTextarea from "../../../common/CustomTextarea";
import attributes from "../../../../libs/attributes";

// const DURATION_OPTIONS = ["Scene", "Instantaneous", "Special"];
// const TARGET_OPTIONS = [
//   "Self",
//   "One creature",
//   "Up to two creatures",
//   "Up to three creatures",
//   "Up to four creatures",
//   "Up to five creatures",
//   "One equipped weapon",
//   "Special",
// ];

export default function DefaultSpellSection({
  formState,
  setFormState,
  t,
}) {
  const [inputDuration, setInputDuration] = useState(formState.duration || "");
  const [inputTarget, setInputTarget] = useState(formState.targetDesc || "");

  useEffect(() => {
    setInputDuration(formState.duration || "");
    setInputTarget(formState.targetDesc || "");
  }, [formState.duration, formState.targetDesc]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (event, newValue) => {
    setInputDuration(newValue);
    handleChange("duration", newValue);
  };

  const handleTargetChange = (event, newValue) => {
    setInputTarget(newValue);
    handleChange("targetDesc", newValue);
  };

  const duration = [t("Scene"), t("Instantaneous"), t("Special")];
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

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 7
        }}>
        <TextField
          label={t("Spell Name")}
          variant="outlined"
          fullWidth
          value={formState.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          slotProps={{
            htmlInput: { maxLength: 50 }
          }}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 1
        }}>
        <FormControl
          variant="standard"
          fullWidth
          style={{ height: "100%" }}
        >
          <ToggleButton
            value={formState.isOffensive || false}
            selected={formState.isOffensive}
            onChange={() =>
              handleChange("isOffensive", !formState.isOffensive)
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
      <Grid
        size={{
          xs: 6,
          sm: 2
        }}>
        <TextField
          type="number"
          label={t("MP x Target")}
          variant="outlined"
          fullWidth
          value={
            formState.mp === null || formState.mp === undefined
              ? ""
              : formState.mp.toString()
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
      <Grid
        size={{
          xs: 6,
          sm: 2
        }}>
        <TextField
          type="number"
          label={t("Max Targets")}
          variant="outlined"
          fullWidth
          value={
            formState.maxTargets === null ||
            formState.maxTargets === undefined
              ? ""
              : formState.maxTargets.toString()
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
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <Autocomplete
          id="target-autocomplete"
          options={target}
          value={inputTarget}
          onChange={handleTargetChange}
          onInputChange={(event, newValue) => {
            setInputTarget(newValue);
            handleChange("targetDesc", newValue);
          }}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("Target Description")}
              fullWidth
              slotProps={{
                htmlInput: { ...params.inputProps, maxLength: 100 }
              }}
            />
          )}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6
        }}>
        <Autocomplete
          id="duration-autocomplete"
          options={duration}
          value={inputDuration}
          onChange={handleDurationChange}
          onInputChange={(event, newValue) => {
            setInputDuration(newValue);
            handleChange("duration", newValue);
          }}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("Duration")}
              fullWidth
              slotProps={{
                htmlInput: { ...params.inputProps, maxLength: 50 }
              }}
            />
          )}
        />
      </Grid>
      {formState.isOffensive ? (
        <>
          <Grid
            size={{
              xs: 6,
              sm: 6
            }}>
            <Select
              fullWidth
              value={formState.attr1 || "dexterity"}
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
          <Grid
            size={{
              xs: 6,
              sm: 6
            }}>
            <Select
              fullWidth
              value={formState.attr2 || "dexterity"}
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
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <CustomTextarea
          label={t("Description")}
          fullWidth
          value={formState.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          maxRows={10}
          maxLength={1500}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <FormControlLabel
          control={
            <Switch
              checked={
                formState.showInPlayerSheet === undefined ||
                formState.showInPlayerSheet ||
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
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
        <FormControlLabel
          control={
            <Switch
              checked={formState.isMagisphere || false}
              onChange={(e) =>
                handleChange("isMagisphere", e.target.checked)
              }
            />
          }
          label={t("Is a Magisphere?")}
        />
      </Grid>
    </Grid>
  );
}
