import React, { useState, useRef } from "react";
import {
  Divider,
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
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

export default function EditPlayerNotes({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [open, setOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDeleteIndex, setNoteToDeleteIndex] = useState(null);
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

  const removeItem = (key) => async () => {
    setNoteToDeleteIndex(key);
    setDeleteDialogOpen(true);
  };

  const handleAddClock = (index) => {
    setSelectedNoteIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNoteIndex(null);
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

    if (clockSections < 2 || clockSections > 30) {
      if (window.electron) {
        window.electron.alert(t("Sections must be between 2 and 30."));
      } else {
        alert(t("Sections must be between 2 and 30."));
      }
      isSubmittingRef.current = false;
      return;
    }

    // Add the clock
    const newClock = {
      name: clockName,
      sections: clockSections,
      state: new Array(clockSections).fill(false),
    };

    setPlayer((prevState) => {
      const notes = prevState.notes.map((note, index) => {
        if (index !== selectedNoteIndex) return note;
        return {
          ...note,
          clocks: [...(note.clocks || []), newClock],
        };
      });
      return { ...prevState, notes };
    });

    handleClose();
  };

  const handleRemoveClock = (noteIndex, clockIndex) => {
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
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 0.75,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            px: 1,
                          }}
                        >
                          <Typography variant="body2">
                            <strong style={{ fontSize: "1.4em" }}>
                              {clock.name}
                            </strong>{" "}
                            ({t("Clock Sections")}: {clock.sections})
                          </Typography>
                          {isEditMode && (
                            <IconButton
                              onClick={() => handleRemoveClock(index, clockIndex)}
                              sx={{
                                color: theme.palette.error.main,
                              }}
                            >
                              <RemoveCircleOutlined />
                            </IconButton>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
            {index !== player.notes.length - 1 && (
              <Grid size={12} sx={{ pt: 0.5 }}>
                <Divider />
              </Grid>
            )}
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h3">{t("Add Clock")}</DialogTitle>
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
              setClockSections(value);
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
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (noteToDeleteIndex !== null) {
            setPlayer((prevState) => {
              return {
                ...prevState,
                notes: prevState.notes.filter((_, index) => index !== noteToDeleteIndex),
              };
            });
          }
          setNoteToDeleteIndex(null);
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
    </Paper>
  );
}
