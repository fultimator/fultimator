import {
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "/src/translation/translate";
import CustomTextarea from "/src/components/common/CustomTextarea";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import Clock from "/src/components/shared/actors/pc/playerSheet/Clock";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Casino,
  Delete,
  Menu as MenuIcon,
  Search,
  RestartAlt as RestartAltIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  RemoveCircleOutlined,
} from "@mui/icons-material";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";

function NoteContextMenu({
  note,
  npcName,
  onDelete,
  onMoveUp,
  onMoveDown,
  showMoveUp,
  showMoveDown,
}) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton component="span" onClick={open}>
        <MenuIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem
          onClick={() => {
            addMessage({
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              speaker: npcName || "NPC",
              kind: "display",
              itemType: "note",
              name: note.name,
              tags: [],
              description: note.effect || note.description,
              clocks: note.clocks?.map((clock) => ({
                sections: clock.sections,
                state: clock.state,
                name: clock.name,
              })),
            });
            close();
          }}
        >
          <ListItemIcon>
            <Casino />
          </ListItemIcon>
          <ListItemText>{t("Roll")}</ListItemText>
        </MenuItem>

        <Divider />
        <MenuItem
          disabled={!showMoveUp}
          onClick={() => {
            close();
            onMoveUp();
          }}
        >
          <ListItemIcon>
            <ArrowUpward fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Move Up")}</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!showMoveDown}
          onClick={() => {
            close();
            onMoveDown();
          }}
        >
          <ListItemIcon>
            <ArrowDownward fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Move Down")}</ListItemText>
        </MenuItem>
        <Divider />

        <MenuItem
          onClick={() => {
            close();
            onDelete();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete color="error" />
          </ListItemIcon>
          <ListItemText>{t("Delete")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default function EditNotes({ npc, setNpc }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingNoteIndex, setPendingNoteIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedSet, setExpandedSet] = useState(new Set());

  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [selectedClockIndex, setSelectedClockIndex] = useState(null);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);

  const [isDeleteClockDialogOpen, setIsDeleteClockDialogOpen] = useState(false);
  const [pendingClockDelete, setPendingClockDelete] = useState({
    noteIndex: null,
    clockIndex: null,
  });

  const toggleExpanded = (i) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const onChange = (i, key, value) => {
    setNpc((prev) => {
      const notes = [...(prev.notes || [])];
      notes[i] = { ...notes[i], [key]: value };
      return { ...prev, notes };
    });
  };

  const addNote = () => {
    setNpc((prev) => ({
      ...prev,
      notes: [
        ...(prev.notes || []),
        { name: "", description: "", effect: "", clocks: [] },
      ],
    }));
  };

  const removeNote = (i) => {
    setNpc((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((_, idx) => idx !== i),
    }));
  };

  const moveNote = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const notes = [...(prev.notes || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= notes.length ||
        toIndex >= notes.length
      ) {
        return prev;
      }
      [notes[fromIndex], notes[toIndex]] = [notes[toIndex], notes[fromIndex]];
      return { ...prev, notes };
    });
  };

  const openDeleteDialog = (i) => {
    setPendingNoteIndex(i);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClock = (noteIndex) => {
    setSelectedNoteIndex(noteIndex);
    setSelectedClockIndex(null);
    setClockName("");
    setClockSections(4);
    setClockDialogOpen(true);
  };

  const handleEditClock = (noteIndex, clockIndex) => {
    const clock = npc.notes[noteIndex].clocks[clockIndex];
    setSelectedNoteIndex(noteIndex);
    setSelectedClockIndex(clockIndex);
    setClockName(clock.name);
    setClockSections(clock.sections);
    setClockDialogOpen(true);
  };

  const handleClockDialogClose = () => {
    setClockDialogOpen(false);
    setSelectedNoteIndex(null);
    setSelectedClockIndex(null);
    setClockName("");
    setClockSections(4);
  };

  const handleClockDialogConfirm = () => {
    if (!clockName.trim()) {
      alert(t("Clock name is required."));
      return;
    }
    if (isNaN(clockSections) || clockSections < 2 || clockSections > 30) {
      alert(t("Sections must be between 2 and 30."));
      return;
    }

    setNpc((prev) => {
      const notes = prev.notes.map((note, index) => {
        if (index !== selectedNoteIndex) return note;

        let updatedClocks;
        if (selectedClockIndex !== null) {
          updatedClocks = note.clocks.map((clock, cIdx) => {
            if (cIdx !== selectedClockIndex) return clock;

            let newState = clock.state;
            if (clockSections !== clock.sections) {
              newState = new Array(clockSections).fill(false);
              for (
                let i = 0;
                i < Math.min(clock.sections, clockSections);
                i++
              ) {
                newState[i] = clock.state[i];
              }
            }

            return {
              ...clock,
              name: clockName,
              sections: clockSections,
              state: newState,
            };
          });
        } else {
          updatedClocks = [
            ...(note.clocks || []),
            {
              name: clockName,
              sections: clockSections,
              state: new Array(clockSections).fill(false),
            },
          ];
        }

        return { ...note, clocks: updatedClocks };
      });
      return { ...prev, notes };
    });

    handleClockDialogClose();
  };

  const handleClockStateChange = (noteIndex, clockIndex, newState) => {
    setNpc((prev) => {
      const notes = prev.notes.map((note, index) => {
        if (index !== noteIndex) return note;
        const clocks = note.clocks.map((clock, cIndex) =>
          cIndex === clockIndex ? { ...clock, state: newState } : clock,
        );
        return { ...note, clocks };
      });
      return { ...prev, notes };
    });
  };

  const resetClockState = (noteIndex, clockIndex) => {
    const resetState = new Array(
      npc.notes[noteIndex].clocks[clockIndex].sections,
    ).fill(false);
    handleClockStateChange(noteIndex, clockIndex, resetState);
  };

  const incrementClockState = (noteIndex, clockIndex) => {
    const clock = npc.notes[noteIndex].clocks[clockIndex];
    const currentFilled = clock.state.filter(Boolean).length;
    if (currentFilled < clock.sections) {
      const newState = new Array(clock.sections).fill(false);
      for (let i = 0; i <= currentFilled; i++) {
        newState[i] = true;
      }
      handleClockStateChange(noteIndex, clockIndex, newState);
    }
  };

  const decrementClockState = (noteIndex, clockIndex) => {
    const clock = npc.notes[noteIndex].clocks[clockIndex];
    const currentFilled = clock.state.filter(Boolean).length;
    if (currentFilled > 0) {
      const newState = [...clock.state];
      newState[currentFilled - 1] = false;
      handleClockStateChange(noteIndex, clockIndex, newState);
    }
  };

  const openDeleteClockDialog = (noteIndex, clockIndex) => {
    setPendingClockDelete({ noteIndex, clockIndex });
    setIsDeleteClockDialogOpen(true);
  };

  const removeClock = (noteIndex, clockIndex) => {
    setNpc((prev) => {
      const notes = prev.notes.map((note, index) => {
        if (index !== noteIndex) return note;
        return {
          ...note,
          clocks: (note.clocks || []).filter((_, idx) => idx !== clockIndex),
        };
      });
      return { ...prev, notes };
    });
  };

  return (
    <SectionCard
      title={t("Notes")}
      actions={
        <>
          <Tooltip title={t("Search Compendium")}>
            <IconButton
              size="small"
              onClick={() => setModalOpen(true)}
              sx={{ color: "#fff" }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("Add Note")}>
            <IconButton size="small" onClick={addNote} sx={{ color: "#fff" }}>
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <Box sx={{ p: 1 }}>
        {npc.notes?.map((note, i) => (
          <ItemRowCard
            key={i}
            label={note.name || t("(unnamed)")}
            subtitle={
              note.clocks && note.clocks.length > 0 ? (
                <Typography
                  noWrap
                  sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                >
                  {note.clocks
                    .map(
                      (clock) =>
                        `${clock.name}: ${clock.state.filter(Boolean).length}/${clock.sections}`,
                    )
                    .join(", ")}
                </Typography>
              ) : null
            }
            actions={
              <>
                <IconButton
                  component="span"
                  onClick={() => {
                    addMessage({
                      id: crypto.randomUUID(),
                      createdAt: Date.now(),
                      speaker: npc.name || "NPC",
                      kind: "display",
                      itemType: "note",
                      name: note.name,
                      tags: [],
                      description: note.effect || note.description,
                      clocks: note.clocks?.map((clock) => ({
                        sections: clock.sections,
                        state: clock.state,
                        name: clock.name,
                      })),
                    });
                  }}
                >
                  <Casino />
                </IconButton>
                <NoteContextMenu
                  note={note}
                  npcName={npc.name}
                  onDelete={() => openDeleteDialog(i)}
                  onMoveUp={() => moveNote(i, i - 1)}
                  onMoveDown={() => moveNote(i, i + 1)}
                  showMoveUp={i > 0}
                  showMoveDown={i < (npc.notes?.length ?? 0) - 1}
                />
              </>
            }
            onClick={() => toggleExpanded(i)}
            paperSx={{ mb: 0.5 }}
          >
            {expandedSet.has(i) && (
              <Box sx={{ p: 1 }}>
                <Grid container spacing={1}>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <TextField
                        label={t("Name:")}
                        value={note.name}
                        onChange={(e) => onChange(i, "name", e.target.value)}
                        size="small"
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <CustomTextarea
                        label={t("Description:")}
                        value={note.description ?? ""}
                        onChange={(e) =>
                          onChange(i, "description", e.target.value)
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <CustomTextarea
                        label={t("Effect:")}
                        value={note.effect ?? ""}
                        onChange={(e) => onChange(i, "effect", e.target.value)}
                      />
                    </FormControl>
                  </Grid>
                  <Grid
                    size={12}
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleAddClock(i)}
                      disabled={note.clocks && note.clocks.length >= 4}
                    >
                      {t("Add Clock")}
                    </Button>
                  </Grid>
                  {note.clocks && note.clocks.length > 0 && (
                    <Grid size={12}>
                      <Grid container spacing={1}>
                        {note.clocks.map((clock, clockIndex) => (
                          <Grid
                            key={clockIndex}
                            size={{ xs: 12, sm: 6, md: 4 }}
                          >
                            <Paper
                              elevation={1}
                              sx={{
                                p: 1.5,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "relative",
                              }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold", fontSize: "1.1em" }}
                                >
                                  {clock.name}
                                </Typography>
                                <Box>
                                  <IconButton
                                    onClick={() =>
                                      handleEditClock(i, clockIndex)
                                    }
                                    size="small"
                                    sx={{ p: 0, mr: 1 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    onClick={() =>
                                      openDeleteClockDialog(i, clockIndex)
                                    }
                                    size="small"
                                    sx={{
                                      color: theme.palette.error.main,
                                      p: 0,
                                    }}
                                  >
                                    <RemoveCircleOutlined fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>

                              <Clock
                                numSections={clock.sections}
                                size={100}
                                state={clock.state}
                                setState={(newState) =>
                                  handleClockStateChange(
                                    i,
                                    clockIndex,
                                    newState,
                                  )
                                }
                              />

                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Tooltip title={t("Decrement")}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      decrementClockState(i, clockIndex)
                                    }
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t("Reset")}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      resetClockState(i, clockIndex)
                                    }
                                  >
                                    <RestartAltIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t("Increment")}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      incrementClockState(i, clockIndex)
                                    }
                                  >
                                    <Add fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </ItemRowCard>
        ))}
      </Box>
      <CompendiumViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context="npc"
        initialType="notes"
        initialCompendium="personal"
        allowMultiSelect
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            notes: [
              ...(prev.notes || []),
              {
                name: item.name ?? "",
                description: item.description ?? "",
                effect: item.effect ?? "",
                clocks: [],
                fuid: item.fuid,
              },
            ],
          }));
        }}
      />
      <Dialog open={clockDialogOpen} onClose={handleClockDialogClose}>
        <DialogTitle variant="h3">
          {selectedClockIndex !== null ? t("Edit Clock") : t("Add Clock")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Enter the clock details below:")}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={t("Clock Name")}
            type="text"
            fullWidth
            variant="outlined"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleClockDialogConfirm();
              }
            }}
            slotProps={{
              htmlInput: { maxLength: 30 },
            }}
          />
          <TextField
            margin="dense"
            label={t("Clock Sections")}
            type="number"
            fullWidth
            variant="outlined"
            value={clockSections}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setClockSections(isNaN(value) ? "" : value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleClockDialogConfirm();
              }
            }}
            slotProps={{
              htmlInput: { min: 2, max: 30 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClockDialogClose}
            color="secondary"
            variant="contained"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleClockDialogConfirm}
            color="primary"
            variant="contained"
          >
            {selectedClockIndex !== null ? t("Save") : t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingNoteIndex(null);
        }}
        onConfirm={() => {
          if (pendingNoteIndex === null) return;
          removeNote(pendingNoteIndex);
          setIsDeleteDialogOpen(false);
          setPendingNoteIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingNoteIndex !== null
            ? npc.notes?.[pendingNoteIndex]?.name || ""
            : ""
        }
      />
      <DeleteConfirmationDialog
        open={isDeleteClockDialogOpen}
        onClose={() => {
          setIsDeleteClockDialogOpen(false);
          setPendingClockDelete({ noteIndex: null, clockIndex: null });
        }}
        onConfirm={() => {
          const { noteIndex, clockIndex } = pendingClockDelete;
          if (noteIndex !== null && clockIndex !== null) {
            removeClock(noteIndex, clockIndex);
          }
          setIsDeleteClockDialogOpen(false);
          setPendingClockDelete({ noteIndex: null, clockIndex: null });
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this clock?")}
        itemPreview={
          pendingClockDelete.noteIndex !== null &&
          pendingClockDelete.clockIndex !== null
            ? npc.notes?.[pendingClockDelete.noteIndex]?.clocks?.[
                pendingClockDelete.clockIndex
              ]?.name || t("Untitled Clock")
            : ""
        }
      />
    </SectionCard>
  );
}
