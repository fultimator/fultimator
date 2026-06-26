import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  playerSpellFieldConfig,
  playerSpellTabs,
} from "/src/forms/rendering/config/itemConfigs/spells";
import { spellList } from "/src/libs/classes";

const EDIT_EXCLUDED_KEYS = new Set(["spellType", "fuid", "class"]);
const editSpellFieldConfig = playerSpellFieldConfig.filter(
  (f) => !EDIT_EXCLUDED_KEYS.has(f.key),
);

export default function SpellDefaultModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
  initialTab,
  initialExpandedIndex,
}) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(spell || {});

  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  useEffect(() => {
    if (spell) {
      const compendiumEntry = spell.fuid
        ? spellList.find((s) => s.fuid === spell.fuid)
        : null;
      setFormState({
        damage: { value: 0, type: "physical", hrZero: false },
        accuracy: {
          attr1: "insight",
          attr2: "will",
          value: 0,
          defense: "mdef",
        },
        cost: { resource: "mp", amount: 0, perTarget: true },
        ...(compendiumEntry ?? {}),
        ...spell,
      });
    }
  }, [spell]);

  const handleSave = () => {
    onSave(spell.index, formState);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted={false}
      slotProps={{
        paper: {
          sx: { width: "80%", maxWidth: "lg" },
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Edit Spell")}
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
          config={editSpellFieldConfig}
          state={formState}
          onChange={setFormState}
          surface="edit"
          initialTab={initialTab}
          extraProps={
            initialExpandedIndex !== undefined
              ? { initialExpandedIndex }
              : undefined
          }
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t("Delete Spell")}
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
        message={t("Are you sure you want to delete this spell?")}
      />
    </Dialog>
  );
}
