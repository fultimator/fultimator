import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

export default function SpellTinkererMagitechRankModal({
  open,
  onClose,
  onSave,
  onDelete,
  magitech,
}) {
  const { t } = useTranslate();

  // Initialize state variables
  const [selectedRank, setSelectedRank] = useState(magitech?.rank || 1);
  const [spellName, setSpellName] = useState(magitech?.spellName || "");
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    magitech?.showInPlayerSheet !== false
  );

  // Update state if magitech prop changes
  useEffect(() => {
    if (magitech) {
      setSelectedRank(magitech.rank || 1);
      setSpellName(magitech.spellName || "");
      setShowInPlayerSheet(!!magitech.showInPlayerSheet);
    }
  }, [magitech]);

  const handleSave = () => {
    onSave(magitech.index, {
      ...magitech,
      spellName,
      rank: selectedRank,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  const handleDelete = () => {
    onDelete(magitech.index);
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
        {t("Select Rank")}
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
      <DialogContent sx={{ minWidth: 400 }}>
        <TextField
          fullWidth
          label={t("Magitech Name")}
          value={spellName}
          onChange={(e) => setSpellName(e.target.value)}
          inputProps={{ maxLength: 50 }}
          margin="normal"
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>{t("Select Rank")}</InputLabel>
          <Select
            value={selectedRank}
            label={t("Select Rank")}
            onChange={(e) => setSelectedRank(e.target.value)}
          >
            <MenuItem value={1}>{t("Basic")}</MenuItem>
            <MenuItem value={2}>{t("Advanced")}</MenuItem>
            <MenuItem value={3}>{t("Superior")}</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={showInPlayerSheet}
              onChange={(e) => setShowInPlayerSheet(e.target.checked)}
            />
          }
          label={t("Show in Character Sheet")}
          sx={{ mt: 2, display: "block" }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Magitech")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
