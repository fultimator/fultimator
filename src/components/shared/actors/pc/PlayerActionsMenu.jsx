import { useState } from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Download,
  Edit,
  Menu as MenuIcon,
  Share,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { applyPreSaveTransforms } from "/src/libs/actor";
import { canonicalizeForTransfer } from "/src/libs/exportTransforms";
import { buildItemText } from "/src/libs/buildItemText";
import { IS_ELECTRON } from "/src/platform";

function safeFileName(name) {
  return (name || "player").replace(/\s+/g, "_").toLowerCase();
}

function downloadBlob(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PlayerActionsMenu({
  player,
  isLocal = false,
  onEdit,
  onDownloadImage,
  buttonSx,
}) {
  const { t } = useTranslate();
  const [anchor, setAnchor] = useState(null);
  const [submenu, setSubmenu] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  if (!player) return null;

  const close = () => setAnchor(null);
  const exportData = () =>
    canonicalizeForTransfer("pc", applyPreSaveTransforms(player));
  const json = () =>
    JSON.stringify({ ...exportData(), dataType: "pc" }, null, 2);

  const copyJson = async () => {
    await navigator.clipboard.writeText(json());
    setSnackbar(t("Copied to Clipboard!"));
    close();
  };

  const downloadJson = () => {
    downloadBlob(
      json(),
      "application/json;charset=utf-8",
      `${safeFileName(player.name)}.json`,
    );
    close();
  };

  const copyText = async (fmt) => {
    await navigator.clipboard.writeText(buildItemText("pc", exportData(), fmt));
    setSnackbar(t("Copied to Clipboard!"));
    close();
  };

  const downloadText = (fmt) => {
    downloadBlob(
      buildItemText("pc", exportData(), fmt),
      "text/plain;charset=utf-8",
      `${safeFileName(player.name)}.${fmt === "plain" ? "txt" : "md"}`,
    );
    close();
  };

  const share = async () => {
    close();
    if (isLocal) {
      setSnackbar(`${t("Share URL")}: ${t("Disabled for local")}`);
      return;
    }
    const base = IS_ELECTRON
      ? "https://fultimator.com"
      : window.location.origin;
    await navigator.clipboard.writeText(`${base}/pc-gallery/${player.id}`);
    setSnackbar(t("Copied to Clipboard!"));
  };

  return (
    <>
      <Tooltip title={t("Actions")}>
        <IconButton
          aria-label={t("Actions")}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={buttonSx}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        slotProps={{ transition: { onExited: () => setSubmenu(null) } }}
      >
        {submenu === null && [
          onEdit && (
            <MenuItem
              key="edit"
              onClick={() => {
                close();
                onEdit();
              }}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Edit")} />
            </MenuItem>
          ),
          <MenuItem key="export" onClick={() => setSubmenu("export")}>
            <ListItemIcon>
              <Code fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Export")} />
            <ChevronRight fontSize="small" />
          </MenuItem>,
          <MenuItem
            key="share"
            sx={isLocal ? { opacity: 0.38 } : undefined}
            onClick={share}
          >
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Share URL")} />
          </MenuItem>,
          onDownloadImage && (
            <MenuItem
              key="download"
              onClick={() => {
                close();
                onDownloadImage();
              }}
            >
              <ListItemIcon>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t("Download as Image")} />
            </MenuItem>
          ),
        ]}
        {submenu === "export" && [
          <MenuItem key="back" onClick={() => setSubmenu(null)}>
            <ListItemIcon>
              <ChevronLeft fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t("Export")} />
          </MenuItem>,
          <Divider key="d1" />,
          <MenuItem key="copy-json" onClick={copyJson}>
            {t("copy_json_clipboard")}
          </MenuItem>,
          <MenuItem key="dl-json" onClick={downloadJson}>
            {t("export_json_file")}
          </MenuItem>,
          <Divider key="d2" />,
          <MenuItem key="copy-md" onClick={() => copyText("markdown")}>
            {t("Copy Markdown to Clipboard")}
          </MenuItem>,
          <MenuItem key="dl-md" onClick={() => downloadText("markdown")}>
            {t("Export as Markdown (.md)")}
          </MenuItem>,
          <Divider key="d3" />,
          <MenuItem key="copy-plain" onClick={() => copyText("plain")}>
            {t("Copy Plaintext to Clipboard")}
          </MenuItem>,
          <MenuItem key="dl-plain" onClick={() => downloadText("plain")}>
            {t("Export as Plaintext (.txt)")}
          </MenuItem>,
        ]}
      </Menu>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2500}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </>
  );
}
