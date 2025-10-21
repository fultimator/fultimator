import { memo } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { availableModules } from "../../../libs/pilotVehicleData";

const ModuleDropdown = memo(({ value, onChange, disabled }) => {
  const { t } = useTranslate();

  return (
    <FormControl fullWidth>
      <InputLabel>{t("Module")}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {/* Armor Modules */}
        <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t("pilot_module_armor")}
        </MenuItem>
        {availableModules.armor.map((availableModule) => (
          <MenuItem
            key={availableModule.name}
            value={availableModule.name}
            sx={{ pl: 3 }}
          >
            {t(availableModule.name)}
          </MenuItem>
        ))}
        
        {/* Weapon Modules */}
        <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t("pilot_module_weapon")}
        </MenuItem>
        {availableModules.weapon.map((availableModule) => (
          <MenuItem
            key={availableModule.name}
            value={availableModule.name}
            sx={{ pl: 3 }}
          >
            {t(availableModule.name)} ({t(availableModule.category)})
            {availableModule.cumbersome && " 🚫"}
          </MenuItem>
        ))}
        
        {/* Support Modules */}
        <MenuItem disabled sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t("pilot_module_support")}
        </MenuItem>
        {availableModules.support.map((availableModule) => (
          <MenuItem
            key={availableModule.name}
            value={availableModule.name}
            sx={{ pl: 3 }}
          >
            {t(availableModule.name)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

ModuleDropdown.displayName = 'ModuleDropdown';

export default ModuleDropdown;