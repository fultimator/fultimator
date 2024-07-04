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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";

export default function SpellTinkererAlchemyEffectsModal({
  open,
  onClose,
  onSave,
  alchemy,
}) {
  const { t } = useTranslate();
  const [editedAlchemy, setEditedAlchemy] = useState(alchemy || {});
  const [effects, setEffects] = useState(alchemy?.effects || []);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (alchemy) {
      setEditedAlchemy(alchemy || {});
      setEffects(alchemy.effects || []);
    }
  }, [alchemy]);

  const validateEffects = useCallback(() => {
    let error = "";

    const usedValues = effects.map(({ dieValue }) => dieValue);
    const uniqueValues = new Set(usedValues.filter((value) => value !== 0));

    if (usedValues.filter((value) => value !== 0).length !== uniqueValues.size) {
      error = t("Each non-'Any' die value must be unique.");
    }

    setValidationError(error);
    return !error;
  }, [effects, t]);

  useEffect(() => {
    validateEffects();
  }, [effects, validateEffects]);

  const handleEffectChange = (index, field, value) => {
    setEffects((prev) => {
      const newEffects = [...prev];
      newEffects[index] = {
        ...newEffects[index],
        [field]: field === "dieValue" ? parseInt(value, 10) : value,
      };
      return newEffects;
    });
  };

  const handleAddEffect = () => {
    setEffects((prev) => [...prev, { dieValue: "", effect: "" }]);
  };

  const handleRemoveEffect = (index) => {
    setEffects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (validateEffects()) {
      // Separate effects with "Any" dieValue (0) from specific dieValues
      const anyDieEffects = effects.filter((effect) => effect.dieValue === 0);
      const specificDieEffects = effects.filter((effect) => effect.dieValue !== 0);

      // Sort specificDieEffects by dieValue in ascending order
      specificDieEffects.sort((a, b) => a.dieValue - b.dieValue);

      // Concatenate anyDieEffects on top of sorted specificDieEffects
      const sortedEffects = [...anyDieEffects, ...specificDieEffects];

      onSave(alchemy.index, { ...editedAlchemy, effects: sortedEffects });
    }
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
        {t("Edit Effects")}
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
          {effects.map((effect, index) => (
            <Grid item xs={12} key={index} container spacing={2}>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel id={`die-value-label-${index}`}>
                    {t("Die Value")}
                  </InputLabel>
                  <Select
                    labelId={`die-value-label-${index}`}
                    id={`die-value-select-${index}`}
                    value={effect.dieValue}
                    label={t("Die Value")}
                    onChange={(e) =>
                      handleEffectChange(index, "dieValue", e.target.value)
                    }
                  >
                    <MenuItem value={0}>{t("Any")}</MenuItem>
                    {Array.from({ length: 20 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  label={t("Effect")}
                  value={effect.effect}
                  onChange={(e) =>
                    handleEffectChange(index, "effect", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveEffect(index)}
                >
                  {t("Remove")}
                </Button>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleAddEffect}>
              {t("Add Effect")}
            </Button>
          </Grid>
          {validationError && (
            <Grid item xs={12}>
              <FormHelperText error>{validationError}</FormHelperText>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSave}
          disabled={!!validationError}
        >
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
