import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useThemeStore } from "../../../store/themeStore";
import { BevelColorPicker } from "../pickers/ColorPicker";
import { SliderControl, EnableToggle } from "../controls";
import type { AccordionProps } from "./types";

export const TextEffectsAccordion = React.memo(function TextEffectsAccordion({
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
        sx={getAccordionSummarySx("textEffects")}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Text Effects
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1.5}>
          <EnableToggle
            label="Enable"
            enabled={customization.textEffectsEnabled}
            defaultEnabled={isAccordionActive("textEffects")}
            onChange={(val) => setCustomization({ textEffectsEnabled: val })}
            onReset={() => setCustomization({ textEffectsEnabled: null })}
          />

          {(customization.textEffectsEnabled === true ||
            (customization.textEffectsEnabled === null &&
              isAccordionActive("textEffects"))) && (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={customization.textEffectType ?? "shadow"}
                  label="Type"
                  onChange={(e) =>
                    setCustomization({
                      textEffectType: e.target.value as
                        | "shadow"
                        | "glow"
                        | "outline",
                    })
                  }
                >
                  <MenuItem value="shadow">Shadow</MenuItem>
                  <MenuItem value="glow">Glow</MenuItem>
                  <MenuItem value="outline">Outline</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                Color
              </Typography>
              <BevelColorPicker
                value={customization.textEffectColor}
                onChange={(val) => setCustomization({ textEffectColor: val })}
                onReset={() => setCustomization({ textEffectColor: null })}
              />

              <SliderControl
                label={
                  <Typography
                    variant="caption"
                    sx={getProfileHighlightSx(["Dystopian"])}
                  >
                    Intensity: 0-100%
                  </Typography>
                }
                value={100}
                customValue={customization.textEffectIntensity}
                tempValue={tempSliderValues.textEffectIntensity}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 100, label: "100%" },
                ]}
                onSliderChange={createSliderHandler("textEffectIntensity")}
                onReset={() => setCustomization({ textEffectIntensity: null })}
                formatValue={(v) => `${v}%`}
              />
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
});
