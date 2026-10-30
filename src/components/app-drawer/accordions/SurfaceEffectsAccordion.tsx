import React from "react";
import {
  Divider,
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

export const SurfaceEffectsAccordion = React.memo(
  function SurfaceEffectsAccordion({
    getProfileHighlightSx,
    getAccordionSummarySx,
    isAccordionActive: _isAccordionActive,
    tempSliderValues,
    createSliderHandler,
  }: AccordionProps) {
    const { customization, setCustomization } = useThemeStore();

    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={getAccordionSummarySx("surface")}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Surface & Effects
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, py: 1.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
              Surface Color
            </Typography>
            <BevelColorPicker
              value={customization.surfaceColor}
              onChange={(val) => setCustomization({ surfaceColor: val })}
              onReset={() => setCustomization({ surfaceColor: null })}
            />

            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, mt: 1 }}
            >
              Surface Depth
            </Typography>
            <BevelColorPicker
              value={customization.surfaceDepth}
              onChange={(val) => setCustomization({ surfaceDepth: val })}
              onReset={() => setCustomization({ surfaceDepth: null })}
            />

            <Divider sx={{ my: 1 }} />

            <SliderControl
              label={
                <Typography
                  variant="caption"
                  sx={getProfileHighlightSx(["Dystopian", "Regalia"])}
                >
                  Backdrop Opacity: 0-100%
                </Typography>
              }
              value={80}
              customValue={customization.backdropOpacity}
              tempValue={tempSliderValues.backdropOpacity}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: "0%" },
                { value: 100, label: "100%" },
              ]}
              onSliderChange={createSliderHandler("backdropOpacity")}
              onReset={() => setCustomization({ backdropOpacity: null })}
              formatValue={(v) => `${v}%`}
            />

            <SliderControl
              label={
                <Typography
                  variant="caption"
                  sx={getProfileHighlightSx(["Dystopian"])}
                >
                  Vignette Strength: 0-100%
                </Typography>
              }
              value={55}
              customValue={customization.vignetteStrength}
              tempValue={tempSliderValues.vignetteStrength}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: "0%" },
                { value: 100, label: "100%" },
              ]}
              onSliderChange={createSliderHandler("vignetteStrength")}
              onReset={() => setCustomization({ vignetteStrength: null })}
              formatValue={(v) => `${v}%`}
            />

            <Divider sx={{ my: 1 }} />

            <EnableToggle
              label="AppBar Gradient"
              enabled={customization.appBarGradient}
              onChange={(val) => setCustomization({ appBarGradient: val })}
              onReset={() => setCustomization({ appBarGradient: null })}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  },
);
