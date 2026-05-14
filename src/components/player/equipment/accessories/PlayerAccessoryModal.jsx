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
import { SharedAccessoryCard } from "../../../../components/shared/itemCards";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { SchemaFieldRenderer } from "../../../../forms/rendering/SchemaFieldRenderer";
import { accessoryFieldConfig } from "../../../../forms/rendering/config/itemConfigs/accessory";
import { validateAccessoryPersisted } from "../../../../forms/schema/itemSchemas/accessory";

function buildInitialState(accessory) {
  return {
    itemType: "accessory",
    name: accessory?.name || "",
    quality: accessory?.quality || "",
    qualityCost: accessory?.qualityCost || 0,
    selectedQuality: accessory?.selectedQuality || "",
    cost: accessory?.cost ?? 0,
    defModifier: accessory?.modifiers?.def ?? accessory?.defModifier ?? 0,
    mDefModifier: accessory?.modifiers?.mdef ?? accessory?.mDefModifier ?? 0,
    initModifier: accessory?.initModifier ?? 0,
    magicModifier: accessory?.magicModifier ?? 0,
    precModifier:
      accessory?.modifiers?.accuracy ?? accessory?.precModifier ?? 0,
    damageMeleeModifier: accessory?.damageMeleeModifier ?? 0,
    damageRangedModifier: accessory?.damageRangedModifier ?? 0,
    isEquipped: accessory?.isEquipped || false,
  };
}

export default function PlayerAccessoryModal({
  open,
  onClose,
  editAccIndex,
  accessory,
  onAddAccessory,
  onDeleteAccessory,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() =>
    buildInitialState(accessory),
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildInitialState(accessory));
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

  const handleFileUpload = (data) => {
    if (data) {
      const next = buildInitialState(null);
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
      if (data.precModifier) next.precModifier = data.precModifier;
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
    const updatedAccessory = {
      ...formState,
      defModifier: parseInt(formState.defModifier),
      mDefModifier: parseInt(formState.mDefModifier),
      initModifier: parseInt(formState.initModifier),
      magicModifier: parseInt(formState.magicModifier),
      precModifier: parseInt(formState.precModifier),
      damageMeleeModifier: parseInt(formState.damageMeleeModifier),
      damageRangedModifier: parseInt(formState.damageRangedModifier),
    };

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
    setFormState(buildInitialState(null));
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
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={accessoryFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="core"
                  label={t("Accessory")}
                  cols={2}
                />
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={accessoryFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="quality"
                  label={t("Quality")}
                  cols={2}
                />
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={accessoryFieldConfig}
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
                        handleFileUpload(JSON.parse(reader.result));
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
