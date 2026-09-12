import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
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
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 2, overflow: "hidden" },
        },
      }}
    >
      <DialogTitle
        variant="h3"
        sx={{
          color: "warning.main",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {title ?? t("Unsaved Changes")}
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
          {message}
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "rgba(237, 108, 2, 0.08)",
            border: "1px solid rgba(237, 108, 2, 0.25)",
          }}
        >
          <Typography
            variant="body2"
            color="warning.main"
            sx={{ fontWeight: 700, lineHeight: 1.45 }}
          >
            {t("Please confirm to continue.")}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ minHeight: 42 }}
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          fullWidth
          sx={{ fontWeight: "bold", minHeight: 42 }}
        >
          {t("Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmConfirmationDialog;
