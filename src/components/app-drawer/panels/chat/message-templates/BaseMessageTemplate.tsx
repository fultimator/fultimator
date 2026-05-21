import React, { useState } from "react";
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { DeleteOutlined as DeleteOutlineIcon, Menu as MenuIcon } from "@mui/icons-material";

interface BaseMessageTemplateProps {
  speaker: string;
  timeAgo: string;
  onDelete: () => void;
  children: React.ReactNode;
}

export const BaseMessageTemplate: React.FC<BaseMessageTemplateProps> = ({
  speaker,
  timeAgo,
  onDelete,
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
            slotProps={{ paper: { sx: { minWidth: 160 } } }}
          >
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
