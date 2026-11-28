import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";

import {
  useActorCardSetup,
  isInteractive,
} from "/src/components/shared/actors/core-utils";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import Diamond from "/src/components/Diamond";
import { RareItemIcon } from "/src/components/icons";
import { SpanMarkdown, ClickableName } from "./NpcMarkdown";

function RareGearRow({ item, npc, showRoll }) {
  const addMessage = useAddChatMessage();

  const handleSend = (e) => {
    e.stopPropagation();
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: npc.name || "NPC",
      kind: "display",
      itemType: "item",
      name: item.name,
      tags: ["Rare Equipment"],
      description: item.effect,
    });
  };

  return (
    <Fragment>
      <Grid
        sx={{ pl: 2, pr: 0, py: 0.25, width: 40, flexShrink: 0 }}
        size="auto"
      >
        <Typography sx={{ textAlign: "left" }}>
          <RareItemIcon />
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
          {item.name && (
            <>
              {showRoll ? (
                <ClickableName name={item.name} onAction={handleSend} />
              ) : (
                <strong>{item.name}</strong>
              )}{" "}
              <Diamond />{" "}
            </>
          )}
          <SpanMarkdown>{item.effect}</SpanMarkdown>
        </Typography>
      </Grid>
    </Fragment>
  );
}

export function NpcRareGear({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  if (!npc.raregear?.length) return null;

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
          {t("Rare Equipment")}
        </Typography>
      </Grid>
      {npc.raregear.map((item, i) => (
        <RareGearRow key={i} item={item} npc={npc} showRoll={showRoll} />
      ))}
    </Grid>
  );
}
