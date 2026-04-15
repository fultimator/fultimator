import { Fragment } from "react";
import {
  Paper,
  Grid,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  Box,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/system";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { useTranslate } from "../../../translation/translate";
import NotesMarkdown from "../../common/NotesMarkdown";
import Clock from "./Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerNotes({
  player,
  setPlayer,
  isCharacterSheet,
  compact = false,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  if (visibleNotesWithIndices.length === 0) return null;

  const noteList = (
    <Box sx={{ p: compact ? { xs: 1, sm: 2 } : "1em", width: "100%" }}>
      {visibleNotesWithIndices.map(({ note, originalIndex }, visibleIndex) => (
        <Fragment key={originalIndex}>
          <Box
            sx={{
              mb: 2,
              p: compact ? 2 : 0,
              borderRadius: compact ? 2 : 0,
              bgcolor: compact ? "background.paper" : "transparent",
              boxShadow: compact && !isCharacterSheet ? 1 : "none",
            }}
          >
            {note.name && (
              <Typography
                variant={compact ? "subtitle1" : "h2"}
                sx={{
                  fontWeight: "bold",
                  mb: compact ? 2 : 0,
                  textTransform: "uppercase",
                }}
              >
                {note.name}
                {!compact && ": "}
              </Typography>
            )}

            {compact ? (
              <>
                <NotesMarkdown
                  sx={{
                    fontFamily: "PT Sans Narrow",
                    fontSize: "1rem",
                    lineHeight: 1.6,
                    "& p": { mb: 1.5 },
                  }}
                >
                  {note.description}
                </NotesMarkdown>

                {note.clocks && (
                  <Grid
                    container
                    spacing={3}
                    sx={{ mt: 2, justifyContent: "center" }}
                  >
                    {note.clocks.map((clock, clockIndex) => (
                      <Grid key={clockIndex} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Stack
                          sx={{ alignItems: "center", position: "relative" }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 1,
                              textAlign: "center",
                              fontWeight: "medium",
                            }}
                          >
                            {clock.name}
                          </Typography>
                          <Clock
                            isCharacterSheet={isCharacterSheet}
                            numSections={clock.sections}
                            size={isSmallScreen ? 140 : 180}
                            state={clock.state}
                            setState={(newState) =>
                              handleClockStateChange(
                                originalIndex,
                                clockIndex,
                                newState,
                              )
                            }
                          />
                          {!isCharacterSheet && (
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ mt: 1, justifyContent: "center" }}
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
                                  sx={{
                                    "&:hover": { bgcolor: "action.selected" },
                                  }}
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
                                  sx={{
                                    "&:hover": { bgcolor: "action.selected" },
                                  }}
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
                                  sx={{
                                    "&:hover": { bgcolor: "action.selected" },
                                  }}
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
                )}
              </>
            ) : (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <NotesMarkdown
                    sx={{
                      fontFamily: "PT Sans Narrow",
                      fontSize: "1rem",
                      lineHeight: 1,
                      "& p": { margin: 0 },
                    }}
                  >
                    {note.description}
                  </NotesMarkdown>
                </Grid>

                {note.clocks && (
                  <Grid
                    size={{ xs: 12, md: 4 }}
                    container
                    spacing={2}
                    sx={{ justifyContent: "center" }}
                  >
                    {note.clocks.map((clock, clockIndex) => (
                      <Grid
                        key={clockIndex}
                        size={{ xs: 12 }}
                        sx={{ textAlign: "center" }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            fontSize: "0.95em",
                            textTransform: "uppercase",
                            mb: 1,
                          }}
                        >
                          {clock.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 1,
                          }}
                        >
                          <Clock
                            numSections={clock.sections}
                            size={120}
                            state={clock.state}
                            setState={(newState) =>
                              handleClockStateChange(
                                originalIndex,
                                clockIndex,
                                newState,
                              )
                            }
                          />
                        </Box>
                        {!isCharacterSheet && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: "center" }}
                          >
                            <Tooltip
                              title={`${t("Decrement")} ${clock.name}`}
                              arrow
                            >
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  decrementClockState(originalIndex, clockIndex)
                                }
                                size="small"
                                sx={{ p: 0.5 }}
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
                                sx={{ p: 0.5 }}
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
                                  incrementClockState(originalIndex, clockIndex)
                                }
                                size="small"
                                sx={{ p: 0.5 }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            )}
          </Box>

          {visibleIndex < visibleNotesWithIndices.length - 1 && (
            <Divider sx={{ my: 2 }} />
          )}
        </Fragment>
      ))}
    </Box>
  );

  if (compact) {
    return (
      <Grid container spacing={0} sx={{ padding: 0 }}>
        <Table>
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
          borderColor: theme.secondary,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            textTransform: "uppercase",
            padding: "5px",
            backgroundColor: theme.primary,
            color: theme.white,
            borderRadius: "8px 8px 0 0",
            fontSize: "1.5em",
          }}
          align="center"
        >
          {t("Notes")}
        </Typography>
        {noteList}
      </Paper>
    </>
  );
}
