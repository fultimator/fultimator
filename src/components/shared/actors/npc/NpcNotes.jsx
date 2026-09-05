import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";

import {
  useActorCardSetup,
  isInteractive,
} from "/src/components/shared/actors/core-utils";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import Diamond from "/src/components/Diamond";
import { NotesIcon } from "/src/components/icons";
import { SpanMarkdown, ClickableName } from "./NpcMarkdown";

function NoteRow({ note, npc, showRoll }) {
  const addMessage = useAddChatMessage();

  const handleSend = (e) => {
    e.stopPropagation();
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: npc.name || "NPC",
      kind: "display",
      itemType: "note",
      name: note.name,
      tags: [],
      description: note.effect,
    });
  };

  return (
    <Fragment>
      <Grid sx={{ pl: 2, py: 1 }} size={1}>
        <Typography sx={{ textAlign: "center" }}>
          <NotesIcon />
        </Typography>
      </Grid>
      <Grid sx={{ pl: 1, pr: 5, py: 1 }} size={11}>
        <Typography component="div">
          {showRoll ? (
            <ClickableName name={note.name} onAction={handleSend} />
          ) : (
            <strong>{note.name}</strong>
          )}{" "}
          <Diamond /> <SpanMarkdown>{note.effect}</SpanMarkdown>
        </Typography>
      </Grid>
    </Fragment>
  );
}

export function NpcNotes({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  if (!npc.notes?.length) return null;

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
          {t("Notes")}
        </Typography>
      </Grid>
      {npc.notes.map((note, i) => (
        <NoteRow key={i} note={note} npc={npc} showRoll={showRoll} />
      ))}
    </Grid>
  );
}
