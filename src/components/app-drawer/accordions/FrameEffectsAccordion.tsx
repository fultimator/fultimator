import React from "react";
import {
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

export const FrameEffectsAccordion = React.memo(function FrameEffectsAccordion({
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
        sx={getAccordionSummarySx("frameEffects")}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Frame Effects
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1.5}>
          <EnableToggle
            label="Enable"
            enabled={customization.frameEffectsEnabled}
            defaultEnabled={isAccordionActive("frameEffects")}
            onChange={(val) => setCustomization({ frameEffectsEnabled: val })}
            onReset={() => setCustomization({ frameEffectsEnabled: null })}
          />

          {(customization.frameEffectsEnabled === true ||
            (customization.frameEffectsEnabled === null &&
              isAccordionActive("frameEffects"))) && (
            <>
              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                Color
              </Typography>
              <BevelColorPicker
                value={customization.frameEffectColor}
                onChange={(val) => setCustomization({ frameEffectColor: val })}
                onReset={() => setCustomization({ frameEffectColor: null })}
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
                customValue={customization.frameEffectIntensity}
                tempValue={tempSliderValues.frameEffectIntensity}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 100, label: "100%" },
                ]}
                onSliderChange={createSliderHandler("frameEffectIntensity")}
                onReset={() => setCustomization({ frameEffectIntensity: null })}
                formatValue={(v) => `${v}%`}
              />
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
});
