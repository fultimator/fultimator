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

const availableSymbols = [
  {
    name: "symbol_binding",
    effect: "symbol_binding_desc",
  },
  {
    name: "symbol_creation",
    effect: "symbol_creation_desc",
  },
  {
    name: "symbol_despair",
    effect: "symbol_despair_desc",
  },
  {
    name: "symbol_destiny",
    effect: "symbol_destiny_desc",
  },
  {
    name: "symbol_elements",
    effect: "symbol_elements_desc",
  },
  {
    name: "symbol_enmity",
    effect: "symbol_enmity_desc",
  },
  {
    name: "symbol_flux",
    effect: "symbol_flux_desc",
  },
  {
    name: "symbol_forbiddance",
    effect: "symbol_forbiddance_desc",
  },
  {
    name: "symbol_growth",
    effect: "symbol_growth_desc",
  },
  {
    name: "symbol_metamorphosis",
    effect: "symbol_metamorphosis_desc",
  },
  {
    name: "symbol_prosperity",
    effect: "symbol_prosperity_desc",
  },
  {
    name: "symbol_protection",
    effect: "symbol_protection_desc",
  },
  {
    name: "symbol_rebellion",
    effect: "symbol_rebellion_desc",
  },
  {
    name: "symbol_rebirth",
    effect: "symbol_rebirth_desc",
  },
  {
    name: "symbol_revenge",
    effect: "symbol_revenge_desc",
  },
  {
    name: "symbol_sacrifice",
    effect: "symbol_sacrifice_desc",
  },
  {
    name: "symbol_sorcery",
    effect: "symbol_sorcery_desc",
  },
  {
    name: "symbol_truth",
    effect: "symbol_truth_desc",
  },
  {
    name: "symbol_weakness",
    effect: "symbol_weakness_desc",
  },
  {
    name: "symbol_custom_name",
    effect: "",
    customName: "",
  },
];

export default function SpellSymbolistSymbolsModal({
  open,
  onClose,
  onSave,
  onDelete,
  symbol,
}) {
  const { t } = useTranslate();
  const [currentSymbols, setCurrentSymbols] = useState(symbol?.symbols || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    symbol ? !!symbol.showInPlayerSheet : true
  );

  useEffect(() => {
    if (symbol) {
      setShowInPlayerSheet(!!symbol.showInPlayerSheet);
    }
    setCurrentSymbols(symbol?.symbols || []);
  }, [symbol]);

  const handleAddSymbol = () => {
    setCurrentSymbols([
      ...currentSymbols,
      {
        name: "symbol_custom_name",
        effect: "",
        customName: "",
      },
    ]);
  };

  const handleSymbolChange = (index, field, value) => {
    const updatedSymbols = [...currentSymbols];

    if (field === "name") {
      const selectedSymbol = availableSymbols.find((sym) => sym.name === value);

      if (selectedSymbol) {
        updatedSymbols[index] = {
          ...selectedSymbol,
          customName:
          selectedSymbol.name === "symbol_custom_name"
              ? updatedSymbols[index].customName
              : "",
        };
      }
    } else {
      updatedSymbols[index][field] = value;
    }

    setCurrentSymbols(updatedSymbols);
  };

  const handleDeleteSymbol = (index) => {
    setCurrentSymbols(currentSymbols.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(symbol.index, {
      ...symbol,
      symbols: currentSymbols,
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
        {t("symbol_edit_symbols_modal")}
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
          {currentSymbols.map((sym, index) => (
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
                    {t("symbol_symbol")}
                  </InputLabel>
                  <Select
                    label={t("symbol_symbol")}
                    value={sym.name}
                    onChange={(e) =>
                      handleSymbolChange(index, "name", e.target.value)
                    }
                    sx={{
                      fontSize: { xs: "0.85rem", sm: "1rem" }, // Adjust font size
                      height: { xs: "40px", sm: "48px", md: "56px" }, // Adjust height for smaller screens
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.85rem", sm: "1rem" }, // Ensure input text scales properly
                      },
                    }}
                  >
                    {availableSymbols.map((option) => (
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
                  label={t("symbol_name")}
                  value={
                    sym.name === "symbol_custom_name"
                      ? sym.customName
                      : t(sym.name)
                  }
                  onChange={(e) =>
                    handleSymbolChange(index, "customName", e.target.value)
                  }
                  disabled={sym.name !== "symbol_custom_name"}
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
                  onClick={() => handleDeleteSymbol(index)}
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
                {sym.name !== "symbol_custom_name" ? (
                  <TextField
                    label={t("symbol_effect")}
                    value={
                      sym.name === "symbol_custom_name"
                        ? sym.effect
                        : t(sym.effect)
                    }
                    onChange={(e) =>
                      handleSymbolChange(index, "effect", e.target.value)
                    }
                    disabled={sym.name !== "symbol_custom_name"}
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
                    label={t("symbol_effect")}
                    fullWidth
                    value={
                      sym.name === "symbol_custom_name"
                        ? sym.effect
                        : t(sym.effect)
                    }
                    onChange={(e) =>
                      handleSymbolChange(index, "effect", e.target.value)
                    }
                    maxRows={10}
                    maxLength={1500}
                    disabled={sym.name !== "symbol_custom_name"}
                  />
                )}
              </Grid>

              {/* Adjusted Delete Button */}
            </Grid>
          ))}
        </Grid>

        {/* Add Symbol Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSymbol}
          sx={{
            width: "100%",
            mt: 2,
            padding: { xs: "12px", sm: "16px" }, // Adjust button padding for mobile
          }}
        >
          {t("symbol_add_symbol")}
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
