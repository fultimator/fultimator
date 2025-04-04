// EditClassNameModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";

import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

export default function SelectCompanionModal({
  open,
  onClose,
  onSave,
  companionList,
  setSelectedCompanion,
}) {
  const { t } = useTranslate();

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleCompanionChange = (event, value) => {
    setSelectedCompanion(value);
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
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("Select Companion")}
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
        <Typography>{t("List of Companions created in the NPC Designer.")}</Typography>
        <Typography>{t("If you changed your Companion in the NPC Designer, select it again.")}</Typography>
        <Autocomplete
          options={companionList}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("Select Companion")}
              variant="outlined"
              fullWidth
              margin="normal"
            />
          )}
          onChange={handleCompanionChange}
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
