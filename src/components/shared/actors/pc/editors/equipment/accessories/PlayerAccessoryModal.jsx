import React, { useState, useEffect, useRef } from "react";
import { useTranslate } from "/src/translation/translate";
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
import { SharedAccessoryCard } from "/src/components/shared/items";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  accessoryFieldConfig,
  accessoryTabs,
} from "/src/forms/rendering/config/itemConfigs/accessory";
import {
  validateAccessoryPersisted,
  buildAccessoryFormState,
  buildAccessorySavePayload,
} from "/src/forms/schema/itemSchemas/accessory";
import { normalizeDefensiveItem } from "/src/libs/equipmentDefensiveNormalization";

export default function PlayerAccessoryModal({
  open,
  onClose,
  editAccIndex,
  accessory,
  onAddAccessory,
  onDeleteAccessory,
  initialTab,
  initialExpandedIndex,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() =>
    buildAccessoryFormState(accessory),
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildAccessoryFormState(accessory));
  }, [accessory]);

  const { name, quality, cost } = formState;

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editAccIndex !== null) {
        onDeleteAccessory(editAccIndex);
      }
      onClose();
    },
  });

  const handleFileUpload = (rawData) => {
    const data = normalizeDefensiveItem(rawData);
    if (data) {
      const normalized = { ...buildAccessoryFormState(data), ...data };
      const validation = validateAccessoryPersisted(normalized);
      if (!validation.success) {
        console.warn(
          "[PlayerAccessoryModal] uploaded accessory failed validation",
          validation.error.issues,
        );
        fileInputRef.current.value = null;
        return;
      }
      const next = buildAccessoryFormState(null);
      if (data.name) next.name = data.name;
      if (data.quality) {
        next.selectedQuality = "";
        next.quality = data.quality;
      }
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
      next.cost = Number(next.qualityCost) || 0;
      setFormState(next);
    }
    fileInputRef.current.value = null;
  };

  const handleSave = () => {
    const updatedAccessory = buildAccessorySavePayload(formState);

    if (import.meta.env.DEV) {
      const result = validateAccessoryPersisted(updatedAccessory);
      if (!result.success) {
        console.warn(
          "[PlayerAccessoryModal] accessory schema validation failed",
          result.error.issues,
        );
      }
    }

    onAddAccessory(updatedAccessory);
  };

  const handleClearFields = () => {
    setFormState(buildAccessoryFormState(null));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: "100%", maxWidth: "lg", minHeight: "500px" },
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Add Accessory")}
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
                tabs={accessoryTabs}
                config={accessoryFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                cols={2}
                initialTab={initialTab}
                extraProps={
                  initialExpandedIndex !== undefined
                    ? { initialExpandedIndex }
                    : undefined
                }
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
                            "[PlayerAccessoryModal] invalid JSON upload",
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
              <SharedAccessoryCard item={{ name, cost, quality }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {editAccIndex !== null && (
            <Button onClick={handleDelete} color="error" variant="contained">
              {t("Delete")}
            </Button>
          )}
          <Button onClick={handleSave} color="primary" variant="contained">
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => {
          if (editAccIndex !== null) {
            onDeleteAccessory(editAccIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this accessory?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
