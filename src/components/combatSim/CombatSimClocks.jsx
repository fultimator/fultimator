import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Slider,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
} from "@mui/material";
import {
  RemoveCircleOutline,
  RestartAlt,
  Close,
  Add,
  ExpandMore,
  ExpandLess,
  AccessTime,
} from "@mui/icons-material";
import Clock from "../player/playerSheet/Clock";
import { t } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";

export default function CombatSimClocks({
  open,
  onClose,
  clocks,
  onSave,
  onUpdate,
  onRemove,
  onReset,
  addLog,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);
  const [expanded, setExpanded] = useState(false);

  const isClockNameEmpty = !clockName.trim();
  const isMaxClocksReached = clocks.length >= 9;
  const isButtonDisabled = isClockNameEmpty || isMaxClocksReached;
  const shouldShowTooltip = isClockNameEmpty && !isMaxClocksReached;

  const { logClockCurrentState } =
    useCombatSimSettingsStore.getState().settings;

  useEffect(() => {
    if (clocks.length === 0) {
      setExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClockNameChange = (e) => {
    setClockName(e.target.value);
  };

  const handleSectionChange = (event, newValue) => {
    setClockSections(newValue);
  };

  const handleAddClock = () => {
    if (!clockName.trim()) {
      if (window.electron) {
        window.electron.alert(t("clocks_name_required"));
      } else {
        alert(t("clocks_name_required"));
      }
      return;
    }

    onSave({
      name: clockName,
      sections: clockSections,
      state: new Array(clockSections).fill(false),
    });

    setClockName("");
    setClockSections(4);
  };

  const handleClockStateChange = (index, newState) => {
    onUpdate(index, newState);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleClose = () => {
    setExpanded(false);
    onClose();
  };

  const logCurrentClock = (index) => {
    const clock = clocks[index];
    if (logClockCurrentState) {
      addLog("combat_sim_log_clock_current_state", "--isClock--", {
        name: clock.name,
        current: clock.state.filter(Boolean).length,
        max: clock.sections,
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
          {t("clocks_section_title")}
        </Typography>
        <IconButton onClick={handleClose} size="small" aria-label="close">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Add new clock section - Collapsible */}
          {!isMaxClocksReached && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  mt: 2,
                  transition: theme.transitions.create("all"),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={toggleExpanded}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Add
                      sx={{
                        mr: 1,
                        color: isDarkMode ? "white" : "primary.main",
                      }}
                    />
                    <Typography variant="h5">
                      {t("clocks_add_button")}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={expanded ? "collapse" : "expand"}
                    size="small"
                  >
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          autoFocus={expanded}
                          fullWidth
                          label={t("clocks_name_label")}
                          value={clockName}
                          onChange={handleClockNameChange}
                          inputProps={{ maxLength: 30 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          {t("clocks_sections_title")}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Slider
                            value={clockSections}
                            onChange={handleSectionChange}
                            step={1}
                            marks
                            min={2}
                            max={30}
                            valueLabelDisplay="auto"
                            sx={{ flexGrow: 1, mr: 2 }}
                          />
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: "bold", minWidth: "15px" }}
                          >
                            {clockSections}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Tooltip
                          title={t("clocks_name_required")}
                          disableHoverListener={!shouldShowTooltip}
                          disableFocusListener={!shouldShowTooltip}
                          disableTouchListener={!shouldShowTooltip}
                        >
                          <span style={{ width: "100%" }}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={handleAddClock}
                              disabled={isButtonDisabled}
                              startIcon={<Add />}
                            >
                              {t("clocks_add_button")}
                            </Button>
                          </span>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Paper>
            </Grid>
          )}

          {/* Existing clocks or Empty state */}
          <Grid item xs={12}>
            {clocks.length > 0 ? (
              <>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {clocks.map((clock, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          position: "relative",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ position: "absolute", right: 8, top: 8 }}>
                          <Tooltip title={t("clocks_reset_tooltip")}>
                            <IconButton
                              size="small"
                              onClick={() => onReset(index)}
                              sx={{ mr: 1 }}
                            >
                              <RestartAlt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("clocks_remove_tooltip")}>
                            <IconButton
                              size="small"
                              onClick={() => onRemove(index)}
                              color="error"
                            >
                              <RemoveCircleOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box sx={{ position: "absolute", left: 8, bottom: 8 }}>
                          <Tooltip title={t("combat_sim_clock_log_button")}>
                            <IconButton
                              size="small"
                              onClick={() => logCurrentClock(index)}
                              color={isDarkMode ? "secondary" : "primary"}
                            >
                              <AccessTime fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mb: 2,
                            fontWeight: "medium",
                            textAlign: "center",
                            mt: 1,
                          }}
                        >
                          {clock.name}
                        </Typography>
                        <Clock
                          numSections={clock.sections}
                          size={140}
                          state={clock.state}
                          setState={(newState) =>
                            handleClockStateChange(index, newState)
                          }
                          isCharacterSheet={false}
                        />
                        <Typography
                          variant="caption"
                          sx={{ mt: 1, color: "text.secondary" }}
                        >
                          {clock.state.filter(Boolean).length}/{clock.sections}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                  mt: 2,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "primary.main",
                    mb: 2,
                  }}
                >
                  <Clock
                    numSections={4}
                    size={60}
                    state={[false, false, false, false]}
                    setState={() => {}}
                    isCharacterSheet={false}
                  />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
                  {t("clocks_empty_list")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    maxWidth: 400,
                  }}
                >
                  {t("clocks_create_new_helper")}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="primary">
          {t("Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
