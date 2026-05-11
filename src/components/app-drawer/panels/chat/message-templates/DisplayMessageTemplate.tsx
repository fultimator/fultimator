import React from "react";
import { Box, Typography } from "@mui/material";
import type { DisplayMessage } from "../types";
import Diamond from "../../../../Diamond";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { TagRow } from "./primitives";
import { formatSpellType } from "./primitives-utils";

interface DisplayMessageTemplateProps {
  message: DisplayMessage;
}

export const DisplayMessageTemplate: React.FC<DisplayMessageTemplateProps> = ({
  message,
}) => {
  const tags = message.tags.map((t) =>
    t === "default" ? formatSpellType(t) : t,
  );

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        {message.itemType} <Diamond color="inherit" /> {message.name}
      </Typography>
      <TagRow tags={tags} />
      {message.description && (
        <Box
          sx={{
            mt: 0.5,
            px: 1,
            py: 0.75,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: "background.default",
          }}
        >
          <NotesMarkdown sx={{ fontSize: "0.85rem", m: 0 }}>
            {message.description}
          </NotesMarkdown>
        </Box>
      )}
    </>
  );
};
