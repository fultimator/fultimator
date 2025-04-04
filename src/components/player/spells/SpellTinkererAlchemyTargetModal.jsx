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

export default function SpellTinkererAlchemyTargetModal({
  open,
  onClose,
  onSave,
  alchemy,
}) {
  const { t } = useTranslate();
  const [editedAlchemy, setEditedAlchemy] = useState(alchemy || {});
  const [targets, setTargets] = useState(alchemy?.targets || []);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (alchemy) {
      setEditedAlchemy(alchemy || {});
      setTargets(alchemy.targets || []);
    }
  }, [alchemy]);

  const validateTargets = useCallback(() => {
    let error = "";

    const ranges = targets.map(({ rangeFrom, rangeTo }) => ({ rangeFrom, rangeTo }));
    const flatRanges = ranges.flatMap(({ rangeFrom, rangeTo }) => {
      const rangeArray = [];
      for (let i = rangeFrom; i <= rangeTo; i++) {
        rangeArray.push(i);
      }
      return rangeArray;
    });

    const hasOverlap = flatRanges.some(
      (value, index, array) => array.indexOf(value) !== index
    );

    if (hasOverlap) {
      error = t("Ranges cannot overlap.");
    } else if (flatRanges.length < 20 || new Set(flatRanges).size !== 20) {
      error = t("All die faces from 1 to 20 must be covered without overlap.");
    } else if (targets.length < 2) {
      error = t("At least two targets are required.");
    }

    setValidationError(error);
    return !error;
  }, [targets, t]);

  useEffect(() => {
    validateTargets();
  }, [targets, validateTargets]);

  const handleTargetChange = (index, field, value) => {
    setTargets((prev) => {
      const newTargets = [...prev];
      newTargets[index] = {
        ...newTargets[index],
        [field]: field === "effect" ? value : parseInt(value, 10),
      };
      return newTargets;
    });
  };

  const handleAddTarget = () => {
    setTargets((prev) => [...prev, { rangeFrom: "", rangeTo: "", effect: "" }]);
  };

  const handleRemoveTarget = (index) => {
    setTargets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (validateTargets()) {
      const sortedTargets = [...targets].sort((a, b) => a.rangeFrom - b.rangeFrom);
      onSave(alchemy.index, { ...editedAlchemy, targets: sortedTargets });
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
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Edit Target")}
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
          {targets.map((target, index) => (
            <Grid item xs={12} key={index} container spacing={2}>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id={`range-from-label-${index}`}>{t("Range From")}</InputLabel>
                  <Select
                    labelId={`range-from-label-${index}`}
                    id={`range-from-select-${index}`}
                    value={target.rangeFrom}
                    label={t("Range From")}
                    onChange={(e) =>
                      handleTargetChange(index, "rangeFrom", e.target.value)
                    }
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id={`range-to-label-${index}`}>{t("Range To")}</InputLabel>
                  <Select
                    labelId={`range-to-label-${index}`}
                    id={`range-to-select-${index}`}
                    value={target.rangeTo}
                    label={t("Range To")}
                    onChange={(e) =>
                      handleTargetChange(index, "rangeTo", e.target.value)
                    }
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  label={t("Effect")}
                  value={target.effect}
                  onChange={(e) =>
                    handleTargetChange(index, "effect", e.target.value)
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                sx={{height: "100%"}}
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveTarget(index)}
                >
                  {t("Remove")}
                </Button>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleAddTarget}>
              {t("Add Target")}
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
