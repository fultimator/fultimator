import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
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

export default function HoplosphereCreateDialog({
  open,
  onClose,
  onConfirm,
  currentZenit,
}) {
  const { t } = useTranslate();
  const [formData, setFormData] = useState(initialState);
  const [isFree, setIsFree] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) {
      setFormData(initialState);
      setIsFree(false);
      setQuantity(1);
    }
  }, [open]);

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
  const quantityValue = Math.max(1, Number(quantity) || 1);
  const unitCost = Number(formData.cost) || 0;
  const cost = unitCost * quantityValue;
  const cannotAfford = !isFree && currentZenit != null && cost > currentZenit;

  const handleConfirm = () => {
    onConfirm(
      {
        ...formData,
        requiredSlots: Number(formData.requiredSlots),
        cost: unitCost,
        coagEffects: coagRowsToObject(formData.coagEffects),
      },
      isFree ? 0 : cost,
      quantityValue,
    );
    setFormData(initialState);
    setIsFree(false);
    setQuantity(1);
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={t("Quantity")}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              slotProps={{
                input: {
                  inputProps: { min: 1 },
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
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  size="small"
                />
              }
              label={t("Free Item?")}
            />
          </Grid>
          <Grid size={12}>
            <Typography
              variant="caption"
              color={cannotAfford ? "error" : "text.secondary"}
            >
              {t("Cost")}: {cost}z
              {currentZenit != null && (
                <>
                  {" "}
                  &nbsp;({t("Current Zenit")}: {currentZenit}z)
                </>
              )}
              {cannotAfford ? ` - ${t("Not enough Zenit")}` : ""}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            !formData.name.trim() || hasDuplicateThresholds || cannotAfford
          }
          title={
            hasDuplicateThresholds
              ? t("Duplicate coagulation thresholds")
              : undefined
          }
        >
          {isFree ? t("Add") : t("Buy")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
