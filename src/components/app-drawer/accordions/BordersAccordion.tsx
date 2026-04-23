import React from "react";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useThemeStore } from "../../../store/themeStore";
import { BevelColorPicker } from "../pickers/ColorPicker";
import { SliderControl, EnableToggle } from "../controls";
import type { AccordionProps } from "./types";

export const BordersAccordion = React.memo(function BordersAccordion({
  getProfileHighlightSx,
  getAccordionSummarySx,
  isAccordionActive,
  tempSliderValues,
  createSliderHandler,
}: AccordionProps) {
  const { customization, setCustomization } = useThemeStore();

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={getAccordionSummarySx("borders")}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Borders
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1.5}>
          <EnableToggle
            label="Enable"
            enabled={customization.bevelBordersEnabled}
            defaultEnabled={isAccordionActive("borders")}
            onChange={(val) => setCustomization({ bevelBordersEnabled: val })}
            onReset={() => setCustomization({ bevelBordersEnabled: null })}
          />

          {(customization.bevelBordersEnabled === true ||
            (customization.bevelBordersEnabled === null &&
              isAccordionActive("borders"))) && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Style</InputLabel>
                <Select
                  value={customization.bevelBorderStyle ?? "solid"}
                  label="Style"
                  onChange={(e) =>
                    setCustomization({
                      bevelBorderStyle: e.target.value as
                        | "solid"
                        | "dashed"
                        | "dotted"
                        | "double",
                    })
                  }
                >
                  <MenuItem value="solid">Solid</MenuItem>
                  <MenuItem value="dashed">Dashed</MenuItem>
                  <MenuItem value="dotted">Dotted</MenuItem>
                  <MenuItem value="double">Double</MenuItem>
                </Select>
              </FormControl>

              <SliderControl
                label={
                  <Typography
                    variant="caption"
                    sx={getProfileHighlightSx(["Dystopian", "Regalia"])}
                  >
                    Width: 1-4px
                  </Typography>
                }
                value={2}
                customValue={customization.bevelBorderWidth}
                tempValue={tempSliderValues.bevelBorderWidth}
                min={1}
                max={4}
                step={1}
                marks
                onSliderChange={createSliderHandler("bevelBorderWidth")}
                onReset={() => setCustomization({ bevelBorderWidth: null })}
              />

              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                Color
              </Typography>
              <BevelColorPicker
                value={customization.bevelBorderColor}
                onChange={(val) => setCustomization({ bevelBorderColor: val })}
                onReset={() => setCustomization({ bevelBorderColor: null })}
              />
            </>
          )}

          <Divider sx={{ my: 1 }} />

          <SliderControl
            label={
              <Typography
                variant="caption"
                sx={getProfileHighlightSx(["Dystopian", "Regalia"])}
              >
                Panel Radius: 0-24px
              </Typography>
            }
            value={6}
            customValue={customization.panelRadius}
            tempValue={tempSliderValues.panelRadius}
            min={0}
            max={24}
            step={1}
            marks
            onSliderChange={createSliderHandler("panelRadius")}
            onReset={() => setCustomization({ panelRadius: null })}
          />

          <SliderControl
            label={
              <Typography
                variant="caption"
                sx={getProfileHighlightSx(["Dystopian", "Regalia"])}
              >
                Control Radius: 0-50px
              </Typography>
            }
            value={6}
            customValue={customization.controlRadius}
            tempValue={tempSliderValues.controlRadius}
            min={0}
            max={50}
            step={1}
            marks
            onSliderChange={createSliderHandler("controlRadius")}
            onReset={() => setCustomization({ controlRadius: null })}
          />

          <Divider sx={{ my: 1 }} />

          <EnableToggle
            label="Button Uppercase"
            enabled={customization.buttonUppercase}
            onChange={(val) => setCustomization({ buttonUppercase: val })}
            onReset={() => setCustomization({ buttonUppercase: null })}
          />

          <SliderControl
            label={
              <Typography
                variant="caption"
                sx={getProfileHighlightSx(["Dystopian", "Regalia"])}
              >
                Button Letter Spacing: 0-10 (x 0.01em)
              </Typography>
            }
            value={3}
            customValue={customization.buttonLetterSpacing}
            tempValue={tempSliderValues.buttonLetterSpacing}
            min={0}
            max={10}
            step={1}
            marks={[
              { value: 0, label: "0" },
              { value: 3, label: "3" },
              { value: 10, label: "10" },
            ]}
            onSliderChange={createSliderHandler("buttonLetterSpacing")}
            onReset={() => setCustomization({ buttonLetterSpacing: null })}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
});
