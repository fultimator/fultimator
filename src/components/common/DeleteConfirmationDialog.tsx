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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemPreview?: React.ReactNode;
  enableCtrlBypass?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemPreview,
  enableCtrlBypass = true,
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
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        variant="h3"
        sx={{
          color: "error.main",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: "24px !important", pb: 2.5 }}>
        <Typography
          variant="body1"
          sx={{ mb: itemPreview ? 2 : 2.5, lineHeight: 1.6 }}
        >
          {message}
        </Typography>

        {itemPreview ? (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            {itemPreview}
          </Box>
        ) : null}

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: "rgba(211, 47, 47, 0.08)",
            border: "1px solid rgba(211, 47, 47, 0.25)",
          }}
        >
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: 700, lineHeight: 1.45 }}
          >
            {t("This action is permanent and cannot be undone.")}
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
          color="error"
          fullWidth
          title={
            enableCtrlBypass
              ? "Ctrl+Click on the initial delete button to skip this dialog"
              : undefined
          }
          sx={{
            fontWeight: "bold",
            minHeight: 42,
            "&:hover": {
              bgcolor: "error.dark",
            },
          }}
        >
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
