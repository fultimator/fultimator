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

const availableDances = [
  {
    name: "dance_angel",
    effect: "dance_angel_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_banshee",
    effect: "dance_banshee_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_bat",
    effect: "dance_bat_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_golem",
    effect: "dance_golem_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_griffin",
    effect: "dance_griffin_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_hydra",
    effect: "dance_hydra_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_kraken",
    effect: "dance_kraken_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_lion",
    effect: "dance_lion_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_maenad",
    effect: "dance_maenad_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_myrmidon",
    effect: "dance_myrmidon_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_nightmare",
    effect: "dance_nightmare_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_ouroboros",
    effect: "dance_ouroboros_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_peacock",
    effect: "dance_peacock_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_phoenix",
    effect: "dance_phoenix_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_satyr",
    effect: "dance_satyr_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_unicorn",
    effect: "dance_unicorn_desc",
    duration: "dance_duration_instant",
  },
  {
    name: "dance_yeti",
    effect: "dance_yeti_desc",
    duration: "dance_duration_next_turn",
  },
  {
    name: "dance_custom_name",
    effect: "",
    duration: "",
    customName: "",
  },
];

export default function SpellDancerDancesModal({
  open,
  onClose,
  onSave,
  dance,
}) {
  const { t } = useTranslate();
  const [currentDances, setCurrentDances] = useState(dance?.dances || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    dance ? !!dance.showInPlayerSheet : true
  );

  useEffect(() => {
    if (dance) {
      setShowInPlayerSheet(!!dance.showInPlayerSheet);
    }
    setCurrentDances(dance?.dances || []);
  }, [dance]);

  const handleAddDance = () => {
    setCurrentDances([
      ...currentDances,
      {
        name: "dance_custom_name",
        effect: "",
        customName: "",
      },
    ]);
  };

  const handleDanceChange = (index, field, value) => {
    const updatedDances = [...currentDances];

    if (field === "name") {
      const selectedDance = availableDances.find((dan) => dan.name === value);

      if (selectedDance) {
        updatedDances[index] = {
          ...selectedDance,
          customName:
            selectedDance.name === "dance_custom_name"
              ? updatedDances[index].customName
              : "",
          duration: selectedDance.duration || "", // Ensure duration is updated
        };
      }
    } else {
      updatedDances[index][field] = value;
    }

    setCurrentDances([...updatedDances]); // Ensure state updates properly
  };

  const handleDeleteDance = (index) => {
    setCurrentDances(currentDances.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(dance.index, {
      ...dance,
      dances: currentDances,
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
        {t("dance_edit_dances_modal")}
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
          {currentDances.map((dan, index) => (
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.9rem" } }}
                  >
                    {t("dance_dance")}
                  </InputLabel>
                  <Select
                    label={t("dance_dance")}
                    value={dan.name}
                    onChange={(e) =>
                      handleDanceChange(index, "name", e.target.value)
                    }
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "1rem" }, // Adjust font size
                      height: { xs: "40px", sm: "48px", md: "56px" }, // Adjust height for smaller screens
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.85rem", sm: "1rem" }, // Ensure input text scales properly
                      },
                    }}
                  >
                    {availableDances.map((option) => (
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

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label={t("dance_name")}
                  value={
                    dan.name === "dance_custom_name"
                      ? dan.customName
                      : t(dan.name)
                  }
                  onChange={(e) =>
                    handleDanceChange(index, "customName", e.target.value)
                  }
                  disabled={dan.name !== "dance_custom_name"}
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
              <Grid item xs={10} sm={10} md={4}>
                <TextField
                  label={t("dance_duration")}
                  value={
                    dan.name === "dance_custom_name"
                      ? dan.duration || ""
                      : t(dan.duration) || ""
                  }
                  onChange={(e) =>
                    handleDanceChange(index, "duration", e.target.value)
                  }
                  disabled={dan.name !== "dance_custom_name"}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: { xs: "0.85rem", sm: "1rem" },
                      height: { xs: "40px", sm: "48px", md: "56px" },
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                    },
                  }}
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>
              <Grid
                item
                xs={2}
                sm={2}
                md={1}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDeleteDance(index)}
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
                {dan.name !== "dance_custom_name" ? (
                  <TextField
                    label={t("dance_effect")}
                    value={
                      dan.name === "dance_custom_name"
                        ? dan.effect
                        : t(dan.effect)
                    }
                    onChange={(e) =>
                      handleDanceChange(index, "effect", e.target.value)
                    }
                    disabled={dan.name !== "dance_custom_name"}
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
                    label={t("dance_effect")}
                    fullWidth
                    value={
                      dan.name === "dance_custom_name"
                        ? dan.effect
                        : t(dan.effect)
                    }
                    onChange={(e) =>
                      handleDanceChange(index, "effect", e.target.value)
                    }
                    maxRows={10}
                    maxLength={1500}
                    disabled={dan.name !== "dance_custom_name"}
                  />
                )}
              </Grid>

              {/* Adjusted Delete Button */}
            </Grid>
          ))}
        </Grid>

        {/* Add Dance Button */}
        <Button
          variant="contained"
          color="quaternary"
          onClick={handleAddDance}
          sx={{
            width: "100%",
            mt: 2,
            padding: { xs: "12px", sm: "16px" }, // Adjust button padding for mobile
          }}
        >
          {t("dance_add_dance")}
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
