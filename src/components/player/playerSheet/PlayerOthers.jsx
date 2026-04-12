import React from "react";
import { Paper, Grid, Typography, Divider, Button } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import Clock from "./Clock";

export default function PlayerOthers({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";

  const others = player.others;
  if (!others?.length) return null;

  const setClockState = (index, newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const updated = [...(prev.others ?? [])];
      updated[index] = { ...updated[index], clockState: newState };
      return { ...prev, others: updated };
    });
  };

  const resetClock = (index, sections) =>
    setClockState(index, new Array(sections).fill(false));

  return (
    <>
      {others.map((other, index) => {
        if (!other?.name) return null;

        const sections = other.clock?.sections ?? 0;
        const hasClock = sections > 0;
        const clockState =
          hasClock
            ? (other.clockState ?? new Array(sections).fill(false))
            : [];

        return (
          <React.Fragment key={index}>
            <Divider sx={{ my: 1 }} />
            <Paper
              elevation={3}
              sx={{
                borderRadius: "8px",
                border: "2px solid",
                borderColor: theme.secondary,
                display: "flex",
                flexDirection: "column",
                boxShadow: "none",
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
                {other.name}
              </Typography>

              <Grid container>
                {hasClock && (
                  <Grid
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      pt: 1,
                      pb: 0.5,
                    }}
                    size={12}>
                    <Clock
                      numSections={sections}
                      size={180}
                      state={clockState}
                      setState={(s) => setClockState(index, s)}
                    />
                  </Grid>
                )}

                {isEditMode && setPlayer && hasClock && (
                  <Grid sx={{ display: "flex", justifyContent: "center", pb: 1 }} size={12}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => resetClock(index, sections)}
                    >
                      {t("Reset Clock")}
                    </Button>
                  </Grid>
                )}

                {other.description && (
                  <Grid
                    sx={{
                      background: `linear-gradient(to right, ${theme.ternary}, ${isDarkMode ? "#252525" : "white"})`,
                      borderTop: hasClock
                        ? `1px solid ${theme.secondary}`
                        : undefined,
                      px: "10px",
                      py: "5px",
                    }}
                    size={12}>
                    <div
                      style={{
                        whiteSpace: "pre-line",
                        fontFamily: "PT Sans Narrow",
                        fontSize: "1rem",
                        fontStyle: "italic",
                      }}
                    >
                      <ReactMarkdown>{other.description}</ReactMarkdown>
                    </div>
                  </Grid>
                )}

                {other.effect && (
                  <Grid
                    sx={{
                      borderTop: `1px solid ${theme.secondary}`,
                      px: "10px",
                      py: "5px",
                    }}
                    size={12}>
                    <div
                      style={{
                        whiteSpace: "pre-line",
                        fontFamily: "PT Sans Narrow",
                        fontSize: "1rem",
                      }}
                    >
                      <ReactMarkdown>{other.effect}</ReactMarkdown>
                    </div>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </React.Fragment>
        );
      })}
    </>
  );
}
