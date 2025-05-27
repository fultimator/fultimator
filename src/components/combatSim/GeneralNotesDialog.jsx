import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardHeader,
  useMediaQuery,
} from "@mui/material";
import {
  Close,
  Add,
  ContentCopy,
  ArrowUpward,
  ArrowDownward,
  Palette,
  Edit,
  Visibility,
  ExpandMore,
  ExpandLess,
  Delete,
  DragIndicator,
  Save,
  ViewHeadline,
} from "@mui/icons-material";
import { t, replacePlaceholders } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { NoteAlt } from "@mui/icons-material";

// Available note colors
const NOTE_COLORS = {
  default: { bg: "#f5f5f5", darkBg: "#333333", label: t("color_default") },
  red: { bg: "#ffebee", darkBg: "#4a0000", label: t("color_red") },
  green: { bg: "#e8f5e9", darkBg: "#003300", label: t("color_green") },
  blue: { bg: "#e3f2fd", darkBg: "#000033", label: t("color_blue") },
  yellow: { bg: "#fffde7", darkBg: "#332b00", label: t("color_yellow") },
  purple: { bg: "#f3e5f5", darkBg: "#2a0033", label: t("color_purple") },
};

// Format date helper function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Individual Note Component
const NoteItem = ({
  id,
  note,
  updateNote,
  deleteNote,
  moveNote,
  index,
  totalNotes,
  maxNoteLength,
  isDarkMode,
  useDragAndDrop,
  isViewMode,
  compactMode,
  isMobile,
}) => {
  const [expanded, setExpanded] = useState(!compactMode);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleChange = (e) => {
    updateNote(id, { ...note, title: e.target.value });
  };

  const handleBodyChange = (e) => {
    updateNote(id, { ...note, body: e.target.value });
  };

  const handleColorChange = (e) => {
    updateNote(id, { ...note, color: e.target.value });
  };

  const copyToClipboard = () => {
    const textToCopy = `${note.title}\n\n${note.body}`;
    navigator.clipboard.writeText(textToCopy);
  };

  const getBgColor = () => {
    const colorData = NOTE_COLORS[note.color] || NOTE_COLORS.default;
    return isDarkMode ? colorData.darkBg : colorData.bg;
  };

  const remainingChars = maxNoteLength
    ? maxNoteLength - note.body.length
    : null;

  const currentRowCount = note.body.split("\n").length;

  const selectedColorKey = note.color || "default";

  // View mode rendering
  if (isViewMode) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        elevation={1}
        sx={{
          mb: 2,
          backgroundColor: getBgColor(),
          position: "relative",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: 3,
          },
        }}
      >
        <CardHeader
          title={
            <Typography variant={isMobile ? "h5" : "h4"}>
              {note.title || t("notes_unnamed")}
            </Typography>
          }
          subheader={formatDate(note.createdAt)}
          action={
            <Box sx={{ display: "flex" }}>
              <Tooltip title={t("notes_copy_note_clipboard")}>
                <IconButton size="small" onClick={copyToClipboard}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              mb: 1,
              maxHeight: expanded ? "none" : "75px",
              overflow: expanded ? "visible" : "hidden",
              textOverflow: expanded ? "clip" : "ellipsis",
            }}
          >
            {note.body || t("notes_no_content")}
          </Typography>
          {note.body && currentRowCount > 3 && (
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              variant="text"
              color="inherit"
            >
              {expanded ? t("notes_show_less") : t("notes_show_more")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Edit mode rendering - compact or expanded
  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: getBgColor(),
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {useDragAndDrop && (
          <Box
            {...attributes}
            {...listeners}
            sx={{
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              mr: 1,
              color: "text.secondary",
              "&:hover": { opacity: 0.7 },
              "&:active": { cursor: "grabbing" },
              touchAction: "none",
            }}
          >
            <DragIndicator />
          </Box>
        )}

        <Tooltip title={expanded ? t("Collapse") : t("Expand")}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: "text.secondary" }}
          >
            {expanded ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={t("notes_note_title")}
          value={note.title}
          onChange={handleTitleChange}
          inputProps={{ maxLength: 100 }}
          sx={{ mr: 1 }}
        />

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title={t("notes_menu_delete")}>
            <IconButton
              size="small"
              onClick={() => deleteNote(id)}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {expanded && (
        <>
          <TextField
            fullWidth
            multiline
            rows={
              currentRowCount > (isMobile ? 3 : 5)
                ? currentRowCount
                : isMobile
                ? 3
                : 5
            }
            placeholder={t("notes_note_content")}
            value={note.body}
            onChange={handleBodyChange}
            variant="outlined"
            inputProps={{
              maxLength: maxNoteLength || undefined,
            }}
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {maxNoteLength ? (
              <Typography
                variant="caption"
                color={remainingChars < 20 ? "error" : "text.secondary"}
              >
                {replacePlaceholders(t("notes_remaining_characters"), {
                  count: remainingChars,
                })}
              </Typography>
            ) : (
              <Box>{/* Empty Box to fill the gap */}</Box>
            )}
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: isMobile ? 40 : 80 }}>
                <Select
                  value={selectedColorKey}
                  onChange={handleColorChange}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: "30px",
                    paddingLeft: isMobile ? "4px" : "8px",
                    ".MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      padding: isMobile ? "6px 4px" : "6px 8px",
                    },
                  }}
                  displayEmpty
                  renderValue={() => (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Palette fontSize="small" sx={{ mr: 0 }} />
                    </Box>
                  )}
                >
                  {Object.entries(NOTE_COLORS).map(([key, data]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor: isDarkMode ? data.darkBg : data.bg,
                            border: "1px solid",
                            borderColor: "divider",
                            mr: 1,
                          }}
                        />
                        {data.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title={t("notes_copy_note_clipboard")}>
                <IconButton size="small" onClick={copyToClipboard}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {!useDragAndDrop && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                {index > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => moveNote(id, "up")}
                    startIcon={<ArrowUpward fontSize="small" />}
                  >
                    {t("notes_menu_move_up")}
                  </Button>
                )}

                {index < totalNotes - 1 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => moveNote(id, "down")}
                    startIcon={<ArrowDownward fontSize="small" />}
                  >
                    {t("notes_menu_move_down")}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default function GeneralNotesDialog({
  open,
  onClose,
  onSave,
  notes: initialNotes = [],
  useDragAndDrop = true,
  maxNotesCount = null,
  maxNoteLength = null,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [notes, setNotes] = useState(
    initialNotes.map((note, index) => ({
      ...note,
      id: note.id || `note-${index}-${Date.now()}`,
    }))
  );
  const [viewMode, setViewMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [originalNotes, setOriginalNotes] = useState([...initialNotes]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    // Update notes when props change
    if (initialNotes) {
      const processedNotes = initialNotes.map((note, index) => ({
        ...note,
        id: note.id || `note-${index}-${Date.now()}`,
      }));
      setNotes(processedNotes);
      setOriginalNotes([...processedNotes]);
    }
  }, [initialNotes]);

  useEffect(() => {
    // Enable compact mode automatically if there are more than 5 notes
    setCompactMode(notes.length > 5);
  }, [notes.length]);

  const handleClose = () => {
    // Close without saving - revert to original notes
    setNotes([...originalNotes]);
    onClose();
  };

  const handleSave = () => {
    // Save changes
    onSave(notes);
    setOriginalNotes([...notes]);
    onClose();
  };

  const addNote = () => {
    const newNote = {
      id: `note-${notes.length}-${Date.now()}`,
      title: "",
      body: "",
      color: "default",
      createdAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    // Automatically switch to edit mode when adding a note
    if (viewMode) {
      setViewMode(false);
    }
  };

  const updateNote = (id, updatedNote) => {
    setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const moveNote = (id, direction) => {
    const index = notes.findIndex((note) => note.id === id);

    if (direction === "up" && index > 0) {
      const newNotes = [...notes];
      [newNotes[index], newNotes[index - 1]] = [
        newNotes[index - 1],
        newNotes[index],
      ];
      setNotes(newNotes);
    } else if (direction === "down" && index < notes.length - 1) {
      const newNotes = [...notes];
      [newNotes[index], newNotes[index + 1]] = [
        newNotes[index + 1],
        newNotes[index],
      ];
      setNotes(newNotes);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode === "view");
    }
  };

  const toggleCompactMode = () => {
    setCompactMode(!compactMode);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1,
          pt: 2,
          px: 3,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold" }}>
          {t("combat_sim_notes_title")}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="close"
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, mt: 1 }}>
        {notes.length > 0 ? (
          <>
            {/* Header controls section - optimized for mobile */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left section with view/edit toggles - icons only on mobile */}
              <ToggleButtonGroup
                value={viewMode ? "view" : "edit"}
                exclusive
                onChange={handleModeChange}
                aria-label="view or edit mode"
                size="small"
              >
                <ToggleButton value="view" aria-label="view mode">
                  <Visibility sx={{ mr: isSmallScreen ? 0 : 0.5 }} />
                  {!isSmallScreen && t("notes_view_button")}
                </ToggleButton>
                <ToggleButton value="edit" aria-label="edit mode">
                  <Edit sx={{ mr: isSmallScreen ? 0 : 0.5 }} />
                  {!isSmallScreen && t("notes_edit_button")}
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Right section with note count, compact mode toggle and add button */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {maxNotesCount && (
                  <Chip
                    label={`${notes.length}/${maxNotesCount}`}
                    color={
                      notes.length >= maxNotesCount ? "warning" : "default"
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      ml: !viewMode || notes.length === 0 ? 0 : "auto",
                    }}
                  />
                )}

                {!viewMode && notes.length > 3 && (
                  <Tooltip
                    title={
                      compactMode
                        ? t("notes_expand_all")
                        : t("notes_collapse_all")
                    }
                  >
                    <IconButton onClick={toggleCompactMode} size="small">
                      <ViewHeadline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isSmallScreen ? null : <Add />}
                  onClick={addNote}
                  disabled={
                    maxNotesCount !== null && notes.length >= maxNotesCount
                  }
                  size={isSmallScreen ? "small" : "medium"}
                >
                  {isSmallScreen ? <Add /> : t("notes_create_new")}
                </Button>
              </Box>
            </Box>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
              disabled={viewMode}
            >
              <SortableContext
                items={notes.map((note) => note.id)}
                strategy={verticalListSortingStrategy}
              >
                <Box
                  sx={{
                    mt: 2,
                    maxHeight: isMobile ? "calc(100vh - 200px)" : "55vh",
                    overflowY: "auto",
                    pr: 1,
                    pl: 0.5,
                  }}
                >
                  {notes.map((note, index) => (
                    <NoteItem
                      key={note.id}
                      id={note.id}
                      note={note}
                      updateNote={updateNote}
                      deleteNote={deleteNote}
                      moveNote={moveNote}
                      index={index}
                      totalNotes={notes.length}
                      maxNoteLength={maxNoteLength}
                      isDarkMode={isDarkMode}
                      useDragAndDrop={useDragAndDrop && !viewMode}
                      isViewMode={viewMode}
                      compactMode={compactMode && !viewMode}
                      isMobile={isMobile}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>
          </>
        ) : (
          // Empty state component when there are no notes
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: isMobile ? "calc(100vh - 200px)" : "40vh",
              textAlign: "center",
              p: 3,
              gap: 2,
            }}
          >
            <NoteAlt
              sx={{
                fontSize: 80,
                color: "text.secondary",
                opacity: 0.6,
              }}
            />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {t("notes_empty_state")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={addNote}
              size="large"
            >
              {t("notes_create_new")}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          startIcon={isSmallScreen ? null : <Close />}
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={
            viewMode && JSON.stringify(notes) === JSON.stringify(originalNotes)
          }
          startIcon={isSmallScreen ? null : <Save />}
        >
          {t("mkeditor_save_note")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
