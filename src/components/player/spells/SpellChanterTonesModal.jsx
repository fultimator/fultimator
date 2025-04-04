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
  TextField,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close, Delete } from "@mui/icons-material";
import CustomTextarea from "../../common/CustomTextarea";

const availableTones = [
  {
    name: "magichant_tone_calm",
    effect: "magichant_tone_calm_desc",
  },
  {
    name: "magichant_tone_energetic",
    effect: "magichant_tone_energetic_desc",
  },
  {
    name: "magichant_tone_frantic",
    effect: "magichant_tone_frantic_desc",
  },
  {
    name: "magichant_tone_haunting",
    effect: "magichant_tone_haunting_desc",
  },
  {
    name: "magichant_tone_lively",
    effect: "magichant_tone_lively_desc",
  },
  {
    name: "magichant_tone_menacing",
    effect: "magichant_tone_menacing_desc",
  },
  {
    name: "magichant_tone_solemn",
    effect: "magichant_tone_solemn_desc",
  },
  {
    name: "magichant_custom_name",
    effect: "",
    customName: "",
  },
];

export default function SpellChanterTonesModal({
  open,
  onClose,
  onSave,
  magichant,
}) {
  const { t } = useTranslate();
  const [currentTones, setCurrentTones] = useState(magichant?.tones || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    magichant ? !!magichant.showInPlayerSheet : true
  );

  useEffect(() => {
    if (magichant) {
      setShowInPlayerSheet(!!magichant.showInPlayerSheet);
    }
    setCurrentTones(magichant?.tones || []);
  }, [magichant]);

  const handleAddTone = () => {
    setCurrentTones([
      ...currentTones,
      {
        name: "magichant_custom_name",
        effect: "",
        customName: "",
      },
    ]);
  };

  const handleToneChange = (index, field, value) => {
    const updatedTones = [...currentTones];

    if (field === "name") {
      const selectedTone = availableTones.find((tone) => tone.name === value);

      if (selectedTone) {
        updatedTones[index] = {
          ...selectedTone,
          customName:
            selectedTone.name === "magichant_custom_name"
              ? updatedTones[index].customName
              : "",
        };
      }
    } else {
      updatedTones[index][field] = value;
    }

    setCurrentTones(updatedTones);
  };

  const handleDeleteTone = (index) => {
    setCurrentTones(currentTones.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(magichant.index, {
      ...magichant,
      tones: currentTones,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("magichant_edit_tones_modal")}
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
          {currentTones.map((tone, index) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={index}
              container
              spacing={1}
              alignItems="center"
              sx={{
                padding: { xs: "8px 0", sm: "12px 0" },
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              }}
            >
              <Grid item xs={12} sm={5} md={5}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.9rem" } }}
                  >
                    {t("magichant_tone")}
                  </InputLabel>
                  <Select
                    label={t("magichant_tone")}
                    value={tone.name}
                    onChange={(e) =>
                      handleToneChange(index, "name", e.target.value)
                    }
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "1rem" }, // Adjust font size
                      height: { xs: "40px", sm: "48px", md: "56px" }, // Adjust height for smaller screens
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.85rem", sm: "1rem" }, // Ensure input text scales properly
                      },
                    }}
                  >
                    {availableTones.map((option) => (
                      <MenuItem
                        key={option.name}
                        value={option.name}
                        sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                      >
                        {t(option.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={10} sm={6} md={6}>
                <TextField
                  label={t("magichant_name")}
                  value={
                    tone.name === "magichant_custom_name"
                      ? tone.customName
                      : t(tone.name)
                  }
                  onChange={(e) =>
                    handleToneChange(index, "customName", e.target.value)
                  }
                  disabled={tone.name !== "magichant_custom_name"}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.85rem", sm: "1rem" }, // Smaller font on mobile
                      height: { xs: "40px", sm: "48px", md: "56px" }, // Adjusted height
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: { xs: "0.75rem", sm: "0.9rem" }, // Smaller label
                    },
                  }}
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>
              <Grid
                item
                xs={2}
                sm={1}
                md={1}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDeleteTone(index)}
                  aria-label={t("Delete")}
                  sx={{
                    width: "100%",
                    height: { xs: "40px", sm: "48px", md: "56px" }, // Responsive height
                    minHeight: "unset", // Allow natural resizing
                    minWidth: "unset", // Allow natural resizing
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0", // Remove extra padding inside
                  }}
                >
                  <Delete />
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                {tone.name !== "magichant_custom_name" ? (
                  <TextField
                    label={t("magichant_tone_effect")}
                    value={
                      tone.name === "magichant_custom_name"
                        ? tone.effect
                        : t(tone.effect)
                    }
                    onChange={(e) =>
                      handleToneChange(index, "effect", e.target.value)
                    }
                    disabled={tone.name !== "magichant_custom_name"}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        fontSize: { xs: "0.85rem", sm: "1rem" }, // Smaller font on mobile
                        height: { xs: "40px", sm: "48px", md: "56px" }, // Adjusted height
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: { xs: "0.75rem", sm: "0.9rem" }, // Smaller label
                      },
                    }}
                    inputProps={{ maxLength: 200 }}
                  />
                ) : (
                  <CustomTextarea
                    label={t("magichant_tone_effect")}
                    fullWidth
                    value={
                      tone.name === "magichant_custom_name"
                        ? tone.effect
                        : t(tone.effect)
                    }
                    onChange={(e) =>
                      handleToneChange(index, "effect", e.target.value)
                    }
                    maxRows={10}
                    maxLength={1500}
                    disabled={tone.name !== "magichant_custom_name"}
                  />
                )}
              </Grid>

              {/* Adjusted Delete Button */}
            </Grid>
          ))}
        </Grid>

        {/* Add Tone Button */}
        <Button
          variant="contained"
          color="quaternary"
          onClick={handleAddTone}
          sx={{
            width: "100%",
            mt: 2,
            padding: { xs: "12px", sm: "16px" }, // Adjust button padding for mobile
          }}
        >
          {t("magichant_add_tone")}
        </Button>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
