import React from "react";
import { Box, Typography } from "@mui/material";
import type { DisplayMessage } from "../types";
import Diamond from "../../../../Diamond";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { TagRow } from "./primitives";
import { formatSpellType } from "./primitives-utils";
import Clock from "/src/components/shared/actors/pc/playerSheet/optional/Clock.jsx";
import { ACTION_ICON_SRC_BY_KEY } from "../../../../actionIconSrc";

interface DisplayMessageTemplateProps {
  message: DisplayMessage;
}

export const DisplayMessageTemplate: React.FC<DisplayMessageTemplateProps> = ({
  message,
}) => {
  const tags = message.tags.map((t) =>
    t === "default" ? formatSpellType(t) : t,
  );
  const iconSrc =
    ACTION_ICON_SRC_BY_KEY[
      String(
        message.itemType || "",
      ).toLowerCase() as keyof typeof ACTION_ICON_SRC_BY_KEY
    ];
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
        backgroundColor: "background.paper",
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
              backgroundColor: "action.hover",
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
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "action.hover",
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
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "action.hover",
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
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "action.hover",
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
