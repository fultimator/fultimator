import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { WarningAmber as WarningIcon } from "@mui/icons-material";

interface ResetConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmDialog: React.FC<ResetConfirmDialogProps> = ({
  open,
  onConfirm,
  onCancel,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
    <DialogTitle
      sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}
    >
      <WarningIcon color="warning" />
      Reset Customizations?
    </DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" component="p">
          This will clear all your custom color and overrides, returning them to
          the current theme's defaults.
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          This action cannot be undone.
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onCancel} variant="outlined">
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="warning" autoFocus>
        Reset All
      </Button>
    </DialogActions>
  </Dialog>
);
