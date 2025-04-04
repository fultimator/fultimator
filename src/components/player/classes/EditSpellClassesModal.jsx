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
  IconButton,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

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
      <DialogTitle variant="h3" sx={{ fontWeight: "bold"}}>
        {t("Edit Class Spell Types")}
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
        <FormGroup>
          {spellClassesList.map((spellClass, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedSpellClasses.includes(spellClass)}
                  onChange={(e) =>
                    onSpellClassChange(spellClass, e.target.checked)
                  }
                />
              }
              label={t(spellClass)}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
