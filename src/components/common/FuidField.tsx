import { useEffect, useState } from "react";
import {
  Alert,
  InputAdornment,
  IconButton,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material";
import { Refresh, ContentCopy, Search } from "@mui/icons-material";
import { slugify } from "../../libs/slugify";
import { useTranslate } from "../../translation/translate";

interface Props {
  value: string | undefined;
  name: string;
  label?: string;
  onChange: (fuid: string) => void;
  onBrowse?: () => void;
  disabled?: boolean;
  autoSync?: boolean;
}

export default function FuidField({
  value,
  name,
  label = "ID",
  onChange,
  onBrowse,
  disabled = false,
  autoSync = false,
}: Props) {
  const { t } = useTranslate();
  const [copiedOpen, setCopiedOpen] = useState(false);

  useEffect(() => {
    if (!autoSync) return;
    const derived = slugify(name);
    if (!derived) return;
    if (value !== derived) onChange(derived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, autoSync]);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopiedOpen(true);
    }
  };

  return (
    <>
      <TextField
        label={t(label)}
        value={value ?? ""}
        fullWidth
        size="small"
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t("Copy ID")}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleCopy}
                      disabled={!value}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {!disabled && (
                  <Tooltip title={t("Regenerate from name")}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onChange(slugify(name))}
                        disabled={!name}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {!disabled && onBrowse && (
                  <Tooltip title={t("Import from Compendium")}>
                    <span>
                      <IconButton size="small" onClick={onBrowse}>
                        <Search fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </InputAdornment>
            ),
          },
          htmlInput: { tabIndex: -1 },
        }}
      />
      <Snackbar
        open={copiedOpen}
        autoHideDuration={1800}
        onClose={() => setCopiedOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {t("Copied to clipboard")}
        </Alert>
      </Snackbar>
    </>
  );
}
