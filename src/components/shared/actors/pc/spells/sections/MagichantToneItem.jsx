import { useState, useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  magichantToneItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/magichantTone";
import { availableMagichantTones } from "/src/libs/player/spellOptionData";
import { useTranslate } from "/src/translation/translate";

function toFormState(src, t) {
  const resolvedKey = src.key || src.name || "magichant_custom_name";
  const custom =
    resolvedKey === "magichant_custom_name" ||
    !availableMagichantTones.find((e) => e.name === resolvedKey);
  return {
    key: resolvedKey,
    customName: src.customName || "",
    effect: custom ? (src.effect || "") : (src.effect ? t(src.effect) : ""),
    passives: src.passives ?? [],
    behaviors: src.behaviors ?? [],
  };
}

export default function MagichantToneItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  onCloneItem,
}) {
  const { t: translate } = useTranslate();

  const [formState, setFormState] = useState(() => toFormState(item, translate));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFormState(toFormState(item, translate)); }, [item]);

  const handleChange = (next) => {
    const nextKey = next.key;
    if (nextKey !== formState.key && nextKey !== "magichant_custom_name") {
      const preset = availableMagichantTones.find((e) => e.name === nextKey);
      if (preset) {
        const resolved = {
          ...next,
          key: nextKey,
          customName: "",
          effect: translate(preset.effect || ""),
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, { ...resolved, effect: preset.effect || "" });
        return;
      }
    }
    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const isCustom =
    formState.key === "magichant_custom_name" ||
    !availableMagichantTones.find((e) => e.name === formState.key);

  const itemDisplayName =
    formState.customName ||
    (isCustom ? translate("magichant_custom_name") : translate(formState.key));

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "magichant_custom_name",
      customName: formState.customName || translate(formState.key),
      effect: formState.effect,
    });
  };

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <ItemRowCard
        label={itemDisplayName}
        variant="outlined"
        onClick={() => setExpanded((v) => !v)}
        actions={
          <>
            <Tooltip title={translate("Clone to Custom")}>
              <IconButton onClick={(e) => { e.stopPropagation(); handleCloneToCustom(); }}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("Delete")}>
              <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(e); }}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
        paperSx={{ mb: 0.5 }}
      >
        {expanded && (
          <Box sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
            <TabbedSchemaFormRenderer
              tabs={DEFAULT_SUBITEM_TABS}
              config={magichantToneItemFields}
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
        title={translate("Delete")}
        message={translate("Are you sure you want to delete this item?")}
        itemPreview={<Box sx={{ fontWeight: "bold" }}>{itemDisplayName}</Box>}
      />
    </>
  );
}
