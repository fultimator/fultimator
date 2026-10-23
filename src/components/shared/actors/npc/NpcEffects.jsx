import React from "react";
import { Grid, Typography } from "@mui/material";
import { useActorCardSetup } from "/src/components/shared/actors/core-utils";
import Diamond from "/src/components/Diamond";
import { SpanMarkdown } from "./NpcMarkdown";
import { summarizeEffectChanges } from "./editors/effectChangeSummary";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// Enabled effects with a name, summary, or description; disabled ones are hidden.
function visibleEffects(npc) {
  return asArray(npc.effects).filter((effect) => {
    if (!effect || effect.disabled) return false;
    const summary = summarizeEffectChanges(effect);
    const hasDescription = asArray(effect.behaviors).some(
      (b) => typeof b?.description === "string" && b.description.trim(),
    );
    return Boolean(summary) || hasDescription || Boolean(effect.name);
  });
}

function EffectRow({ effect }) {
  const summary = summarizeEffectChanges(effect);
  const description = asArray(effect.behaviors)
    .map((b) =>
      typeof b?.description === "string" ? b.description.trim() : "",
    )
    .find(Boolean);

  return (
    <Grid sx={{ px: 3, py: 0.5 }} size={12}>
      <Typography component="div">
        <strong>{effect.name}</strong>
        {summary && (
          <>
            {" "}
            <Diamond /> {summary}
          </>
        )}
        {description && (
          <>
            {" "}
            <Diamond /> <SpanMarkdown>{description}</SpanMarkdown>
          </>
        )}
      </Typography>
    </Grid>
  );
}

export function NpcEffects({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const effects = visibleEffects(npc);

  if (effects.length === 0) return null;

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
          {t("effects")}
        </Typography>
      </Grid>
      {effects.map((effect, i) => (
        <EffectRow key={effect.id ?? i} effect={effect} />
      ))}
    </Grid>
  );
}
