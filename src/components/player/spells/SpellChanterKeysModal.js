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

const availableKeys = [
  {
    name: "magichant_flame",
    type: "fire",
    status: "Shaken",
    attribute: "MIG",
    recovery: "HP",
  },
  {
    name: "magichant_frost",
    type: "ice",
    status: "Weak",
    attribute: "WLP",
    recovery: "MP",
  },
  {
    name: "magichant_iron",
    type: "physical",
    status: "Slow",
    attribute: "WLP",
    recovery: "MP",
  },
  {
    name: "magichant_radiance",
    type: "bolt",
    status: "Shaken",
    attribute: "DEX",
    recovery: "HP",
  },
  {
    name: "magichant_shadow",
    type: "light",
    status: "Dazed",
    attribute: "INS",
    recovery: "HP",
  },
  {
    name: "magichant_stone",
    type: "dark",
    status: "Weak",
    attribute: "DEX",
    recovery: "MP",
  },
  {
    name: "magichant_thunder",
    type: "earth",
    status: "Dazed",
    attribute: "MIG",
    recovery: "HP",
  },
  {
    name: "magichant_wind",
    type: "wind",
    status: "Slow",
    attribute: "INS",
    recovery: "MP",
  },
  {
    name: "magichant_custom_name",
    type: "",
    status: "",
    attribute: "",
    recovery: "",
    customName: "",
  },
];

export default function SpellChanterKeysModal({
  open,
  onClose,
  onSave,
  onDelete,
  magichant,
}) {
  const { t } = useTranslate();
  const [currentKeys, setCurrentKeys] = useState(magichant?.keys || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    magichant ? !!magichant.showInPlayerSheet : true
  );

  useEffect(() => {
    if (magichant) {
      setShowInPlayerSheet(!!magichant.showInPlayerSheet);
    }
    setCurrentKeys(magichant?.keys || []);
  }, [magichant]);

  const handleAddKey = () => {
    setCurrentKeys([
      ...currentKeys,
      {
        name: "magichant_custom_name",
        type: "",
        status: "",
        attribute: "",
        recovery: "",
        customName: "",
      },
    ]);
  };

  const handleKeyChange = (index, field, value) => {
    const updatedKeys = [...currentKeys];

    if (field === "name") {
      const selectedKey = availableKeys.find((key) => key.name === value);

      if (selectedKey) {
        updatedKeys[index] = {
          ...selectedKey,
          customName:
            selectedKey.name === "magichant_custom_name" ? updatedKeys[index].customName : "",
        };
      }
    } else {
      updatedKeys[index][field] = value;
    }

    setCurrentKeys(updatedKeys);
  };

  const handleDeleteKey = (index) => {
    setCurrentKeys(currentKeys.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(magichant.index, {
      ...magichant,
      keys: currentKeys,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("magichant_edit_keys_modal")}
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
          {currentKeys.map((key, index) => (
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
                padding: { xs: "8px 0", sm: "12px 0" }, // More space for smaller screens
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)", // Adds separation between keys
              }}
            >
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.9rem" } }}
                  >
                    {t("magichant_key")}
                  </InputLabel>
                  <Select
                    label={t("magichant_key")}
                    value={key.name}
                    onChange={(e) =>
                      handleKeyChange(index, "name", e.target.value)
                    }
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "1rem" }, // Adjust font size
                      height: { xs: "40px", sm: "48px", md: "56px" }, // Adjust height for smaller screens
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.85rem", sm: "1rem" }, // Ensure input text scales properly
                      },
                    }}
                  >
                    {availableKeys.map((option) => (
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

              <Grid item xs={12} sm={4} md={2}>
                <TextField
                  label={t("magichant_name")}
                  value={key.name === "magichant_custom_name" ? key.customName : t(key.name)}
                  onChange={(e) =>
                    handleKeyChange(index, "customName", e.target.value)
                  }
                  disabled={key.name !== "magichant_custom_name"}
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
              <Grid item xs={6} sm={4} md={1}>
                <TextField
                  label={t("magichant_type")}
                  value={key.name === "magichant_custom_name" ? key.type : t(key.type)}
                  onChange={(e) =>
                    handleKeyChange(index, "type", e.target.value)
                  }
                  disabled={key.name !== "magichant_custom_name"}
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
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  label={t("magichant_status_effect")}
                  value={key.name === "magichant_custom_name" ? key.status : t(key.status)}
                  onChange={(e) =>
                    handleKeyChange(index, "status", e.target.value)
                  }
                  disabled={key.name !== "magichant_custom_name"}
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
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  label={t("magichant_attribute")}
                  value={key.name === "magichant_custom_name" ? key.attribute : t(key.attribute)}
                  onChange={(e) =>
                    handleKeyChange(index, "attribute", e.target.value)
                  }
                  disabled={key.name !== "magichant_custom_name"}
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
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  label={t("magichant_recovery")}
                  value={key.name === "magichant_custom_name" ? key.recovery : t(key.recovery)}
                  onChange={(e) =>
                    handleKeyChange(index, "recovery", e.target.value)
                  }
                  disabled={key.name !== "magichant_custom_name"}
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

              {/* Adjusted Delete Button */}
              <Grid
                item
                xs={12}
                sm={12}
                md={1}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => handleDeleteKey(index)}
                  aria-label={t("Delete")}
                  sx={{
                    width: "100%",
                    height: { xs: "44px", sm: "48px", md: "56px" }, // Responsive height
                    minHeight: "unset", // Allow natural resizing
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0", // Remove extra padding inside
                  }}
                >
                  <Delete />
                </Button>
              </Grid>
            </Grid>
          ))}
        </Grid>

        {/* Add Key Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddKey}
          sx={{
            width: "100%",
            mt: 2,
            padding: { xs: "12px", sm: "16px" }, // Adjust button padding for mobile
          }}
        >
          {t("magichant_add_key")}
        </Button>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
