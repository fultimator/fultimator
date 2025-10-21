import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

export default function SpellInvokerModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
}) {
  const { t } = useTranslate();
  const [editedSpell, setEditedSpell] = useState(spell || {});

  useEffect(() => {
    if (spell) {
      setEditedSpell(spell || {});
    }
  }, [spell]);

  const handleChange = (field, value) => {
    setEditedSpell((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(spell.index, editedSpell);
    onClose();
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
        {t("invoker_edit_invocation_button")}
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
          <Grid item xs={6} sm={6}>
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
          <Grid item xs={6} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSpell.innerWellspring || false}
                  onChange={(e) =>
                    handleChange("innerWellspring", e.target.checked)
                  }
                />
              }
              label={t("invoker_invocation_inner_wellspring")}
            />
          </Grid>
          {editedSpell.innerWellspring && (
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <InputLabel id="chosen-wellspring-select-label">
                  {t("invoker_invocation_chosen_wellspring")}
                </InputLabel>
                <Select
                  labelId="chosen-wellspring-select-label"
                  id="chosen-wellspring-select"
                  value={editedSpell.chosenWellspring || ""}
                  label={t("invoker_invocation_chosen_wellspring")}
                  onChange={(e) =>
                    handleChange("chosenWellspring", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="Air">{t("Air")}</MenuItem>
                  <MenuItem value="Earth">{t("Earth")}</MenuItem>
                  <MenuItem value="Fire">{t("Fire")}</MenuItem>
                  <MenuItem value="Lightning">{t("Lightning")}</MenuItem>
                  <MenuItem value="Water">{t("Water")}</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {t("invoker_invocation_chosen_wellspring_hint")}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Spell")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}