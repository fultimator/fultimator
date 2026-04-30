import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Close, Delete } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const initialState = {
  name: "",
  description: "",
  requiredSlots: 1,
  socketable: "all",
  cost: 500,
  coagEffects: [],
};

function coagRowsToObject(rows) {
  return rows.reduce((acc, row) => {
    const threshold = Number(row.threshold);
    const effect = row.effect.trim();
    if (threshold > 1 && effect) acc[threshold] = effect;
    return acc;
  }, {});
}

export default function HoplosphereCreateDialog({ open, onClose, onConfirm }) {
  const { t } = useTranslate();
  const [formData, setFormData] = useState(initialState);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoagChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      coagEffects: prev.coagEffects.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const handleAddCoag = () => {
    setFormData((prev) => ({
      ...prev,
      coagEffects: [...prev.coagEffects, { threshold: 2, effect: "" }],
    }));
  };

  const handleRemoveCoag = (index) => {
    setFormData((prev) => ({
      ...prev,
      coagEffects: prev.coagEffects.filter((_, i) => i !== index),
    }));
  };

  const thresholds = formData.coagEffects.map((r) => Number(r.threshold));
  const hasDuplicateThresholds = thresholds.length !== new Set(thresholds).size;

  const handleConfirm = () => {
    onConfirm({
      id: genId(),
      ...formData,
      requiredSlots: Number(formData.requiredSlots),
      cost: Number(formData.cost) || 0,
      coagEffects: coagRowsToObject(formData.coagEffects),
    });
    setFormData(initialState);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Add Hoplosphere")}
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
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label={t("Name")}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label={t("Description")}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Slots")}</InputLabel>
              <Select
                label={t("Slots")}
                value={formData.requiredSlots}
                onChange={(e) => handleChange("requiredSlots", e.target.value)}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Socketable")}</InputLabel>
              <Select
                label={t("Socketable")}
                value={formData.socketable}
                onChange={(e) => handleChange("socketable", e.target.value)}
              >
                <MenuItem value="all">{t("All")}</MenuItem>
                <MenuItem value="weapon">{t("Weapon only")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={t("Cost")}
              value={formData.cost}
              onChange={(e) => handleChange("cost", e.target.value)}
              slotProps={{
                input: {
                  inputProps: { min: 0 },
                },
              }}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t("Coagulation")}
            </Typography>
          </Grid>
          {formData.coagEffects.map((row, index) => (
            <Grid container spacing={1} size={12} key={index}>
              <Grid size={{ xs: 4, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t("Threshold")}
                  value={row.threshold}
                  onChange={(e) =>
                    handleCoagChange(index, "threshold", e.target.value)
                  }
                  slotProps={{ input: { inputProps: { min: 2 } } }}
                />
              </Grid>
              <Grid size={{ xs: 7, sm: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("Effect")}
                  value={row.effect}
                  onChange={(e) =>
                    handleCoagChange(index, "effect", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 1, sm: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveCoag(index)}
                  aria-label={t("Delete")}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Grid size={12}>
            <Button size="small" startIcon={<Add />} onClick={handleAddCoag}>
              {t("Add Coagulation")}
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!formData.name.trim() || hasDuplicateThresholds}
          title={
            hasDuplicateThresholds
              ? t("Duplicate coagulation thresholds")
              : undefined
          }
        >
          {t("Add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
