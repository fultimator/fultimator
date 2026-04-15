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
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import { Delete, ExpandMore, ContentCopy } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import ReactMarkdown from "react-markdown";
import { magiseeds, magiseedTypes } from "../../../libs/floralistMagiseedData";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

export default function MagiseedItem({
  magiseed,
  magiseedIndex,
  onMagiseedChange,
  onDeleteMagiseed,
  onCloneMagiseed,
}) {
  const { t } = useTranslate();
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });

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
    return magiseeds.find((m) => m.name === magiseedName);
  };

  const isCustomMagiseed = magiseed.name === "floralist_custom_magiseed";

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ ...props }) => <p style={inlineStyles} {...props} />,
  };

  const handleCloneToCustom = () => {
    if (!onCloneMagiseed) return;

    const clone = {
      ...magiseed,
      name: "floralist_custom_magiseed",
      customName:
        magiseed.customName || (magiseed.name ? t(magiseed.name) : ""),
      description:
        typeof magiseed.description === "string"
          ? t(magiseed.description)
          : magiseed.description,
      effects: Object.fromEntries(
        Object.entries(magiseed.effects || {}).map(([key, value]) => [
          key,
          typeof value === "string" ? t(value) : value,
        ]),
      ),
    };

    onCloneMagiseed(magiseedIndex, clone);
  };

  const magiseedDisplayName = magiseed.customName || t(magiseed.name);

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Header with name and delete button */}
            <Grid
              size={{
                xs: 12,
                sm: 8,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {magiseedDisplayName}
              </Typography>
            </Grid>
            <Grid
              style={{ textAlign: "right" }}
              size={{
                xs: 12,
                sm: 4,
              }}
            >
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <Button
                  onClick={handleDelete}
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                >
                  {t("Delete")}
                </Button>
                <Button
                  onClick={handleCloneToCustom}
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopy />}
                >
                  {t("Clone to Custom")}
                </Button>
              </div>
            </Grid>

            {/* Magiseed Type Selection */}
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>{t("Magiseed Type")}</InputLabel>
                <Select
                  value={magiseed.name || "floralist_custom_magiseed"}
                  onChange={(e) => {
                    const selectedPreset = getPresetMagiseed(e.target.value);
                    if (selectedPreset) {
                      // Reset to preset values
                      handleFieldChange("name", selectedPreset.name);
                      handleFieldChange("type", selectedPreset.type);
                      handleFieldChange("effects", selectedPreset.effects);
                      handleFieldChange(
                        "endOfTurnEffect",
                        selectedPreset.endOfTurnEffect,
                      );
                      handleFieldChange("passive", selectedPreset.passive);
                      if (e.target.value !== "floralist_custom_magiseed") {
                        handleFieldChange("customName", "");
                        handleFieldChange("description", "");
                      }
                    }
                  }}
                >
                  {magiseeds.map((preset) => (
                    <MenuItem key={preset.name} value={preset.name}>
                      {t(preset.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Name (only for custom magiseeds) */}
            {isCustomMagiseed && (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label={t("Custom Name")}
                  value={magiseed.customName || ""}
                  onChange={(e) =>
                    handleFieldChange("customName", e.target.value)
                  }
                />
              </Grid>
            )}

            {/* Type Selection (for custom magiseeds) */}
            {isCustomMagiseed && (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>{t("Type")}</InputLabel>
                  <Select
                    value={magiseed.type || "custom"}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                  >
                    {magiseedTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {t(type.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Custom Description (only for custom magiseeds) */}
            {isCustomMagiseed && (
              <Grid size={12}>
                <CustomTextarea
                  label={t("Description")}
                  value={magiseed.description || ""}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </Grid>
            )}

            {/* Effect Type Controls */}
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={magiseed.endOfTurnEffect || false}
                    onChange={(e) =>
                      handleFieldChange("endOfTurnEffect", e.target.checked)
                    }
                    disabled={!isCustomMagiseed}
                  />
                }
                label={t("floralist_end_of_turn_effect")}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={magiseed.passive || false}
                    onChange={(e) =>
                      handleFieldChange("passive", e.target.checked)
                    }
                    disabled={!isCustomMagiseed}
                  />
                }
                label={t("floralist_passive_effect")}
              />
            </Grid>

            {/* Effects by Growth Clock Section */}
            <Grid size={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    {t("floralist_effects_by_growth_section")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((section) => (
                      <Grid key={section} size={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          {t("floralist_section_effect", { section })} (T ={" "}
                          {section})
                        </Typography>
                        {isCustomMagiseed ? (
                          <CustomTextarea
                            label={`${t("Effect")} ${section}`}
                            value={magiseed.effects?.[section] || ""}
                            onChange={(e) =>
                              handleEffectChange(section, e.target.value)
                            }
                            rows={2}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              backgroundColor: "#f9f9f9",
                              minHeight: "40px",
                            }}
                          >
                            <ReactMarkdown components={components}>
                              {t(magiseed.effects?.[section] || "") ||
                                t("floralist_no_effect")}
                            </ReactMarkdown>
                          </div>
                        )}
                        {section < 4 && <Divider sx={{ mt: 2 }} />}
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Base Description (non-editable for presets) */}
            {!isCustomMagiseed && (
              <Grid size={12}>
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
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDeleteMagiseed && onDeleteMagiseed(magiseedIndex)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this magiseed?")}
        itemPreview={
          <Typography variant="h4">{magiseedDisplayName}</Typography>
        }
      />
    </>
  );
}
