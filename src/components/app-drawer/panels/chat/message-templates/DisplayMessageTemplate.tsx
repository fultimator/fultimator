import React from "react";
import { Box, Typography } from "@mui/material";
import type { DisplayMessage } from "../types";
import Diamond from "../../../../Diamond";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { TagRow } from "./primitives";
import { formatSpellType } from "./primitives-utils";
import Clock from "../../../../player/playerSheet/Clock";

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
  study: "/assets/icons/actions/action_study.png",
};

export const DisplayMessageTemplate: React.FC<DisplayMessageTemplateProps> = ({
  message,
}) => {
  const tags = message.tags.map((t) =>
    t === "default" ? formatSpellType(t) : t,
  );
  const iconSrc =
    DISPLAY_ICON_SRC[String(message.itemType || "").toLowerCase()];
  const clockSections = Number(message.clock?.sections) || 0;
  const clockState =
    clockSections > 0
      ? Array.isArray(message.clock?.state) &&
        message.clock.state.length === clockSections
        ? message.clock.state
        : new Array(clockSections).fill(false)
      : [];
  const filledClockSections = clockState.filter(Boolean).length;
  const hasDescription = Boolean(message.description);
  const hasEffect = Boolean(message.effect);
  const hasClock = clockSections > 0;

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, rgba(233, 240, 236, 0.75) 0%, rgba(221, 234, 229, 0.88) 100%)",
      }}
    >
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
              sx={{
                width: 32,
                height: 32,
                objectFit: "contain",
                display: "block",
              }}
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
      <Box sx={{ mt: 0.5 }}>
        <TagRow tags={tags} />
      </Box>
      {(hasDescription || hasEffect || hasClock) && (
        <Box
          sx={{
            mt: 0.75,
            display: "flex",
            flexDirection: "column",
            gap: 0.75,
            alignItems: "stretch",
          }}
        >
          {hasDescription && (
            <Box
              sx={{
                px: 1.2,
                py: 1,
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: 1,
                backgroundColor: "rgba(214, 230, 224, 0.75)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
                minHeight: 72,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.4,
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                Description
              </Typography>
              <NotesMarkdown sx={{ fontSize: "0.85rem", m: 0 }}>
                {message.description}
              </NotesMarkdown>
            </Box>
          )}
          {hasEffect && (
            <Box
              sx={{
                px: 1.2,
                py: 1,
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: 1,
                backgroundColor: "rgba(214, 230, 224, 0.75)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
                minHeight: 72,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 0.4,
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                Effect
              </Typography>
              <NotesMarkdown sx={{ fontSize: "0.85rem", m: 0 }}>
                {message.effect}
              </NotesMarkdown>
            </Box>
          )}

          {hasClock ? (
            <Box
              sx={{
                px: 1.2,
                py: 1,
                border: "1px solid",
                borderColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: 1,
                backgroundColor: "rgba(214, 230, 224, 0.75)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 1.25,
                minHeight: 72,
              }}
            >
              <Clock
                numSections={clockSections}
                size={56}
                state={clockState}
                setState={() => {}}
                isCharacterSheet
              />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  {message.clock?.name || "Clock"}
                </Typography>
                <Typography
                  sx={{ fontSize: "1.25rem", lineHeight: 1.1, fontWeight: 800 }}
                >
                  {filledClockSections}/{clockSections}
                </Typography>
              </Box>
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
};
