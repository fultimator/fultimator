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
  Table,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
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
  const customTheme = useCustomTheme();
  const theme = useTheme();

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
    <Grid
      container
      spacing={1}
      sx={{ p: 1, width: "100%", flex: 1, minWidth: 0 }}
    >
      {visibleNotesWithIndices.map(({ note, originalIndex }) => (
        <Grid item key={originalIndex} size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              height: "100%",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {note.name && (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  textTransform: "uppercase",
                  fontSize: "1rem",
                }}
              >
                {note.name}
              </Typography>
            )}

            {note.clocks && note.clocks.length === 1 ? (
              <Grid container spacing={1.5} alignItems="flex-start">
                <Grid item size={{ xs: 12, sm: 8 }}>
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
                <Grid item size={{ xs: 12, sm: 4 }}>
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
                        pt: 1,
                        pb: 0.5,
                      }}
                    >
                      <Clock
                        isCharacterSheet={isCharacterSheet}
                        numSections={note.clocks[0].sections}
                        size={100}
                        state={note.clocks[0].state}
                        setState={(newState) =>
                          handleClockStateChange(originalIndex, 0, newState)
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
                        {note.clocks[0].name}
                      </Typography>
                    </Box>
                    {!isCharacterSheet && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ mt: 0, justifyContent: "center" }}
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
          </Card>
        </Grid>
      ))}
    </Grid>
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
