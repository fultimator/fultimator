import { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Delete, ContentCopy, ExpandMore } from "@mui/icons-material";
import CustomTextarea from "../../../common/CustomTextarea";
import { availableGifts } from "../spellOptionData";

export default function GiftItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const handleNameChange = (value) => {
    const gift = availableGifts.find((g) => g.name === value);
    if (gift) {
      onItemChange(itemIndex, "name", value);
      if (value !== "esper_gift_custom_name") {
        onItemChange(itemIndex, "event", gift.event);
        onItemChange(itemIndex, "effect", gift.effect);
        onItemChange(itemIndex, "customName", "");
      }
    }
  };

  const isCustom = item.name === "esper_gift_custom_name";
  const [expanded, setExpanded] = useState(false);

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;

    const clone = {
      ...item,
      name: "esper_gift_custom_name",
      customName: item.customName || (item.name ? t(item.name) : ""),
      event: typeof item.event === "string" ? t(item.event) : item.event,
      effect: typeof item.effect === "string" ? t(item.effect) : item.effect,
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
    <Accordion expanded={expanded} onChange={() => setExpanded((prev) => !prev)} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ flex: 1, fontWeight: "bold" }}>
            {item.customName || t(item.name || "esper_gift_custom_name")}
          </Typography>
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
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>{t("Gift Type")}</InputLabel>
              <Select
                value={item.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                label={t("Gift Type")}
              >
                {availableGifts
                  .filter((gift) => gift.name !== "esper_gift_custom_name")
                  .map((gift) => (
                  <MenuItem key={gift.name} value={gift.name}>
                    {t(gift.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t("Event")}
              value={
                isCustom
                  ? item.event || ""
                  : item.event?.startsWith("esper_event_")
                  ? t(item.event)
                  : item.event || ""
              }
              onChange={(e) =>
                isCustom && onItemChange(itemIndex, "event", e.target.value)
              }
              readOnly={!isCustom}
            />
          </Grid>

          {isCustom && (
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t("Custom Name")}
                value={item.customName || ""}
                onChange={(e) =>
                  onItemChange(itemIndex, "customName", e.target.value)
                }
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <CustomTextarea
              label={t("Gift Effect")}
              value={
                isCustom
                  ? item.effect || ""
                  : item.effect
                  ? t(item.effect)
                  : ""
              }
              onChange={(e) =>
                isCustom && onItemChange(itemIndex, "effect", e.target.value)
              }
              readOnly={!isCustom}
              rows={2}
            />
          </Grid>

        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
