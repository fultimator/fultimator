import React from "react";
import { Box, Typography } from "@mui/material";
import type { ActionMessage } from "../types";

const ACTION_LABEL: Record<string, string> = {
  attack: "Attack",
  equipment: "Equipment",
  guard: "Guard",
  hinder: "Hinder",
  inventory: "Inventory",
  objective: "Objective",
  spell: "Spell",
  study: "Study",
  skill: "Skill",
  other: "Other",
};

interface ActionMessageTemplateProps {
  message: ActionMessage;
}

export const ActionMessageTemplate: React.FC<ActionMessageTemplateProps> = ({
  message,
}) => {
  const label = ACTION_LABEL[message.action] ?? message.action;

  return (
    <>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Action
      </Typography>
      <Box
        sx={{
          mt: 0.75,
          p: 1,
          borderRadius: 1.5,
          backgroundColor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "baseline",
          gap: 1,
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        {message.weapon && (
          <Typography variant="body2" color="text.secondary">
            {message.weapon}
          </Typography>
        )}
      </Box>
    </>
  );
};
