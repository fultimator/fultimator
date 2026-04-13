import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Add,
  Remove,
  RestartAlt,
  StickyNote2Outlined,
} from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import NotesMarkdown from "../../../common/NotesMarkdown";
import Clock from "../Clock";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;

  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} style={{ backgroundColor: "yellow", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.replace(regex, "<mark>$1</mark>");
}

export default function PlayerNotes({ player, setPlayer, searchQuery = "", isEditMode = false, onAddNote, onEditNote }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleNotes = (player.notes || [])
    .map((note, index) => ({ ...note, originalIndex: index }))
    .filter(
      (note) =>
        !normalizedQuery ||
        note.name?.toLowerCase().includes(normalizedQuery) ||
        note.description?.toLowerCase().includes(normalizedQuery) ||
        note.clocks?.some((clock) => clock?.name?.toLowerCase().includes(normalizedQuery))
    );

  if (visibleNotes.length === 0 && !(isEditMode && onAddNote)) return null;

  const updateClock = (noteIndex, clockIndex, newState) => {
    setPlayer((prev) => ({
      ...prev,
      notes: prev.notes.map((note, ni) =>
        ni !== noteIndex
          ? note
          : {
              ...note,
              clocks: note.clocks.map((clock, ci) =>
                ci !== clockIndex ? clock : { ...clock, state: newState }
              ),
            }
      ),
    }));
  };

  const increment = (noteIndex, clockIndex, clock) => {
    const next = [...clock.state];
    const i = next.indexOf(false);
    if (i !== -1) {
      next[i] = true;
      updateClock(noteIndex, clockIndex, next);
    }
  };

  const decrement = (noteIndex, clockIndex, clock) => {
    const next = [...clock.state];
    const i = next.lastIndexOf(true);
    if (i !== -1) {
      next[i] = false;
      updateClock(noteIndex, clockIndex, next);
    }
  };

  const reset = (noteIndex, clockIndex, clock) => {
    updateClock(
      noteIndex,
      clockIndex,
      new Array(clock.sections).fill(false)
    );
  };

  return (
    <TableContainer component={Paper} sx={{ width: '100%' }}>
      <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow
            sx={{
              background: theme.primary,
              "& .MuiTypography-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                textTransform: "uppercase",
              },
            }}
          >
            <StyledTableCellHeader sx={{ width: 36 }} />
            <StyledTableCellHeader>
              <Typography variant="h4">{t("Notes")}</Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' }, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontSize: '0.875rem' }}>{t("Sections")}</Typography>
            </StyledTableCellHeader>
            <StyledTableCellHeader sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
            <StyledTableCellHeader sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}>
              {isEditMode && onAddNote && (
                <Tooltip title={t("Add Note")}>
                  <IconButton size="small" onClick={onAddNote} sx={{ color: '#fff', p: 0.5 }}>
                    <Add fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleNotes.map((note, noteIndex) => {
            const noteKey = `note-${noteIndex}`;
            const descriptionMatchesQuery =
              !!normalizedQuery && !!note.description?.toLowerCase().includes(normalizedQuery);
            const isOpen = !!openRows.notes[noteKey] || descriptionMatchesQuery;
            return (
              <React.Fragment key={noteIndex}>
                {/* Note title row */}
                <TableRow key={`note-${noteIndex}`}>
                  <StyledTableCell sx={{ width: 36, pl: 1 }}>
                    {note.description ? (
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); toggleRow('notes', noteKey); }}
                        sx={{ p: 0.5 }}
                      >
                        {isOpen ? (
                          <KeyboardArrowUp fontSize="small" />
                        ) : (
                          <KeyboardArrowDown fontSize="small" />
                        )}
                      </IconButton>
                    ) : (
                      <Tooltip title={t("Note")}>
                        <StickyNote2Outlined
                          fontSize="small"
                          sx={{ color: theme.secondary }}
                        />
                      </Tooltip>
                    )}
                  </StyledTableCell>
                  <StyledTableCell onClick={(e) => { e.stopPropagation(); note.description && toggleRow('notes', noteKey); }} sx={{ cursor: note.description ? "pointer" : "default", minWidth: { xs: 60, sm: 100 }, wordBreak: "break-word" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                        {highlightMatch(note.name, searchQuery)}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' } }} />
                  <StyledTableCell sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                  <StyledTableCell sx={{ width: { xs: 110, sm: 110 }, textAlign: 'right' }}>
                    {isEditMode && (
                      <Tooltip title={t("Edit Note")}>
                        <IconButton size="small" onClick={() => onEditNote && onEditNote(note.originalIndex)} sx={{ p: 0.5 }}>
                          <StickyNote2Outlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </StyledTableCell>
                </TableRow>
                {/* Description collapse */}
                {note.description && (
                  <TableRow key={`desc-${noteIndex}`}>
                    <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 2, py: 1 }}>
                          <NotesMarkdown sx={{ fontSize: "0.85rem" }}>
                            {highlightMarkdownText(note.description, searchQuery)}
                          </NotesMarkdown>
                        </Box>
                      </Collapse>
                    </StyledTableCell>
                  </TableRow>
                )}
                {/* Clock rows */}
                {note.clocks?.map((clock, clockIndex) => {
                  const filled = clock.state.filter(Boolean).length;
                  const total = clock.sections;
                  const canIncrement = filled < total;
                  const canDecrement = filled > 0;

                  return (
                    <TableRow
                      key={`clock-${noteIndex}-${clockIndex}`}
                      sx={{ bgcolor: "action.hover" }}
                    >
                      <StyledTableCell sx={{ width: 36, pl: 1, display: "flex", alignItems: "center" }}>
                        <Clock
                          numSections={total}
                          size={28}
                          state={clock.state}
                          setState={() => {}}
                          isCharacterSheet={true}
                        />
                      </StyledTableCell>
                      <StyledTableCell sx={{ minWidth: { xs: 60, sm: 100 }, wordBreak: "break-word", pl: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {highlightMatch(clock.name, searchQuery)}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' }, textAlign: "center" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: "bold"
                          }}>
                          {filled}/{total}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                      <StyledTableCell sx={{ width: { xs: 110, sm: 110 }, textAlign: 'right' }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: 'flex-end', gap: 0.25 }}>
                          <IconButton
                            size="small"
                            disabled={!canDecrement}
                            onClick={() => decrement(note.originalIndex, clockIndex, clock)}
                            sx={{ p: "4px" }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={!canIncrement}
                            onClick={() => increment(note.originalIndex, clockIndex, clock)}
                            sx={{ p: "4px" }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          <Tooltip title={t("Reset")} arrow>
                            <IconButton
                              size="small"
                              onClick={() => reset(note.originalIndex, clockIndex, clock)}
                              sx={{ p: "4px" }}
                            >
                              <RestartAlt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </StyledTableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            );})}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
