import { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { availableTherioforms } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  therioformItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/therioform";
import { useTranslate } from "/src/translation/translate";

function toFormState(src, t) {
  const custom = src.name === "mutant_therioform_custom_name";
  return {
    name: src.name || "mutant_therioform_custom_name",
    customName: src.customName || "",
    genoclepsis: custom ? (src.genoclepsis || "") : (src.genoclepsis ? t(src.genoclepsis) : ""),
    description: custom ? (src.description || "") : (src.description ? t(src.description) : ""),
    passives: src.passives ?? [],
    behaviors: src.behaviors ?? [],
  };
}

export default function MutantItem({
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
    const nextName = next.name;
    if (nextName !== formState.name && nextName !== "mutant_therioform_custom_name") {
      const therioform = availableTherioforms.find((tf) => tf.name === nextName);
      if (therioform) {
        const resolved = {
          ...next,
          name: nextName,
          customName: "",
          genoclepsis: t(therioform.genoclepsis || ""),
          description: t(therioform.description || ""),
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, { ...resolved, genoclepsis: therioform.genoclepsis || "", description: therioform.description || "" });
        return;
      }
    }
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName =
    formState.customName || t(formState.name || "mutant_therioform_custom_name");

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      name: "mutant_therioform_custom_name",
      customName: formState.customName || t(formState.name || ""),
      genoclepsis: formState.genoclepsis,
      description: formState.description,
    });
  };

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
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
              config={therioformItemFields}
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
