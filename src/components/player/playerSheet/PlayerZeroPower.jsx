import React from "react";
import { Paper, Grid, Typography, Divider, IconButton, Tooltip } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import Clock from "./Clock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function PlayerZeroPower({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";

  const zeroPower = player.zeroPower;
  if (!zeroPower?.name) return null;

  const sections = zeroPower.clock?.sections ?? 6;
  const clockState = zeroPower.clockState ?? new Array(sections).fill(false);

  const setClockState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      zeroPower: { ...prev.zeroPower, clockState: newState },
    }));
  };

  const resetClock = () => setClockState(new Array(sections).fill(false));

  const incrementClock = () => {
    const currentFilled = clockState.filter(Boolean).length;
    if (currentFilled < sections) {
      const newState = new Array(sections).fill(false);
      for (let i = 0; i <= currentFilled; i++) {
        newState[i] = true;
      }
      setClockState(newState);
    }
  };

  const decrementClock = () => {
    const currentFilled = clockState.filter(Boolean).length;
    if (currentFilled > 0) {
      const newState = [...clockState];
      newState[currentFilled - 1] = false;
      setClockState(newState);
    }
  };

  const triggerName =
    typeof zeroPower.zeroTrigger === "string"
      ? zeroPower.zeroTrigger
      : zeroPower.zeroTrigger?.name ?? "";
  const triggerDesc =
    typeof zeroPower.zeroTrigger === "object"
      ? zeroPower.zeroTrigger?.description ?? ""
      : "";
  const effectName =
    typeof zeroPower.zeroEffect === "string"
      ? zeroPower.zeroEffect
      : zeroPower.zeroEffect?.name ?? "";
  const effectDesc =
    typeof zeroPower.zeroEffect === "object"
      ? zeroPower.zeroEffect?.description ?? ""
      : "";

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
          {t("Zero Power") + ": " + zeroPower.name}
        </Typography>

        <Grid container>
          {sections > 0 && (
            <Grid
              sx={{ display: "flex", justifyContent: "center", pt: 1, pb: 0.5 }}
              size={12}>
              <Clock
                numSections={sections}
                size={180}
                state={clockState}
                setState={setClockState}
              />
            </Grid>
          )}

          {isEditMode && setPlayer && (
            <Grid sx={{ display: "flex", justifyContent: "center", pb: 1, gap: 1 }} size={12}>
              <Tooltip title={t("Decrement")} arrow>
                <IconButton
                  color="primary"
                  onClick={decrementClock}
                  size="small"
                  variant="outlined"
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Reset")} arrow>
                <IconButton
                  color="primary"
                  onClick={resetClock}
                  size="small"
                  variant="outlined"
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Increment")} arrow>
                <IconButton
                  color="primary"
                  onClick={incrementClock}
                  size="small"
                  variant="outlined"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          )}

          {triggerName && (
            <Grid
              sx={{
                background: `linear-gradient(to right, ${theme.ternary}, ${isDarkMode ? "#252525" : "white"})`,
                borderTop: `1px solid ${theme.secondary}`,
                px: "10px",
                py: "5px",
              }}
              size={12}>
              <Typography
                sx={{ fontFamily: "PT Sans Narrow", fontSize: "1rem" }}
              >
                <strong>{t("Trigger")}: </strong>
                {triggerName}
              </Typography>
              {triggerDesc && (
                <Typography
                  sx={{
                    fontFamily: "PT Sans Narrow",
                    fontSize: "1rem",
                    fontStyle: "italic",
                  }}
                >
                  <ReactMarkdown>{triggerDesc}</ReactMarkdown>
                </Typography>
              )}
            </Grid>
          )}

          {effectName && (
            <Grid
              sx={{
                borderTop: `1px solid ${theme.secondary}`,
                px: "10px",
                py: "5px",
              }}
              size={12}>
              <Typography
                sx={{ fontFamily: "PT Sans Narrow", fontSize: "1rem" }}
              >
                <strong>{t("Effect")}: </strong>
                {effectName}
              </Typography>
              {effectDesc && (
                <Typography
                  sx={{ fontFamily: "PT Sans Narrow", fontSize: "1rem" }}
                >
                  <ReactMarkdown>{effectDesc}</ReactMarkdown>
                </Typography>
              )}
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
}
