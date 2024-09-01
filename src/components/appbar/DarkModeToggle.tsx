import React from "react";
import { Switch, FormControlLabel } from "@mui/material";
import { useTranslate } from "../../translation/translate";

export interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { t } = useTranslate();
  return (
    <FormControlLabel
      control={
        <Switch
          checked={isDarkMode}
          onChange={onToggleDarkMode}
          color="default"
        />
      }
      label={t("Dark Mode")}
    />
  );
};

export default DarkModeToggle;
