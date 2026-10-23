import React from "react";
import { Box, Typography } from "@mui/material";

interface TextMessageTemplateProps {
  text: string;
}

export const TextMessageTemplate: React.FC<TextMessageTemplateProps> = ({
  text,
}) => {
  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Message
      </Typography>
      <Box
        sx={{
          mt: 0.75,
          p: 1,
          borderRadius: 1.5,
          backgroundColor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
      </Box>
    </>
  );
};
