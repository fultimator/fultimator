import React, { useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { languageOptions, useTranslate } from "../../translation/translate";

export interface LanguageMenuProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageMenu: React.FC<LanguageMenuProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    onSelectLanguage(language);
    handleClose();
  };

  return (
    <>
      <MenuItem
        onClick={handleClick}
        aria-label={`${t("Change Language to:", true)} ${getLanguageName(
          selectedLanguage
        )}`}
      >
        <ListItemIcon>
          <LanguageIcon />
        </ListItemIcon>
        <ListItemText
          primary={`${t("Language:", true)} ${getLanguageName(
            selectedLanguage
          )}`}
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
        {languageOptions.map((option) => (
          <MenuItem
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const getLanguageName = (languageCode: string): string => {
  switch (languageCode) {
    case "en":
      return "English";
    case "it":
      return "Italiano";
    case "es":
      return "Español";
    case "de":
      return "German";
    case "pl":
      return "Polish";
    case "fr":
      return "French";
    default:
      return languageCode;
  }
};

export default LanguageMenu;
