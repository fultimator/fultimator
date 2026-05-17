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
import armor from "../../../../libs/armor";
import { SLOT_TIERS } from "../technospheres/slotTiers";
import { SharedArmorCard } from "../../../../components/shared/itemCards";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { SchemaFieldRenderer } from "../../../../forms/rendering/SchemaFieldRenderer";
import { armorFieldConfig } from "../../../../forms/rendering/config/itemConfigs/armor";
import { validateArmorPersisted } from "../../../../forms/schema/itemSchemas/armor";
import { buildSphereData } from "../../../../libs/technospheres";
import { normalizeDefensiveItem } from "../../../../libs/equipmentDefensiveNormalization";

function buildInitialState(armorPlayer, isSlotsVariant) {
  const base = armorPlayer?.base || armor[0];
  return {
    itemType: "armor",
    base,
    name: armorPlayer?.name || base.name,
    martial: armorPlayer?.martial ?? base.martial,
    def: armorPlayer?.def ?? base.def,
    mdef: armorPlayer?.mdef ?? base.mdef,
    init: armorPlayer?.init ?? base.init,
    rework: armorPlayer?.rework || false,
    quality: armorPlayer?.quality || "",
    qualityCost: armorPlayer?.qualityCost || 0,
    selectedQuality: armorPlayer?.selectedQuality || "",
    isSlotsVariant: isSlotsVariant ?? false,
    slots: armorPlayer?.slots ?? "alpha",
    slotted: armorPlayer?.slotted ?? [],
    cost: armorPlayer?.cost ?? base.cost,
    defModifier: armorPlayer?.modifiers?.def ?? armorPlayer?.defModifier ?? 0,
    mDefModifier:
      armorPlayer?.modifiers?.mdef ?? armorPlayer?.mDefModifier ?? 0,
    initModifier: armorPlayer?.initModifier ?? 0,
    magicModifier: armorPlayer?.magicModifier ?? 0,
    precModifier: armorPlayer?.modifiers?.accuracy ?? 0,
    damageMeleeModifier: armorPlayer?.damageMeleeModifier ?? 0,
    damageRangedModifier: armorPlayer?.damageRangedModifier ?? 0,
    isEquipped: armorPlayer?.isEquipped || false,
    fuid: armorPlayer?.fuid,
  };
}

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

  const [formState, setFormState] = useState(() =>
    buildInitialState(armorPlayer, isSlotsVariant),
  );
  const [paidSlots, setPaidSlots] = useState(armorPlayer?.slots ?? "alpha");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildInitialState(armorPlayer, isSlotsVariant));
    setPaidSlots(armorPlayer?.slots ?? "alpha");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armorPlayer]);

  const { name, base, quality, cost, slots, slotted } = formState;

  const paidSlotTier =
    SLOT_TIERS.find((t) => t.value === paidSlots) ?? SLOT_TIERS[0];
  const selectedSlotTier =
    SLOT_TIERS.find((t) => t.value === slots) ?? SLOT_TIERS[0];
  const slotCostDelta = isSlotsVariant
    ? selectedSlotTier.cost - paidSlotTier.cost
    : 0;
  const currentZenit = player?.info?.zenit ?? 0;
  const cannotAffordSlotTier = slotCostDelta > currentZenit;
  const slotCostChangeLabel =
    slotCostDelta > 0
      ? `${t("Deduct on save")}: ${slotCostDelta}z`
      : slotCostDelta < 0
        ? `${t("Refund on save")}: ${Math.abs(slotCostDelta)}z`
        : "";
  const currentZenitLabel = `${t("Current Zenit")}: ${currentZenit}z`;

  const handleSlotTierChange = (tier) => {
    const newTier = SLOT_TIERS.find((t) => t.value === tier);
    const hoplospheres = player?.equipment?.[0]?.hoplospheres ?? [];
    const kept = [];
    let usedCost = 0;
    for (const id of slotted) {
      const hoplo = hoplospheres.find((h) => h.id === id);
      const slotCost = hoplo?.requiredSlots ?? 1;
      if (usedCost + slotCost <= (newTier?.slots ?? 1)) {
        kept.push(id);
        usedCost += slotCost;
      }
    }
    setFormState((prev) => ({ ...prev, slots: tier, slotted: kept }));
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
      const normalized = {
        ...buildInitialState(data, isSlotsVariant),
        ...data,
      };
      const validation = validateArmorPersisted(normalized);
      if (!validation.success) {
        console.warn(
          "[PlayerArmorModal] uploaded armor failed validation",
          validation.error.issues,
        );
        fileInputRef.current.value = null;
        return;
      }
      const next = buildInitialState(null, isSlotsVariant);
      if (data.base) next.base = data.base;
      if (data.name) next.name = data.name;
      if (data.martial !== undefined) next.martial = data.martial;
      if (data.init !== undefined) next.init = data.init;
      if (data.rework) next.rework = data.rework;
      if (data.quality) next.quality = data.quality;
      if (data.qualityCost) next.qualityCost = data.qualityCost;
      if (data.defModifier) next.defModifier = data.defModifier;
      if (data.mDefModifier) next.mDefModifier = data.mDefModifier;
      if (data.initModifier) next.initModifier = data.initModifier;
      if (data.magicModifier) next.magicModifier = data.magicModifier;
      if (data.modifiers?.accuracy !== undefined) {
        next.precModifier = data.modifiers.accuracy;
      }
      if (data.damageMeleeModifier)
        next.damageMeleeModifier = data.damageMeleeModifier;
      if (data.damageRangedModifier)
        next.damageRangedModifier = data.damageRangedModifier;
      next.cost = (next.base?.cost ?? 0) + (Number(next.qualityCost) || 0);
      setFormState(next);
    }
    fileInputRef.current.value = null;
  };

  const handleSave = () => {
    const updatedArmor = {
      ...formState,
      category: "Armor",
      modifiers: {
        ...(formState.modifiers ?? {}),
        def: parseInt(formState.defModifier),
        mdef: parseInt(formState.mDefModifier),
        init: parseInt(formState.initModifier),
        magic: parseInt(formState.magicModifier),
        accuracy: parseInt(formState.precModifier),
        damageMelee: parseInt(formState.damageMeleeModifier),
        damageRanged: parseInt(formState.damageRangedModifier),
      },
      def: formState.base?.def ?? formState.def,
      mdef: formState.base?.mdef ?? formState.mdef,
      defModifier: parseInt(formState.defModifier),
      mDefModifier: parseInt(formState.mDefModifier),
      initModifier: parseInt(formState.initModifier),
      magicModifier: parseInt(formState.magicModifier),
      precModifier: parseInt(formState.precModifier),
      damageMeleeModifier: parseInt(formState.damageMeleeModifier),
      damageRangedModifier: parseInt(formState.damageRangedModifier),
      isEquipped:
        (armorPlayer?.martial || false) !== formState.martial
          ? false
          : formState.isEquipped,
      ...(isSlotsVariant || armorPlayer?.slots || armorPlayer?.slotted
        ? { slots, slotted }
        : {}),
    };

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

    if (slotCostDelta !== 0 && setPlayer) {
      setPlayer((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          zenit: Math.max(0, (prev.info?.zenit ?? 0) - slotCostDelta),
        },
      }));
    }
  };

  const handleClearFields = () => {
    setFormState(buildInitialState(null, isSlotsVariant));
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
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={armorFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="core"
                  label={t("Armor")}
                  cols={2}
                />
              </Grid>

              {isSlotsVariant ? (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <SchemaFieldRenderer
                    config={armorFieldConfig}
                    state={formState}
                    onChange={(next) => {
                      if (next.slots !== formState.slots) {
                        handleSlotTierChange(next.slots);
                      } else {
                        setFormState(next);
                      }
                    }}
                    surface="edit"
                    group="slots"
                    label={t("Technospheres")}
                    cols={1}
                    extraProps={{ player, isWeapon: false }}
                  />
                </Grid>
              ) : (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <SchemaFieldRenderer
                    config={armorFieldConfig}
                    state={formState}
                    onChange={setFormState}
                    surface="edit"
                    group="quality"
                    label={t("Quality")}
                    cols={2}
                  />
                </Grid>
              )}

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={armorFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="modifiers"
                  label={t("Modifiers")}
                  cols={2}
                />
              </Grid>

              <Grid container spacing={1} sx={{ alignItems: "center" }}>
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
