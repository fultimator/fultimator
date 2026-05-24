import React, { useState, useEffect, useRef } from "react";
import { useTranslate } from "../../../../translation/translate";
import {
  Grid,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { SharedArmorCard } from "../../../../components/shared/itemCards";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { TabbedSchemaFormRenderer } from "../../../../forms/rendering/TabbedSchemaFormRenderer";
import {
  armorFieldConfig,
  armorTabs,
} from "../../../../forms/rendering/config/itemConfigs/armor";
import {
  validateArmorPersisted,
  buildArmorFormState,
  buildArmorSavePayload,
  applyArmorSlotTierChange,
  applyArmorZenitSideEffect,
  getArmorSlotCostInfo,
} from "../../../../forms/schema/itemSchemas/armor";
import { buildSphereData } from "../../../../libs/technospheres";
import { normalizeDefensiveItem } from "../../../../libs/equipmentDefensiveNormalization";

export default function PlayerArmorModal({
  open,
  onClose,
  editArmorIndex,
  armorPlayer,
  onAddArmor,
  onDeleteArmor,
  player,
  setPlayer,
}) {
  const { t } = useTranslate();

  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;
  const technospheresVariant =
    player?.settings?.optionalRules?.technospheresVariant ?? "standard";
  const isSlotsVariant =
    isTechnospheres && technospheresVariant !== "mnemospheres";

  const ctx = { player, setPlayer };

  const [formState, setFormState] = useState(() =>
    buildArmorFormState(armorPlayer, ctx),
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildArmorFormState(armorPlayer, ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armorPlayer]);

  const { name, base, quality, cost, slots, slotted } = formState;

  const slotCostInfo = getArmorSlotCostInfo(formState, armorPlayer, ctx);
  const slotCostDelta = slotCostInfo?.delta ?? 0;
  const currentZenit = slotCostInfo?.currentZenit ?? 0;
  const cannotAffordSlotTier = slotCostInfo?.cannotAfford ?? false;
  const slotCostChangeLabel =
    slotCostDelta > 0
      ? `${t("Deduct on save")}: ${slotCostDelta}z`
      : slotCostDelta < 0
        ? `${t("Refund on save")}: ${Math.abs(slotCostDelta)}z`
        : "";
  const currentZenitLabel = `${t("Current Zenit")}: ${currentZenit}z`;

  const handleSlotTierChange = (tier) => {
    setFormState((prev) => applyArmorSlotTierChange(prev, tier, ctx));
  };

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpenFalse,
    handleDelete: handleDeleteWithConfirm,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editArmorIndex !== null) {
        onDeleteArmor(editArmorIndex);
      }
      onClose();
    },
  });

  const handleFileUpload = (rawData) => {
    const data = normalizeDefensiveItem(rawData);
    if (data && data.base?.category === "Armor") {
      const normalized = { ...buildArmorFormState(data, ctx), ...data };
      const validation = validateArmorPersisted(normalized);
      if (!validation.success) {
        console.warn(
          "[PlayerArmorModal] uploaded armor failed validation",
          validation.error.issues,
        );
        fileInputRef.current.value = null;
        return;
      }
      setFormState(buildArmorFormState(data, ctx));
    }
    fileInputRef.current.value = null;
  };

  const handleSave = () => {
    const updatedArmor = buildArmorSavePayload(formState, armorPlayer);

    if (import.meta.env.DEV) {
      const result = validateArmorPersisted(updatedArmor);
      if (!result.success) {
        console.warn(
          "[PlayerArmorModal] armor schema validation failed",
          result.error.issues,
        );
      }
    }

    onAddArmor(updatedArmor);
    applyArmorZenitSideEffect(formState, armorPlayer, ctx);
  };

  const handleClearFields = () => {
    setFormState(buildArmorFormState(null, ctx));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: "100%", maxWidth: "lg" },
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Add Armor")}
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
          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* Left column: form fields */}
            <Grid size={{ xs: 12, md: 7 }}>
              <TabbedSchemaFormRenderer
                tabs={armorTabs}
                config={armorFieldConfig}
                state={formState}
                onChange={(next) => {
                  if (isSlotsVariant && next.slots !== formState.slots) {
                    handleSlotTierChange(next.slots);
                  } else {
                    setFormState(next);
                  }
                }}
                surface="edit"
                cols={2}
                extraProps={{ player, isWeapon: false }}
              />

              <Grid container spacing={1} sx={{ alignItems: "center", mt: 2 }}>
                <Grid>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid>
                  <Button variant="outlined" onClick={handleClearFields}>
                    {t("Clear All Fields")}
                  </Button>
                </Grid>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          handleFileUpload(JSON.parse(String(reader.result)));
                        } catch (error) {
                          console.warn(
                            "[PlayerArmorModal] invalid JSON upload",
                            error,
                          );
                          fileInputRef.current.value = null;
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{ display: "none" }}
                />
              </Grid>
            </Grid>

            {/* Right column: preview card */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ position: "sticky", top: 0 }}>
              <SharedArmorCard
                item={{
                  base,
                  ...base,
                  name,
                  cost,
                  martial: formState.martial,
                  quality,
                  init: formState.init,
                  rework: formState.rework,
                  defModifier: parseInt(formState.defModifier),
                  mDefModifier: parseInt(formState.mDefModifier),
                  initModifier: parseInt(formState.initModifier),
                  slots,
                  slotted,
                }}
                sphereData={buildSphereData({ slots, slotted }, player)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {editArmorIndex !== null && (
            <Button
              onClick={handleDeleteWithConfirm}
              color="error"
              variant="contained"
            >
              {t("Delete")}
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {slotCostChangeLabel && (
            <Typography
              variant="body2"
              color={cannotAffordSlotTier ? "error" : "text.secondary"}
            >
              {slotCostChangeLabel} ({currentZenitLabel})
              {cannotAffordSlotTier ? ` - ${t("Not enough Zenit")}` : ""}
            </Typography>
          )}
          <Button onClick={onClose} color="secondary">
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={cannotAffordSlotTier}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpenFalse}
        onConfirm={() => {
          if (editArmorIndex !== null) {
            onDeleteArmor(editArmorIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this armor?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {t("Armor")} - {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
