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
import { SliderControl, EnableToggle } from "../controls";
import type { AccordionProps } from "./types";

export const GradientsAccordion = React.memo(function GradientsAccordion({
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
        sx={getAccordionSummarySx("gradients")}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Gradients
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1.5}>
          <EnableToggle
            label="Enable"
            enabled={customization.gradientsEnabled}
            defaultEnabled={isAccordionActive("gradients")}
            isDisabled={!isAccordionActive("gradients")}
            onChange={(val) => setCustomization({ gradientsEnabled: val })}
            onReset={() => setCustomization({ gradientsEnabled: null })}
          />

          {!isAccordionActive("gradients") && (
            <Typography variant="caption" color="text.secondary">
              Gradients are disabled for this style.
            </Typography>
          )}

          {isAccordionActive("gradients") &&
            (customization.gradientsEnabled === true ||
              customization.gradientsEnabled === null) && (
              <>
                <SliderControl
                  label={
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Direction: 0-360 degrees
                    </Typography>
                  }
                  value={180}
                  customValue={customization.gradientDirection}
                  tempValue={tempSliderValues.gradientDirection}
                  min={0}
                  max={360}
                  step={15}
                  marks={[
                    { value: 0, label: "0°" },
                    { value: 180, label: "180°" },
                    { value: 360, label: "360°" },
                  ]}
                  onSliderChange={createSliderHandler("gradientDirection")}
                  onReset={() => setCustomization({ gradientDirection: null })}
                  formatValue={(v) => `${v}°`}
                />

                <SliderControl
                  label={
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Opacity: 0-100%
                    </Typography>
                  }
                  value={100}
                  customValue={customization.gradientOpacity}
                  tempValue={tempSliderValues.gradientOpacity}
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: "0%" },
                    { value: 100, label: "100%" },
                  ]}
                  onSliderChange={createSliderHandler("gradientOpacity")}
                  onReset={() => setCustomization({ gradientOpacity: null })}
                  formatValue={(v) => `${v}%`}
                />

                <SliderControl
                  label={
                    <Typography
                      variant="caption"
                      sx={getProfileHighlightSx(["Dystopian"])}
                    >
                      Layers: 1-2
                    </Typography>
                  }
                  value={2}
                  customValue={customization.gradientLayers}
                  tempValue={tempSliderValues.gradientLayers}
                  min={1}
                  max={2}
                  step={1}
                  marks
                  onSliderChange={createSliderHandler("gradientLayers")}
                  onReset={() => setCustomization({ gradientLayers: null })}
                />
              </>
            )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
});
