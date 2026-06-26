import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";

export default function ActorEditModal({
  open,
  onClose,
  onConfirm,
  title,
  subtitle,
  maxWidth = "sm",
  children,
  actions,
}) {
  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      if (!onConfirm) return;
      event.preventDefault();
      onConfirm();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose?.();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      fullWidth
      maxWidth={maxWidth}
      slotProps={{ paper: { sx: { width: "100%" } } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ px: 3, pt: "20px !important", pb: 2.5 }}>
        {subtitle ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.55 }}
          >
            {subtitle}
          </Typography>
        ) : null}
        {children}
      </DialogContent>

      {actions ? (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Box sx={{ width: "100%" }}>{actions}</Box>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
