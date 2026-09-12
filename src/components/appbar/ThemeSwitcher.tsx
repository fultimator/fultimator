import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ListSubheader,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import StyleIcon from "@mui/icons-material/Style";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslate } from "../../translation/translate";
import type { ThemeValue, StyleProfileValue } from "../../store/themeStore";
import {
  THEME_DEFAULT_PROFILE_MAP,
  STYLE_PROFILE_MAP,
} from "../../themes/themeRegistry";

export interface ThemeSwitcherProps {
  selectedTheme: ThemeValue;
  selectedStyleProfile: StyleProfileValue;
  onSelectTheme: (theme: ThemeValue) => void;
  onSelectStyleProfile: (profile: StyleProfileValue) => void;
}

const themes = [
  { value: "Fabula", label: "Core Rulebook" },
  { value: "High", label: "High Fantasy" },
  { value: "Techno", label: "Techno Fantasy" },
  { value: "Natural", label: "Natural Fantasy" },
  { value: "Bravely", label: "Bravely Ordinary" },
  { value: "Obscura", label: "Fabula Obscura" },
  { value: "Noir", label: "Noir" },
  { value: "ClearBlue", label: "Clear Blue" },
  { value: "MidnightBlue", label: "Midnight Blue" },
];

const styleProfiles = [
  { value: "ThemeDefault", label: "Theme Default" },
  { value: "Flat", label: "Flat" },
  { value: "Regalia", label: "Regalia" },
  { value: "Dystopian", label: "Dystopian" },
  { value: "Noir", label: "Noir" },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  selectedTheme,
  selectedStyleProfile,
  onSelectTheme,
  onSelectStyleProfile,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleToggleTheme = (theme: ThemeValue) => {
    onSelectTheme(theme);
  };

  const handleToggleStyleProfile = (profile: StyleProfileValue) => {
    onSelectStyleProfile(profile);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MenuItem onClick={handleToggle}>
        <ListItemIcon>
          {selectedStyleProfile === "ThemeDefault" ? (
            <Brightness4Icon />
          ) : (
            <StyleIcon />
          )}
        </ListItemIcon>
        <ListItemText
          primary={`${t("Theme:", true)} ${getThemeName(selectedTheme)}`}
          secondary={`${t("Styles:", true)} ${getStyleDisplayName(selectedTheme, selectedStyleProfile)}`}
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
        <ListSubheader>{t("Theme", true)}</ListSubheader>
        {themes.map((themeOption) => (
          <MenuItem
            key={themeOption.value}
            selected={selectedTheme === themeOption.value}
            onClick={() => {
              handleToggleTheme(themeOption.value as ThemeValue);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {selectedTheme === themeOption.value ? (
                <CheckIcon fontSize="small" />
              ) : null}
            </ListItemIcon>
            {getThemeName(themeOption.value as ThemeValue)}
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader>{t("Styles", true)}</ListSubheader>
        {styleProfiles.map((styleOption) => (
          <MenuItem
            key={styleOption.value}
            selected={selectedStyleProfile === styleOption.value}
            onClick={() =>
              handleToggleStyleProfile(styleOption.value as StyleProfileValue)
            }
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {selectedStyleProfile === styleOption.value ? (
                <CheckIcon fontSize="small" />
              ) : null}
            </ListItemIcon>
            {getStyleProfileName(styleOption.value as StyleProfileValue)}
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

const getStyleProfileName = (styleValue: StyleProfileValue): string => {
  const styleOption = styleProfiles.find(
    (option) => option.value === styleValue,
  );
  return styleOption ? styleOption.label : styleValue;
};

const getStyleDisplayName = (
  themeValue: ThemeValue,
  styleValue: StyleProfileValue,
): string => {
  if (styleValue !== "ThemeDefault") return getStyleProfileName(styleValue);
  const defaultProfileId = THEME_DEFAULT_PROFILE_MAP[themeValue];
  const matchedKey = (
    Object.keys(STYLE_PROFILE_MAP) as StyleProfileValue[]
  ).find((k) => STYLE_PROFILE_MAP[k] === defaultProfileId);
  return `Theme Default (${getStyleProfileName(matchedKey ?? "Flat")})`;
};

export default ThemeSwitcher;
