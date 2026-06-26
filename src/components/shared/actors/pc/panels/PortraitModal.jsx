import React, { useCallback } from "react";
import avatar_image from "/images/components/avatar.jpg";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import CropFreeIcon from "@mui/icons-material/CropFree";
import { useTranslate } from "/src/translation/translate";

export default function PortraitModal({ open, onClose, pc, onUpdate }) {
  const { t } = useTranslate();
  const [urlTemp, setUrlTemp] = React.useState(pc.info.imgurl || "");
  const [fitMode, setFitMode] = React.useState(
    pc.info?.portraitFitMode === "contain" ? "contain" : "cover",
  );
  const [error, setError] = React.useState("");
  const [snackOpen, setSnackOpen] = React.useState(false);

  const previewSrc = urlTemp || pc.info.imgurl || "";

  const checkAndApply = useCallback(async () => {
    if (!urlTemp) {
      onUpdate?.((prev) => ({
        ...prev,
        info: { ...prev.info, imgurl: "", portraitFitMode: fitMode },
      }));
      onClose();
      return;
    }
    try {
      const res = await fetch(urlTemp);
      if (!res.ok) {
        setError(`Failed to fetch: ${res.status} ${res.statusText}`);
        return;
      }
      const blob = await res.blob();
      if (blob.size > 5 * 1024 * 1024) {
        setError("Image too large (max 5 MB)");
        return;
      }
      onUpdate?.((prev) => ({
        ...prev,
        info: { ...prev.info, imgurl: urlTemp, portraitFitMode: fitMode },
      }));
      setSnackOpen(true);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  }, [urlTemp, fitMode, onUpdate, onClose]);

  const handleRemove = () => {
    setUrlTemp("");
    onUpdate?.((prev) => ({ ...prev, info: { ...prev.info, imgurl: "" } }));
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "Antonio", textTransform: "uppercase" }}>
          {t("Portrait")}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "12px !important",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 240,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Portrait preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: fitMode,
                  objectPosition: "center",
                  display: "block",
                }}
              />
            ) : (
              <img
                src={avatar_image}
                alt="Default portrait"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  opacity: 0.4,
                }}
              />
            )}
          </Box>
          <TextField
            label={t("Image URL")}
            value={urlTemp}
            onChange={(e) => {
              setUrlTemp(e.target.value);
              setError("");
            }}
            fullWidth
            size="small"
            error={!!error}
            helperText={error || undefined}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip
              title={
                fitMode === "contain"
                  ? t("Switch to Cover")
                  : t("Switch to Contain")
              }
            >
              <IconButton
                size="small"
                onClick={() =>
                  setFitMode((m) => (m === "contain" ? "cover" : "contain"))
                }
              >
                {fitMode === "contain" ? <CropFreeIcon /> : <FitScreenIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {fitMode === "contain" ? t("Contain") : t("Cover")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              p: 1.25,
              borderRadius: 1,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <InfoOutlined
              sx={{
                fontSize: "1rem",
                mt: "2px",
                flexShrink: 0,
                color: "text.secondary",
              }}
            />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                {t(
                  "Paste a direct image URL (must end in .png, .jpg, .webp, etc.). Most platforms block hotlinking. The most reliable option is a dedicated image host that gives you a raw file link:",
                )}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="ul"
                sx={{ m: 0, pl: 2 }}
              >
                <li>
                  <strong>postimages.org</strong> - upload, use the "Direct
                  link" field
                </li>
                <li>
                  <strong>GitHub</strong> - open the file, click Raw, copy the
                  raw.githubusercontent.com URL
                </li>
              </Typography>
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ display: "block", mt: 0.5 }}
              >
                {t(
                  "Discord, Google Drive, and social platforms block external image loading.",
                )}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemove} color="error" sx={{ mr: "auto" }}>
            {t("Remove Image")}
          </Button>
          <Button onClick={onClose}>{t("Cancel")}</Button>
          <Button onClick={checkAndApply} variant="contained">
            {t("Update Image")}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={t("Image uploaded successfully!")}
      />
    </>
  );
}
