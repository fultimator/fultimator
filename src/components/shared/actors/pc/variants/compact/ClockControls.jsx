import { Box, IconButton, Tooltip } from "@mui/material";
import { Add, Remove, RestartAlt } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import Clock from "/src/components/shared/actors/pc/playerSheet/Clock";
import { useClock } from "/src/hooks/useClock";

export default function ClockControls({
  sections,
  state,
  setState,
  label,
  theme,
  clockSize = 36,
  compact = false,
}) {
  const { t } = useTranslate();
  const {
    filledCount: filled,
    increment,
    decrement,
    reset,
  } = useClock(sections, state, setState);

  const controls = (
    <>
      <Tooltip title={t("Decrement")} arrow>
        <span>
          <IconButton size="small" disabled={filled === 0} onClick={decrement} sx={{ p: 0, width: 28, height: 28 }}>
            <Remove sx={{ fontSize: "1rem" }} />
          </IconButton>
        </span>
      </Tooltip>
      <Box
        sx={{
          width: 28, height: 28, borderRadius: "4px", bgcolor: "action.selected",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontFamily: "Antonio", fontSize: "0.75rem",
          fontWeight: "bold", lineHeight: 1, color: "text.primary",
        }}
      >
        {filled}/{sections}
      </Box>
      <Tooltip title={t("Increment")} arrow>
        <span>
          <IconButton size="small" disabled={filled >= sections} onClick={increment} sx={{ p: 0, width: 28, height: 28 }}>
            <Add sx={{ fontSize: "1rem" }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("Reset")} arrow>
        <IconButton size="small" onClick={reset} sx={{ p: 0, width: 28, height: 28 }}>
          <RestartAlt sx={{ fontSize: "1rem" }} />
        </IconButton>
      </Tooltip>
    </>
  );

  if (compact) {
    // Compact: always inline - clock left, name center, controls right
    return (
      <Box
        sx={{
          border: "1px solid", borderColor: "divider", borderRadius: "4px",
          overflow: "visible", display: "flex", alignItems: "center",
          gap: "6px", px: "7px", py: "4px",
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
      >
        <Box sx={{ alignSelf: "center", flexShrink: 0 }}>
          <Clock numSections={sections} size={clockSize} state={state} setState={setState} isCharacterSheet={true} />
        </Box>
        <Box sx={{ flex: 1, fontWeight: "bold", fontSize: "0.85rem", lineHeight: 1.3, overflow: "hidden", alignSelf: "center" }}>
          {label}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, gap: 0, alignSelf: "center" }}>
          {controls}
        </Box>
      </Box>
    );
  }

  // Full variant: container-query-driven layout
  // Narrow container (<= ~180px) → vertical stack: clock → name → controls
  // Wide container → horizontal: clock left, name+controls stacked right
  return (
    <Box
      sx={{
        containerType: "inline-size",
        border: "1px solid", borderColor: "divider", borderRadius: "4px",
        overflow: "hidden",
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: theme.primary },
        display: "flex",
        alignItems: "stretch",
        gap: "6px",
        px: "6px",
        py: "4px",
        "@container (max-width: 180px)": {
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          py: "8px",
        },
      }}
    >
      <Box
        sx={{
          alignSelf: "center",
          flexShrink: 0,
          "@container (max-width: 180px)": { alignSelf: "auto" },
        }}
      >
        <Clock numSections={sections} size={clockSize} state={state} setState={setState} isCharacterSheet={true} />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 0,
          overflow: "hidden",
          "@container (max-width: 180px)": {
            alignItems: "center",
            width: "100%",
          },
        }}
      >
        <Box
          sx={{
            fontWeight: "bold", fontSize: "0.85rem", lineHeight: 1.3,
            overflow: "hidden",
            "@container (max-width: 180px)": { textAlign: "center", width: "100%" },
          }}
        >
          {label}
        </Box>
        <Box
          sx={{
            display: "flex", alignItems: "center", gap: 0, mt: "2px",
            "@container (max-width: 180px)": { mt: 0 },
          }}
        >
          {controls}
        </Box>
      </Box>
    </Box>
  );
}
