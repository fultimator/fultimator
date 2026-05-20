import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { Close } from "@mui/icons-material";
import { SharedWeaponCard } from "../../../../components/shared/itemCards";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import {
  normalizeWeaponLike,
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
  getWeaponRange,
  getWeaponPrec,
} from "../../../../libs/weaponNormalization";
import {
  validateWeaponPersisted,
  buildWeaponFormState,
  buildWeaponSavePayload,
  calcWeaponPreview,
} from "../../../../forms/schema/itemSchemas/weapon";
import { SchemaFieldRenderer } from "../../../../forms/rendering/SchemaFieldRenderer";
import {
  weaponFieldConfig,
  weaponGroupLabels,
} from "../../../../forms/rendering/config/itemConfigs/weapon";

export default function PlayerWeaponModal({
  open,
  onClose,
  editWeaponIndex,
  weapon,
  onAddWeapon,
  onDeleteWeapon,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() => buildWeaponFormState(weapon));
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildWeaponFormState(weapon));
  }, [weapon]);

  const {
    base,
    name,
    att1,
    att2,
    martial,
    type,
    hands,
    category,
    damageHrZero,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityCost,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
    totalBonus,
  } = formState;

  const { cost, damage, prec } = calcWeaponPreview(formState);

  useEffect(() => {
    const bonus = Math.floor(cost / 1000) * 2;
    setFormState((prev) => ({ ...prev, totalBonus: bonus }));
  }, [damageReworkBonus, cost, qualityCost, rework]);

  const set = (key, value) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editWeaponIndex !== null) {
        onDeleteWeapon(editWeaponIndex);
      }
      onClose();
    },
  });

  const handleFileUpload = (data) => {
    if (data) {
      setFormState(buildWeaponFormState(normalizeWeaponLike(data)));
    }
    fileInputRef.current.value = null;
  };

  const handleSave = () => {
    const updatedWeapon = buildWeaponSavePayload(formState, weapon);

    if (import.meta.env.DEV) {
      const result = validateWeaponPersisted(updatedWeapon);
      if (!result.success) {
        console.warn("[PlayerWeaponModal] weapon schema validation failed", result.error.issues);
      }
    }
    onAddWeapon(updatedWeapon);
  };

  const handleClearFields = () => {
    setFormState(buildWeaponFormState(null));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: "lg",
            },
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Add Weapon")}
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
              {/* Core: base, name, category, hands, martial */}
              <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="core"
                  label={t("Weapon")}
                  cols={2}
                />
              </Grid>

              {/* Accuracy: att1, att2 */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="accuracy"
                  cols={2}
                />
              </Grid>

              {/* Damage: type, hrZero */}
              <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="damage"
                  cols={2}
                />
              </Grid>

              {/* Quality: preset, text, cost */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="quality"
                  cols={2}
                />
              </Grid>

              {/* Rare bonuses */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="rareBonus"
                  cols={1}
                  extraProps={{
                    rework,
                    totalBonus,
                    basePrec: getWeaponPrec(base),
                  }}
                />
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="rare"
                  cols={2}
                />
                <SchemaFieldRenderer
                  config={weaponFieldConfig}
                  groupLabels={weaponGroupLabels}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="modifiers"
                  cols={2}
                />
              </Grid>

              {/* Controls: upload, clear */}
              <Grid container spacing={1} sx={{ alignItems: "center", mb: 1 }}>
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
                        const result = JSON.parse(reader.result);
                        handleFileUpload(result);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{ display: "none" }}
                />
              </Grid>
            </Grid>

            {/* Right column: preview card (sticky so it stays visible while scrolling) */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ position: "sticky", top: 0 }}>
              <SharedWeaponCard
                item={{
                  base,
                  name,
                  att1,
                  att2,
                  martial,
                  type,
                  hands,
                  category,
                  range: getWeaponRange(base),
                  cost,
                  damage: { value: damage, type, hrZero: damageHrZero },
                  prec,
                  quality,
                  qualityCost,
                  damageBonus,
                  damageReworkBonus,
                  precBonus,
                  rework,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {editWeaponIndex !== null && (
            <Button onClick={handleDelete} color="error" variant="contained">
              {t("Delete")}
            </Button>
          )}
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={weapon?.magicannon}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => {
          if (editWeaponIndex !== null) {
            onDeleteWeapon(editWeaponIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this weapon?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {t(category)} - {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
