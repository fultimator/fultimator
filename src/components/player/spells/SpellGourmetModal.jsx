import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import SpellGourmetCookingModal from "./SpellGourmetCookingModal";

export default function SpellGourmetModal({
  open,
  onClose,
  onSave,
  onDelete,
  spell,
  player,
  onPlayerUpdate,
}) {
  const { t } = useTranslate();
  const [editedSpell, setEditedSpell] = useState(
    spell || {
      spellName: "",
      mp: 0,
      target: "",
      attr: "will",
      cookbookEffects: [],
      showInPlayerSheet: true,
      allYouCanEat: false,
    }
  );
  const [cookingModalOpen, setCookingModalOpen] = useState(false);

  useEffect(() => {
    if (spell) {
      setEditedSpell({
        spellName: spell.spellName || "",
        mp: spell.mp || 0,
        target: spell.target || "",
        attr: spell.attr || "will",
        cookbookEffects: spell.cookbookEffects || [],
        ingredientInventory: spell.ingredientInventory || [],
        showInPlayerSheet: spell.showInPlayerSheet !== undefined ? spell.showInPlayerSheet : true,
        allYouCanEat: spell.allYouCanEat || false,
        index: spell.index,
      });
    }
  }, [spell]);

  const handleChange = (field, value) => {
    setEditedSpell((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Ensure spell has a name and all required fields
    const spellToSave = {
      ...editedSpell,
      spellName: editedSpell.spellName.trim() || '{t("gourmet_cookbook")}',
      spellType: "cooking", // Ensure spell type is preserved
      mp: editedSpell.mp || 0,
      target: editedSpell.target || "",
      attr: editedSpell.attr || "will",
      cookbookEffects: editedSpell.cookbookEffects || [],
      ingredientInventory: editedSpell.ingredientInventory || [],
      showInPlayerSheet: editedSpell.showInPlayerSheet !== undefined ? editedSpell.showInPlayerSheet : true,
      allYouCanEat: editedSpell.allYouCanEat || false,
    };
    onSave(editedSpell.index, spellToSave);
  };

  const handleDelete = () => {
    onDelete(editedSpell.index);
  };

  const handleCookingModalSave = (cookbookEffects, inventory) => {
    setEditedSpell((prev) => ({ 
      ...prev, 
      cookbookEffects,
      ingredientInventory: inventory || prev.ingredientInventory || []
    }));
    setCookingModalOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "80%",
            maxWidth: "md",
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("gourmet_edit_cooking_button")}
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={t("gourmet_cookbook_name")}
                variant="outlined"
                fullWidth
                value={editedSpell.spellName}
                onChange={(e) => handleChange("spellName", e.target.value)}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            

            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => setCookingModalOpen(true)}
                fullWidth
              >
                {t("gourmet_manage_cookbook_button")}
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedSpell.showInPlayerSheet || false}
                    onChange={(e) => handleChange("showInPlayerSheet", e.target.checked)}
                  />
                }
                label={t("Show in Character Sheet")}
              />
            </Grid>

            {/* Add 'All You Can Eat' Switch Toggle */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editedSpell.allYouCanEat || false}
                    onChange={(e) => handleChange("allYouCanEat", e.target.checked)}
                  />
                }
                label={t("gourmet_all_you_can_eat")}
              />
            </Grid>
            
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleDelete}>
            {t("Delete Spell")}
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>

      <SpellGourmetCookingModal
        open={cookingModalOpen}
        onClose={() => setCookingModalOpen(false)}
        onSave={handleCookingModalSave}
        cookbookEffects={editedSpell.cookbookEffects}
        ingredientInventory={editedSpell.ingredientInventory || []}
        player={player}
        onPlayerUpdate={onPlayerUpdate}
        spell={editedSpell}
      />
    </>
  );
}