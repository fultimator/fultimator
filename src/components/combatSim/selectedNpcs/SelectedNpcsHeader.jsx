import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { AccessTime, Notes, Replay } from "@mui/icons-material";
import { t } from "../../../translation/translate";
import { useTheme } from "@mui/material/styles";
import { calcInit } from "../../../libs/npcs";

export default function SelectedNpcsHeader({
  selectedNPCs,
  isMobile,
  onNotesClick,
  onClockClick,
  handleResetTurns,
}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const isDarkMode = theme.palette.mode === "dark";

  const isAllTurnsChecked = selectedNPCs?.every((npc) =>
    npc.combatStats.turns?.every(Boolean)
  );

  // Calculate the highest initiative for the selected NPCs
  const highestInit = Math.max(
    ...selectedNPCs
      .filter((npc) => npc.id !== undefined)
      .map((npc) => calcInit(npc))
      .concat([0]) // Add a default value in case the array is empty
  );
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        borderBottom: "1px solid #ccc",
        paddingBottom: 1,
        gap: 1,
      }}
    >
      {/* Left side */}
      {!isMobile && (
        <Typography
          variant={"h5"}
          sx={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {t("combat_sim_selected_npcs")}
        </Typography>
      )}

      {/* Center - Initiative */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: isMobile ? "left" : "center",
        }}
      >
        {selectedNPCs.length > 0 && (
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color={isDarkMode ? "#fff" : primary}
          >
            {t("combat_sim_npc_initiative")}: <strong>{highestInit}</strong>
          </Typography>
        )}
      </Box>

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
              border: `1px solid ${isDarkMode ? "#fff" : primary}`,
              boxShadow: 3,
            }}
            color={isDarkMode ? "inherit" : "primary"}
            onClick={onNotesClick}
          >
            <Notes />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color={isDarkMode ? "white" : "primary"}
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
              border: `1px solid ${isDarkMode ? "#fff" : primary}`,
              boxShadow: 3,
            }}
            color={isDarkMode ? "inherit" : "primary"}
            onClick={onClockClick}
          >
            <AccessTime />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color={isDarkMode ? "white" : "primary"}
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
              border: `1px solid ${isDarkMode ? "#fff" : primary}`,
              backgroundColor: isAllTurnsChecked ? "primary.main" : "inherit",
              boxShadow: 3,
            }}
            color={
              isAllTurnsChecked
                ? isDarkMode
                  ? "inherit"
                  : "white"
                : isDarkMode
                ? "inherit"
                : "primary"
            }
            onClick={handleResetTurns}
            disabled={selectedNPCs.length === 0}
          >
            <Replay />
          </IconButton>
        ) : (
          <Button
            size="small"
            sx={{ padding: "0 0.5rem" }}
            color={isDarkMode && !isAllTurnsChecked ? "white" : "primary"}
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
