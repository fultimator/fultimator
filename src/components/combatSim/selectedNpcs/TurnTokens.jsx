import React from "react";
import { Box, Tooltip } from "@mui/material";
import { PlayArrow, CheckCircle } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

/**
 * Single circle button showing turn count.
 * - Outline circle with number = turns available
 * - Play icon (pulsing) = turn in progress
 * - Dimmed filled circle = all turns taken
 *
 * combatActive=false → plain toggle (click marks all taken / all reset)
 */
export default function TurnTokens({
  turns,
  combatActive,
  isActiveFaction,
  activeTurnIndex, // non-null = this actor has a turn in progress
  onStartTurn,
  onEndTurn,
  onToggle,
  color = "primary",
}) {
  const theme = useTheme();
  const palette = theme.palette[color] ?? theme.palette.primary;

  const total = turns.length;
  const taken = turns.filter(Boolean).length;
  const remaining = total - taken;
  const allTaken = remaining === 0;
  const inProgress = activeTurnIndex !== null && combatActive;

  const canStart = combatActive && isActiveFaction && !allTaken && !inProgress;
  const nextSlot = turns.findIndex((t) => !t);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!combatActive) {
      const anyTaken = turns.some(Boolean);
      onToggle?.(anyTaken ? turns.map(() => false) : turns.map(() => true));
      return;
    }
    if (inProgress) {
      onEndTurn?.(activeTurnIndex);
    } else if (canStart) {
      onStartTurn?.(nextSlot);
    }
  };

  let tooltipTitle;
  if (!combatActive) tooltipTitle = allTaken ? "Reset turn" : "Mark turn taken";
  else if (inProgress) tooltipTitle = "End turn";
  else if (canStart) tooltipTitle = "Start turn";
  else if (allTaken) tooltipTitle = "All turns taken";
  else tooltipTitle = "Not your faction's turn";

  const borderColor = inProgress
    ? palette.main
    : isActiveFaction && !allTaken && combatActive
      ? palette.main
      : theme.palette.text.disabled;

  const textColor = inProgress
    ? palette.main
    : allTaken
      ? theme.palette.text.disabled
      : isActiveFaction && combatActive
        ? palette.main
        : theme.palette.text.disabled;
  const isCurrentFactionToken = isActiveFaction && combatActive && !allTaken;

  const cursor =
    (combatActive && (canStart || inProgress)) || !combatActive
      ? "pointer"
      : "default";
  const fontSize = remaining > 9 ? "0.7rem" : "0.9rem";

  return (
    <Tooltip title={tooltipTitle} enterDelay={300}>
      <Box
        onClick={handleClick}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor,
          flexShrink: 0,
          backgroundColor:
            inProgress || isCurrentFactionToken
              ? borderColor
              : allTaken && !inProgress
                ? borderColor + "22"
                : "transparent",
          opacity: allTaken && !inProgress && combatActive ? 0.4 : 1,
          transition: "border-color 0.2s, opacity 0.2s",
          ...(inProgress && {
            animation: "pulse 1.2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.45 },
            },
          }),
        }}
      >
        {inProgress ? (
          <PlayArrow
            sx={{
              fontSize: 16,
              color: theme.palette.getContrastText(borderColor),
            }}
          />
        ) : allTaken ? (
          <CheckCircle sx={{ fontSize: 18, color: textColor }} />
        ) : (
          <Box
            component="span"
            sx={{
              fontSize,
              fontWeight: "bold",
              lineHeight: 1,
              color: isCurrentFactionToken
                ? theme.palette.getContrastText(borderColor)
                : textColor,
              userSelect: "none",
            }}
          >
            {remaining}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
