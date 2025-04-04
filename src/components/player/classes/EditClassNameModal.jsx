// EditClassNameModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

export default function EditClassNameModal({
  open,
  onClose,
  onSave,
  className,
  setClassName,
}) {
  const { t } = useTranslate();

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "80%", md: "40%" },
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold"}}>
        {t("Edit Class Name")}
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
        <TextField
          fullWidth
          label={t("Class Name")}
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          inputProps={{ maxLength: 50 }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
