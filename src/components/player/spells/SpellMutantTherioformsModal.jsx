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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close, Delete } from "@mui/icons-material";
import CustomTextarea from "../../common/CustomTextarea";

const availableTherioforms = [
  {
    name: "mutant_therioform_amphibia",
    genoclepsis: "mutant_therioform_amphibia_geno",
    description: "mutant_therioform_amphibia_desc",
  },
  {
    name: "mutant_therioform_arpaktida",
    genoclepsis: "mutant_therioform_arpaktida_geno",
    description: "mutant_therioform_arpaktida_desc",
  },
  {
    name: "mutant_therioform_dynamotheria",
    genoclepsis: "mutant_therioform_dynamotheria_geno",
    description: "mutant_therioform_dynamotheria_desc",
  },
  {
    name: "mutant_therioform_electrophora",
    genoclepsis: "mutant_therioform_electrophora_geno",
    description: "mutant_therioform_electrophora_desc",
  },
  {
    name: "mutant_therioform_neurophagoida",
    genoclepsis: "mutant_therioform_neurophagoida_geno",
    description: "mutant_therioform_neurophagoida_desc",
  },
  {
    name: "mutant_therioform_placophora",
    genoclepsis: "mutant_therioform_placophora_geno",
    description: "mutant_therioform_placophora_desc",
  },
  {
    name: "mutant_therioform_pneumophora",
    genoclepsis: "mutant_therioform_pneumophora_geno",
    description: "mutant_therioform_pneumophora_desc",
  },
  {
    name: "mutant_therioform_polypoda",
    genoclepsis: "mutant_therioform_polypoda_geno",
    description: "mutant_therioform_polypoda_desc",
  },
  {
    name: "mutant_therioform_pterotheria",
    genoclepsis: "mutant_therioform_pterotheria_geno",
    description: "mutant_therioform_pterotheria_desc",
  },
  {
    name: "mutant_therioform_pyrophora",
    genoclepsis: "mutant_therioform_pyrophora_geno",
    description: "mutant_therioform_pyrophora_desc",
  },
  {
    name: "mutant_therioform_tachytheria",
    genoclepsis: "mutant_therioform_tachytheria_geno",
    description: "mutant_therioform_tachytheria_desc",
  },
  {
    name: "mutant_therioform_toxicophora",
    genoclepsis: "mutant_therioform_toxicophora_geno",
    description: "mutant_therioform_toxicophora_desc",
  },
  {
    name: "mutant_therioform_custom_name",
    genoclepsis: "",
    description: "",
    customName: "",
  },
];

export default function SpellMutantTherioformsModal({
  open,
  onClose,
  onSave,
  mutant,
}) {
  const { t } = useTranslate();
  const [currentTherioforms, setCurrentTherioforms] = useState(mutant?.therioforms || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    mutant ? !!mutant.showInPlayerSheet : true
  );

  useEffect(() => {
    if (mutant) {
      setShowInPlayerSheet(!!mutant.showInPlayerSheet);
    }
    setCurrentTherioforms(mutant?.therioforms || []);
  }, [mutant]);

  const handleAddTherioform = () => {
    setCurrentTherioforms([
      ...currentTherioforms,
      {
        name: "mutant_therioform_custom_name",
        genoclepsis: "",
        description: "",
        customName: "",
      },
    ]);
  };

  const handleTherioformChange = (index, field, value) => {
    const updatedTherioforms = [...currentTherioforms];

    if (field === "name") {
      const selectedTherioform = availableTherioforms.find((therioform) => therioform.name === value);

      if (selectedTherioform) {
        updatedTherioforms[index] = {
          ...selectedTherioform,
          customName:
            selectedTherioform.name === "mutant_therioform_custom_name"
              ? updatedTherioforms[index].customName
              : "",
        };
      }
    } else {
      updatedTherioforms[index][field] = value;
    }

    setCurrentTherioforms(updatedTherioforms);
  };

  const handleDeleteTherioform = (index) => {
    setCurrentTherioforms(currentTherioforms.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(mutant.index, {
      ...mutant,
      therioforms: currentTherioforms,
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
        {t("mutant_edit")}
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
          {currentTherioforms.map((therioform, index) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              key={index}
              container
              spacing={1}
              alignItems="flex-start"
            >
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>{t("mutant_therioform_type")}</InputLabel>
                  <Select
                    value={therioform.name}
                    onChange={(e) =>
                      handleTherioformChange(index, "name", e.target.value)
                    }
                  >
                    {availableTherioforms.map((availableTherioform) => (
                      <MenuItem key={availableTherioform.name} value={availableTherioform.name}>
                        {availableTherioform.name === "mutant_therioform_custom_name"
                          ? t("mutant_therioform_custom")
                          : t(availableTherioform.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label={t("mutant_genoclepsis_suggestions")}
                  value={
                    therioform.name === "mutant_therioform_custom_name"
                      ? therioform.genoclepsis || ""
                      : t(therioform.genoclepsis)
                  }
                  onChange={(e) =>
                    handleTherioformChange(index, "genoclepsis", e.target.value)
                  }
                  readOnly={therioform.name !== "mutant_therioform_custom_name"}
                  multiline
                  rows={2}
                />
              </Grid>

              {therioform.name === "mutant_therioform_custom_name" && (
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label={t("mutant_therioform_custom_name")}
                    value={therioform.customName}
                    onChange={(e) =>
                      handleTherioformChange(index, "customName", e.target.value)
                    }
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={therioform.name === "mutant_therioform_custom_name" ? 2 : 4}>
                <CustomTextarea
                  label={t("mutant_therioform_description")}
                  value={
                    therioform.name === "mutant_therioform_custom_name" ? therioform.description : t(therioform.description)
                  }
                  readOnly={therioform.name !== "mutant_therioform_custom_name"}
                  onChange={(e) =>
                    therioform.name === "mutant_therioform_custom_name" &&
                    handleTherioformChange(index, "description", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} sm={1}>
                <Button
                  onClick={() => handleDeleteTherioform(index)}
                  variant="outlined"
                  color="error"
                  sx={{ minWidth: "auto", padding: 1 }}
                >
                  <Delete />
                </Button>
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button onClick={handleAddTherioform} variant="outlined" fullWidth>
              {t("mutant_add")}
            </Button>
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