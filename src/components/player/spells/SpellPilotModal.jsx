import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

export default function SpellPilotModal({
  open,
  onClose,
  onSave,
  onDelete,
  pilot,
}) {
  const { t } = useTranslate();

  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    pilot ? !!pilot.showInPlayerSheet : true
  );

  useEffect(() => {
    if (pilot) {
      setShowInPlayerSheet(!!pilot.showInPlayerSheet);
    }
  }, [pilot]);

  const handleSave = () => {
    onSave(pilot.index, {
      ...pilot,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  const handleDelete = () => {
    onDelete(pilot.index);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("pilot_settings_button")}
      </DialogTitle>
      <Button
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
      </Button>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInPlayerSheet}
                  onChange={(e) => setShowInPlayerSheet(e.target.checked)}
                />
              }
              label={t("Show in Character Sheet")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button onClick={handleDelete} variant="outlined" color="error">
          {t("Delete")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}