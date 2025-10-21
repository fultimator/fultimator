import { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close, Add } from "@mui/icons-material";
import MagiseedItem from "./MagiseedItem";
import { availableMagiseeds } from "../../../libs/floralistMagiseedData";

export default function SpellFloralistMagiseedsModal({
  open,
  onClose,
  onSave,
  floralist,
}) {
  const { t } = useTranslate();
  const [currentMagiseeds, setCurrentMagiseeds] = useState([]);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(true);

  useEffect(() => {
    if (floralist) {
      setCurrentMagiseeds(floralist.availableMagiseeds || []);
      setShowInPlayerSheet(!!floralist.showInPlayerSheet || floralist.showInPlayerSheet === undefined);
    }
  }, [floralist]);

  const handleAddMagiseed = useCallback(() => {
    const newMagiseed = {
      name: "floralist_custom_magiseed",
      type: "custom",
      customName: "",
      description: "",
      effects: {
        1: "",
        2: "",
        3: "",
        4: ""
      },
      endOfTurnEffect: false,
      passive: false
    };
    setCurrentMagiseeds(prev => [...prev, newMagiseed]);
  }, []);

  const handleMagiseedChange = useCallback((index, field, value) => {
    setCurrentMagiseeds(prev => {
      const newMagiseeds = [...prev];
      newMagiseeds[index] = {
        ...newMagiseeds[index],
        [field]: value
      };
      return newMagiseeds;
    });
  }, []);

  const handleDeleteMagiseed = useCallback((index) => {
    setCurrentMagiseeds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleShowInPlayerSheetChange = useCallback((e) => {
    setShowInPlayerSheet(e.target.checked);
  }, []);

  const handleAddPresetMagiseed = useCallback((presetName) => {
    const preset = availableMagiseeds.find(m => m.name === presetName);
    if (!preset) return;

    const newMagiseed = {
      ...preset,
      customName: "", // Allow custom naming even for presets
      description: preset.description
    };
    setCurrentMagiseeds(prev => [...prev, newMagiseed]);
  }, []);

  const handleSave = useCallback(() => {
    if (onSave && floralist) {
      const updatedFloralist = {
        ...floralist,
        availableMagiseeds: currentMagiseeds,
        showInPlayerSheet: showInPlayerSheet,
      };
      onSave(floralist.index, updatedFloralist);
    }
  }, [onSave, floralist, currentMagiseeds, showInPlayerSheet]);

  // Get available preset magiseeds that haven't been added yet
  const getAvailablePresets = () => {
    const addedPresetNames = currentMagiseeds.map(m => m.name).filter(name => name !== "floralist_custom_magiseed");
    return availableMagiseeds.filter(preset => 
      preset.name !== "floralist_custom_magiseed" && 
      !addedPresetNames.includes(preset.name)
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "90%", maxWidth: "xl" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("magiseed_edit_magiseed")}
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
          {/* Add Magiseed Buttons */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("magiseed_add_magiseed")}
            </Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddMagiseed}
                >
                  {t("magiseed_custom")}
                </Button>
              </Grid>
              {getAvailablePresets().map((preset) => (
                <Grid item key={preset.name}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => handleAddPresetMagiseed(preset.name)}
                  >
                    {t(preset.name)}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Magiseeds List */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t("magiseed_available_magiseeds")} ({currentMagiseeds.length})
            </Typography>
          </Grid>

          {currentMagiseeds.length === 0 ? (
            <Grid item xs={12}>
              <Typography
                sx={{
                  padding: "20px",
                  textAlign: "center",
                  color: "text.secondary",
                  fontStyle: "italic",
                  border: "1px dashed #ccc",
                  borderRadius: "4px",
                }}
              >
                {t("magiseed_no_available_magiseeds_hint")}
              </Typography>
            </Grid>
          ) : (
            currentMagiseeds.map((magiseed, index) => (
              <Grid item xs={12} key={index}>
                <MagiseedItem
                  magiseed={magiseed}
                  magiseedIndex={index}
                  onMagiseedChange={handleMagiseedChange}
                  onDeleteMagiseed={handleDeleteMagiseed}
                />
              </Grid>
            ))
          )}

          {/* Show in Player Sheet Toggle */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInPlayerSheet}
                  onChange={handleShowInPlayerSheetChange}
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
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}