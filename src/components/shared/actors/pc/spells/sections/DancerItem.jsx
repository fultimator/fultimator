import { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { availableDances } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  danceItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/dance";
import { useTranslate } from "/src/translation/translate";

function toFormState(src, t) {
  const resolvedKey = src.key || src.name || "dance_custom_name";
  const custom = resolvedKey === "dance_custom_name";
  return {
    key: resolvedKey,
    customName: src.customName || "",
    duration: custom ? (src.duration || "") : (src.duration ? t(src.duration) : ""),
    effect: custom ? (src.effect || "") : (src.effect ? t(src.effect) : ""),
    passives: src.passives ?? [],
    behaviors: src.behaviors ?? [],
  };
}

export default function DancerItem({
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
    if (nextKey !== formState.key && nextKey !== "dance_custom_name") {
      const dance = availableDances.find((d) => d.name === nextKey);
      if (dance) {
        const resolved = {
          ...next,
          key: nextKey,
          customName: "",
          duration: t(dance.duration || ""),
          effect: t(dance.effect || ""),
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, { ...resolved, duration: dance.duration || "", effect: dance.effect || "" });
        return;
      }
    }
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName =
    formState.customName || t(formState.key || "dance_custom_name");

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "dance_custom_name",
      customName: formState.customName || t(formState.key || ""),
      duration: formState.duration,
      effect: formState.effect,
    });
  };

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        subtitle={formState.duration || undefined}
        onClick={() => setExpanded((v) => !v)}
        actions={
          <>
            <IconButton onClick={(e) => { e.stopPropagation(); handleCloneToCustom(); }}>
              <ContentCopy />
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); openDeleteDialog(); }}>
              <Delete />
            </IconButton>
          </>
        }
      >
        {expanded && (
          <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
            <TabbedSchemaFormRenderer
              tabs={DEFAULT_SUBITEM_TABS}
              config={danceItemFields}
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
