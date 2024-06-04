// EditClassNameModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";

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
          width: "80%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Class Name")}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t("Class Name")}
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          sx={{ marginTop: "10px" }}
          inputProps={{ maxLength: 50 }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
