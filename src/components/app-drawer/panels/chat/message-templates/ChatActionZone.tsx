import React from "react";
import { Box, Button, Divider, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
import { scanForTrigger, type TriggerMatch } from "../../../../../pipelines/triggerScanner";

// Guard zone: surfaces chat-action trigger items on the guard message.
// guardVariant "cover" -> Bodyguard-style; "no-cover" -> Withstand-style.

interface ChatActionZoneProps {
  guardVariant: "cover" | "no-cover";
  speakerCombatId?: string;
}

export const ChatActionZone: React.FC<ChatActionZoneProps> = ({
  guardVariant,
  speakerCombatId,
}) => {
  const theme = useTheme();
  const { selectedNPCs, selectedPCs, runtimeActors } = useCombatEncounterStore();

  const allActors = [
    ...selectedNPCs.map((doc) => ({ doc: doc as Record<string, unknown>, runtime: runtimeActors[doc.combatId as string] })),
    ...selectedPCs.map((doc) => ({ doc: doc as Record<string, unknown>, runtime: runtimeActors[doc.combatId as string] })),
  ].filter((a) => a.runtime != null);

  const matches = scanForTrigger("chat-action", allActors, {
    excludeCombatId: speakerCombatId,
    triggerAction: "guard",
    guardVariant,
  });

  if (matches.length === 0) return null;

  return (
    <Box
      sx={{
        mt: 0.75,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 0.4,
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "text.secondary",
          }}
        >
          {guardVariant === "cover" ? "Cover abilities" : "No-cover abilities"}
        </Typography>
      </Box>
      {matches.map((match, i) => (
        <React.Fragment key={`${match.combatId}-${match.itemName}`}>
          {i > 0 && <Divider />}
          <ChatActionRow match={match} />
        </React.Fragment>
      ))}
    </Box>
  );
};

const ChatActionRow: React.FC<{ match: TriggerMatch }> = ({ match }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: 0.55,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8rem" }} noWrap>
          {match.itemName}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
          {match.actorName}
        </Typography>
      </Box>
      <Tooltip title="Activate this ability">
        <Button
          size="small"
          variant="outlined"
          sx={{
            minWidth: 52,
            height: 28,
            px: 1,
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Use
        </Button>
      </Tooltip>
    </Box>
  );
};

// Reactive interrupt zone: surfaces reactive trigger items on attack/spell messages.
// Clicking an interrupt substitutes that actor as the target.

interface ReactiveInterruptZoneProps {
  attackerCombatId?: string;
  onSubstituteTarget?: (combatId: string) => void;
}

export const ReactiveInterruptZone: React.FC<ReactiveInterruptZoneProps> = ({
  attackerCombatId,
  onSubstituteTarget,
}) => {
  const { selectedNPCs, selectedPCs, runtimeActors } = useCombatEncounterStore();

  const allActors = [
    ...selectedNPCs.map((doc) => ({ doc: doc as Record<string, unknown>, runtime: runtimeActors[doc.combatId as string] })),
    ...selectedPCs.map((doc) => ({ doc: doc as Record<string, unknown>, runtime: runtimeActors[doc.combatId as string] })),
  ].filter((a) => a.runtime != null);

  const matches = scanForTrigger("reactive", allActors, {
    excludeCombatId: attackerCombatId,
    reactiveEvent: "ally-targeted",
  });

  if (matches.length === 0) return null;

  return (
    <Box
      sx={{
        mt: 0.75,
        border: "1px solid",
        borderColor: "warning.main",
        borderRadius: 1.5,
        overflow: "hidden",
        backgroundColor: "background.default",
        opacity: 0.9,
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 0.4,
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "warning.main",
          }}
        >
          Interrupts available
        </Typography>
      </Box>
      {matches.map((match, i) => (
        <React.Fragment key={`${match.combatId}-${match.itemName}`}>
          {i > 0 && <Divider />}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1,
              py: 0.55,
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8rem" }} noWrap>
                {match.itemName}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                {match.actorName}
              </Typography>
            </Box>
            <Tooltip title="Substitute this actor as the damage target">
              <Button
                size="small"
                color="warning"
                variant="outlined"
                onClick={() => onSubstituteTarget?.(match.combatId)}
                sx={{
                  minWidth: 60,
                  height: 28,
                  px: 1,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Protect
              </Button>
            </Tooltip>
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

// On-hit zone: surfaces on-hit trigger items for the attacker after a hit.

interface OnHitZoneProps {
  attackerCombatId?: string;
  isSingleTarget?: boolean;
  anyTargetHasStatusEffects?: boolean;
  isFumble?: boolean;
}

export const OnHitZone: React.FC<OnHitZoneProps> = ({
  attackerCombatId,
  isSingleTarget,
  anyTargetHasStatusEffects,
  isFumble,
}) => {
  const { selectedNPCs, selectedPCs, runtimeActors } = useCombatEncounterStore();

  if (isFumble) return null;

  const allActors = [
    ...selectedNPCs.map((doc) => ({ doc: doc as Record<string, unknown>, runtime: runtimeActors[doc.combatId as string] })),
    ...selectedPCs.map((doc) => ({ doc: doc as Record<string, unknown>, runtime: runtimeActors[doc.combatId as string] })),
  ].filter((a) => a.runtime != null);

  // Only scan the attacker's items for on-hit triggers
  const attackerActors = attackerCombatId
    ? allActors.filter((a) => a.runtime.combatId === attackerCombatId)
    : allActors;

  const matches = scanForTrigger("on-hit", attackerActors, {
    onHitCondition: {
      singleTarget: isSingleTarget,
    },
  }).filter((match) => {
    const trigger = match.trigger as Extract<typeof match.trigger, { kind: "on-hit" }>;
    if (trigger.condition?.targetHasStatusEffects && !anyTargetHasStatusEffects) return false;
    return true;
  });

  if (matches.length === 0) return null;

  return (
    <Box
      sx={{
        mt: 0.75,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1.5,
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 0.4,
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            fontSize: "0.68rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "text.secondary",
          }}
        >
          On-hit abilities
        </Typography>
      </Box>
      {matches.map((match, i) => (
        <React.Fragment key={`${match.combatId}-${match.itemName}`}>
          {i > 0 && <Divider />}
          <ChatActionRow match={match} />
        </React.Fragment>
      ))}
    </Box>
  );
};
