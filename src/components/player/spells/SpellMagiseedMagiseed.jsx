import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { Delete, ExpandMore } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import ReactMarkdown from "react-markdown";
import { availableMagiseeds } from "../../../libs/floralistMagiseedData";

export default function SpellMagiseedMagiseed({
  magiseed,
  magiseedIndex,
  onMagiseedChange,
  onDeleteMagiseed,
}) {
  const { t } = useTranslate();

  const handleFieldChange = (field, value) => {
    if (onMagiseedChange) {
      onMagiseedChange(magiseedIndex, field, value);
    }
  };

  const handleEffectChange = (section, value) => {
    const newEffects = { ...magiseed.effects };
    newEffects[section] = value;
    handleFieldChange("effects", newEffects);
  };

  const getPresetMagiseed = (magiseedName) => {
    return availableMagiseeds.find(m => m.name === magiseedName);
  };

  const isCustomMagiseed = magiseed.name === "magiseed_custom";

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ ...props }) => <p style={inlineStyles} {...props} />,
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* Header with name and delete button */}
          <Grid item xs={10}>
            <Typography variant="h6" gutterBottom>
              {magiseed.customName || t(magiseed.name)}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ textAlign: "right" }}>
            <Button
              onClick={() => onDeleteMagiseed && onDeleteMagiseed(magiseedIndex)}
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Delete />}
            >
              {t("Delete")}
            </Button>
          </Grid>

          {/* Magiseed Type Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t("magiseed_type")}</InputLabel>
              <Select
                value={magiseed.name || "magiseed_custom"}
                onChange={(e) => {
                  const selectedPreset = getPresetMagiseed(e.target.value);
                  if (selectedPreset) {
                    // Reset to preset values
                    handleFieldChange("name", selectedPreset.name);
                    handleFieldChange("effects", selectedPreset.effects);
                    if (e.target.value !== "magiseed_custom") {
                      handleFieldChange("customName", "");
                      handleFieldChange("description", "");
                    }
                  }
                }}
              >
                {availableMagiseeds.map((preset) => (
                  <MenuItem key={preset.name} value={preset.name}>
                    {t(preset.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Name (only for custom magiseeds) */}
          {isCustomMagiseed && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("magiseed_custom")}
                value={magiseed.customName || ""}
                onChange={(e) => handleFieldChange("customName", e.target.value)}
              />
            </Grid>
          )}


          {/* Custom Description (only for custom magiseeds) */}
          {isCustomMagiseed && (
            <Grid item xs={12}>
              <CustomTextarea
                label={t("Description")}
                value={magiseed.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
              />
            </Grid>
          )}

          {/* Effect Range (only for custom magiseeds) */}
          {isCustomMagiseed && (
            <>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label={t("magiseed_effect_range_start")}
                  type="number"
                  value={magiseed.rangeStart ?? 0}
                  onChange={(e) => handleFieldChange("rangeStart", parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0, max: 4 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label={t("magiseed_effect_range_end")}
                  type="number"
                  value={magiseed.rangeEnd ?? 3}
                  onChange={(e) => handleFieldChange("rangeEnd", parseInt(e.target.value) || 3)}
                  inputProps={{ min: 0, max: 4 }}
                />
              </Grid>
            </>
          )}


          {/* Effects by Growth Clock Section */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  {t("magiseed_effects_by_growth_section")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {(() => {
                    const rangeStart = magiseed.rangeStart ?? 0;
                    const rangeEnd = magiseed.rangeEnd ?? 3;
                    const sections = [];
                    for (let i = rangeStart; i <= rangeEnd; i++) {
                      sections.push(i);
                    }
                    return sections;
                  })().map((section) => (
                    <Grid item xs={12} key={section}>
                      <Typography variant="subtitle1" gutterBottom>
                        {t("magiseed_section_effect", { section })} (T = {section})
                      </Typography>
                      {isCustomMagiseed ? (
                        <CustomTextarea
                          label={`${t("Effect")} ${section}`}
                          value={magiseed.effects?.[section] || ""}
                          onChange={(e) => handleEffectChange(section, e.target.value)}
                          rows={2}
                        />
                      ) : (
                        <div
                          style={{
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            backgroundColor: "#f9f9f9",
                            minHeight: "40px"
                          }}
                        >
                          <ReactMarkdown components={components}>
                            {t(magiseed.effects?.[section] || "") || t("magiseed_no_effect")}
                          </ReactMarkdown>
                        </div>
                      )}
                      {section < 3 && <Divider sx={{ mt: 2 }} />}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Base Description (non-editable for presets) */}
          {!isCustomMagiseed && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {t("Description")}
              </Typography>
              <div
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd", 
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <ReactMarkdown components={components}>
                  {t(magiseed.description || magiseed.name + "_desc")}
                </ReactMarkdown>
              </div>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}