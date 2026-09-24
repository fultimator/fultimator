import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useCombatProgressClocksStore } from "../../../store/combatProgressClocksStore";
import ClockControls from "../../shared/actors/pc/variants/compact/ClockControls";

export const ProgressClocksPanel = () => {
  const { t } = useTranslate();
  const theme = useTheme();
  const encounterClocks = useCombatProgressClocksStore(
    (s) => s.encounterClocks,
  );
  const actorClockEntries = useCombatProgressClocksStore(
    (s) => s.actorClockEntries,
  );
  const onUpdateEncounterClock = useCombatProgressClocksStore(
    (s) => s.onUpdateEncounterClock,
  );
  const onUpdateActorClock = useCombatProgressClocksStore(
    (s) => s.onUpdateActorClock,
  );

  const hasEncounterClocks = encounterClocks.length > 0;
  const hasActorClocks = actorClockEntries.length > 0;

  if (!hasEncounterClocks && !hasActorClocks) {
    return (
      <Box
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("clocks_empty_list")}
        </Typography>
      </Box>
    );
  }

  const sectionTitleSx = {
    mb: 0.75,
    fontWeight: "bold",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    color: "text.secondary",
  };

  return (
    <Box
      sx={{
        p: 1.5,
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      {hasEncounterClocks && (
        <Box>
          <Typography sx={sectionTitleSx}>
            {t("clocks_section_title")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {encounterClocks.map((clock, index) => (
              <ClockControls
                key={index}
                sections={clock.sections}
                state={clock.state}
                setState={(newState) => onUpdateEncounterClock(index, newState)}
                label={clock.name}
                theme={{ primary: theme.palette.primary.main }}
                clockSize={36}
                compact
              />
            ))}
          </Box>
        </Box>
      )}

      {hasEncounterClocks && hasActorClocks && <Divider sx={{ my: 0.25 }} />}

      {hasActorClocks && (
        <Box>
          <Typography sx={sectionTitleSx}>{t("Clocks")}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {actorClockEntries.map((entry) => (
              <ClockControls
                key={`${entry.actorCombatId}-${entry.noteIndex}-${entry.clockIndex}`}
                sections={entry.clock.sections}
                state={entry.clock.state}
                setState={(newState) =>
                  onUpdateActorClock({
                    actorKind: entry.actorKind,
                    actorCombatId: entry.actorCombatId,
                    noteIndex: entry.noteIndex,
                    clockIndex: entry.clockIndex,
                    newState,
                  })
                }
                label={entry.clock.name}
                secondaryLabel={entry.actorName}
                theme={{ primary: theme.palette.primary.main }}
                clockSize={36}
                compact
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
