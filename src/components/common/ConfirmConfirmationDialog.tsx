import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";

interface ConfirmConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
}

const ConfirmConfirmationDialog: React.FC<ConfirmConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const { t } = useTranslate();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      handleConfirm();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <DialogTitle variant="h3" sx={{ color: "warning.main" }}>
        {title ?? t("Unsaved Changes")}
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="primary" fullWidth>
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          fullWidth
          sx={{ fontWeight: "bold" }}
        >
          {t("Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmConfirmationDialog;
