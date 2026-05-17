import { InputAdornment, IconButton, TextField, Tooltip } from "@mui/material";
import { Refresh, ContentCopy } from "@mui/icons-material";
import { slugify } from "../../libs/slugify";
import { useTranslate } from "../../translation/translate";

interface Props {
  value: string | undefined;
  name: string;
  onChange: (fuid: string) => void;
  disabled?: boolean;
}

export default function FuidField({ value, name, onChange, disabled = false }: Props) {
  const { t } = useTranslate();

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
                  <IconButton size="small" onClick={handleCopy} disabled={!value}>
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
