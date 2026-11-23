import React from "react";
import {
  Box,
  Slider,
  IconButton,
  Typography,
  SliderProps as MuiSliderProps,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";

interface SliderControlProps {
  label?: React.ReactNode;
  value: number;
  customValue: number | null;
  tempValue?: number;
  min: number;
  max: number;
  step?: number;
  marks?: MuiSliderProps["marks"];
  onSliderChange: Pick<MuiSliderProps, "onChange" | "onChangeCommitted">;
  onReset: () => void;
  formatValue?: (v: number) => string;
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  customValue,
  tempValue,
  min,
  max,
  step = 1,
  marks,
  onSliderChange,
  onReset,
  formatValue,
}) => (
  <>
    {label && (
      <Box sx={{ mb: 0.5 }}>
        {typeof label === "string" ? (
          <Typography variant="caption">{label}</Typography>
        ) : (
          label
        )}
      </Box>
    )}
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Slider
        value={tempValue ?? customValue ?? value}
        {...onSliderChange}
        min={min}
        max={max}
        step={step}
        marks={marks}
        valueLabelDisplay="auto"
        valueLabelFormat={formatValue}
        sx={{ flex: 1 }}
      />
      {customValue !== null && (
        <IconButton size="small" onClick={onReset} sx={{ p: 0.5 }}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  </>
);
