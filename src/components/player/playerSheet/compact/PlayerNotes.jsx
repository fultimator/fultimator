import React, { Fragment } from "react";
import {
  Paper,
  Grid,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  Box,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { fontSize, styled, width } from "@mui/system";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { useTranslate } from "../../../../translation/translate";
import NotesMarkdown from "../../../common/NotesMarkdown";
import Clock from "../Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

export default function PlayerNotes({ player, setPlayer, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  return (
    <>
      {player.notes.filter((note) => note.showInPlayerSheet !== false).length >
        0 && (
        <>
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
            <Box sx={{ p: { xs: 1, sm: 2 }, width: "100%" }}>            {player.notes
              .filter((note) => note.showInPlayerSheet !== false)
              .map((note, noteIndex) => (
                <Fragment key={noteIndex}>
                  <Box
                    sx={{
                      mb: 4,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      boxShadow: isCharacterSheet ? "none" : 1,
                    }}
                  >
                    {note.name && (
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 2,
                          fontWeight: "bold",
                          color: "theme.secondary",
                        }}
                      >
                        {note.name}
                      </Typography>
                    )}

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
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={3}
                            key={clockIndex}
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Stack
                              alignItems="center"
                              sx={{ position: "relative" }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 1,
                                  textAlign: "center",
                                  fontWeight: "medium",
                                  color: "theme.secondary",
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
                                    noteIndex,
                                    clockIndex,
                                    newState
                                  )
                                }
                              />
                              {!isCharacterSheet && (
                                <Tooltip
                                  title={`${t("Reset")} ${clock.name}`}
                                  arrow
                                >
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      resetClockState(noteIndex, clockIndex)
                                    }
                                    sx={{
                                      mt: 1,
                                      bgcolor: "background.default",
                                      "&:hover": {
                                        bgcolor: "action.selected",
                                      },
                                    }}
                                  >
                                    <RestartAltIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>

                  {noteIndex <
                    player.notes.filter(
                      (note) => note.showInPlayerSheet !== false
                    ).length -
                      1 && <Divider sx={{ my: 2 }} />}
                </Fragment>
              ))}
          </Box>
        </Grid>
        </>
      )}
    </>
  );
}
