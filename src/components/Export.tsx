import { useState } from "react";
import useDownloadJSON from "../hooks/useDownloadJSON";
import { Code } from "@mui/icons-material";
import { Tooltip, IconButton, Menu, MenuItem, Snackbar } from "@mui/material";
import { useTranslate } from "../translation/translate";
import { buildItemText } from "../libs/buildItemText";

type Props = {
  name?: string;
  dataType: string;
  data?: any;
};

enum ExportAction {
  FILE,
  CLIPBOARD,
}

function Export({ name = "", dataType, data = {} }: Props) {
  const { t } = useTranslate();
  const [downloadJSON, copyToClipboard] = useDownloadJSON(name, { ...data, dataType });

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

  async function handleCopyText(fmt: string) {
    const text = buildItemText(dataType, data, fmt);
    await navigator.clipboard.writeText(text);
    handleCloseExportMenu();
    handleSnackbarOpen();
  }

  return (
    <>
      <Tooltip title={t("Export")}>
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
          {t("export_json_file")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportJSON(ExportAction.CLIPBOARD);
          }}
        >
          {t("copy_json_clipboard")}
        </MenuItem>
        <MenuItem onClick={() => handleCopyText("markdown")}>{t("Copy Markdown to Clipboard")}</MenuItem>
        <MenuItem onClick={() => handleCopyText("plain")}>{t("Copy Plaintext to Clipboard")}</MenuItem>
        {dataType === "npc" && (
          <MenuItem onClick={() => handleCopyText("obsidian")}>{t("Copy Obsidian (BlueCorvid) to Clipboard")}</MenuItem>
        )}
      </Menu>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={isSnackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={t("Copied to Clipboard!")}
      />
    </>
  );
}

export default Export;
