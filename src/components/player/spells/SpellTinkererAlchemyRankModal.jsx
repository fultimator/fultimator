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
  Switch
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

export default function SpellTinkererAlchemyRankModal({
  open,
  onClose,
  onSave,
  onDelete,
  alchemy,
}) {
  const { t } = useTranslate();
  
  // Initialize state variables
  const [selectedRank, setSelectedRank] = useState(alchemy?.rank || 1);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    alchemy ? !!alchemy.showInPlayerSheet : true
  );

  // Update showInPlayerSheet state if alchemy prop changes
  useEffect(() => {
    if (alchemy) {
      setShowInPlayerSheet(!!alchemy.showInPlayerSheet);
    }
  }, [alchemy]);

  const handleSave = () => {
    onSave(alchemy.index, {
      ...alchemy,
      rank: selectedRank,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  const handleDelete = () => {
    onDelete(alchemy.index);
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
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
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
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="rank-select-label">{t("Select Rank")}</InputLabel>
              <Select
                labelId="rank-select-label"
                id="rank-select"
                value={selectedRank}
                label={t("Select Rank")}
                onChange={(e) => setSelectedRank(e.target.value)}
                fullWidth
              >
                <MenuItem value={1}>{t("Basic")}</MenuItem>
                <MenuItem value={2}>{t("Advanced")}</MenuItem>
                <MenuItem value={3}>{t("Superior")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
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
          {t("Delete Alchemy")}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
