import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Storage,
  FileDownload,
  FileUpload,
  CloudUpload,
  CloudDownload,
} from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";

interface DataSyncMenuProps {
  supportsLocalDb: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  onLocalExport: () => void;
  onLocalImport: () => void;
  onDriveExport: () => void;
  onDriveImport: () => void;
}

const DataSyncMenu: React.FC<DataSyncMenuProps> = ({
  supportsLocalDb,
  isAuthenticated,
  isLoading,
  onLocalExport,
  onLocalImport,
  onDriveExport,
  onDriveImport,
}) => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!supportsLocalDb && !isAuthenticated) return null;

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const wrap = (fn: () => void) => () => {
    handleClose();
    fn();
  };

  return (
    <>
      <MenuItem onClick={handleToggle} disabled={isLoading}>
        <ListItemIcon>
          <Storage />
        </ListItemIcon>
        <ListItemText primary={t("Data & Sync")} />
      </MenuItem>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {supportsLocalDb && [
          <MenuItem
            key="export-local"
            onClick={wrap(onLocalExport)}
            disabled={isLoading}
          >
            <ListItemIcon>
              <FileDownload />
            </ListItemIcon>
            <ListItemText primary={t("Export Local Database")} />
          </MenuItem>,
          <MenuItem
            key="import-local"
            onClick={wrap(onLocalImport)}
            disabled={isLoading}
          >
            <ListItemIcon>
              <FileUpload />
            </ListItemIcon>
            <ListItemText primary={t("Import Local Database")} />
          </MenuItem>,
        ]}

        {supportsLocalDb && isAuthenticated && <Divider key="drive-divider" />}

        {isAuthenticated && [
          <MenuItem
            key="drive-export"
            onClick={wrap(onDriveExport)}
            disabled={isLoading}
          >
            <ListItemIcon>
              <CloudUpload />
            </ListItemIcon>
            <ListItemText primary={t("Export to Google Drive")} />
          </MenuItem>,
          <MenuItem
            key="drive-import"
            onClick={wrap(onDriveImport)}
            disabled={isLoading}
          >
            <ListItemIcon>
              <CloudDownload />
            </ListItemIcon>
            <ListItemText primary={t("Restore from Google Drive")} />
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
};

export default DataSyncMenu;
