import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import {
  useActorCardSetup,
  isInteractive,
} from "/src/components/shared/actors/core-utils";
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
      <Grid
        sx={{ pl: 2, pr: 0, py: 0.25, width: 40, flexShrink: 0 }}
        size="auto"
      >
        <Typography
          sx={{
            textAlign: "left",
            fontSize: "1.1em",
            display: "flex",
            alignItems: "center",
            height: "1.32em",
            "& svg": { display: "block" },
          }}
        >
          <ActionIcon />
        </Typography>
      </Grid>
      <Grid
        sx={{
          pl: 1,
          pr: 1,
          py: 0.25,
          minWidth: 0,
          flex: "1 1 calc(100% - 40px)",
          maxWidth: "calc(100% - 40px)",
        }}
      >
        <Typography component="div">
          {action.name && (
            <>
              {showRoll ? (
                <ClickableName name={action.name} onAction={handleSend} />
              ) : (
                <strong>{action.name}</strong>
              )}{" "}
              <Diamond />{" "}
            </>
          )}
          <SpanMarkdown>{action.effect}</SpanMarkdown>
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
    <Grid container sx={{ pb: 0.75 }}>
      <Grid
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          minHeight: 34,
          mb: 0.75,
          display: "flex",
          alignItems: "center",
          background,
        }}
        size={12}
      >
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            lineHeight: 1,
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
