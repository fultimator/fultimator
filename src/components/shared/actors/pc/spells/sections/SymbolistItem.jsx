import { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { availableSymbols } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  symbolItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/symbol";
import { useTranslate } from "/src/translation/translate";

function toFormState(src, t) {
  const resolvedKey = src.key || src.name || "symbol_custom_name";
  const custom = resolvedKey === "symbol_custom_name";
  return {
    key: resolvedKey,
    customName: src.customName || "",
    effect: custom ? (src.effect || "") : (src.effect ? t(src.effect) : ""),
    behaviors: src.behaviors ?? [],
  };
}

export default function SymbolistItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  onCloneItem,
  paperSx,
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
    if (nextKey !== formState.key && nextKey !== "symbol_custom_name") {
      const symbol = availableSymbols.find((s) => s.name === nextKey);
      if (symbol) {
        const resolved = {
          ...next,
          key: nextKey,
          customName: "",
          effect: t(symbol.effect || ""),
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, { ...resolved, effect: symbol.effect || "" });
        return;
      }
    }
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName =
    formState.customName || t(formState.key || "symbol_custom_name");

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "symbol_custom_name",
      customName: formState.customName || t(formState.key || ""),
      effect: formState.effect,
    });
  };

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        onClick={() => setExpanded((v) => !v)}
        paperSx={paperSx}
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
              config={symbolItemFields}
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
