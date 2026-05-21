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

const DISPLAY_ICON_SRC: Record<string, string | undefined> = {
  equipment: "/assets/icons/actions/action_equipment.png",
  spell: "/assets/icons/actions/action_spell.png",
  skill: "/assets/icons/actions/action_skill.png",
  inventory: "/assets/icons/actions/action_inventory.png",
  objective: "/assets/icons/actions/action_objective.png",
  guard: "/assets/icons/actions/action_guard.png",
  hinder: "/assets/icons/actions/action_hinder.png",
  attack: "/assets/icons/actions/action_attack.png",
};

export const DisplayMessageTemplate: React.FC<DisplayMessageTemplateProps> = ({
  message,
}) => {
  const tags = message.tags.map((t) =>
    t === "default" ? formatSpellType(t) : t,
  );
  const iconSrc = DISPLAY_ICON_SRC[String(message.itemType || "").toLowerCase()];

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {iconSrc && (
          <Box
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              borderRadius: 0.5,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.5,
            }}
          >
            <Box
              component="img"
              src={iconSrc}
              alt={message.itemType}
              sx={{ width: 32, height: 32, objectFit: "contain", display: "block" }}
            />
          </Box>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          {message.itemType} <Diamond color="inherit" /> {message.name}
        </Typography>
      </Box>
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
