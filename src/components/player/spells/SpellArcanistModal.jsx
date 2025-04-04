import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import { Close } from "@mui/icons-material";

export default function SpellArcanistModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
  isRework,
}) {
  const { t } = useTranslate();
  const [editedSpell, setEditedSpell] = useState(spell || {});

  useEffect(() => {
    setEditedSpell(spell || {});
  }, [spell]);

  const handleChange = (field, value) => {
    setEditedSpell((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(spell.index, editedSpell);
  };

  const handleDelete = () => {
    onDelete(spell.index);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Edit Arcana")}
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t("Arcana Name")}
              variant="outlined"
              fullWidth
              value={editedSpell.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t("Domain")}
              variant="outlined"
              fullWidth
              value={editedSpell.domain || ""}
              onChange={(e) => handleChange("domain", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              label={t("Arcana Description")}
              variant="outlined"
              fullWidth
              value={editedSpell.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomTextarea
              label={t("Domain Description")}
              fullWidth
              value={editedSpell.domainDesc || ""}
              onChange={(e) => handleChange("domainDesc", e.target.value)}
              maxRows={10}
              maxLength={1500}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              label={t("Merge Name")}
              variant="outlined"
              fullWidth
              value={editedSpell.merge || ""}
              onChange={(e) => handleChange("merge", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomTextarea
              label={t("Merge Description")}
              fullWidth
              value={editedSpell.mergeDesc || ""}
              onChange={(e) => handleChange("mergeDesc", e.target.value)}
              maxRows={10}
              maxLength={1500}
            />
          </Grid>
          {isRework && (
            <>
              <Grid item xs={12} sm={12}>
                <TextField
                  label={t("Pulse Name")}
                  variant="outlined"
                  fullWidth
                  value={editedSpell.pulse || ""}
                  onChange={(e) => handleChange("pulse", e.target.value)}
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextarea
                  label={t("Merge Description")}
                  fullWidth
                  value={editedSpell.pulseDesc || ""}
                  onChange={(e) => handleChange("pulseDesc", e.target.value)}
                  maxRows={10}
                  maxLength={1500}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={12}>
            <TextField
              label={t("Dismiss Name")}
              variant="outlined"
              fullWidth
              value={editedSpell.dismiss || ""}
              onChange={(e) => handleChange("dismiss", e.target.value)}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomTextarea
              label={t("Dismiss Description")}
              fullWidth
              value={editedSpell.dismissDesc || ""}
              onChange={(e) => handleChange("dismissDesc", e.target.value)}
              maxRows={10}
              maxLength={1500}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    editedSpell.showInPlayerSheet === undefined ||
                    editedSpell.showInPlayerSheet ||
                    false
                  }
                  onChange={(e) =>
                    handleChange("showInPlayerSheet", e.target.checked)
                  }
                />
              }
              label={t("Show in Character Sheet")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Arcana")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
