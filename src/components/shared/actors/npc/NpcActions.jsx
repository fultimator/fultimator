import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import { useActorCardSetup, isInteractive } from "/src/components/shared/actors/core-utils";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import Diamond from "/src/components/Diamond";
import { ActionIcon } from "/src/components/icons";
import { SpanMarkdown, ClickableName } from "./NpcMarkdown";

function ActionRow({ action, npc, showRoll }) {
  const addMessage = useAddChatMessage();

  const handleSend = (e) => {
    e.stopPropagation();
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: npc.name || "NPC",
      kind: "display",
      itemType: "action",
      name: action.name,
      tags: [`SP: ${action.spCost ?? 1}`],
      description: action.effect,
    });
  };

  return (
    <Fragment>
      <Grid sx={{ px: 1, py: 0.5 }} size={1}>
        <Typography sx={{ textAlign: "center" }}>
          <ActionIcon />
        </Typography>
      </Grid>
      <Grid sx={{ px: 1, py: 0.5 }} size={11}>
        <Typography component="div">
          {showRoll ? (
            <ClickableName name={action.name} onAction={handleSend} />
          ) : (
            <strong>{action.name}</strong>
          )}{" "}
          <Diamond /> <SpanMarkdown>{action.effect}</SpanMarkdown>
        </Typography>
      </Grid>
    </Fragment>
  );
}

export function NpcActions({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  if (!npc.actions?.length) return null;

  return (
    <Grid container>
      <Grid sx={{ mt: 0, px: 2, py: 0.3, background }} size={12}>
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            fontWeight: "medium",
            textTransform: "uppercase",
          }}
        >
          {t("Other Actions")}
        </Typography>
      </Grid>
      {npc.actions.map((action, i) => (
        <ActionRow key={i} action={action} npc={npc} showRoll={showRoll} />
      ))}
    </Grid>
  );
}
