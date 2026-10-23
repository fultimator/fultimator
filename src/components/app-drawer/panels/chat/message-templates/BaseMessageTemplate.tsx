import React, { useState } from "react";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  DeleteOutlined as DeleteOutlineIcon,
  Menu as MenuIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";

interface BaseMessageTemplateProps {
  speaker: string;
  timeAgo: string;
  onDelete: () => void;
  onRetarget?: () => void;
  dimmed?: boolean;
  children: React.ReactNode;
}

export const BaseMessageTemplate: React.FC<BaseMessageTemplateProps> = ({
  speaker,
  timeAgo,
  onDelete,
  onRetarget,
  dimmed = false,
  children,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete();
  };

  const handleRetarget = () => {
    handleMenuClose();
    onRetarget?.();
  };

  return (
    <Box
      sx={{
        alignSelf: "flex-start",
        width: "100%",
        maxWidth: "100%",
        px: 1.25,
        py: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: 1,
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? "saturate(0.75)" : "none",
        transition: "opacity 0.2s, filter 0.2s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {speaker}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {timeAgo}
          </Typography>
          <IconButton
            size="small"
            aria-label="Message options"
            onClick={handleMenuOpen}
            sx={{ color: "text.secondary" }}
          >
            <MenuIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 160,
                  "& .MuiMenuItem-root": {
                    color: "text.primary",
                    "& .MuiListItemIcon-root": {
                      color: "text.secondary",
                    },
                    "&:hover": {
                      backgroundColor: "action.hover",
                      color: "text.primary",
                    },
                    "&:hover .MuiListItemIcon-root": {
                      color: "text.primary",
                    },
                  },
                },
              },
            }}
          >
            {onRetarget && (
              <MenuItem onClick={handleRetarget}>
                <ListItemIcon>
                  <RestartAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Retarget Actors</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Message</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );
};
