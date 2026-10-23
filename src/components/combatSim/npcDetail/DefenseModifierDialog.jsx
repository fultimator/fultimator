import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { t } from "../../../translation/translate";

const DefenseModifierDialog = ({
  open,
  onClose,
  defenseType,
  npc,
  onUpdate,
  calcDef,
  calcMDef,
  calcAttr,
}) => {
  const [upgradeDowngrade, setUpgradeDowngrade] = useState(null);
  const [upgradeAmount, setUpgradeAmount] = useState(1);
  const [overrideValue, setOverrideValue] = useState("");

  // Reset state when dialog opens or defenseType changes
  useEffect(() => {
    if (open) {
      const currentModifier =
        defenseType === "DEF"
          ? npc.combatStats?.defenseModifier
          : npc.combatStats?.mdefenseModifier;

      const modifierSign =
        currentModifier > 0 ? 1 : currentModifier < 0 ? -1 : null;
      setUpgradeDowngrade(modifierSign);
      setUpgradeAmount(
        currentModifier ? Math.max(1, Math.abs(currentModifier)) : 1,
      );
      const overrideMap = npc.combatStats?.defenseOverride || {};
      const savedOverride =
        defenseType === "MDEF" && overrideMap.MDEF === undefined
          ? overrideMap["M.DEF"]
          : overrideMap[defenseType];
      setOverrideValue(savedOverride ?? "");
    }
  }, [open, defenseType, npc]);

  if (!defenseType) return null;

  const baseValue =
    defenseType === "DEF"
      ? calcDef
        ? calcDef(npc)
        : 0
      : calcMDef
        ? calcMDef(npc)
        : 0;

  const attrValue =
    defenseType === "DEF"
      ? calcAttr
        ? calcAttr("Slow", "Enraged", "dexterity", npc)
        : 0
      : calcAttr
        ? calcAttr("Dazed", "Enraged", "insight", npc)
        : 0;

  // Calculate final value
  const getFinalValue = () => {
    if (hasOverride) {
      return parseInt(overrideValue, 10) || 0;
    }

    let defenseValue;
    const amount = Math.max(1, Number.parseInt(upgradeAmount, 10) || 1);

    if (upgradeDowngrade === null) {
      defenseValue = baseValue;
    } else {
      defenseValue = baseValue + upgradeDowngrade * amount;
    }

    return defenseValue + (attrValue || 0);
  };

  const handleUpgradeDowngradeChange = (event, newValue) => {
    setUpgradeDowngrade(newValue);
    if (newValue !== null && (!upgradeAmount || upgradeAmount < 1)) {
      setUpgradeAmount(1);
    }
  };

  const handleOverrideChange = (event) => {
    const value = event.target.value;
    if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
      setOverrideValue(value);
    }
  };

  const handleSave = () => {
    const updates = {};
    const amount = Math.max(1, Number.parseInt(upgradeAmount, 10) || 1);

    // Handle upgrade/downgrade
    if (defenseType === "DEF") {
      updates.defenseModifier =
        upgradeDowngrade === null ? null : upgradeDowngrade * amount;
    } else {
      updates.mdefenseModifier =
        upgradeDowngrade === null ? null : upgradeDowngrade * amount;
    }

    // Handle override
    const override = overrideValue !== "" ? parseInt(overrideValue) : null;
    updates.defenseOverride = {
      ...(npc.combatStats?.defenseOverride || {}),
      [defenseType]: override,
    };

    onUpdate(updates);
    onClose();
  };

  const handleClear = () => {
    setUpgradeDowngrade(null);
    setUpgradeAmount(1);
    setOverrideValue("");
  };

  const hasOverride =
    overrideValue !== "" &&
    overrideValue !== null &&
    overrideValue !== undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {t("Edit")} {t(defenseType)}
      </DialogTitle>
      <DialogContent>
        {/* Base Value */}
        <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
          {t("Base")} {t(defenseType)}: {baseValue}
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          {defenseType === "DEF" ? "DEX" : "INS"}: d{attrValue}
        </Typography>

        {/* Upgrade/Downgrade Section */}
        <Box sx={{ my: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t("Upgrade/Downgrade")}
          </Typography>
          <ToggleButtonGroup
            value={upgradeDowngrade}
            exclusive
            onChange={handleUpgradeDowngradeChange}
            fullWidth
            sx={{ display: "flex", gap: 1 }}
          >
            <ToggleButton value={1} color="success" sx={{ flex: 1 }}>
              {t("Upgrade")}
            </ToggleButton>
            <ToggleButton value={-1} color="error" sx={{ flex: 1 }}>
              {t("Downgrade")}
            </ToggleButton>
          </ToggleButtonGroup>
          {upgradeDowngrade !== null && (
            <TextField
              fullWidth
              type="number"
              size="small"
              label={t("Amount")}
              value={upgradeAmount}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                setUpgradeAmount(Number.isNaN(value) ? "" : Math.max(1, value));
              }}
              sx={{ mt: 1 }}
              slotProps={{
                htmlInput: { min: 1 },
              }}
            />
          )}
          {upgradeDowngrade !== null && !hasOverride && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
              {t("Modified Value")}:{" "}
              {baseValue +
                upgradeDowngrade *
                  Math.max(1, Number.parseInt(upgradeAmount, 10) || 1)}
            </Typography>
          )}
        </Box>

        {/* Override Section */}
        <Box
          sx={{
            my: 2,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 1,
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t("Override")}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 1,
            }}
          >
            {t(
              "Set a specific value that overrides both base and upgrade/downgrade",
            )}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mb: 1,
            }}
          >
            {t("Final")} = {t("Override")}
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={overrideValue}
            onChange={handleOverrideChange}
            placeholder={t("Enter override value")}
            size="small"
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Box>

        {/* Final Value Display */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" align="center">
            {t("Final")} {t(defenseType)}: {getFinalValue()}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="warning">
          {t("Clear All")}
        </Button>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DefenseModifierDialog;
