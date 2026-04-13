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
      player.notes[originalNoteIndex].clocks[clockIndex].sections
    ).fill(false);
    handleClockStateChange(originalNoteIndex, clockIndex, resetState);
  };

  if (visibleNotesWithIndices.length === 0) return null;

  const noteList = (
    <Box sx={{ p: compact ? { xs: 1, sm: 2 } : "1em", width: "100%" }}>
      {visibleNotesWithIndices.map(({ note, originalIndex }, visibleIndex) => (
        <Fragment key={originalIndex}>
          <Box
            sx={{
              mb: 4,
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
                  textTransform: "uppercase"
                }}>
                {note.name}
                {!compact && ": "}
              </Typography>
            )}

            <NotesMarkdown
              sx={{
                fontFamily: "PT Sans Narrow",
                fontSize: "1rem",
                lineHeight: compact ? 1.6 : 1,
                "& p": compact ? { mb: 1.5 } : { margin: 0 },
              }}
            >
              {note.description}
            </NotesMarkdown>

            {note.clocks && (
              <Grid
                container
                spacing={compact ? 3 : 2}
                sx={{ mt: 2, justifyContent: "center" }}
              >
                {note.clocks.map((clock, clockIndex) => (
                  <Grid
                    key={clockIndex}
                    sx={
                      compact
                        ? { display: "flex", flexDirection: "column" }
                        : { textAlign: "center", py: 2 }
                    }
                    size={{
                      xs: 12,
                      sm: 6,
                      md: compact ? 3 : undefined
                    }}>
                    {compact ? (
                      <Stack sx={{ alignItems: "center", position: "relative" }}>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, textAlign: "center", fontWeight: "medium" }}
                        >
                          {clock.name}
                        </Typography>
                        <Clock
                          isCharacterSheet={isCharacterSheet}
                          numSections={clock.sections}
                          size={isSmallScreen ? 140 : 180}
                          state={clock.state}
                          setState={(newState) =>
                            handleClockStateChange(originalIndex, clockIndex, newState)
                          }
                        />
                        {!isCharacterSheet && (
                          <Tooltip title={`${t("Reset")} ${clock.name}`} arrow>
                            <IconButton
                              color="primary"
                              onClick={() => resetClockState(originalIndex, clockIndex)}
                              sx={{
                                mt: 1,
                                "&:hover": { bgcolor: "action.selected" },
                              }}
                            >
                              <RestartAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    ) : (
                      <>
                        <Typography
                          variant="h4"
                          sx={{
                            mb: 1,
                            fontWeight: "bold",
                            fontSize: "1.2em",
                            textTransform: "uppercase",
                          }}
                        >
                          {clock.name}
                        </Typography>
                        <Clock
                          numSections={clock.sections}
                          size={200}
                          state={clock.state}
                          setState={(newState) =>
                            handleClockStateChange(originalIndex, clockIndex, newState)
                          }
                        />
                        <Grid container sx={{ justifyContent: "center" }}>
                          <IconButton
                            color="primary"
                            onClick={() => resetClockState(originalIndex, clockIndex)}
                            sx={{ mt: 1 }}
                          >
                            <RestartAltIcon />
                          </IconButton>
                        </Grid>
                      </>
                    )}
                  </Grid>
                ))}
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
