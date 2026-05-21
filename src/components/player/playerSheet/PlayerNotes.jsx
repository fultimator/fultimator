import { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Box,
  Stack,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslate } from "../../../translation/translate";
import NotesMarkdown from "../../common/NotesMarkdown";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";
import Clock from "./Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import RemoveCircleOutlined from "@mui/icons-material/RemoveCircleOutlined";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerNotes({
  player,
  setPlayer,
  isCharacterSheet,
  compact = false,
  isEditMode = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const [editNoteIndex, setEditNoteIndex] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftNoteName, setDraftNoteName] = useState("");
  const [draftNoteDescription, setDraftNoteDescription] = useState("");
  const [draftNoteClocks, setDraftNoteClocks] = useState([]);

  // Create visible notes with original indices preserved
  const visibleNotesWithIndices = (player.notes || [])
    .map((note, index) => ({ note, originalIndex: index }))
    .filter(({ note }) => note.showInPlayerSheet !== false);

  const handleClockStateChange = (originalNoteIndex, clockIndex, newState) => {
    setPlayer((prevPlayer) => {
      const updatedNotes = prevPlayer.notes.map((note, index) => {
        if (index === originalNoteIndex) {
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

  const resetClockState = (originalNoteIndex, clockIndex) => {
    const resetState = new Array(
      player.notes[originalNoteIndex].clocks[clockIndex].sections,
    ).fill(false);
    handleClockStateChange(originalNoteIndex, clockIndex, resetState);
  };

  const incrementClockState = (originalNoteIndex, clockIndex) => {
    const clock = player.notes[originalNoteIndex].clocks[clockIndex];
    const currentFilled = clock.state.filter(Boolean).length;
    if (currentFilled < clock.sections) {
      const newState = new Array(clock.sections).fill(false);
      for (let i = 0; i <= currentFilled; i++) {
        newState[i] = true;
      }
      handleClockStateChange(originalNoteIndex, clockIndex, newState);
    }
  };

  const decrementClockState = (originalNoteIndex, clockIndex) => {
    const clock = player.notes[originalNoteIndex].clocks[clockIndex];
    const currentFilled = clock.state.filter(Boolean).length;
    if (currentFilled > 0) {
      const newState = [...clock.state];
      newState[currentFilled - 1] = false;
      handleClockStateChange(originalNoteIndex, clockIndex, newState);
    }
  };

  const openNoteEditor = (originalNoteIndex) => {
    const target = player.notes?.[originalNoteIndex];
    if (!target) return;
    setIsCreating(false);
    setEditNoteIndex(originalNoteIndex);
    setDraftNoteName(target.name || "");
    setDraftNoteDescription(target.description || "");
    setDraftNoteClocks(
      (target.clocks || []).map((clock) => ({
        ...clock,
        name: clock.name || "",
        sections: Number(clock.sections) || 4,
        state: Array.isArray(clock.state)
          ? [...clock.state]
          : new Array(Number(clock.sections) || 4).fill(false),
      })),
    );
  };

  const openNoteCreator = () => {
    setIsCreating(true);
    setEditNoteIndex(null);
    setDraftNoteName("");
    setDraftNoteDescription("");
    setDraftNoteClocks([]);
  };

  const closeNoteEditor = () => {
    setIsCreating(false);
    setEditNoteIndex(null);
    setDeleteDialogOpen(false);
    setDraftNoteName("");
    setDraftNoteDescription("");
    setDraftNoteClocks([]);
  };

  const deleteEditedNote = () => {
    if (editNoteIndex == null || isCreating) return;
    setPlayer((prev) => {
      const notes = [...(prev.notes || [])];
      if (!notes[editNoteIndex]) return prev;
      notes.splice(editNoteIndex, 1);
      return { ...prev, notes };
    });
    closeNoteEditor();
  };

  const saveNoteEditor = () => {
    if (editNoteIndex == null && !isCreating) return;
    const cleanedClocks = draftNoteClocks.map((clock) => {
      const normalizedSections = Number(clock.sections);
      return {
        ...clock,
        name: (clock.name || "").trim(),
        sections: normalizedSections,
        state: Array.isArray(clock.state)
          ? clock.state.slice(0, normalizedSections)
          : new Array(normalizedSections).fill(false),
      };
    });

    const hasInvalidClockName = cleanedClocks.some((clock) => !clock.name);
    if (hasInvalidClockName) {
      if (window.electron) {
        window.electron.alert(t("Clock name is required."));
      } else {
        alert(t("Clock name is required."));
      }
      return;
    }

    const hasInvalidClockSections = cleanedClocks.some(
      (clock) =>
        isNaN(clock.sections) || clock.sections < 2 || clock.sections > 30,
    );
    if (hasInvalidClockSections) {
      if (window.electron) {
        window.electron.alert(t("Sections must be between 2 and 30."));
      } else {
        alert(t("Sections must be between 2 and 30."));
      }
      return;
    }

    if (isCreating) {
      setPlayer((prev) => ({
        ...prev,
        notes: [
          ...(prev.notes || []),
          {
            name: draftNoteName,
            description: draftNoteDescription,
            clocks: cleanedClocks,
            showInPlayerSheet: true,
          },
        ],
      }));
    } else {
      setPlayer((prev) => {
        const notes = [...(prev.notes || [])];
        if (!notes[editNoteIndex]) return prev;
        notes[editNoteIndex] = {
          ...notes[editNoteIndex],
          name: draftNoteName,
          description: draftNoteDescription,
          clocks: cleanedClocks,
        };
        return { ...prev, notes };
      });
    }
    closeNoteEditor();
  };

  const addDraftClock = () => {
    if (draftNoteClocks.length >= 4) return;
    setDraftNoteClocks((prev) => {
      return [
        ...prev,
        {
          name: "",
          sections: 4,
          state: new Array(4).fill(false),
        },
      ];
    });
  };

  const updateDraftClock = (clockIndex, updater) => {
    setDraftNoteClocks((prev) =>
      prev.map((clock, idx) =>
        idx === clockIndex ? { ...clock, ...updater(clock) } : clock,
      ),
    );
  };

  const handleDraftClockNameChange = (clockIndex, value) => {
    updateDraftClock(clockIndex, () => ({ name: value }));
  };

  const handleDraftClockSectionsChange = (clockIndex, nextValue) => {
    const parsed = parseInt(nextValue, 10);
    updateDraftClock(clockIndex, (clock) => {
      if (isNaN(parsed)) return { sections: "", state: [] };
      const nextSections = parsed;
      const nextState = new Array(nextSections).fill(false);
      const maxCopy = Math.min(nextSections, Number(clock.sections) || 0);
      for (let i = 0; i < maxCopy; i++) {
        nextState[i] = Boolean(clock.state?.[i]);
      }
      return { sections: nextSections, state: nextState };
    });
  };

  const removeDraftClock = (clockIndex) => {
    setDraftNoteClocks((prev) => prev.filter((_, idx) => idx !== clockIndex));
  };

  if (visibleNotesWithIndices.length === 0 && !isEditMode) return null;

  const noteList = (
    <Grid
      container
      spacing={1}
      sx={{ p: 1, width: "100%", flex: 1, minWidth: 0 }}
    >
      {visibleNotesWithIndices.map(({ note, originalIndex }) => (
        <Grid key={originalIndex} size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                padding: "5px",
                paddingLeft: "10px",
                backgroundColor: primary,
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  flex: 1,
                }}
              >
                {note.name || t("Note")}
              </Typography>
              {isEditMode && (
                <Tooltip title={t("Edit")}>
                  <IconButton
                    size="small"
                    onClick={() => openNoteEditor(originalIndex)}
                    sx={{ p: 0.5, color: "#fff" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {/* Body */}
            <Box sx={{ p: 1, flex: 1, display: "flex", flexDirection: "column" }}>

            {note.clocks && note.clocks.length === 1 ? (
              <Grid container spacing={1} sx={{ alignItems: "flex-start" }}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Box
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.02)",
                      p: 1,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <NotesMarkdown
                      sx={{
                        fontFamily: "PT Sans Narrow",
                        fontSize: "0.95rem",
                        lineHeight: 1.4,
                        "& p": { margin: 0, mb: 0.5 },
                      }}
                    >
                      {note.description}
                    </NotesMarkdown>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Clock
                        isCharacterSheet={isCharacterSheet}
                        numSections={note.clocks[0].sections}
                        size={80}
                        state={note.clocks[0].state}
                        setState={(newState) =>
                          handleClockStateChange(originalIndex, 0, newState)
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          textAlign: "center",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                          color: "text.secondary",
                        }}
                      >
                        {note.clocks[0].name}
                      </Typography>
                    </Box>
                    {!isCharacterSheet && (
                      <Stack
                        direction="row"
                        spacing={0.25}
                        sx={{ mt: 0.25, justifyContent: "center" }}
                      >
                        <Tooltip
                          title={`${t("Decrement")} ${note.clocks[0].name}`}
                          arrow
                        >
                          <IconButton
                            color="primary"
                            onClick={() =>
                              decrementClockState(originalIndex, 0)
                            }
                            size="small"
                            sx={{ p: 0.25 }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={`${t("Reset")} ${note.clocks[0].name}`}
                          arrow
                        >
                          <IconButton
                            color="primary"
                            onClick={() => resetClockState(originalIndex, 0)}
                            size="small"
                            sx={{ p: 0.25 }}
                          >
                            <RestartAltIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={`${t("Increment")} ${note.clocks[0].name}`}
                          arrow
                        >
                          <IconButton
                            color="primary"
                            onClick={() =>
                              incrementClockState(originalIndex, 0)
                            }
                            size="small"
                            sx={{ p: 0.25 }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            ) : (
              <>
                <Box
                  sx={{
                    flex: 1,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                    p: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                  }}
                >
                  <NotesMarkdown
                    sx={{
                      fontFamily: "PT Sans Narrow",
                      fontSize: "0.95rem",
                      lineHeight: 1.4,
                      "& p": { margin: 0, mb: 0.5 },
                    }}
                  >
                    {note.description}
                  </NotesMarkdown>
                </Box>

                {note.clocks && note.clocks.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid
                      container
                      spacing={2}
                      sx={{ justifyContent: "center" }}
                    >
                      {note.clocks.map((clock, clockIndex) => (
                        <Grid
                          key={clockIndex}
                          size={{
                            xs: 12,
                            sm: note.clocks.length > 1 ? 6 : 12,
                            md:
                              note.clocks.length > 2
                                ? 4
                                : note.clocks.length > 1
                                  ? 6
                                  : 12,
                          }}
                        >
                          <Stack
                            sx={{ alignItems: "center", position: "relative" }}
                          >
                            <Clock
                              isCharacterSheet={isCharacterSheet}
                              numSections={clock.sections}
                              size={
                                note.clocks.length > 2
                                  ? 80
                                  : note.clocks.length > 1
                                    ? 100
                                    : 120
                              }
                              state={clock.state}
                              setState={(newState) =>
                                handleClockStateChange(
                                  originalIndex,
                                  clockIndex,
                                  newState,
                                )
                              }
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 0.75,
                                textAlign: "center",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              {clock.name}
                            </Typography>
                            {!isCharacterSheet && (
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ justifyContent: "center" }}
                              >
                                <Tooltip
                                  title={`${t("Decrement")} ${clock.name}`}
                                  arrow
                                >
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      decrementClockState(
                                        originalIndex,
                                        clockIndex,
                                      )
                                    }
                                    size="small"
                                    sx={{ p: 0.25 }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip
                                  title={`${t("Reset")} ${clock.name}`}
                                  arrow
                                >
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      resetClockState(originalIndex, clockIndex)
                                    }
                                    size="small"
                                    sx={{ p: 0.25 }}
                                  >
                                    <RestartAltIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip
                                  title={`${t("Increment")} ${clock.name}`}
                                  arrow
                                >
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      incrementClockState(
                                        originalIndex,
                                        clockIndex,
                                      )
                                    }
                                    size="small"
                                    sx={{ p: 0.25 }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
            )}
            </Box>
          </Card>
        </Grid>
      ))}
      {isEditMode && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            onClick={openNoteCreator}
            sx={{
              height: "100%",
              minHeight: 80,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px dashed ${theme.palette.divider}`,
              bgcolor: "transparent",
              boxShadow: "none",
              cursor: "pointer",
              transition: "border-color 0.15s, background-color 0.15s",
              "&:hover": {
                borderColor: primary,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <AddIcon fontSize="small" />
              <Typography variant="body2">{t("Add Note")}</Typography>
            </Box>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  if (compact) {
    return (
      <Grid container spacing={0} sx={{ padding: 0 }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: primary,
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textTransform: "uppercase",
                },
              }}
            >
              <StyledTableCellHeader sx={{ width: 34 }} />
              <StyledTableCellHeader>
                <Typography variant="h4">{t("Notes")}</Typography>
              </StyledTableCellHeader>
            </TableRow>
          </TableHead>
        </Table>
        {noteList}
      </Grid>
    );
  }

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <Paper
        elevation={3}
        sx={{
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          display: "flex",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            writingMode: "vertical-lr",
            textTransform: "uppercase",
            marginLeft: "-1px",
            marginRight: "10px",
            marginTop: "-1px",
            marginBottom: "-1px",
            paddingY: "10px",
            backgroundColor: primary,
            color: "#fff",
            borderRadius: "0 8px 8px 0",
            transform: "rotate(180deg)",
            fontSize: "2em",
          }}
          align="center"
        >
          {t("Notes")}
        </Typography>
        {noteList}
      </Paper>
      <Dialog
        open={editNoteIndex !== null || isCreating}
        onClose={closeNoteEditor}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle variant="h4">{isCreating ? t("Add Note") : t("Edit Note")}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 1.5, pt: "8px !important" }}>
          <TextField
            label={t("Name")}
            value={draftNoteName}
            onChange={(e) => setDraftNoteName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label={t("Description")}
            value={draftNoteDescription}
            onChange={(e) => setDraftNoteDescription(e.target.value)}
            fullWidth
            multiline
            minRows={5}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 0.5,
            }}
          >
            <Typography variant="h5">{t("Clocks")}</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={addDraftClock}
              disabled={draftNoteClocks.length >= 4}
              startIcon={<AddIcon fontSize="small" />}
            >
              {t("Add Clock")}
            </Button>
          </Box>
          {draftNoteClocks.length > 0 && (
            <Grid container spacing={1.25}>
              {draftNoteClocks.map((clock, clockIndex) => (
                <Grid key={`draft-clock-${clockIndex}`} size={12}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <Grid container spacing={1.25} sx={{ alignItems: "center" }}>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <TextField
                          label={t("Clock Name")}
                          value={clock.name}
                          onChange={(e) =>
                            handleDraftClockNameChange(
                              clockIndex,
                              e.target.value,
                            )
                          }
                          fullWidth
                          size="small"
                          slotProps={{ htmlInput: { maxLength: 30 } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 10, sm: 4 }}>
                        <TextField
                          label={t("Clock Sections")}
                          type="number"
                          value={clock.sections}
                          onChange={(e) =>
                            handleDraftClockSectionsChange(
                              clockIndex,
                              e.target.value,
                            )
                          }
                          fullWidth
                          size="small"
                          slotProps={{ htmlInput: { min: 2, max: 30 } }}
                        />
                      </Grid>
                      <Grid
                        size={{ xs: 2, sm: 1 }}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeDraftClock(clockIndex)}
                          sx={{ p: 0.25 }}
                        >
                          <RemoveCircleOutlined fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
            {!isCreating ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t("Delete")}
              </Button>
            ) : null}
            <Box sx={{ flexGrow: 1 }} />
            <Button onClick={closeNoteEditor}>{t("Cancel")}</Button>
            <Button variant="contained" onClick={saveNoteEditor}>
              {t("Save")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={deleteEditedNote}
        title={t("Delete Note")}
        message={t("Are you sure you want to delete this note?")}
      />
    </>
  );
}
