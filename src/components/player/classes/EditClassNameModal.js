import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";

export default function EditClassNameModal({
  open,
  onClose,
  className,
  setClassName,
  onSaveClassName,
}) {
  const { t } = useTranslate();

  const handleSave = () => {
    onSaveClassName();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80%", // Adjust width as needed
          maxWidth: "lg", // Adjust maximum width as needed
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
          onChange={(e) => setClassName(e.target.value)} // Use setClassName here
          sx={{ marginTop: "10px" }}
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
