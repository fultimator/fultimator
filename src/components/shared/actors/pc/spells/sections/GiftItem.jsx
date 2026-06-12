import { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { availableGifts } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  giftItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/gift";
import { useTranslate } from "/src/translation/translate";

function toFormState(src, t) {
  const resolvedKey = src.key || src.name || "esper_gift_custom_name";
  const custom = resolvedKey === "esper_gift_custom_name";
  return {
    key: resolvedKey,
    customName: src.customName || "",
    event: custom ? (src.event || "") : (src.event ? t(src.event) : ""),
    effect: custom ? (src.effect || "") : (src.effect ? t(src.effect) : ""),
    behaviors: src.behaviors ?? [],
  };
}

export default function GiftItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  onCloneItem,
}) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);

  const [formState, setFormState] = useState(() => toFormState(item, t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFormState(toFormState(item, t)); }, [item]);

  const {
    isOpen: deleteDialogOpen,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const handleChange = (next) => {
    const nextKey = next.key;
    if (nextKey !== formState.key && nextKey !== "esper_gift_custom_name") {
      const gift = availableGifts.find((g) => g.name === nextKey);
      if (gift) {
        const resolved = {
          ...next,
          key: nextKey,
          customName: "",
          event: t(gift.event || ""),
          effect: t(gift.effect || ""),
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, { ...resolved, event: gift.event || "", effect: gift.effect || "" });
        return;
      }
    }
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName =
    formState.customName || t(formState.key || "esper_gift_custom_name");

  const subtitle = formState.event ? (
    <NotesMarkdown compact>{formState.event}</NotesMarkdown>
  ) : undefined;

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "esper_gift_custom_name",
      customName: formState.customName || t(formState.key || ""),
      event: formState.event,
      effect: formState.effect,
    });
  };

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        subtitle={subtitle}
        onClick={() => setExpanded((v) => !v)}
        actions={
          <>
            <Tooltip title={t("Clone to Custom")}>
              <IconButton onClick={(e) => { e.stopPropagation(); handleCloneToCustom(); }}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Delete")}>
              <IconButton onClick={(e) => { e.stopPropagation(); openDeleteDialog(); }}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
      >
        {expanded && (
          <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
            <TabbedSchemaFormRenderer
              tabs={DEFAULT_SUBITEM_TABS}
              config={giftItemFields}
              state={formState}
              onChange={handleChange}
              surface="edit"
              cols={2}
            />
          </Box>
        )}
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
