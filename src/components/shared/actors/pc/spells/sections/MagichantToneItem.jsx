import { useState, useEffect } from "react";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { SchemaFieldRenderer } from "/src/forms/rendering/SchemaFieldRenderer";
import { magichantToneItemFields } from "/src/forms/rendering/config/itemConfigs/spells/magichantToneItem";
import { availableMagichantTones } from "/src/libs/player/spellOptionData";
import { useTranslate } from "/src/translation/translate";

export default function MagichantToneItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  _t,
}) {
  const { t: translate } = useTranslate();

  const toFormState = (src) => ({
    key: src.key || "magichant_custom_name",
    customName: src.customName || "",
    effect: src.effect || "",
  });

  const [formState, setFormState] = useState(() => toFormState(item));

  useEffect(() => {
    setFormState(toFormState(item));
  }, [item]);

  const handleChange = (next) => {
    const prevKey = formState.key;
    const nextKey = next.key;

    if (nextKey !== prevKey) {
      const preset = availableMagichantTones.find((e) => e.name === nextKey);
      if (preset) {
        const resolved = {
          key: nextKey,
          customName: "",
          effect: preset.effect || "",
        };
        setFormState(resolved);
        onItemChange(itemIndex, "key", resolved.key);
        onItemChange(itemIndex, "customName", resolved.customName);
        onItemChange(itemIndex, "effect", resolved.effect);
        return;
      }
    }

    setFormState(next);
    onItemChange(itemIndex, "key", next.key);
    onItemChange(itemIndex, "customName", next.customName);
    onItemChange(itemIndex, "effect", next.effect);
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
      effect:
        typeof formState.effect === "string"
          ? translate(formState.effect)
          : formState.effect,
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
              <IconButton onClick={handleCloneToCustom}>
                <ContentCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title={translate("Delete")}>
              <IconButton onClick={handleDelete}>
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
        paperSx={{ mb: 0.5 }}
      >
        {expanded && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <SchemaFieldRenderer
                config={magichantToneItemFields}
                state={formState}
                onChange={handleChange}
                surface="edit"
                cols={2}
              />
            </Grid>
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
