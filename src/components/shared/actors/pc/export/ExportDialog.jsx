import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Divider,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTranslate } from "../../../../../translation/translate";

const STORAGE_KEY = "export-settings";

const DEFAULT_SETTINGS = {
  format: "png",
  scale: 2,
  printMode: false,
};

export default function ExportDialog({
  open,
  onClose,
  onDownload,
  isLoading,
  title,
  officialPdfDescription,
}) {
  const { t } = useTranslate();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // ignore malformed stored values
    }
  }, [open]);

  const set = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleDownload = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage write errors
    }
    await onDownload(settings);
  };

  const showCaptureOptions =
    settings.format === "png" || settings.format === "app-pdf";
  const showScaleOption = settings.format === "png";

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title ?? t("Export Character Sheet")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <FormControl>
            <FormLabel>{t("Format")}</FormLabel>
            <RadioGroup
              value={settings.format}
              onChange={(e) => set("format", e.target.value)}
            >
              <FormControlLabel
                value="png"
                control={<Radio />}
                label={t("PNG Image")}
              />
              <FormControlLabel
                value="app-pdf"
                control={<Radio />}
                label={
                  <Stack>
                    <Typography variant="body2">
                      {t("App Layout PDF")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("Sheet as-is, sliced into A4 pages")}
                    </Typography>
                  </Stack>
                }
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label={
                  <Stack>
                    <Typography variant="body2">{t("Official PDF")}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {officialPdfDescription ??
                        t("Fill the official Fabula Ultima character sheet")}
                    </Typography>
                  </Stack>
                }
              />
            </RadioGroup>
          </FormControl>

          {showCaptureOptions && (
            <>
              <Divider />
              {showScaleOption && (
                <FormControl>
                  <FormLabel>{t("Scale")}</FormLabel>
                  <RadioGroup
                    row
                    value={String(settings.scale)}
                    onChange={(e) => set("scale", Number(e.target.value))}
                  >
                    <FormControlLabel
                      value="1"
                      control={<Radio />}
                      label="1x"
                    />
                    <FormControlLabel
                      value="2"
                      control={<Radio />}
                      label="2x"
                    />
                    <FormControlLabel
                      value="3"
                      control={<Radio />}
                      label={
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <span>3x</span>
                          <Typography variant="caption" color="text.secondary">
                            {t("(large file)")}
                          </Typography>
                        </Stack>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.printMode}
                    onChange={(e) => set("printMode", e.target.checked)}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">{t("Print Mode")}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("Forces white background, hides edit buttons")}
                    </Typography>
                  </Stack>
                }
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          disabled={isLoading}
        >
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isLoading ? t("Exporting...") : t("Download")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
