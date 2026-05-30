import React, { useState, useEffect, useRef } from "react";
import { useTranslate } from "/src/translation/translate";
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { SharedShieldCard } from "/src/components/shared/items";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  shieldFieldConfig,
  shieldTabs,
} from "/src/forms/rendering/config/itemConfigs/shield";
import {
  validateShieldPersisted,
  buildShieldFormState,
  buildShieldSavePayload,
} from "/src/forms/schema/itemSchemas/shield";
import { normalizeDefensiveItem } from "/src/libs/equipmentDefensiveNormalization";

export default function PlayerShieldModal({
  open,
  onClose,
  editShieldIndex,
  shield,
  onAddShield,
  onDeleteShield,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() =>
    buildShieldFormState(shield),
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormState(buildShieldFormState(shield));
  }, [shield]);

  const { name, base, quality, cost } = formState;

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {
      if (editShieldIndex !== null) {
        onDeleteShield(editShieldIndex);
      }
      onClose();
    },
  });

  const handleFileUpload = (rawData) => {
    const data = normalizeDefensiveItem(rawData);
    if (data && data.base?.category === "Shield") {
      const normalized = { ...buildShieldFormState(data), ...data };
      const validation = validateShieldPersisted(normalized);
      if (!validation.success) {
        console.warn(
          "[PlayerShieldModal] uploaded shield failed validation",
          validation.error.issues,
        );
        fileInputRef.current.value = null;
        return;
      }
      setFormState(buildShieldFormState(data));
    }
    fileInputRef.current.value = null;
  };

  const handleSave = () => {
    const updatedShield = buildShieldSavePayload(formState, shield);

    if (import.meta.env.DEV) {
      const result = validateShieldPersisted(updatedShield);
      if (!result.success) {
        console.warn(
          "[PlayerShieldModal] shield schema validation failed",
          result.error.issues,
        );
      }
    }

    onAddShield(updatedShield);
  };

  const handleClearFields = () => {
    setFormState(buildShieldFormState(null));
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
          {t("Add Shield")}
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
                tabs={shieldTabs}
                config={shieldFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                cols={2}
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
                            "[PlayerShieldModal] invalid JSON upload",
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
              <SharedShieldCard
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
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {editShieldIndex !== null && (
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
          if (editShieldIndex !== null) {
            onDeleteShield(editShieldIndex);
          }
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this shield?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="body2">
              {t("Shield")} - {cost} {t("zenit")}
            </Typography>
          </Box>
        }
      />
    </>
  );
}
