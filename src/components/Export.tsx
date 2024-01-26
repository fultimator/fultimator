import { useState } from "react";
import useDownloadJSON from "../hooks/useDownloadJSON";
import { Code } from "@mui/icons-material";
import { Tooltip, IconButton, Menu, MenuItem, Snackbar } from "@mui/material";

type Props = {
  name?: string;
  data?: any;
};

enum ExportAction {
  FILE,
  CLIPBOARD,
}

function Export({ name = "", data = {} }: Props) {
  const [downloadJSON, copyToClipboard] = useDownloadJSON(name, data);

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [exportAnchor, setExportAnchor] = useState(null);
  const isExportMenuOpen = Boolean(exportAnchor);

  function handleOpenExportMenu(event) {
    setExportAnchor(event.currentTarget);
  }

  function handleCloseExportMenu() {
    setExportAnchor(null);
  }

  function handleSnackbarOpen() {
    setIsSnackbarOpen(true);
  }

  function handleSnackbarClose() {
    setIsSnackbarOpen(false);
  }

  function exportJSON(action: ExportAction) {
    switch (action) {
      case ExportAction.FILE:
        downloadJSON();
        break;
      case ExportAction.CLIPBOARD:
        copyToClipboard();
        handleSnackbarOpen();
        break;
      default:
        break;
    }
    handleCloseExportMenu();
  }

  return (
    <>
      <Tooltip title="Export">
        <IconButton onClick={handleOpenExportMenu}>
          <Code />
        </IconButton>
      </Tooltip>

      {/* Menu component shows a modal in the whole screen. Can't rely on mouseover or mouseleave events */}
      <Menu
        anchorEl={exportAnchor}
        open={isExportMenuOpen}
        onClose={handleCloseExportMenu}
      >
        <MenuItem
          onClick={() => {
            exportJSON(ExportAction.FILE);
          }}
        >
          Export as JSON File
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportJSON(ExportAction.CLIPBOARD);
          }}
        >
          Copy JSON to Clipboard
        </MenuItem>
      </Menu>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="Copied to Clipboard!"
      />
    </>
  );
}

export default Export;
