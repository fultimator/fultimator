import { useState } from "react";
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
import NotesMarkdown from "../../../common/NotesMarkdown";
import Clock from "../Clock";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: "2px 4px" });

export default function PlayerNotes({ player, setPlayer, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [openNotes, setOpenNotes] = useState({});

  const visibleNotes = (player.notes || []).filter(
    (note) =>
      note.showInPlayerSheet !== false &&
      (!searchQuery ||
        note.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (visibleNotes.length === 0) return null;

  const toggleNote = (idx) =>
    setOpenNotes((prev) => ({ ...prev, [idx]: !prev[idx] }));

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
    <TableContainer component={Paper}>
      <Table size="small">
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
            <StyledTableCellHeader sx={{ width: 34 }} />
            <StyledTableCellHeader colSpan={4}>
              <Typography variant="h4">{t("Notes")}</Typography>
            </StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleNotes.map((note, noteIndex) => (
            <>
              {/* Note title row */}
              <TableRow key={`note-${noteIndex}`}>
                <StyledTableCell sx={{ width: 34 }}>
                  {note.description ? (
                    <IconButton
                      size="small"
                      onClick={() => toggleNote(noteIndex)}
                    >
                      {openNotes[noteIndex] ? (
                        <KeyboardArrowUp fontSize="small" />
                      ) : (
                        <KeyboardArrowDown fontSize="small" />
                      )}
                    </IconButton>
                  ) : (
                    <Tooltip title={t("Note")}>
                      <StickyNote2Outlined
                        fontSize="small"
                        sx={{ ml: "4px", color: theme.secondary }}
                      />
                    </Tooltip>
                  )}
                </StyledTableCell>
                <StyledTableCell colSpan={4}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ textTransform: "uppercase", cursor: note.description ? "pointer" : "default" }}
                    onClick={() => note.description && toggleNote(noteIndex)}
                  >
                    {note.name}
                  </Typography>
                </StyledTableCell>
              </TableRow>

              {/* Description collapse */}
              {note.description && (
                <TableRow key={`desc-${noteIndex}`}>
                  <StyledTableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                    <Collapse in={!!openNotes[noteIndex]} timeout="auto" unmountOnExit>
                      <Box sx={{ px: 2, py: 1, bgcolor: "background.default" }}>
                        <NotesMarkdown sx={{ fontSize: "0.85rem" }}>
                          {note.description}
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
                    {/* Mini non-interactable clock */}
                    <StyledTableCell sx={{ width: 44, textAlign: "center", pl: 1 }}>
                      <Clock
                        numSections={total}
                        size={36}
                        state={clock.state}
                        setState={() => {}}
                        isCharacterSheet={true}
                      />
                    </StyledTableCell>

                    {/* Clock name */}
                    <StyledTableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                        {clock.name}
                      </Typography>
                    </StyledTableCell>

                    {/* Decrement */}
                    <StyledTableCell sx={{ width: 28, p: 0 }}>
                      <IconButton
                        size="small"
                        disabled={!canDecrement}
                        onClick={() => decrement(noteIndex, clockIndex, clock)}
                        sx={{ p: "2px" }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                    </StyledTableCell>

                    {/* Count */}
                    <StyledTableCell sx={{ width: 36, textAlign: "center", p: 0 }}>
                      <Typography variant="body2" fontWeight="bold" fontSize="0.8rem">
                        {filled}/{total}
                      </Typography>
                    </StyledTableCell>

                    {/* Increment + Reset */}
                    <StyledTableCell sx={{ width: 56, p: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          size="small"
                          disabled={!canIncrement}
                          onClick={() => increment(noteIndex, clockIndex, clock)}
                          sx={{ p: "2px" }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                        <Tooltip title={t("Reset")} arrow>
                          <IconButton
                            size="small"
                            onClick={() => reset(noteIndex, clockIndex, clock)}
                            sx={{ p: "2px" }}
                          >
                            <RestartAlt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </StyledTableCell>
                  </TableRow>
                );
              })}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
