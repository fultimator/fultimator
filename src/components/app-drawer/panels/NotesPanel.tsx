import React, { useEffect, useState } from "react";
import { Box, Divider, IconButton, TextField, Typography } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

const LOCAL_NOTES_KEY = "fultimator-local-notes";

// TODO: placeholder, replace with real roll history / chat feature
export const NotesPanel: React.FC = () => {
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_NOTES_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setNotes(parsed.filter((item) => typeof item === "string"));
      }
    } catch {
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
    } catch {
      // Ignore storage errors (private mode / quota exceeded)
    }
  }, [notes]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setNotes((prev) => [...prev, trimmed]);
    setInput("");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
          }}
        >
          Chat
        </Typography>
      </Box>

      <Box
        sx={{
          px: 2,
          pb: 2,
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {notes.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Placeholder for roll history / chat log feature.
          </Typography>
        )}
        {notes.map((note, index) => (
          <Box
            key={`${note}-${index}`}
            sx={{
              alignSelf: "flex-start",
              maxWidth: "90%",
              px: 1.25,
              py: 0.9,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default",
            }}
          >
            <Typography variant="body2">{note}</Typography>
          </Box>
        ))}
      </Box>

      <Divider />

      <Box sx={{ p: 1.25, pt: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write to chat..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <IconButton
            size="small"
            color="primary"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
