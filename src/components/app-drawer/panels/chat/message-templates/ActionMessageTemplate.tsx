import React from "react";
import { Box, Typography } from "@mui/material";
import type { ActionMessage } from "../types";
import { t } from "../../../../../translation/translate";
import NotesMarkdown from "../../../../common/NotesMarkdown";

const ACTION_LABEL_KEY: Record<string, string[]> = {
  attack: ["attack", "attacks"],
  equipment: ["equipment"],
  guard: ["guard"],
  study: ["study"],
  study_roll: ["study_roll", "study"],
  inventory: ["inventory"],
  hinder: ["hinder"],
  objective: ["objective"],
  spell: ["spell"],
  skill: ["skill"],
  other: ["other"],
};

const ACTION_RULE_KEY: Record<string, string[]> = {
  attack: ["attack_rule"],
  equipment: ["equipment_rule"],
  guard: ["guard_rule"],
  study: ["study_rule"],
  study_roll: ["study_rule"],
  inventory: ["inventory_rule"],
  hinder: ["hinder_rule"],
  objective: ["objective_rule"],
  spell: ["spell_rule"],
  skill: ["skill_rule"],
  other: ["other_rule"],
};

function resolveLocalizedKey(candidates: string[], fallback: string): string {
  for (const key of candidates) {
    const value = t(key, undefined, true);
    if (value !== key) return value;
  }
  return fallback;
}

interface ActionMessageTemplateProps {
  message: ActionMessage;
}

export const ActionMessageTemplate: React.FC<ActionMessageTemplateProps> = ({
  message,
}) => {
  const actionKey = String(message.action || "").toLowerCase();
  const labelCandidates = ACTION_LABEL_KEY[actionKey] ?? [actionKey];
  const ruleCandidates = ACTION_RULE_KEY[actionKey] ?? [`${actionKey}_rule`];
  const label = resolveLocalizedKey(labelCandidates, message.action);
  const description = resolveLocalizedKey(ruleCandidates, "");

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
      {description && (
        <Box
          sx={{
            mt: 0.5,
            p: 1,
            borderRadius: 1.5,
            backgroundColor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <NotesMarkdown>{description}</NotesMarkdown>
        </Box>
      )}
    </>
  );
};
