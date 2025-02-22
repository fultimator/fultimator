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


export default function SpellSymbolistModal({
  open,
  onClose,
  onSave,
  onDelete,
  symbol,
}) {
  const { t } = useTranslate();

  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    symbol ? !!symbol.showInPlayerSheet : true
  );

  useEffect(() => {
    if (symbol) {
      setShowInPlayerSheet(!!symbol.showInPlayerSheet);
    }
  }, [symbol]);

  const handleSave = () => {
    onSave(symbol.index, {
      ...symbol,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  const handleDelete = () => {
    onDelete(symbol.index);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("symbol_settings_modal")}
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
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("symbol_delete_button")}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
