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
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import {
  getMnemosphereCost,
  MNEMOSPHERE_LEVELS,
} from "../../../../libs/mnemospheres";

export default function CompendiumSphereImportDialog({
  open,
  item,
  type,
  onClose,
  onConfirm,
  currentZenit,
}) {
  const { t } = useTranslate();
  const [selectedLvl, setSelectedLvl] = useState(1);
  const [isFree, setIsFree] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) return;
    setSelectedLvl(item?.baseLvl ?? item?.lvl ?? 1);
    setIsFree(false);
    setQuantity(1);
  }, [item, open]);

  const isMnemosphere = type === "mnemospheres";
  const quantityValue = isMnemosphere ? 1 : Math.max(1, Number(quantity) || 1);
  const unitCost = isMnemosphere
    ? getMnemosphereCost(selectedLvl)
    : Number(item?.cost) || 0;
  const cost = unitCost * quantityValue;
  const cannotAfford = !isFree && currentZenit != null && cost > currentZenit;

  const handleConfirm = () => {
    const parsedLevel = Number(selectedLvl);
    onConfirm({
      level: Number.isFinite(parsedLevel) ? parsedLevel : 1,
      cost: isFree ? 0 : cost,
      quantity: quantityValue,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t(isMnemosphere ? "Add Mnemosphere" : "Add Hoplosphere")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {item?.name ??
                `${item?.class ?? ""} ${t(isMnemosphere ? "Mnemosphere" : "Hoplosphere")}`}
            </Typography>
          </Grid>
          {isMnemosphere && (
            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Base Level")}</InputLabel>
                <Select
                  value={selectedLvl}
                  onChange={(e) => setSelectedLvl(e.target.value)}
                  label={t("Base Level")}
                >
                  {MNEMOSPHERE_LEVELS.map((lvl) => (
                    <MenuItem key={lvl} value={lvl}>
                      {lvl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {!isMnemosphere && (
            <Grid size={12}>
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
          )}
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
          disabled={cannotAfford}
        >
          {isFree ? t("Add") : t("Buy")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
