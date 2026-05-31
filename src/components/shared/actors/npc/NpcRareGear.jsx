import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { useActorCardSetup, isInteractive } from "/src/components/shared/actors/core-utils";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import Diamond from "/src/components/Diamond";
import { RareItemIcon } from "/src/components/icons";
import { SpanMarkdown, ClickableName } from "./shared";

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
      <Grid sx={{ px: 1, py: 0.5 }} size={1}>
        <Typography sx={{ textAlign: "center" }}>
          <RareItemIcon />
        </Typography>
      </Grid>
      <Grid sx={{ px: 1, py: 0.5 }} size={11}>
        <Typography component="div">
          {showRoll ? (
            <ClickableName name={item.name} onAction={handleSend} />
          ) : (
            <strong>{item.name}</strong>
          )}{" "}
          <Diamond /> <SpanMarkdown>{item.effect}</SpanMarkdown>
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
          {t("Rare Equipment")}
        </Typography>
      </Grid>
      {npc.raregear.map((item, i) => (
        <RareGearRow key={i} item={item} npc={npc} showRoll={showRoll} />
      ))}
    </Grid>
  );
}
