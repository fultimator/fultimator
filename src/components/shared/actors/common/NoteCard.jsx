import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Edit, ChatOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import ClockControls from "/src/components/shared/actors/pc/variants/compact/ClockControls";
import { highlightMatch } from "/src/components/shared/actors/core-utils";
import { highlightMarkdownText } from "/src/components/shared/actors/pc/variants/compact/highlightUtils";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import ItemRowCard from "./ItemRowCard";

function NoteClockCard({ clock, clockIndex, noteOriginalIndex, setPlayer, searchQuery, compact, primary }) {
  const theme = { primary };
  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      notes: prev.notes.map((note, ni) =>
        ni !== noteOriginalIndex ? note : {
          ...note,
          clocks: note.clocks.map((c, ci) => ci !== clockIndex ? c : { ...c, state: newState }),
        },
      ),
    }));
  };

  return (
    <ClockControls
      sections={clock.sections}
      state={clock.state}
      setState={persistState}
      clockSize={compact ? 36 : 60}
      compact={compact}
      label={
        <Typography
          sx={{ fontWeight: "bold", fontSize: compact ? "0.85rem" : "0.9rem", lineHeight: 1.3 }}
          noWrap
        >
          {highlightMatch(clock.name, searchQuery)}
        </Typography>
      }
      theme={theme}
    />
  );
}

export default function NoteCard({
  note,
  noteIndex,
  isOpen,
  onToggle,
  setPlayer,
  searchQuery = "",
  isEditMode = false,
  onEdit,
  compact = false,
  speaker = "",
}) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;

  const handleSendToChat = (e) => {
    e.stopPropagation();
    sendDisplayMessage("note", note.name, { description: note.description ?? "", speaker });
  };
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleClocks = (note.clocks || [])
    .map((clock, originalIdx) => ({ clock, originalIdx }))
    .filter(({ clock }) => !normalizedQuery || clock?.name?.toLowerCase().includes(normalizedQuery));

  const clockGridCols = compact
    ? "1fr"
    : "repeat(auto-fill, minmax(160px, 1fr))";

  const hasDescription = !!note.description;
  const hasClocks = visibleClocks.length > 0;

  const actions = (
    <>
      <Tooltip title={t("Send to chat")} arrow>
        <IconButton size="small" onClick={handleSendToChat}>
          <ChatOutlined />
        </IconButton>
      </Tooltip>
      {isEditMode && onEdit && (
        <Tooltip title={t("Edit Note")} arrow>
          <IconButton size="small" onClick={() => onEdit(note.originalIndex)}>
            <Edit />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const body = hasDescription && isOpen ? (
    <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
      <NotesMarkdown uniform fontSize="1rem">
        {highlightMarkdownText(note.description, searchQuery)}
      </NotesMarkdown>
    </Box>
  ) : null;

  const clocks = hasClocks ? (
    <Box sx={{ display: "grid", gridTemplateColumns: clockGridCols, gap: "4px", mt: "4px", mb: compact ? 0 : 1.5 }}>
      {visibleClocks.map(({ clock, originalIdx }) => (
        <NoteClockCard
          key={`clock-${noteIndex}-${originalIdx}`}
          clock={clock}
          clockIndex={originalIdx}
          noteOriginalIndex={note.originalIndex}
          setPlayer={setPlayer}
          searchQuery={searchQuery}
          compact={compact}
          primary={primary}
        />
      ))}
    </Box>
  ) : null;

  if (compact) {
    return (
      <React.Fragment>
        <ItemRowCard
          compact
          onCardClick={hasDescription ? onToggle : undefined}
          variant="outlined"
          label={
            <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>
              {highlightMatch(note.name, searchQuery)}
            </Typography>
          }
          actions={actions}
        >
          {body}
        </ItemRowCard>
        {clocks}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <ItemRowCard
        onCardClick={hasDescription ? onToggle : undefined}
        elevation={3}
        paperSx={{ mb: 1.5, borderRadius: "8px" }}
        label={
          <Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "1.0rem", sm: "1.1rem" }, textTransform: "uppercase", lineHeight: 1.3 }}>
            {highlightMatch(note.name, searchQuery)}
          </Typography>
        }
        actions={actions}
      >
        {body}
      </ItemRowCard>
      {clocks}
    </React.Fragment>
  );
}
