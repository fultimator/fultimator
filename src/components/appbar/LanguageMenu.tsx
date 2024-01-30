import React, { useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";

export interface LanguageMenuProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageMenu: React.FC<LanguageMenuProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
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

  const languageOptions = [
    { code: "en", label: "English" },
    { code: "it", label: "Italiano (Italian)" },
    { code: "es", label: "Español (Spanish)" },
    // Continue?
  ];

  return (
    <>
      <MenuItem onClick={handleClick} aria-label={`Change Language to ${getLanguageName(selectedLanguage)}`}>
        <ListItemIcon>
          <LanguageIcon />
        </ListItemIcon>
        <ListItemText primary={`Language: ${getLanguageName(selectedLanguage)}`} />
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
          <MenuItem key={option.code} onClick={() => handleLanguageChange(option.code)}>
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
    default:
      return languageCode;
  }
};

export default LanguageMenu;
