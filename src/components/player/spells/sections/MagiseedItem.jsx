import { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Delete, ExpandMore, ContentCopy } from "@mui/icons-material";
import CustomTextarea from "../../../common/CustomTextarea";
import { magiseeds } from "../../../../libs/floralistMagiseedData";

export default function MagiseedItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedEffects, setExpandedEffects] = useState(false);

  const handleNameChange = (value) => {
    const preset = magiseeds.find((m) => m.name === value);
    if (preset) {
      onItemChange(itemIndex, "name", value);
      // Update other fields from preset if not custom
      if (value !== "magiseed_custom") {
        onItemChange(itemIndex, "description", preset.description);
        onItemChange(itemIndex, "rangeStart", preset.rangeStart || 0);
        onItemChange(itemIndex, "rangeEnd", preset.rangeEnd || 3);
        onItemChange(itemIndex, "effects", preset.effects || {});
        onItemChange(itemIndex, "customName", "");
      }
    }
  };

  const isCustom = item.name === "magiseed_custom";
  const magiseedName = isCustom ? item.customName || t("Custom Magiseed") : t(item.name);

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;

    const clone = {
      ...item,
      name: "magiseed_custom",
      customName: item.customName || (item.name ? t(item.name) : ""),
      description: typeof item.description === "string" ? t(item.description) : item.description,
      effects: Object.fromEntries(
        Object.entries(item.effects || {}).map(([key, value]) => [
          key,
          typeof value === "string" ? t(value) : value,
        ])
      ),
    };

    onCloneItem(itemIndex, clone);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteItem(itemIndex);
  };

  const handleCloneClick = (e) => {
    e.stopPropagation();
    handleCloneToCustom();
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", pr: 1 }}>
          <Typography sx={{ flex: 1, fontWeight: "bold" }}>
            {magiseedName}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {item.rangeStart !== undefined && item.rangeEnd !== undefined && (
              <Typography variant="caption" color="text.secondary">
                T:{item.rangeStart}-{item.rangeEnd}
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteClick}
          >
            {t("Delete")}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={handleCloneClick}
          >
            {t("Clone to Custom")}
          </Button>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Card sx={{ mb: 0 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Magiseed Name Selector */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t("Magiseed")}</InputLabel>
              <Select
                value={item.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                label={t("Magiseed")}
              >
                {magiseeds.map((preset) => (
                  <MenuItem key={preset.name} value={preset.name}>
                    {preset.name === "magiseed_custom"
                      ? t("Custom Magiseed")
                      : t(preset.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Custom Name (for custom magiseeds) */}
          {isCustom && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("Custom Name")}
                value={item.customName || ""}
                onChange={(e) =>
                  onItemChange(itemIndex, "customName", e.target.value)
                }
                placeholder={t("Enter custom magiseed name")}
              />
            </Grid>
          )}

          {/* Range Start and End */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label={t("Range Start")}
              type="number"
              value={item.rangeStart ?? 0}
              onChange={(e) =>
                onItemChange(itemIndex, "rangeStart", parseInt(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 4 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label={t("Range End")}
              type="number"
              value={item.rangeEnd ?? 3}
              onChange={(e) =>
                onItemChange(itemIndex, "rangeEnd", parseInt(e.target.value) || 3)
              }
              inputProps={{ min: 0, max: 4 }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              {t("Description")}
            </Typography>
            <CustomTextarea
              label={t("Magiseed Description")}
              value={item.description || ""}
              onChange={(e) =>
                onItemChange(itemIndex, "description", e.target.value)
              }
              placeholder={t("Describe this magiseed")}
              rows={2}
            />
          </Grid>

          {/* Effects (T=0, T=1, T=2, T=3) */}
          <Grid item xs={12}>
            <Accordion
              expanded={expandedEffects}
              onChange={() => setExpandedEffects(!expandedEffects)}
              defaultExpanded
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {t("Effects by Growth Clock")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                  {[0, 1, 2, 3].map((t_value) => (
                    <Grid item xs={12} key={t_value}>
                      <CustomTextarea
                        label={t(`T = ${t_value}`)}
                        value={item.effects?.[t_value] || ""}
                        onChange={(e) => {
                          const newEffects = { ...item.effects, [t_value]: e.target.value };
                          onItemChange(itemIndex, "effects", newEffects);
                        }}
                        placeholder={t(`Effect at T = ${t_value}`)}
                        rows={2}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </CardContent>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
}
