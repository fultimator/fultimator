import React, { useState, useEffect } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTranslate } from "../../translation/translate";

type ThemeValue = "Fabula" | "High" | "Techno" | "Natural" | "Midnight";

export interface ThemeSwitcherProps {
  selectedTheme: ThemeValue;
  onSelectTheme: (theme: ThemeValue) => void;
}

const themes = [
  { value: "Fabula", label: "Core Rulebook" },
  { value: "High", label: "High Fantasy" },
  { value: "Techno", label: "Techno Fantasy" },
  { value: "Natural", label: "Natural Fantasy" },
  { value: "Midnight", label: "Fabula Obscura" },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleToggleTheme = (theme: ThemeValue) => {
    onSelectTheme(theme);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    onSelectTheme(selectedTheme);
  }, [onSelectTheme, selectedTheme]);

  return (
    <>
      <MenuItem onClick={handleToggle}>
        <ListItemIcon>
          {selectedTheme === "Midnight" ? (
            <Brightness4Icon />
          ) : (
            <Brightness7Icon />
          )}
        </ListItemIcon>
        <ListItemText
          primary={`${t("Theme:", true)} ${getThemeName(selectedTheme)}`}
        />
      </MenuItem>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {themes.map((themeOption) => (
          <MenuItem
            key={themeOption.value}
            onClick={() => handleToggleTheme(themeOption.value as ThemeValue)}
          >
            {getThemeName(themeOption.value as ThemeValue)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const getThemeName = (themeValue: ThemeValue): string => {
  const themeOption = themes.find((option) => option.value === themeValue);
  return themeOption ? themeOption.label : themeValue;
};

export default ThemeSwitcher;
