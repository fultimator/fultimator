import { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  invocationItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/invocation";
import { useTranslate } from "/src/translation/translate";

function toFormState(src) {
  return {
    key: src.key || "",
    wellspring: src.wellspring || "",
    type: src.type || "Blast",
    customName: src.customName || "",
    effect: src.effect || "",
    behaviors: src.behaviors ?? [],
  };
}

export default function InvocationItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  paperSx,
}) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);
  const [formState, setFormState] = useState(() => toFormState(item));

  useEffect(() => {
    setFormState(toFormState(item));
  }, [item]);

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const handleChange = (next) => {
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName = formState.customName || formState.key || t("spell.invocation.custom");

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        subtitle={formState.wellspring ? `${formState.wellspring} · ${formState.type}` : formState.type}
        onClick={() => setExpanded((v) => !v)}
        actions={
          <>
            <Tooltip title={t("Delete")}>
              <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(e); }}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
        paperSx={{ mb: 0.5, ...paperSx }}
      >
        {expanded && (
          <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
            <TabbedSchemaFormRenderer
              tabs={DEFAULT_SUBITEM_TABS}
              config={invocationItemFields}
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
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDeleteItem(itemIndex)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this item?")}
        itemPreview={<Typography variant="h4">{itemDisplayName}</Typography>}
      />
    </>
  );
}
