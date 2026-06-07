import { useState } from "react";
import {
  Grid,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Delete,
  ContentCopy,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import CustomTextarea from "/src/components/common/CustomTextarea";
import { availableGifts } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import NotesMarkdown from "/src/components/common/NotesMarkdown";

export default function GiftItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const [expanded, setExpanded] = useState(false);
  const {
    isOpen: deleteDialogOpen,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const isCustom = item.key === "esper_gift_custom_name";

  const handleNameChange = (value) => {
    const gift = availableGifts.find((g) => g.name === value);
    if (!gift) return;
    onItemChange(itemIndex, "key", value);
    if (value !== "esper_gift_custom_name") {
      onItemChange(itemIndex, "event", gift.event);
      onItemChange(itemIndex, "effect", gift.effect);
      onItemChange(itemIndex, "customName", "");
    }
  };

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "esper_gift_custom_name",
      customName: item.customName || (item.key ? t(item.key) : ""),
      event: typeof item.event === "string" ? t(item.event) : item.event,
      effect: typeof item.effect === "string" ? t(item.effect) : item.effect,
    });
  };

  const itemDisplayName =
    item.customName || t(item.key || "esper_gift_custom_name");

  const eventText = isCustom
    ? item.event || ""
    : item.event?.startsWith("esper_event_")
      ? t(item.event)
      : item.event || "";

  const subtitle = eventText ? (
    <NotesMarkdown compact>{eventText}</NotesMarkdown>
  ) : undefined;

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        subtitle={subtitle}
        onClick={() => setExpanded((prev) => !prev)}
        actions={
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleCloneToCustom();
              }}
            >
              <ContentCopy />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog();
              }}
            >
              <Delete />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </>
        }
      >
        <Collapse in={expanded}>
          <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
            <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("Gift Type")}</InputLabel>
                  <Select
                    value={item.key || ""}
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

              <Grid size={{ xs: 12, sm: 4 }}>
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
                    onItemChange(itemIndex, "event", e.target.value)
                  }
                  disabled={!isCustom}
                />
              </Grid>

              {isCustom && (
                <Grid size={{ xs: 12, sm: 4 }}>
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

              <Grid size={12}>
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
                    onItemChange(itemIndex, "effect", e.target.value)
                  }
                  disabled={!isCustom}
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </ItemRowCard>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => onDeleteItem(itemIndex)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this item?")}
        itemPreview={<Typography variant="h4">{itemDisplayName}</Typography>}
      />
    </>
  );
}
