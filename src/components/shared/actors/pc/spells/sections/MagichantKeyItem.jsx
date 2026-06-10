import { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { availableMagichantKeys } from "/src/libs/player/spellOptionData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  magichantKeyItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/magichantKey";
import { useTranslate } from "/src/translation/translate";

function toFormState(src) {
  const resolvedKey = src.key || src.name || "magichant_custom_name";
  return {
    key: resolvedKey,
    customName: src.customName || "",
    type: src.type || "",
    status: src.status || "",
    attribute: src.attribute || "",
    recovery: src.recovery || "",
    passives: src.passives ?? [],
    behaviors: src.behaviors ?? [],
  };
}

export default function MagichantKeyItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  onCloneItem,
}) {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);

  const [formState, setFormState] = useState(() => toFormState(item));
  useEffect(() => { setFormState(toFormState(item)); }, [item]);

  const {
    isOpen: deleteDialogOpen,
    openDialog: openDeleteDialog,
    closeDialog: closeDeleteDialog,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const handleChange = (next) => {
    const nextKey = next.key;
    if (nextKey !== formState.key && nextKey !== "magichant_custom_name") {
      const keyData = availableMagichantKeys.find((k) => k.name === nextKey);
      if (keyData) {
        const resolved = {
          ...next,
          key: nextKey,
          customName: "",
          type: keyData.type || "",
          status: keyData.status || "",
          attribute: keyData.attribute || "",
          recovery: keyData.recovery || "",
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, resolved);
        return;
      }
    }
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const itemDisplayName =
    formState.customName || t(formState.key || "magichant_custom_name");

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "magichant_custom_name",
      customName: formState.customName || t(formState.key || ""),
      type: formState.type,
      status: formState.status,
      attribute: formState.attribute,
      recovery: formState.recovery,
    });
  };

  const metaSummary = [formState.type, formState.status, formState.attribute, formState.recovery]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        subtitle={metaSummary || undefined}
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
              config={magichantKeyItemFields}
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
