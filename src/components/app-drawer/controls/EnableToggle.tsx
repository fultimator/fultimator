import React from "react";
import { Box, Switch, IconButton, Typography } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";

interface EnableToggleProps {
  label: string;
  enabled: boolean | null;
  defaultEnabled?: boolean;
  isDisabled?: boolean;
  onChange: (checked: boolean) => void;
  onReset: () => void;
}

export const EnableToggle: React.FC<EnableToggleProps> = ({
  label,
  enabled,
  defaultEnabled = true,
  isDisabled = false,
  onChange,
  onReset,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
    }}
  >
    <Typography variant="body2">{label}</Typography>
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", ml: "auto" }}>
      <Switch
        size="small"
        disabled={isDisabled}
        checked={
          isDisabled
            ? false
            : enabled === true || (enabled === null && defaultEnabled)
        }
        onChange={(e) => onChange(e.target.checked ? true : false)}
        sx={{ m: 0 }}
      />
      {enabled !== null && (
        <IconButton size="small" onClick={onReset} sx={{ p: 0.5 }}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  </Box>
);
