import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useCustomTheme } from "../hooks/useCustomTheme";
import { useTranslate } from "../translation/translate";
import { useAddChatMessage } from "../hooks/useAddChatMessage";
import ClockControls from "./shared/actors/pc/variants/compact/ClockControls";

const NpcClockList = ({ npc, setNpc }) => {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const addMessage = useAddChatMessage();

  const clockEntries = (npc.notes || []).flatMap((note, noteIndex) =>
    (note.clocks || []).map((clock, clockIndex) => ({
      noteIndex,
      clockIndex,
      noteName: note.name,
      note,
      clock,
    })),
  );

  if (clockEntries.length === 0) return null;

  const sendClockToChat = (note, clock) => {
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: npc.name || "NPC",
      kind: "display",
      itemType: "note",
      name: note.name,
      tags: [],
      description: note.effect || note.description,
      clock: {
        sections: clock.sections,
        state: clock.state,
        name: clock.name,
      },
    });
  };

  const persistState = (noteIndex, clockIndex, newState) => {
    setNpc((prev) => {
      const notes = (prev.notes || []).map((note, ni) =>
        ni !== noteIndex
          ? note
          : {
              ...note,
              clocks: note.clocks.map((c, ci) =>
                ci !== clockIndex ? c : { ...c, state: newState },
              ),
            },
      );
      return { ...prev, notes };
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "10px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: theme.secondary,
        mt: 2,
      }}
    >
      <Typography
        sx={{
          mb: 1,
          fontFamily: "Antonio",
          textTransform: "uppercase",
          fontSize: "1.3rem",
          color: theme.white,
          background: theme.primary,
          padding: "2px 10px",
          borderRadius: "4px",
        }}
      >
        {t("Clocks")}
      </Typography>
      <Grid container spacing={0.75}>
        {clockEntries.map(
          ({ noteIndex, clockIndex, noteName, note, clock }) => (
            <Grid key={`${noteIndex}-${clockIndex}`} size={12}>
              <ClockControls
                sections={clock.sections}
                state={clock.state}
                setState={(newState) =>
                  persistState(noteIndex, clockIndex, newState)
                }
                label={
                  <Typography
                    component="span"
                    onClick={() => sendClockToChat(note, clock)}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      lineHeight: 1.3,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    noWrap
                  >
                    {clock.name}
                  </Typography>
                }
                secondaryLabel={
                  noteName ? (
                    <Typography
                      component="span"
                      onClick={() => sendClockToChat(note, clock)}
                      sx={{
                        fontSize: "0.78rem",
                        lineHeight: 1.3,
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      noWrap
                    >
                      {noteName}
                    </Typography>
                  ) : null
                }
                theme={{ primary: theme.primary }}
                clockSize={44}
                compact
              />
            </Grid>
          ),
        )}
      </Grid>
    </Paper>
  );
};

export default NpcClockList;
