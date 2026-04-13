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
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemPreview,
}) => {
  const { t } = useTranslate();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
          }
        }
      }}
    >
      <DialogTitle variant="h3" sx={{ color: "error.main" }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        
        {itemPreview && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            {itemPreview}
          </Box>
        )}

        <Typography variant="body2" color="error" sx={{ fontWeight: "bold", mt: 2, mb: 2 }}>
          {t("This action is permanent and cannot be undone.")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="primary"
          fullWidth
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          fullWidth
          sx={{ 
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "error.dark",
            }
          }}
        >
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
