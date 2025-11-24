import React from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { customizations } from "./libs.jsx";
import { Martial } from "../../../components/icons";

function ChangeCustomizations({
  selectedCustomization,
  setSelectedCustomization,
  onCustomizationAdd,
  onCustomizationRemove,
  currentCustomizations,
  selectedCategory,
  isSecondForm,
}) {
  const { t } = useTranslate();

  // Filter out already chosen customizations
  const availableCustomizations = customizations.filter((custom) => {
    // Prevent selecting 'powerful' for arcane or dagger weapons
    if (
      custom.name === "weapon_customization_powerful" &&
      (selectedCategory === "weapon_category_arcane" ||
        selectedCategory === "weapon_category_dagger")
    ) {
      return false;
    }

    // Prevent 'quick' and 'powerful' from coexisting
    if (
      (custom.name === "weapon_customization_powerful" &&
        currentCustomizations.some(
          (c) => c.name === "weapon_customization_quick"
        )) ||
      (custom.name === "weapon_customization_quick" &&
        currentCustomizations.some(
          (c) => c.name === "weapon_customization_powerful"
        ))
    ) {
      return false;
    }

    return !currentCustomizations.some(
      (selected) => selected.name === custom.name
    );
  });

  const totalCustomizationCost = currentCustomizations.reduce(
    (total, customization) => total + customization.customCost,
    0
  );

  // Get the cost of the selected customization
  const selectedCustomizationObject = customizations.find(
    (custom) => custom.name === selectedCustomization
  );
  const selectedCustomizationCost = selectedCustomizationObject
    ? selectedCustomizationObject.customCost
    : 0;

  const isButtonDisabled =
    totalCustomizationCost + selectedCustomizationCost > 3;

  return (
    <Grid container item xs={12} spacing={1}>
      {/* Customization Selection */}
      <Grid item xs={10}>
        <FormControl fullWidth>
          <InputLabel>{t("weapons_customization_select")}</InputLabel>
          <Select
            label={t("weapons_customization_select")}
            value={selectedCustomization}
            onChange={(e) => setSelectedCustomization(e.target.value)}
            disabled={totalCustomizationCost === 3}
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center'
              }
            }}
          >
            {availableCustomizations.map((custom) => (
              <MenuItem key={custom.name} value={custom.name}>
                {custom.martial && (
                  <ListItemIcon>
                    <Martial />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={`${t(custom.name)} (${custom.customCost})`}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Add Customization Button */}
      <Grid item xs={2}>
        <Button
          variant="contained"
          onClick={() => {
            if (selectedCustomization) {
              const customToAdd = customizations.find(
                (c) => c.name === selectedCustomization
              );
              if (customToAdd) {
                onCustomizationAdd(customToAdd);
                setSelectedCustomization("");
              }
            }
          }}
          disabled={isButtonDisabled || !selectedCustomization}
          sx={{ height: "100%", width: "100%" }}
        >
          {"+"}
        </Button>
      </Grid>

      {/* List of selected customizations */}
      <Grid item xs={12}>
        <Grid container spacing={1} direction="row">
          {currentCustomizations.map((customization) => (
            <Grid item key={customization.name}>
              <Chip
                label={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {t(customization.name)}
                    {customization.martial && <Martial />}
                  </span>
                }
                disabled={isSecondForm && customization.name === "weapon_customization_transforming"}
                onDelete={() => onCustomizationRemove(customization.name)}
                color="primary"
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ChangeCustomizations;