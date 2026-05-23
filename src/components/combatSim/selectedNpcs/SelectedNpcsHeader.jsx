import React from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { AccessTime, Close, Notes, Replay, TouchApp } from "@mui/icons-material";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { useCombatEncounterStore } from "../../../stores/combatEncounterStore";

export default function SelectedNpcsHeader({
  selectedNPCs,
  isMobile,
  onNotesClick,
  onClockClick,
  handleResetTurns,
  onClearAll,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const interactionMode = useCombatEncounterStore((s) => s.interactionMode);
  const setInteractionMode = useCombatEncounterStore(
    (s) => s.setInteractionMode,
  );

  const isAllTurnsChecked = selectedNPCs?.every((npc) =>
    npc.combatStats.turns?.every(Boolean),
  );
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: 1,
        gap: 1,
      }}
    >
      {/* Left side - interaction mode toggle + clear button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={interactionMode}
          onChange={(_, val) => {
            if (val !== null) setInteractionMode(val);
          }}
          sx={{ "& .MuiToggleButton-root": { px: 0.75, py: 0.5 } }}
        >
          <ToggleButton value="select">
            <Tooltip title="Select mode: click to open actor sheet">
              <TouchApp fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="target">
            <Tooltip title="Target mode: T to target, Shift+T to multi-target">
              <img
                src="/assets/icons/checks/roll_target.png"
                style={{ width: 16, height: 16 }}
                alt="target"
              />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Clear targets & selection">
          <IconButton
            size="small"
            onClick={onClearAll}
            sx={{ color: "text.secondary" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Right side - Buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 2 : 1,
        }}
      >
        {isMobile ? (
          <IconButton
            size="small"
            sx={{
              padding: 0.5,
              border: `1px solid ${primary}`,
              boxShadow: 3,
            }}
            color="primary"
            onClick={onNotesClick}
          >
            <Notes />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color="primary"
            variant="outlined"
            onClick={onNotesClick}
            endIcon={<Notes />}
          >
            {t("combat_sim_notes_button")}
          </Button>
        )}
        {isMobile ? (
          <IconButton
            size="small"
            sx={{
              padding: 0.5,
              border: `1px solid ${primary}`,
              boxShadow: 3,
            }}
            color="primary"
            onClick={onClockClick}
          >
            <AccessTime />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color="primary"
            variant="outlined"
            onClick={onClockClick}
            endIcon={<AccessTime />}
          >
            {t("clocks_section_title")}
          </Button>
        )}
        {isMobile ? (
          <IconButton
            size="small"
            sx={{
              padding: 0.5,
              border: `1px solid ${primary}`,
              backgroundColor: isAllTurnsChecked ? "primary.main" : "inherit",
              boxShadow: 3,
            }}
            color="primary"
            onClick={handleResetTurns}
            disabled={selectedNPCs.length === 0}
          >
            <Replay />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color="primary"
            variant={isAllTurnsChecked ? "contained" : "outlined"}
            onClick={handleResetTurns}
            endIcon={<Replay />}
            disabled={selectedNPCs.length === 0}
          >
            {t("combat_sim_next_round")}
          </Button>
        )}
      </Box>
    </Box>
  );
}
