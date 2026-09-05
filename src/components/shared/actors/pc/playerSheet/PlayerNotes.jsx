import { useState } from "react";
import { Paper, IconButton, Tooltip, Box, Typography } from "@mui/material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { Add } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import NoteCard from "/src/components/shared/actors/common/NoteCard";
import { PlayerNoteModal } from "/src/components/shared/actors/pc/editors";
import { usePlayerSheetCompactStore } from "/src/store/playerSheetCompactStore";

export default function PlayerNotes({
  player,
  setPlayer,
  searchQuery = "",
  isEditMode = false,
  onAddNote,
  onEditNote,
  compact = false,
  defaultExpanded = false,
  speaker = "",
  showAll = false,
}) {
  const { t } = useTranslate();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Compact persistent tab uses store slices; all other modes use local state.
  const storeNoteRows = usePlayerSheetCompactStore((s) => s.openRows.notes);
  const storeToggleRow = usePlayerSheetCompactStore((s) => s.toggleRow);
  const [localOpenRows, setLocalOpenRows] = useState(() => {
    if (!defaultExpanded) return {};
    return Object.fromEntries(
      (player.notes || []).map((_, i) => [`note-${i}`, true]),
    );
  });

  const useStore = compact && !defaultExpanded;
  const isOpen = (noteKey, descriptionMatch) => {
    if (useStore) return !!storeNoteRows[noteKey] || descriptionMatch;
    // In showAll (tab) mode, notes are open by default unless explicitly closed
    if (showAll) return localOpenRows[noteKey] !== false || descriptionMatch;
    return !!localOpenRows[noteKey] || descriptionMatch;
  };
  const toggleRow = (noteKey) => {
    if (useStore) storeToggleRow("notes", noteKey);
    else if (showAll)
      setLocalOpenRows((prev) => ({
        ...prev,
        [noteKey]: prev[noteKey] === false,
      }));
    else setLocalOpenRows((prev) => ({ ...prev, [noteKey]: !prev[noteKey] }));
  };

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editNoteIndex, setEditNoteIndex] = useState(null);
  const [noteBeingEdited, setNoteBeingEdited] = useState(null);

  const handleAddNote =
    onAddNote ??
    (() => {
      setNoteBeingEdited(null);
      setEditNoteIndex(null);
      setOpenNoteModal(true);
    });

  const handleEditNote =
    onEditNote ??
    ((index) => {
      setNoteBeingEdited(player.notes[index]);
      setEditNoteIndex(index);
      setOpenNoteModal(true);
    });

  const handleSaveNote = (note) => {
    if (editNoteIndex !== null) {
      setPlayer((prev) => ({
        ...prev,
        notes: prev.notes.map((n, i) => (i === editNoteIndex ? note : n)),
      }));
    } else {
      setPlayer((prev) => ({ ...prev, notes: [...(prev.notes || []), note] }));
    }
    setOpenNoteModal(false);
  };

  const handleDeleteNote = (index) => {
    setPlayer((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
    setOpenNoteModal(false);
  };

  const visibleNotes = (player.notes || [])
    .map((note, index) => ({ ...note, originalIndex: index }))
    .filter((note) => showAll || note.showInPlayerSheet !== false)
    .filter(
      (note) =>
        !normalizedQuery ||
        note.name?.toLowerCase().includes(normalizedQuery) ||
        note.description?.toLowerCase().includes(normalizedQuery) ||
        note.clocks?.some((clock) =>
          clock?.name?.toLowerCase().includes(normalizedQuery),
        ),
    );

  if (visibleNotes.length === 0 && !isEditMode) return null;

  const noteList = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 1 }}>
      {visibleNotes.length === 0 && (
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ px: 0.5, py: 0.25 }}
        >
          {t("No notes.")}
        </Typography>
      )}
      {visibleNotes.map((note, noteIndex) => {
        const noteKey = `note-${noteIndex}`;
        const descriptionMatch =
          !!normalizedQuery &&
          !!note.description?.toLowerCase().includes(normalizedQuery);
        return (
          <NoteCard
            key={noteIndex}
            note={note}
            noteIndex={noteIndex}
            isOpen={isOpen(noteKey, descriptionMatch)}
            onToggle={() => toggleRow(noteKey)}
            setPlayer={setPlayer}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditNote}
            compact={compact}
            speaker={speaker}
          />
        );
      })}
    </Box>
  );

  const modal = !onAddNote && (
    <PlayerNoteModal
      open={openNoteModal}
      onClose={() => {
        setOpenNoteModal(false);
        setNoteBeingEdited(null);
        setEditNoteIndex(null);
      }}
      editNoteIndex={editNoteIndex}
      note={noteBeingEdited}
      onSaveNote={handleSaveNote}
      onDeleteNote={handleDeleteNote}
    />
  );

  if (compact) {
    return (
      <>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ mb: 1, overflow: "hidden" }}
        >
          <CompactSectionHeader title={t("Notes")}>
            {isEditMode && (
              <Tooltip title={t("Add Note")}>
                <IconButton
                  size="small"
                  onClick={handleAddNote}
                  sx={{ color: "#fff", p: "2px" }}
                >
                  <Add sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </CompactSectionHeader>
          {noteList}
        </Paper>
        {modal}
      </>
    );
  }

  return (
    <>
      <SectionCard
        title={t("Notes")}
        actions={
          isEditMode && (
            <IconButton
              size="small"
              onClick={handleAddNote}
              sx={{ p: 0.5, color: "#fff" }}
            >
              <Add fontSize="small" />
            </IconButton>
          )
        }
        sx={{ mb: 1 }}
      >
        {noteList}
      </SectionCard>
      {modal}
    </>
  );
}
