import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { Close, Delete } from "@mui/icons-material"; // Import Delete icon
import { useTranslate } from "../../../translation/translate";
import attributes from "../../../libs/attributes";

const secondEffectsOptions = [
  { dieValue: 1, effect: "Wind" },
  { dieValue: 2, effect: "Bolt" },
  { dieValue: 3, effect: "Dark" },
  { dieValue: 4, effect: "Earth" },
  { dieValue: 5, effect: "Fire" },
  { dieValue: 6, effect: "Poison" },
];

export default function SpellEntropistGambleModal({
  open,
  onClose,
  onSave,
  onDelete,
  gamble,
}) {
  const { t } = useTranslate();
  const [editedGamble, setEditedGamble] = useState(gamble || {});
  const [targets, setTargets] = useState(gamble?.targets || []);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (gamble) {
      setEditedGamble(gamble || {});
      setTargets(gamble.targets || []);
    }
  }, [gamble]);

  const validateTargets = useCallback(() => {
    let error = "";

    // Ensure at least two targets
    if (targets.length < 2) {
      error = t("At least two targets are required.");
    } else {
      const ranges = targets.map((target) => ({
        from: target.rangeFrom,
        to: target.rangeTo,
      }));

      // Check for overlap
      ranges.sort((a, b) => a.from - b.from);
      for (let i = 0; i < ranges.length - 1; i++) {
        if (ranges[i].to >= ranges[i + 1].from) {
          error = t("Ranges cannot overlap.");
          break;
        }
      }

      // Ensure all 12 die faces are covered
      const requiredDieFaces = new Set(
        Array.from({ length: 12 }, (_, i) => i + 1)
      );
      const coveredDieFaces = new Set();
      for (const range of ranges) {
        for (let i = range.from; i <= range.to; i++) {
          coveredDieFaces.add(i);
        }
      }
      if (
        coveredDieFaces.size !== 12 ||
        !Array.from(requiredDieFaces).every((face) => coveredDieFaces.has(face))
      ) {
        error = t("All 12 die faces must be covered without overlap.");
      }

      // Ensure no target effect is blank
      if (!error) {
        for (const target of targets) {
          if (!target.effect.trim()) {
            error = t("All target effect fields must be filled out.");
            break;
          }
        }
      }

      // Check second effects if enabled
      const targetsWithSecondEffects = targets.filter(
        (target) => target.secondRoll
      );
      if (!error) {
        for (const target of targetsWithSecondEffects) {
          if (!target.secondEffects?.length) {
            error = t("All 6 die values for second effects must be covered.");
            break;
          }
          const secondEffectDieFaces = new Set();
          for (const effect of target.secondEffects) {
            secondEffectDieFaces.add(effect.dieValue);
            if (!effect.effect.trim()) {
              error = t("All second effect fields must be filled out.");
              break;
            }
          }
          if (
            secondEffectDieFaces.size !== 6 ||
            !Array.from(requiredDieFaces)
              .slice(0, 6)
              .every((face) => secondEffectDieFaces.has(face))
          ) {
            error = t("All 6 die values for second effects must be covered.");
            break;
          }
        }
      }
    }

    setValidationError(error);
    return !error;
  }, [targets, t]);

  useEffect(() => {
    validateTargets();
  }, [targets, validateTargets]);

  const handleChange = (field, value) => {
    setEditedGamble((prev) => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (index, field, value) => {
    setTargets((prev) => {
      const newTargets = [...prev];
      if (field === "secondRoll") {
        newTargets[index] = {
          ...newTargets[index],
          [field]: value,
          secondEffects: value ? newTargets[index].secondEffects || [] : [],
        };
      } else {
        newTargets[index] = {
          ...newTargets[index],
          [field]: field === "effect" ? value : parseInt(value, 10),
        };
      }
      return newTargets;
    });
  };

  const handleSecondEffectChange = (targetIndex, effectIndex, field, value) => {
    setTargets((prev) => {
      const newTargets = [...prev];
      newTargets[targetIndex] = {
        ...newTargets[targetIndex],
        secondEffects: newTargets[targetIndex].secondEffects.map(
          (effect, idx) =>
            idx === effectIndex ? { ...effect, [field]: value } : effect
        ),
      };
      return newTargets;
    });
  };

  const handleAddTarget = () => {
    setTargets((prev) => [
      ...prev,
      {
        rangeFrom: "",
        rangeTo: "",
        effect: "",
        secondRoll: false,
        secondEffects: [],
      },
    ]);
  };

  const handleRemoveTarget = (index) => {
    setTargets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSecondEffect = (index) => {
    setTargets((prev) => {
      const newTargets = [...prev];
      newTargets[index] = {
        ...newTargets[index],
        secondEffects: [
          ...newTargets[index].secondEffects,
          { dieValue: 1, effect: "" }, // default values
        ],
      };
      return newTargets;
    });
  };

  const handleRemoveSecondEffect = (targetIndex, effectIndex) => {
    setTargets((prev) => {
      const newTargets = [...prev];
      newTargets[targetIndex] = {
        ...newTargets[targetIndex],
        secondEffects: newTargets[targetIndex].secondEffects.filter(
          (_, i) => i !== effectIndex
        ),
      };
      return newTargets;
    });
  };

  const handleSave = () => {
    if (validateTargets()) {
      const sortedTargets = [...targets].sort(
        (a, b) => a.rangeFrom - b.rangeFrom
      );
      onSave(editedGamble.index, { ...editedGamble, targets: sortedTargets });
    }
  };

  const handleDelete = () => {
    onDelete(editedGamble.index);
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
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("edit_gamble_spell")}
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
          <Grid item xs={12}>
            <TextField
              label={t("Spell Name")}
              variant="outlined"
              fullWidth
              value={editedGamble.spellName}
              onChange={(e) => handleChange("spellName", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              label={t("MP x Dice")}
              variant="outlined"
              fullWidth
              value={
                editedGamble.mp === null || editedGamble.mp === undefined
                  ? ""
                  : editedGamble.mp.toString()
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
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              label={t("Max Throwable Dices")}
              variant="outlined"
              fullWidth
              value={
                editedGamble.maxTargets === null ||
                editedGamble.maxTargets === undefined
                  ? ""
                  : editedGamble.maxTargets.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 100)
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
                } else if (value > 100) {
                  value = 100;
                }
                handleChange("maxTargets", value);
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="attr-label">{t("Attribute")}</InputLabel>
              <Select
                labelId="attr-label"
                label={t("Attribute")}
                value={editedGamble.attr || "will"}
                onChange={(e) => handleChange("attr", e.target.value)}
              >
                {Object.keys(attributes).map((key) => (
                  <MenuItem key={key} value={key}>
                    {attributes[key].shortcaps}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {targets.map((target, index) => (
            <Grid
              item
              xs={12}
              key={index}
              container
              spacing={2}
              sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}
            >
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel id={`range-from-label-${index}`}>
                    {t("Range From")}
                  </InputLabel>
                  <Select
                    labelId={`range-from-label-${index}`}
                    id={`range-from-select-${index}`}
                    value={target.rangeFrom}
                    label={t("Range From")}
                    onChange={(e) =>
                      handleTargetChange(index, "rangeFrom", e.target.value)
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel id={`range-to-label-${index}`}>
                    {t("Range To")}
                  </InputLabel>
                  <Select
                    labelId={`range-to-label-${index}`}
                    id={`range-to-select-${index}`}
                    value={target.rangeTo}
                    label={t("Range To")}
                    onChange={(e) =>
                      handleTargetChange(index, "rangeTo", e.target.value)
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={t("Effect")}
                  value={target.effect}
                  onChange={(e) =>
                    handleTargetChange(index, "effect", e.target.value)
                  }
                  fullWidth
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={target.secondRoll}
                      onChange={(e) =>
                        handleTargetChange(
                          index,
                          "secondRoll",
                          e.target.checked
                        )
                      }
                      color="primary"
                    />
                  }
                  label={t("Second Roll")}
                />
              </Grid>
              <Grid item xs={12} sm={1} sx={{ mt: 2 }}>
                <IconButton
                  aria-label="remove"
                  onClick={() => handleRemoveTarget(index)}
                  sx={{ color: "error.main" }}
                >
                  <Delete />
                </IconButton>
              </Grid>
              {target.secondRoll && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  {target.secondEffects.map((effect, effectIndex) => (
                    <Grid container spacing={2} key={effectIndex}>
                      <Grid item xs={5} sm={3}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel
                            id={`die-value-label-${index}-${effectIndex}`}
                          >
                            {t("Die")}
                          </InputLabel>
                          <Select
                            labelId={`die-value-label-${index}-${effectIndex}`}
                            label={t("Die")}
                            value={effect.dieValue}
                            onChange={(e) =>
                              handleSecondEffectChange(
                                index,
                                effectIndex,
                                "dieValue",
                                e.target.value
                              )
                            }
                          >
                            {secondEffectsOptions.map(({ dieValue }) => (
                              <MenuItem key={dieValue} value={dieValue}>
                                {dieValue}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={5} sm={6}>
                        <TextField
                          label={t("Effect")}
                          value={effect.effect}
                          onChange={(e) =>
                            handleSecondEffectChange(
                              index,
                              effectIndex,
                              "effect",
                              e.target.value
                            )
                          }
                          fullWidth
                          inputProps={{ maxLength: 200 }}
                        />
                      </Grid>
                      <Grid item xs={2} sm={3}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() =>
                            handleRemoveSecondEffect(index, effectIndex)
                          }
                        >
                          {t("Remove")}
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                  {target.secondEffects.length < 6 && (
                    <Button
                      variant="contained"
                      onClick={() => handleAddSecondEffect(index)}
                      sx={{ mt: 2 }}
                    >
                      {t("Add Second Effect")}
                    </Button>
                  )}
                </Grid>
              )}
            </Grid>
          ))}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleAddTarget}>
              {t("Add Target")}
            </Button>
          </Grid>
          {validationError && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <FormHelperText error>{validationError}</FormHelperText>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            sx={{ mt: 4 }}
            control={
              <Switch
                checked={editedGamble.showInPlayerSheet || false}
                onChange={(e) =>
                  handleChange("showInPlayerSheet", e.target.checked)
                }
              />
            }
            label={t("Show in Character Sheet")}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControlLabel
            control={
              <Switch
                checked={editedGamble.isMagisphere || false}
                onChange={(e) => handleChange("isMagisphere", e.target.checked)}
              />
            }
            label={t("Is a Magisphere?")}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Spell")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!!validationError}
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
