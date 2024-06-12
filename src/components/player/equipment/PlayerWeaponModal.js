import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";

import { Close } from "@mui/icons-material";

export default function PlayerWeaponModal({ open, onClose }) {
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
        {t("Add Weapon")}
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
      <DialogContent></DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary">
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
