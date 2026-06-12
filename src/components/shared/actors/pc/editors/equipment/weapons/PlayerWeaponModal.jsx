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
import { useTranslate } from "/src/translation/translate";
import { Close } from "@mui/icons-material";
import { SharedWeaponCard } from "/src/components/shared/items";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import {
  normalizeWeaponLike,
  getWeaponRange,
  getWeaponPrec,
} from "/src/libs/weaponNormalization";
import {
  validateWeaponPersisted,
  buildWeaponFormState,
  buildWeaponSavePayload,
  calcWeaponPreview,
} from "/src/forms/schema/itemSchemas/weapon";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  weaponFieldConfig,
  weaponGroupLabels,
  weaponTabs,
} from "/src/forms/rendering/config/itemConfigs/weapon";

export default function PlayerWeaponModal({
  open,
  onClose,
  editWeaponIndex,
  weapon,
  onAddWeapon,
  onDeleteWeapon,
  initialTab,
  initialExpandedIndex,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() =>
    buildWeaponFormState(weapon),
  );
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
    totalBonus,
  } = formState;

  const { cost, damage, prec } = calcWeaponPreview(formState);

  useEffect(() => {
    const bonus = Math.floor(cost / 1000) * 2;
    setFormState((prev) => ({ ...prev, totalBonus: bonus }));
  }, [damageReworkBonus, cost, qualityCost, rework]);

  const _set = (key, value) =>
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
        console.warn(
          "[PlayerWeaponModal] weapon schema validation failed",
          result.error.issues,
        );
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
              minHeight: "500px",
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
              <TabbedSchemaFormRenderer
                tabs={weaponTabs}
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                cols={2}
                initialTab={initialTab}
                extraProps={{
                  rework,
                  totalBonus,
                  basePrec: getWeaponPrec(base),
                  ...(initialExpandedIndex !== undefined ? { initialExpandedIndex } : {}),
                }}
              />

              {/* Controls: upload, clear */}
              <Grid
                container
                spacing={1}
                sx={{ alignItems: "center", mb: 1, mt: 2 }}
              >
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
