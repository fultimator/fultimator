import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { useActorCardSetup, isInteractive } from "/src/components/shared/actors/core-utils";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import Diamond from "/src/components/Diamond";
import { SpanMarkdown, ClickableName } from "./NpcMarkdown";

function SpecialRow({ item, npc, showRoll }) {
  const addMessage = useAddChatMessage();

  const handleSend = (e) => {
    e.stopPropagation();
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: npc.name || "NPC",
      kind: "display",
      itemType: "special",
      name: item.name,
      tags: [`SP: ${item.spCost ?? 1}`],
      description: item.effect,
    });
  };

  return (
    <Fragment>
      <Grid sx={{ px: 3, py: 0.5 }} size={12}>
        <Typography component="div">
          <span style={{ display: "inline" }}>
            {showRoll ? (
              <ClickableName name={item.name} onAction={handleSend} />
            ) : (
              <strong>{item.name}</strong>
            )}{" "}
            <Diamond />{" "}
          </span>
          <SpanMarkdown>{item.effect}</SpanMarkdown>
        </Typography>
      </Grid>
    </Fragment>
  );
}

export function NpcSpecialRules({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  const special = [...(npc.special ?? [])];

  if (npc.species === "Construct") {
    special.push({
      name: t("Construct"),
      effect: t(
        "Immune to **poison** damage and Resistant to **earth** damage, and immune to poisoned.",
        true,
      ),
    });
  }
  if (npc.species === "Undead") {
    special.push({
      name: t("Undead"),
      effect: t(
        "Immune to **poisoned** status and additionally, when an effect (such as an Arcanum, a potion or a spell) would cause an undead creature to recover Hit Points, whoever controls that effect may instead have the undead lose half as many Hit Points.",
        true,
      ),
    });
  }
  if (npc.species === "Plant") {
    special.push({
      name: t("Plant"),
      effect: t("Immune to **dazed**, **shaken**, **enraged** status", true),
    });
  }

  if (special.length === 0) return null;

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
          {t("Special Rules")}
        </Typography>
      </Grid>
      {special.map((item, i) => (
        <SpecialRow key={i} item={item} npc={npc} showRoll={showRoll} />
      ))}
    </Grid>
  );
}
