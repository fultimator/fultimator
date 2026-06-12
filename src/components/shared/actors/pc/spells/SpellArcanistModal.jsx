import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { Close } from "@mui/icons-material";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import { arcanistFields } from "/src/forms/rendering/config/itemConfigs/spells/arcanist";
import { playerSpellTabs } from "/src/forms/rendering/config/itemConfigs/spells";
import { metaFieldConfig } from "/src/forms/rendering/config/metaFieldConfig";
import {
  behaviorsTabField,
  makePassivesTabField,
} from "/src/forms/rendering/config/shared/behaviorFields";

const arcanaCoreFields = [
  {
    key: "name",
    kind: "editable",
    label: "Arcana Name",
    component: "text",
    defaultValue: "",
    group: "core",
    order: 4,
    gridSize: { xs: 12, sm: 6 },
    validationHints: { required: true },
  },
  {
    key: "description",
    kind: "editable",
    label: "Arcana Description",
    component: "textarea",
    defaultValue: "",
    group: "description",
    order: 60,
    fullWidth: true,
  },
  {
    key: "showInPlayerSheet",
    kind: "editable",
    label: "Show in Character Sheet",
    component: "checkbox",
    defaultValue: true,
    group: "visibility",
    order: 70,
    gridSize: { xs: 12 },
  },
];

const arcanaFieldConfig = [
  ...arcanaCoreFields,
  ...arcanistFields,
  ...metaFieldConfig,
  makePassivesTabField([]),
  behaviorsTabField,
];

export default function SpellArcanistModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
  isRework,
  initialTab,
  initialExpandedIndex,
}) {
  const { t } = useTranslate();
  const [editedSpell, setEditedSpell] = useState(spell || {});
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });

  useEffect(() => {
    setEditedSpell({
      showInPlayerSheet: true,
      spellType: isRework ? "arcanist-rework" : "arcanist",
      ...(spell || {}),
    });
  }, [spell, isRework]);

  const handleSave = () => {
    onSave(spell.index, editedSpell);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: "80%",
            maxWidth: "lg",
          },
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Edit Arcana")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <TabbedSchemaFormRenderer
          tabs={playerSpellTabs}
          config={arcanaFieldConfig}
          state={editedSpell}
          onChange={setEditedSpell}
          surface="edit"
          initialTab={initialTab}
          extraProps={initialExpandedIndex !== undefined ? { initialExpandedIndex } : undefined}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Arcana")}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => onDelete(spell.index)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this arcana?")}
      />
    </Dialog>
  );
}
