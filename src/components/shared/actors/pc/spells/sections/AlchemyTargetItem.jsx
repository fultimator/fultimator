import { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ContentCopy, Delete } from "@mui/icons-material";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  alchemyTargetItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/alchemyTarget";
import { useTranslate } from "/src/translation/translate";

function toFormState(src) {
  return {
    rangeFrom: src.rangeFrom || 1,
    rangeTo: src.rangeTo || 20,
    effect: src.effect || "",
    passives: src.passives ?? [],
    behaviors: src.behaviors ?? [],
  };
}

export default function AlchemyTargetItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  onCloneItem,
}) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);
  const [formState, setFormState] = useState(() => toFormState(item));

  useEffect(() => {
    setFormState(toFormState(item));
  }, [item]);

  const {
    isOpen: deleteDialogOpen,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const handleChange = (next) => {
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName = `${formState.rangeFrom} - ${formState.rangeTo}`;
  const subtitle = formState.effect ? (
    <NotesMarkdown compact>{formState.effect}</NotesMarkdown>
  ) : undefined;

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        subtitle={subtitle}
        onClick={() => setExpanded((v) => !v)}
        actions={
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onCloneItem?.(itemIndex);
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
          </>
        }
      >
        {expanded && (
          <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
            <TabbedSchemaFormRenderer
              tabs={DEFAULT_SUBITEM_TABS}
              config={alchemyTargetItemFields}
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
