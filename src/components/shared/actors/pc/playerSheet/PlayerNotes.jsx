import { useState } from "react";
import { Paper, IconButton, Tooltip, Box } from "@mui/material";
import SectionCard from "../../common/SectionCard";
import { Add } from "@mui/icons-material";
import { useTranslate } from "../../../../../translation/translate";
import CompactSectionHeader from "../../pc-compact/CompactSectionHeader";
import NoteCard from "../../common/NoteCard";
import { PlayerNoteModal } from "/src/components/shared/actors/pc/editors";

export default function PlayerNotes({
  player,
  setPlayer,
  searchQuery = "",
  isEditMode = false,
  onAddNote,
  onEditNote,
  compact = false,
}) {
  const { t } = useTranslate();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const [openRows, setOpenRowsState] = useState({});
  const toggleRow = (key) =>
    setOpenRowsState((prev) => ({ ...prev, [key]: !prev[key] }));

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editNoteIndex, setEditNoteIndex] = useState(null);
  const [noteBeingEdited, setNoteBeingEdited] = useState(null);

  const handleAddNote = onAddNote ?? (() => {
    setNoteBeingEdited(null);
    setEditNoteIndex(null);
    setOpenNoteModal(true);
  });

  const handleEditNote = onEditNote ?? ((index) => {
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
    .filter((note) => note.showInPlayerSheet !== false)
    .filter((note) =>
      !normalizedQuery ||
      note.name?.toLowerCase().includes(normalizedQuery) ||
      note.description?.toLowerCase().includes(normalizedQuery) ||
      note.clocks?.some((clock) => clock?.name?.toLowerCase().includes(normalizedQuery)),
    );

  if (visibleNotes.length === 0 && !(isEditMode && handleAddNote)) return null;

  return (
    <>
      {compact ? (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ mb: 1, overflow: "hidden" }}
        >
          <CompactSectionHeader title={t("Notes")}>
            {isEditMode && (
              <Tooltip title={t("Add Note")}>
                <IconButton size="small" onClick={handleAddNote} sx={{ color: "#fff", p: "2px" }}>
                  <Add sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </CompactSectionHeader>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 1 }}>
            {visibleNotes.map((note, noteIndex) => {
              const noteKey = `note-${noteIndex}`;
              const descriptionMatchesQuery = !!normalizedQuery && !!note.description?.toLowerCase().includes(normalizedQuery);
              const isOpen = !!openRows[noteKey] || descriptionMatchesQuery;
              return (
                <NoteCard
                  key={noteIndex}
                  note={note}
                  noteIndex={noteIndex}
                  isOpen={isOpen}
                  onToggle={() => toggleRow(noteKey)}
                  setPlayer={setPlayer}
                  searchQuery={searchQuery}
                  isEditMode={isEditMode}
                  onEdit={handleEditNote}
                  compact={compact}
                />
              );
            })}
          </Box>
        </Paper>
      ) : (
        <SectionCard
          title={t("Notes")}
          actions={
            isEditMode && (
              <IconButton size="small" onClick={handleAddNote} sx={{ p: 0.5, color: "#fff" }}>
                <Add fontSize="small" />
              </IconButton>
            )
          }
          sx={{ mb: 1 }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 1 }}>
            {visibleNotes.map((note, noteIndex) => {
              const noteKey = `note-${noteIndex}`;
              const descriptionMatchesQuery = !!normalizedQuery && !!note.description?.toLowerCase().includes(normalizedQuery);
              const isOpen = !!openRows[noteKey] || descriptionMatchesQuery;
              return (
                <NoteCard
                  key={noteIndex}
                  note={note}
                  noteIndex={noteIndex}
                  isOpen={isOpen}
                  onToggle={() => toggleRow(noteKey)}
                  setPlayer={setPlayer}
                  searchQuery={searchQuery}
                  isEditMode={isEditMode}
                  onEdit={handleEditNote}
                  compact={compact}
                />
              );
            })}
          </Box>
        </SectionCard>
      )}

      {!onAddNote && (
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
      )}
    </>
  );
}
