import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";

export default function EditSpellClassesModal({
  open,
  onClose,
  onSave,
  onSpellClassChange,
  spellClassesList,
  selectedSpellClasses = [],
}) {
  const { t } = useTranslate();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Class Spell Types")}
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          {spellClassesList.map((spellClass, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedSpellClasses.includes(spellClass)}
                  onChange={(e) => onSpellClassChange(spellClass, e.target.checked)}
                />
              }
              label={t(spellClass)}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={onSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
