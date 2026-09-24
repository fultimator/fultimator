import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import type { DisplayMessage } from "../types";
import Diamond from "../../../../Diamond";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { TagRow } from "./primitives";
import { formatSpellType } from "./primitives-utils";
import Clock from "/src/components/shared/actors/pc/playerSheet/Clock";
import { ACTION_ICON_SRC_BY_KEY } from "../../../../actionIconSrc";
import { useChatActions } from "../ChatActionsContext.shared";

interface DisplayMessageTemplateProps {
  message: DisplayMessage;
}

export const DisplayMessageTemplate: React.FC<DisplayMessageTemplateProps> = ({
  message,
}) => {
  const { onLossResource, onUpdateCost } = useChatActions();
  const [costEditAnchor, setCostEditAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [costEditValue, setCostEditValue] = useState("");
  const tags = message.tags.map((t) =>
    t === "default" ? formatSpellType(t) : t,
  );
  const iconSrc =
    ACTION_ICON_SRC_BY_KEY[
      String(
        message.itemType || "",
      ).toLowerCase() as keyof typeof ACTION_ICON_SRC_BY_KEY
    ];
  const clocks = (message.clocks ?? [])
    .map((clock) => {
      const sections = Number(clock?.sections) || 0;
      if (sections <= 0) return null;
      const state =
        Array.isArray(clock?.state) && clock.state.length === sections
          ? clock.state
          : new Array(sections).fill(false);
      return { name: clock?.name, sections, state };
    })
    .filter((clock): clock is NonNullable<typeof clock> => clock !== null);
  const hasDescription = Boolean(message.description);
  const hasEffect = Boolean(message.effect);
  const hasClock = clocks.length > 0;

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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {clocks.map((clock, index) => (
                <Box
                  key={index}
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
                    numSections={clock.sections}
                    size={56}
                    state={clock.state}
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
                      {clock.name || "Clock"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.25rem",
                        lineHeight: 1.1,
                        fontWeight: 800,
                      }}
                    >
                      {clock.state.filter(Boolean).length}/{clock.sections}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : null}
        </Box>
      )}
      {message.cost != null && (
        <Box sx={{ mt: 1, display: "flex", gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => {
              if (onLossResource) {
                onLossResource(
                  message,
                  message.cost!.resource,
                  message.cost!.amount,
                );
                return;
              }
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Spend {message.cost.amount} {message.cost.resource.toUpperCase()}
          </Button>
          {onUpdateCost && (
            <IconButton
              size="small"
              onClick={(e) => {
                setCostEditValue(String(message.cost!.amount));
                setCostEditAnchor(e.currentTarget);
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          )}
          <Popover
            open={Boolean(costEditAnchor)}
            anchorEl={costEditAnchor}
            onClose={() => setCostEditAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: { sx: { p: 1.5, display: "flex", gap: 1 } },
            }}
          >
            <TextField
              autoFocus
              type="number"
              size="small"
              label={`Spend ${message.cost?.resource.toUpperCase()}`}
              value={costEditValue}
              onChange={(e) => setCostEditValue(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const amount = Math.max(0, parseInt(costEditValue, 10) || 0);
                onUpdateCost?.(message, amount);
                onLossResource?.(message, message.cost!.resource, amount);
                setCostEditAnchor(null);
              }}
            >
              Spend
            </Button>
          </Popover>
        </Box>
      )}
    </Box>
  );
};
