import React from "react";
import { Box, Typography } from "@mui/material";
import type { ActionMessage } from "../types";
import { t } from "../../../../../translation/translate";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { ACTION_ICON_SRC_BY_KEY } from "../../../../actionIconSrc";
import { TagRow } from "./primitives";
import { ChatActionZone } from "./ChatActionZone";

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

function toTitleCase(value: string): string {
  return String(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

interface ActionMessageTemplateProps {
  message: ActionMessage;
  speakerCombatId?: string;
}

export const ActionMessageTemplate: React.FC<ActionMessageTemplateProps> = ({
  message,
  speakerCombatId,
}) => {
  const actionKey = String(message.action || "").toLowerCase();
  const labelCandidates = ACTION_LABEL_KEY[actionKey] ?? [actionKey];
  const ruleCandidates = ACTION_RULE_KEY[actionKey] ?? [`${actionKey}_rule`];
  const label = toTitleCase(
    resolveLocalizedKey(labelCandidates, message.action),
  );
  const description = resolveLocalizedKey(ruleCandidates, "");
  const actionIconSrc =
    ACTION_ICON_SRC_BY_KEY[actionKey as keyof typeof ACTION_ICON_SRC_BY_KEY];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {actionIconSrc && (
          <Box
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0.5,
              backgroundColor: "background.default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.5,
            }}
          >
            <Box
              component="img"
              src={actionIconSrc}
              alt={label}
              sx={{
                width: 32,
                height: 32,
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
        )}
        <Box
          sx={{ display: "flex", alignItems: "baseline", gap: 1, minWidth: 0 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          {message.weapon && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {message.weapon}
            </Typography>
          )}
        </Box>
      </Box>
      <TagRow tags={["Action"]} />
      {description && (
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
            {description}
          </NotesMarkdown>
        </Box>
      )}
      {actionKey === "guard" && (
        <>
          <ChatActionZone
            guardVariant="no-cover"
            speakerCombatId={speakerCombatId}
          />
          <ChatActionZone
            guardVariant="cover"
            speakerCombatId={speakerCombatId}
          />
        </>
      )}
    </>
  );
};
