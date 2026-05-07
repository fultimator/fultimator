import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { DeleteOutlined as DeleteOutlineIcon } from "@mui/icons-material";

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
            aria-label="Delete message"
            onClick={onDelete}
            sx={{ color: "text.secondary" }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Box>
  );
};
