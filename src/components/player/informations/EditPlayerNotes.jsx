import React, { useState, useRef } from "react";
import {
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import RemoveCircleOutlined from "@mui/icons-material/RemoveCircleOutlined";
import { Add } from "@mui/icons-material";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";
import Clock from "../playerSheet/Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import { Tooltip, Stack } from "@mui/material";

export default function EditPlayerNotes({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [open, setOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [selectedClockIndex, setSelectedClockIndex] = useState(null);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);

  const noteToDeleteIndexRef = useRef(null);
  const clockToDeleteRef = useRef({ noteIndex: null, clockIndex: null });

  const {
    isOpen: deleteNoteDialogOpen,
    closeDialog: closeDeleteNoteDialog,
    handleDelete: handleDeleteNoteAction,
  } = useDeleteConfirmation({
    onConfirm: () => {
      const idx = noteToDeleteIndexRef.current;
      if (idx !== null) {
        setPlayer((prevState) => {
          return {
            ...prevState,
            notes: prevState.notes.filter((_, index) => index !== idx),
          };
        });
      }
      noteToDeleteIndexRef.current = null;
      setNoteToDeleteIndex(null);
    },
  });

  const {
    isOpen: deleteClockDialogOpen,
    closeDialog: closeDeleteClockDialog,
    handleDelete: handleDeleteClockAction,
  } = useDeleteConfirmation({
    onConfirm: () => {
      const { noteIndex, clockIndex } = clockToDeleteRef.current;
      if (noteIndex !== null && clockIndex !== null) {
        setPlayer((prevState) => {
          const notes = prevState.notes.map((note, index) => {
            if (index !== noteIndex) return note;
            return {
              ...note,
              clocks: (note.clocks || []).filter((_, idx) => idx !== clockIndex),
            };
          });
          return { ...prevState, notes };
        });
      }
      clockToDeleteRef.current = { noteIndex: null, clockIndex: null };
      setClockToDelete({ noteIndex: null, clockIndex: null });
    },
  });

  const [noteToDeleteIndex, setNoteToDeleteIndex] = useState(null);
  const [clockToDelete, setClockToDelete] = useState({ noteIndex: null, clockIndex: null });
  const isSubmittingRef = useRef(false);
  const isAddingNoteRef = useRef(false);

  const handleNoteNameChange = (key) => (e) => {
    const value = e.target.value;
    setPlayer((prevState) => {
      const notes = prevState.notes.map((note, index) =>
        index === key ? { ...note, name: value } : note
      );
      return { ...prevState, notes };
    });
  };

  const handleNoteDescriptionChange = (key) => (e) => {
    const value = e.target.value;
    setPlayer((prevState) => {
      const notes = prevState.notes.map((note, index) =>
        index === key ? { ...note, description: value } : note
      );
      return { ...prevState, notes };
    });
  };

  const removeItem = (key) => (e) => {
    noteToDeleteIndexRef.current = key;
    setNoteToDeleteIndex(key);
    handleDeleteNoteAction(e);
  };

  const handleAddClock = (index) => {
    setSelectedNoteIndex(index);
    setSelectedClockIndex(null);
    setClockName("");
    setClockSections(4);
    setOpen(true);
  };

  const handleEditClock = (noteIndex, clockIndex) => {
    const clock = player.notes[noteIndex].clocks[clockIndex];
    setSelectedNoteIndex(noteIndex);
    setSelectedClockIndex(clockIndex);
    setClockName(clock.name);
    setClockSections(clock.sections);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNoteIndex(null);
    setSelectedClockIndex(null);
    setClockName("");
    setClockSections(4);
    isSubmittingRef.current = false;
  };

  const handleConfirm = () => {
    // Prevent double submissions using ref
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Validate inputs
    if (!clockName.trim()) {
      if (window.electron) {
        window.electron.alert(t("Clock name is required."));
      } else {
        alert(t("Clock name is required."));
      }
      isSubmittingRef.current = false;
      return;
    }

    if (isNaN(clockSections) || clockSections < 2 || clockSections > 30) {
      if (window.electron) {
        window.electron.alert(t("Sections must be between 2 and 30."));
      } else {
        alert(t("Sections must be between 2 and 30."));
      }
      isSubmittingRef.current = false;
      return;
    }

    setPlayer((prevState) => {
      const notes = prevState.notes.map((note, index) => {
        if (index !== selectedNoteIndex) return note;

        let updatedClocks;
        if (selectedClockIndex !== null) {
          // Editing existing clock
          updatedClocks = note.clocks.map((clock, cIdx) => {
            if (cIdx !== selectedClockIndex) return clock;

            // If sections changed, we need to adjust the state array
            let newState = clock.state;
            if (clockSections !== clock.sections) {
              newState = new Array(clockSections).fill(false);
              // Copy over old state as much as possible
              for (let i = 0; i < Math.min(clock.sections, clockSections); i++) {
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
          // Adding new clock
          const newClock = {
            name: clockName,
            sections: clockSections,
            state: new Array(clockSections).fill(false),
          };
          updatedClocks = [...(note.clocks || []), newClock];
        }

        return {
          ...note,
          clocks: updatedClocks,
        };
      });
      return { ...prevState, notes };
    });

    handleClose();
  };

  const removeClock = (noteIndex, clockIndex) => (e) => {
    clockToDeleteRef.current = { noteIndex, clockIndex };
    setClockToDelete({ noteIndex, clockIndex });
    handleDeleteClockAction(e);
  };

  const handleClockStateChange = (noteIndex, clockIndex, newState) => {
    setPlayer((prevPlayer) => {
      const updatedNotes = prevPlayer.notes.map((note, index) => {
        if (index === noteIndex) {
          const updatedClocks = note.clocks.map((clock, cIndex) => {
            if (cIndex === clockIndex) {
              return { ...clock, state: newState };
            }
            return clock;
          });
          return { ...note, clocks: updatedClocks };
        }
        return note;
      });
      return { ...prevPlayer, notes: updatedNotes };
    });
  };

  const resetClockState = (noteIndex, clockIndex) => {
    const resetState = new Array(
      player.notes[noteIndex].clocks[clockIndex].sections
    ).fill(false);
    handleClockStateChange(noteIndex, clockIndex, resetState);
  };

  const incrementClockState = (noteIndex, clockIndex) => {
    const clock = player.notes[noteIndex].clocks[clockIndex];
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
    const clock = player.notes[noteIndex].clocks[clockIndex];
    const currentFilled = clock.state.filter(Boolean).length;
    if (currentFilled > 0) {
      const newState = [...clock.state];
      newState[currentFilled - 1] = false;
      handleClockStateChange(noteIndex, clockIndex, newState);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <CustomHeader
            type="top"
            headerText={t("Notes")}
            addItem={
              isEditMode
                ? () => {
                    if (isAddingNoteRef.current) return;
                    isAddingNoteRef.current = true;
                    setPlayer((prevState) => {
                      return {
                        ...prevState,
                        notes: [
                          ...prevState.notes,
                          {
                            name: "",
                            description: "",
                            clocks: [],
                          },
                        ],
                      };
                    });
                    // Reset after a tick to allow React to process state update
                    setTimeout(() => {
                      isAddingNoteRef.current = false;
                    }, 0);
                  }
                : null
            }
            showIconButton={isEditMode}
            icon={Add}
          />
        </Grid>
        {player.notes.map((note, index) => (
          <Grid
            container
            size={12}
            rowSpacing={1.5}
            columnSpacing={2}
            sx={{ py: 0.5 }}
            key={index}
          >
            <Grid size={12}>
              <Grid container rowSpacing={1.5} columnSpacing={2}>
                <Grid size={{ xs: 12, sm: isEditMode ? 11 : 12 }}>
                  <TextField
                    id="name"
                    label={t("Note Name") + ":"}
                    value={note.name}
                    fullWidth
                    onChange={handleNoteNameChange(index)}
                    slotProps={{
                      input: {
                        readOnly: !isEditMode,
                      },
                      htmlInput: { maxLength: 50 },
                    }}
                  />
                </Grid>
                {isEditMode && (
                  <Grid
                    size={{ xs: 12, sm: 1 }}
                    sx={{ display: "flex", justifyContent: { xs: "flex-end", sm: "center" }, alignItems: "center" }}
                  >
                    <IconButton onClick={removeItem(index)}>
                      <RemoveCircleOutlined />
                    </IconButton>
                  </Grid>
                )}
                <Grid size={12}>
                  <CustomTextarea
                    id="description"
                    label={t("Description") + ":"}
                    value={note.description}
                    onChange={handleNoteDescriptionChange(index)}
                    maxLength={5000}
                    maxRows={10}
                    readOnly={!isEditMode}
                  />
                </Grid>
                {isEditMode && (
                  <Grid size={12} sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Button
                      variant="contained"
                      onClick={() => handleAddClock(index)}
                      disabled={note.clocks && note.clocks.length >= 4}
                    >
                      {t("Add Clock")}
                    </Button>
                  </Grid>
                )}
                {note.clocks && note.clocks.length > 0 && (
                  <Grid size={12}>
                    <Grid container spacing={1}>
                      {note.clocks.map((clock, clockIndex) => (
                        <Grid
                          key={clockIndex}
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                          }}
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
                              {isEditMode && (
                                <Box>
                                  <IconButton
                                    onClick={() => handleEditClock(index, clockIndex)}
                                    size="small"
                                    sx={{
                                      p: 0,
                                      mr: 1,
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    onClick={removeClock(index, clockIndex)}
                                    size="small"
                                    sx={{
                                      color: theme.palette.error.main,
                                      p: 0,
                                    }}
                                  >
                                    <RemoveCircleOutlined fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>

                            <Clock
                              numSections={clock.sections}
                              size={100}
                              state={clock.state}
                              setState={(newState) =>
                                handleClockStateChange(index, clockIndex, newState)
                              }
                            />

                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Tooltip title={t("Decrement")}>
                                <IconButton
                                  size="small"
                                  onClick={() => decrementClockState(index, clockIndex)}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Reset")}>
                                <IconButton
                                  size="small"
                                  onClick={() => resetClockState(index, clockIndex)}
                                >
                                  <RestartAltIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Increment")}>
                                <IconButton
                                  size="small"
                                  onClick={() => incrementClockState(index, clockIndex)}
                                >
                                  <AddIcon fontSize="small" />
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
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h3">{selectedClockIndex !== null ? t("Edit Clock") : t("Add Clock")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Enter the clock details below:")}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="clockName"
            label={t("Clock Name")}
            type="text"
            fullWidth
            variant="outlined"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
            slotProps={{
              htmlInput: { maxLength: 30 }
            }}
          />
          <TextField
            margin="dense"
            id="clockSections"
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
                handleConfirm();
              }
            }}
            slotProps={{
              htmlInput: { min: 2, max: 30 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="contained">
            {t("Cancel")}
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            {selectedClockIndex !== null ? t("Save") : t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteNoteDialogOpen}
        onClose={closeDeleteNoteDialog}
        onConfirm={() => {
          const idx = noteToDeleteIndexRef.current;
          if (idx !== null) {
            setPlayer((prevState) => {
              return {
                ...prevState,
                notes: prevState.notes.filter((_, index) => index !== idx),
              };
            });
          }
          noteToDeleteIndexRef.current = null;
          setNoteToDeleteIndex(null);
          closeDeleteNoteDialog();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this note?")}
        itemPreview={
          noteToDeleteIndex !== null && (
            <Box>
              <Typography variant="h4">
                {player.notes[noteToDeleteIndex].name || t("Untitled Note")}
              </Typography>
            </Box>
          )
        }
      />
      <DeleteConfirmationDialog
        open={deleteClockDialogOpen}
        onClose={closeDeleteClockDialog}
        onConfirm={() => {
          const { noteIndex, clockIndex } = clockToDeleteRef.current;
          if (noteIndex !== null && clockIndex !== null) {
            setPlayer((prevState) => {
              const notes = prevState.notes.map((note, index) => {
                if (index !== noteIndex) return note;
                return {
                  ...note,
                  clocks: (note.clocks || []).filter((_, idx) => idx !== clockIndex),
                };
              });
              return { ...prevState, notes };
            });
          }
          clockToDeleteRef.current = { noteIndex: null, clockIndex: null };
          setClockToDelete({ noteIndex: null, clockIndex: null });
          closeDeleteClockDialog();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this clock?")}
        itemPreview={
          clockToDelete.noteIndex !== null && clockToDelete.clockIndex !== null && (
            <Box>
              <Typography variant="h4">
                {player.notes[clockToDelete.noteIndex].clocks[clockToDelete.clockIndex].name || t("Untitled Clock")}
              </Typography>
            </Box>
          )
        }
      />
    </Paper>
  );
}
