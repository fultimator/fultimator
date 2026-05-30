import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ActorEditModal from "../../../../../forms/ui/ActorEditModal";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import { useTheme } from "@mui/material/styles";
import { useDeleteConfirmation } from "../../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../../common/DeleteConfirmationDialog";
import { usePlayerSheetCompactStore } from "../../../../../store/playerSheetCompactStore";
import { PlayerNoteModal } from "/src/components/shared/actors/pc/editors";
import BondCard from "../../common/BondCard";
import NoteCard from "../../common/NoteCard";
import CompactSectionHeader from "../CompactSectionHeader";

const POSITIVE = ["admiration", "loyality", "affection"];
const NEGATIVE = ["inferiority", "mistrust", "hatred"];
// Bond section

function BondsSection({ player, setPlayer, isEditMode, searchQuery, t, theme }) {
  const muiTheme = useTheme();
  const positiveColor = muiTheme.palette.success.main;
  const negativeColor = muiTheme.palette.error.main;

  const [editBondIndex, setEditBondIndex] = useState(null);
  const [isCreatingBond, setIsCreatingBond] = useState(false);
  const [draftBond, setDraftBond] = useState(null);
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const bonds = useMemo(() => player.info?.bonds ?? [], [player.info?.bonds]);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (!isCreatingBond && editBondIndex !== null && bonds[editBondIndex]) {
      setDraftBond({ ...bonds[editBondIndex] });
    }
  }, [isCreatingBond, editBondIndex, bonds]);

  const closeModal = () => {
    setEditBondIndex(null);
    setIsCreatingBond(false);
    setDraftBond(null);
    setDeleteDialogOpen(false);
  };

  const openAddBond = () => {
    if (bonds.length >= 6) return;
    setIsCreatingBond(true);
    setEditBondIndex(null);
    setDraftBond({ name: "", admiration: false, loyality: false, affection: false, inferiority: false, mistrust: false, hatred: false });
  };

  const handlePairToggle = (positiveKey, negativeKey) => (_event, value) => {
    setDraftBond((prev) => ({ ...prev, [positiveKey]: value === positiveKey, [negativeKey]: value === negativeKey }));
  };

  const saveBond = () => {
    if (isCreatingBond) {
      setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: [...(prev.info?.bonds ?? []), { ...draftBond }] } }));
      closeModal();
      return;
    }
    const updated = bonds.map((b, i) => i === editBondIndex ? { ...draftBond } : b);
    setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: updated } }));
    closeModal();
  };

  const deleteBond = (index) => {
    const updated = bonds.filter((_, i) => i !== index);
    setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: updated } }));
    closeModal();
  };

  const visibleBonds = bonds
    .map((bond, i) => ({ ...bond, originalIndex: i }))
    .filter((bond) => {
      if (!normalizedQuery) return true;
      const sentiments = [...POSITIVE, ...NEGATIVE].filter((s) => bond[s]).map((s) => t(s.charAt(0).toUpperCase() + s.slice(1))).join(" ");
      return bond.name?.toLowerCase().includes(normalizedQuery) || sentiments.toLowerCase().includes(normalizedQuery);
    });

  if (visibleBonds.length === 0 && !isEditMode) return null;

  return (
    <>
      <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
        <CompactSectionHeader title={t("Bonds")}>
          {isEditMode && (
            <Tooltip title={t("Add Bond")}>
              <span>
                <IconButton size="small" sx={{ p: "2px", color: "#fff" }} onClick={openAddBond} disabled={bonds.length >= 6}>
                  <AddIcon sx={{ fontSize: "1.15rem" }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </CompactSectionHeader>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", p: "6px" }}>
          {visibleBonds.map((bond) => (
            <BondCard
              key={bond.originalIndex}
              bond={bond}
              isEditMode={isEditMode}
              searchQuery={searchQuery}
              onEdit={() => setEditBondIndex(bond.originalIndex)}
              compact
            />
          ))}
          {isEditMode && bonds.length < 6 && !normalizedQuery && (
            <Box
              onClick={openAddBond}
              sx={{
                border: "2px dashed", borderColor: "divider", borderRadius: "4px",
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 56, cursor: "pointer",
                "&:hover": { bgcolor: "action.hover", borderColor: theme.primary },
                transition: "border-color 0.15s ease",
              }}
            >
              <AddIcon sx={{ color: "text.secondary", fontSize: "1.5rem" }} />
            </Box>
          )}
        </Box>
      </Paper>

      {(isCreatingBond || editBondIndex !== null) && draftBond && (
        <ActorEditModal
          open
          onClose={closeModal}
          onConfirm={saveBond}
          title={isCreatingBond ? t("Add Bond") : t("Edit Bond")}
          subtitle={t("Set the bond name and sentiments. Opposed sentiments auto-exclude each other.")}
          maxWidth="sm"
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isCreatingBond && (
                <Button variant="contained" color="error" onClick={handleDelete}>{t("Delete")}</Button>
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={closeModal}>{t("Cancel")}</Button>
              <Button variant="contained" color="primary" onClick={saveBond}>{t("Save")}</Button>
            </Box>
          }
        >
          <Box sx={{ mt: 0.5 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("Bond Name")}
                  value={draftBond.name}
                  onChange={(e) => setDraftBond((prev) => ({ ...prev, name: e.target.value }))}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                />
              </Grid>
              {[
                [{ key: "admiration", label: t("Admiration"), color: positiveColor }, { key: "inferiority", label: t("Inferiority"), color: negativeColor }],
                [{ key: "loyality", label: t("Loyality"), color: positiveColor }, { key: "mistrust", label: t("Mistrust"), color: negativeColor }],
                [{ key: "affection", label: t("Affection"), color: positiveColor }, { key: "hatred", label: t("Hatred"), color: negativeColor }],
              ].map((pair) => (
                <Grid key={pair[0].key} size={12}>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, alignItems: "center", justifyContent: "space-between", p: 0.75, borderRadius: 1, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                    <ToggleButtonGroup
                      exclusive
                      value={draftBond[pair[0].key] ? pair[0].key : draftBond[pair[1].key] ? pair[1].key : null}
                      onChange={handlePairToggle(pair[0].key, pair[1].key)}
                      sx={{ width: "100%", "& .MuiToggleButtonGroup-grouped": { flex: 1, minHeight: 34, borderColor: "divider", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.02em", fontSize: "0.78rem", px: 1 } }}
                    >
                      <ToggleButton value={pair[0].key} sx={{ color: pair[0].color, "&.Mui-selected": { color: pair[0].color, bgcolor: "rgba(76, 175, 80, 0.11)" } }}>
                        {pair[0].label}
                      </ToggleButton>
                      <ToggleButton value={pair[1].key} sx={{ color: pair[1].color, "&.Mui-selected": { color: pair[1].color, bgcolor: "rgba(244, 67, 54, 0.1)" } }}>
                        {pair[1].label}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, px: 0.75, letterSpacing: "0.04em" }}>
                      {t("OR")}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </ActorEditModal>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => deleteBond(editBondIndex)}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to remove this bond?")}
        itemPreview={
          draftBond && (
            <Box>
              <Typography variant="h4" sx={{ textTransform: "uppercase" }}>{draftBond.name}</Typography>
              {[...POSITIVE, ...NEGATIVE].filter((s) => draftBond[s]).map((s) => (
                <Typography key={s} variant="body2" sx={{ color: POSITIVE.includes(s) ? "success.main" : "error.main" }}>
                  {t(s.charAt(0).toUpperCase() + s.slice(1))}
                </Typography>
              ))}
            </Box>
          )
        }
      />
    </>
  );
}
// Notes section

function NotesSection({ player, setPlayer, isEditMode, searchQuery, t }) {
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [editNoteIndex, setEditNoteIndex] = useState(null);
  const [noteBeingEdited, setNoteBeingEdited] = useState(null);

  const handleAddNote = () => {
    setNoteBeingEdited(null);
    setEditNoteIndex(null);
    setOpenNoteModal(true);
  };

  const handleEditNote = (index) => {
    setNoteBeingEdited(player.notes[index]);
    setEditNoteIndex(index);
    setOpenNoteModal(true);
  };

  const handleSaveNote = (note) => {
    if (editNoteIndex !== null) {
      setPlayer((prev) => ({ ...prev, notes: prev.notes.map((n, i) => (i === editNoteIndex ? note : n)) }));
    } else {
      setPlayer((prev) => ({ ...prev, notes: [...(prev.notes || []), note] }));
    }
    setOpenNoteModal(false);
  };

  const handleDeleteNote = (index) => {
    setPlayer((prev) => ({ ...prev, notes: prev.notes.filter((_, i) => i !== index) }));
    setOpenNoteModal(false);
  };

  const visibleNotes = (player.notes || [])
    .map((note, index) => ({ ...note, originalIndex: index }))
    .filter((note) =>
      !normalizedQuery ||
      note.name?.toLowerCase().includes(normalizedQuery) ||
      note.description?.toLowerCase().includes(normalizedQuery) ||
      note.clocks?.some((clock) => clock?.name?.toLowerCase().includes(normalizedQuery)),
    );

  if (visibleNotes.length === 0 && !isEditMode) return null;

  return (
    <>
      <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
        <CompactSectionHeader title={t("Notes")}>
          {isEditMode && (
            <Tooltip title={t("Add Note")}>
              <IconButton size="small" onClick={handleAddNote} sx={{ color: "#fff", p: "2px" }}>
                <AddIcon sx={{ fontSize: "1.15rem" }} />
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
                onEdit={handleEditNote}
                compact
              />
            );
          })}
        </Box>
      </Paper>

      <PlayerNoteModal
        open={openNoteModal}
        onClose={() => { setOpenNoteModal(false); setNoteBeingEdited(null); setEditNoteIndex(null); }}
        editNoteIndex={editNoteIndex}
        note={noteBeingEdited}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
      />
    </>
  );
}
// Main export

export default function NoteTab({ player, setPlayer, isEditMode = false, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <BondsSection player={player} setPlayer={setPlayer} isEditMode={isEditMode} searchQuery={searchQuery} t={t} theme={theme} />
      <NotesSection player={player} setPlayer={setPlayer} isEditMode={isEditMode} searchQuery={searchQuery} t={t} />
    </Box>
  );
}
