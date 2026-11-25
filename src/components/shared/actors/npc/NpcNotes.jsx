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

function NoteRow({ note, npc, showRoll, t }) {
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
      clocks: note.clocks?.map((clock) => ({
        sections: clock.sections,
        state: clock.state,
        name: clock.name,
      })),
    });
  };

  const clockSummaries = note.clocks ?? [];

  return (
    <Fragment>
      <Grid
        sx={{ pl: 2, pr: 0, py: 0.25, width: 40, flexShrink: 0 }}
        size="auto"
      >
        <Typography sx={{ textAlign: "left", "& svg": { width: "1.1em" } }}>
          <NotesIcon />
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
          {note.name &&
            (showRoll ? (
              <ClickableName name={note.name} onAction={handleSend} />
            ) : (
              <strong>{note.name}</strong>
            ))}{" "}
          {clockSummaries.map((clock, i) => (
            <Fragment key={i}>
              {(note.name || i > 0) && (
                <>
                  <Diamond />{" "}
                </>
              )}
              <strong>
                {t("npc_note_clock_sections", [clock.sections])}
                {clock.name ? ` (${clock.name})` : ""}
              </strong>{" "}
            </Fragment>
          ))}
          {(note.name || clockSummaries.length > 0) && note.effect && (
            <>
              <Diamond />{" "}
            </>
          )}
          <SpanMarkdown>{note.effect}</SpanMarkdown>
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
          {t("Notes")}
        </Typography>
      </Grid>
      {npc.notes.map((note, i) => (
        <NoteRow key={i} note={note} npc={npc} showRoll={showRoll} t={t} />
      ))}
    </Grid>
  );
}
