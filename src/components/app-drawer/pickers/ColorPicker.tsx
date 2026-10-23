import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, Popover, Stack, Button } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import { Clear as ClearIcon } from "@mui/icons-material";
import SettingRow from "../../common/SettingRow";

function useColorPickerState(
  value: string | null,
  defaultColor: string = "#000000",
) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hexInput, setHexInput] = useState(value ?? defaultColor);
  const [previewColor, setPreviewColor] = useState(value ?? defaultColor);
  const isPickerOpen = Boolean(anchorEl);
  const popoverRef = useRef<HTMLDivElement>(null);
  const wasPickerOpenRef = useRef(false);

  useEffect(() => {
    setHexInput(value ?? defaultColor);
    if (!isPickerOpen && !wasPickerOpenRef.current) {
      setPreviewColor(value ?? defaultColor);
    }
    wasPickerOpenRef.current = isPickerOpen;
  }, [value, isPickerOpen, defaultColor]);

  useEffect(() => {
    if (!isPickerOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as globalThis.Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorEl &&
        !anchorEl.contains(target)
      ) {
        setAnchorEl(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPickerOpen, anchorEl]);

  return {
    anchorEl,
    setAnchorEl,
    hexInput,
    setHexInput,
    previewColor,
    setPreviewColor,
    isPickerOpen,
    popoverRef,
  };
}

export interface BevelColorPickerProps {
  value: string | null;
  onChange: (value: string) => void;
  onReset: () => void;
}

export const BevelColorPicker = React.memo(function BevelColorPicker({
  value,
  onChange,
  onReset,
}: BevelColorPickerProps) {
  const {
    anchorEl,
    setAnchorEl,
    hexInput,
    setHexInput,
    previewColor,
    setPreviewColor,
    isPickerOpen,
    popoverRef,
  } = useColorPickerState(value);

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Box
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          backgroundColor: value ?? "#000000",
          border: "2px solid",
          borderColor: "divider",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": { boxShadow: 1, transform: "scale(1.05)" },
        }}
      />
      {value && (
        <IconButton size="small" onClick={onReset}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}

      <Popover
        open={isPickerOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          backdrop: { sx: { display: "none" } },
          paper: { ref: popoverRef, sx: { p: 1.5, boxShadow: 3 } },
        }}
      >
        <Stack spacing={1} sx={{ width: 240 }}>
          <Box
            onPointerDown={(e) => e.stopPropagation()}
            sx={{
              "& .react-colorful": { width: "100%", fontFamily: "inherit" },
            }}
          >
            <HexColorPicker color={previewColor} onChange={setPreviewColor} />
          </Box>
          <Box
            component="input"
            type="text"
            value={hexInput}
            onChange={(e) => {
              const val = e.currentTarget.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                setHexInput(val);
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) setPreviewColor(val);
              }
            }}
            placeholder="#000000"
            sx={{
              width: "100%",
              px: 1,
              py: 0.75,
              borderRadius: "4px",
              border: "1px solid",
              borderColor: "divider",
              fontFamily: "monospace",
              fontSize: "0.875rem",
              textAlign: "center",
              backgroundColor: "background.paper",
              color: "text.primary",
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => onChange(previewColor)}
            fullWidth
          >
            Apply
          </Button>
        </Stack>
      </Popover>
    </Box>
  );
});

export interface ColorPickerRowProps {
  label: string;
  value: string;
  isOverridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}

export const ColorPickerRow = React.memo(function ColorPickerRow({
  label,
  value,
  isOverridden,
  onChange,
  onReset,
}: ColorPickerRowProps) {
  const {
    anchorEl,
    setAnchorEl,
    hexInput,
    setHexInput,
    previewColor,
    setPreviewColor,
    isPickerOpen,
    popoverRef,
  } = useColorPickerState(value);

  return (
    <SettingRow label={label}>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: value,
            border: "2px solid",
            borderColor: "divider",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            "&:hover": { boxShadow: 2, transform: "scale(1.05)" },
          }}
        />
        {isOverridden && (
          <IconButton
            size="small"
            onClick={onReset}
            title="Reset to theme default"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}

        <Popover
          open={isPickerOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            backdrop: { sx: { display: "none" } },
            paper: { ref: popoverRef, sx: { p: 1.5, boxShadow: 3 } },
          }}
        >
          <Stack spacing={1} sx={{ width: 240 }}>
            <Box
              onPointerDown={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
              sx={{
                "& .react-colorful": { width: "100%", fontFamily: "inherit" },
                "& .react-colorful__saturation": {
                  borderRadius: "8px 8px 0 0",
                  marginBottom: "8px",
                  height: "160px",
                },
                "& .react-colorful__hue": {
                  borderRadius: "0 0 8px 8px",
                  height: "20px",
                },
                "& .react-colorful__pointer": {
                  width: "16px",
                  height: "16px",
                  borderWidth: "2px",
                },
                "& .react-colorful__last-control": {
                  borderRadius: "0 0 8px 8px",
                },
              }}
            >
              <HexColorPicker color={previewColor} onChange={setPreviewColor} />
            </Box>

            <Box
              component="input"
              type="text"
              value={hexInput}
              onChange={(e) => {
                const val = e.currentTarget.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  setHexInput(val);
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) setPreviewColor(val);
                }
              }}
              onBlur={(e) => {
                const val = e.currentTarget.value;
                if (!/^#[0-9A-Fa-f]{6}$/.test(val)) {
                  setHexInput(value);
                  setPreviewColor(value);
                }
              }}
              placeholder="#000000"
              sx={{
                width: "100%",
                px: 1,
                py: 0.75,
                borderRadius: "4px",
                border: "1px solid",
                borderColor: "divider",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                textAlign: "center",
                backgroundColor: "background.paper",
                color: "text.primary",
                transition: "border-color 0.2s",
                "&:focus": {
                  outline: "none",
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.05)",
                },
              }}
            />

            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onChange(previewColor);
              }}
              fullWidth
            >
              Apply
            </Button>
          </Stack>
        </Popover>
      </Box>
    </SettingRow>
  );
});
