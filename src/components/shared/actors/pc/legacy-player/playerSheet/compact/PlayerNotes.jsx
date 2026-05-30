import { Paper, IconButton, Box, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { usePlayerSheetCompactStore } from "/src/store/playerSheetCompactStore";
import CompactSectionHeader from "/src/components/shared/actors/pc-compact/CompactSectionHeader";
import NoteCard from "/src/components/shared/actors/common/NoteCard";

export default function PlayerNotes({
  player,
  setPlayer,
  searchQuery = "",
  isEditMode = false,
  onAddNote,
  onEditNote,
}) {
  const { t } = useTranslate();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleNotes = (player.notes || [])
    .map((note, index) => ({ ...note, originalIndex: index }))
    .filter((note) =>
      !normalizedQuery ||
      note.name?.toLowerCase().includes(normalizedQuery) ||
      note.description?.toLowerCase().includes(normalizedQuery) ||
      note.clocks?.some((clock) => clock?.name?.toLowerCase().includes(normalizedQuery)),
    );

  if (visibleNotes.length === 0 && !(isEditMode && onAddNote)) return null;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader title={t("Notes")}>
        {isEditMode && onAddNote && (
          <Tooltip title={t("Add Note")}>
            <IconButton size="small" onClick={onAddNote} sx={{ color: "#fff", p: "2px" }}>
              <Add sx={{ fontSize: "1.15rem" }} />
            </IconButton>
          </Tooltip>
        )}
      </CompactSectionHeader>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "4px" }}>
        {visibleNotes.map((note, noteIndex) => {
          const noteKey = `note-${noteIndex}`;
          const descriptionMatchesQuery = !!normalizedQuery && !!note.description?.toLowerCase().includes(normalizedQuery);
          const isOpen = !!openRows.notes[noteKey] || descriptionMatchesQuery;
          return (
            <NoteCard
              key={noteIndex}
              note={note}
              noteIndex={noteIndex}
              isOpen={isOpen}
              onToggle={() => toggleRow("notes", noteKey)}
              setPlayer={setPlayer}
              searchQuery={searchQuery}
              isEditMode={isEditMode}
              onEdit={onEditNote}
              compact
            />
          );
        })}
      </Box>
    </Paper>
  );
}
