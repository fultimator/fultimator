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
  Typography,
  Slider,
  Box,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";
import CustomTextarea from "../../common/CustomTextarea";

export default function SpellMagiseedModal({
  open,
  onClose,
  onSave,
  onDelete,
  magiseed,
}) {
  const { t } = useTranslate();
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(true);
  const [growthClock, setGrowthClock] = useState(0);
  const [gardenDescription, setGardenDescription] = useState("");

  useEffect(() => {
    if (magiseed) {
      setShowInPlayerSheet(!!magiseed.showInPlayerSheet || magiseed.showInPlayerSheet === undefined);
      setGrowthClock(magiseed.growthClock || 0);
      setGardenDescription(magiseed.gardenDescription || "");
    }
  }, [magiseed]);

  const handleSave = () => {
    if (onSave && magiseed) {
      const updatedMagiseed = {
        ...magiseed,
        showInPlayerSheet: showInPlayerSheet,
        growthClock: growthClock,
        gardenDescription: gardenDescription,
      };
      onSave(magiseed.index, updatedMagiseed);
    }
  };

  const handleDelete = () => {
    if (onDelete && magiseed) {
      onDelete(magiseed.index);
    }
  };

  const growthClockMarks = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "md" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("magiseed_settings_button")}
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
        <Grid container spacing={3}>
          {/* Show in Player Sheet */}
          <Grid item xs={12}>
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

          {/* Growth Clock Setting */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("magiseed_growth_clock")}
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={growthClock}
                onChange={(e, newValue) => setGrowthClock(newValue)}
                min={0}
                max={4}
                step={1}
                marks={growthClockMarks}
                valueLabelDisplay="auto"
                sx={{ mt: 2 }}
              />
            </Box>
          </Grid>

          {/* Garden Description */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("magiseed_garden_appearance")}
            </Typography>
            <CustomTextarea
              label={t("magiseed_garden_description_label")}
              value={gardenDescription}
              onChange={(e) => setGardenDescription(e.target.value)}
              placeholder={t("magiseed_garden_description_placeholder")}
              rows={3}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t("magiseed_garden_description_help")}
            </Typography>
          </Grid>

        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} variant="contained" color="error">
          {t("Delete")}
        </Button>
        <Button onClick={onClose} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}