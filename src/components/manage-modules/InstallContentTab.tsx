import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useTranslate } from "../../translation/translate";

interface InstallContentTabProps {
  onImportFile: (file: File) => Promise<string>;
  onImportUrl: (url: string) => Promise<string>;
  /** Called with the new pack id after a successful import */
  onImportSuccess: (packId: string) => void;
}

export default function InstallContentTab({
  onImportFile,
  onImportUrl,
  onImportSuccess,
}: InstallContentTabProps) {
  const { t } = useTranslate();
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (importing) return;
    setImporting(true);
    setError("");
    try {
      const id = await onImportFile(file);
      setUrl("");
      onImportSuccess(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleUrl = async () => {
    if (!url.trim() || importing) return;
    setImporting(true);
    setError("");
    try {
      const id = await onImportUrl(url.trim());
      setUrl("");
      onImportSuccess(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="subtitle2">{t("Upload .fcp file")}</Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {t("Select a .fcp file exported from Fultimator.")}
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<FileUploadIcon />}
          disabled={importing}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("Choose file")}
          <input
            type="file"
            accept=".fcp,.zip"
            hidden
            disabled={importing}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </Button>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="subtitle2">{t("From URL")}</Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {t("Paste a manifest.json URL to download and import the pack.")}
        </Typography>
        <TextField
          label={t("Manifest URL")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          size="small"
          placeholder="https://.../manifest.json"
          disabled={importing}
          onKeyDown={(e) => e.key === "Enter" && handleUrl()}
        />
        <Button
          variant="contained"
          onClick={handleUrl}
          disabled={importing || !url.trim()}
          startIcon={
            importing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FileUploadIcon />
            )
          }
          sx={{ alignSelf: "flex-start" }}
        >
          {t("Import")}
        </Button>
      </Box>
      {importing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2">{t("Importing…")}</Typography>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
