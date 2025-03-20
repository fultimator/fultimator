import React, { Fragment } from "react";
import { Paper, Grid, Typography, Divider, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import Clock from "./Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

export default function PlayerNotes({ player, setPlayer, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const StyledMarkdown = styled(ReactMarkdown)(({ theme }) => ({
    "& ul, & ol": {
      paddingLeft: theme.spacing(2),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      lineHeight: 1.2,
    },
    "& li": {
      marginLeft: 0,
      paddingLeft: theme.spacing(1),
      lineHeight: 1,
      marginBottom: theme.spacing(0.5),
    },
    "& p": {
      margin: 0,
      lineHeight: 1,
    },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  }));

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
      {player.notes.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={{
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                textTransform: "uppercase",
                padding: "5px",
                backgroundColor: primary,
                color: custom.white,
                borderRadius: "8px 8px 0 0",
                fontSize: "1.5em",
              }}
              align="center"
            >
              {t("Notes")}
            </Typography>

            <Grid container spacing={2} sx={{ padding: "1em" }}>
              {player.notes.map((note, noteIndex) => (
                <Fragment key={noteIndex}>
                  <Grid item xs={12} key={noteIndex}>
                    <Typography
                      variant="h2"
                      fontWeight={"bold"}
                      sx={{ textTransform: "uppercase" }}
                    >
                      {note.name + ": "}
                    </Typography>
                    <StyledMarkdown
                      sx={{
                        fontFamily: "PT Sans Narrow",
                        fontSize: "1rem",
                      }}
                    >
                      {note.description}
                    </StyledMarkdown>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={2}
                      sx={{ mt: 2 }}
                    >
                      {/* Render the clocks */}
                      {note.clocks &&
                        note.clocks.map((clock, clockIndex) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            key={clockIndex}
                            sx={{ textAlign: "center", py: 2 }}
                          >
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
                                handleClockStateChange(
                                  noteIndex,
                                  clockIndex,
                                  newState
                                )
                              }
                            />
                            <Grid container justifyContent="center">
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  resetClockState(noteIndex, clockIndex)
                                }
                                sx={{ mt: 1 }}
                              >
                                <RestartAltIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                  {noteIndex < player.notes.length - 1 && (
                    <Grid item xs={12} key={`divider-${noteIndex}`}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                  )}
                </Fragment>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
}
