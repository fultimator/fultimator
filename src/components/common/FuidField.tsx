import { useEffect } from "react";
import { InputAdornment, IconButton, TextField, Tooltip } from "@mui/material";
import { Refresh, ContentCopy } from "@mui/icons-material";
import { slugify } from "../../libs/slugify";
import { useTranslate } from "../../translation/translate";

interface Props {
  value: string | undefined;
  name: string;
  onChange: (fuid: string) => void;
  disabled?: boolean;
  autoSync?: boolean;
}

export default function FuidField({
  value,
  name,
  onChange,
  disabled = false,
  autoSync = false,
}: Props) {
  const { t } = useTranslate();

  useEffect(() => {
    if (!autoSync) return;
    const derived = slugify(name);
    if (!derived) return;
    if (value !== derived) onChange(derived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, autoSync]);

  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(value);
  };

  return (
    <TextField
      label="ID"
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
            </InputAdornment>
          ),
        },
        htmlInput: { tabIndex: -1 },
      }}
    />
  );
}
