import { useState } from "react";
import { Box, IconButton, InputBase, Tooltip } from "@mui/material";
import { Add, Remove, RestartAlt } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import Clock from "/src/components/shared/actors/pc/playerSheet/Clock";
import { useClock } from "/src/hooks/useClock";

export default function ClockControls({
  sections,
  state,
  setState,
  label,
  secondaryLabel,
  theme,
  clockSize = 36,
  compact = false,
}) {
  const { t } = useTranslate();
  const {
    filledCount: filled,
    set,
    increment,
    decrement,
    reset,
  } = useClock(sections, state, setState);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEditing = () => {
    setDraft(String(filled));
    setEditing(true);
  };

  const commitEditing = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, 0), sections);
      const next = new Array(sections).fill(false);
      for (let i = 0; i < clamped; i++) next[i] = true;
      set(next);
    }
    setEditing(false);
  };

  const controls = (
    <>
      <Tooltip title={t("Decrement")} arrow>
        <span>
          <IconButton
            disabled={filled === 0}
            onClick={decrement}
            sx={{ p: 0, width: 40, height: 40 }}
          >
            <Remove sx={{ fontSize: "1.4rem" }} />
          </IconButton>
        </span>
      </Tooltip>
      <Box
        onClick={editing ? undefined : startEditing}
        sx={{
          width: 40,
          height: 40,
          borderRadius: "4px",
          bgcolor: "action.selected",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "Antonio",
          fontSize: "1rem",
          fontWeight: "bold",
          lineHeight: 1,
          color: "text.primary",
          cursor: editing ? "default" : "pointer",
        }}
      >
        {editing ? (
          <InputBase
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitEditing}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEditing();
              } else if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            inputProps={{
              inputMode: "numeric",
              style: {
                width: "100%",
                padding: 0,
                textAlign: "center",
                fontFamily: "Antonio",
                fontSize: "1rem",
                fontWeight: "bold",
                lineHeight: 1,
              },
            }}
          />
        ) : (
          `${filled}/${sections}`
        )}
      </Box>
      <Tooltip title={t("Increment")} arrow>
        <span>
          <IconButton
            disabled={filled >= sections}
            onClick={increment}
            sx={{ p: 0, width: 40, height: 40 }}
          >
            <Add sx={{ fontSize: "1.4rem" }} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("Reset")} arrow>
        <IconButton onClick={reset} sx={{ p: 0, width: 40, height: 40 }}>
          <RestartAlt sx={{ fontSize: "1.4rem" }} />
        </IconButton>
      </Tooltip>
    </>
  );

  if (compact) {
    // Compact: clock left, name + secondary name stacked center, controls right
    return (
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "4px",
          overflow: "visible",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          px: "7px",
          py: "4px",
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
      >
        <Box
          sx={{
            alignSelf: "center",
            flexShrink: 0,
            display: "flex",
            lineHeight: 0,
          }}
        >
          <Clock
            numSections={sections}
            size={clockSize}
            state={state}
            setState={setState}
            isCharacterSheet={true}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              fontWeight: "bold",
              fontSize: "0.95rem",
              lineHeight: 1.3,
              overflow: "hidden",
            }}
          >
            {label}
          </Box>
          {secondaryLabel && (
            <Box
              sx={{
                fontSize: "0.85rem",
                lineHeight: 1.3,
                overflow: "hidden",
                color: "text.secondary",
              }}
            >
              {secondaryLabel}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gap: 0,
            alignSelf: "center",
          }}
        >
          {controls}
        </Box>
      </Box>
    );
  }

  // Full variant: container-query-driven layout
  // Narrow container (<= ~260px) → vertical stack: clock → name → controls
  // Wide container → horizontal: clock left, name+controls stacked right
  return (
    <Box
      sx={{
        containerType: "inline-size",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "4px",
        overflow: "hidden",
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: theme.primary },
        display: "flex",
        alignItems: "stretch",
        gap: "6px",
        px: "6px",
        py: "4px",
        "@container (max-width: 260px)": {
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
          "@container (max-width: 260px)": { alignSelf: "auto" },
        }}
      >
        <Clock
          numSections={sections}
          size={clockSize}
          state={state}
          setState={setState}
          isCharacterSheet={true}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 0,
          overflow: "hidden",
          "@container (max-width: 260px)": {
            alignItems: "center",
            width: "100%",
          },
        }}
      >
        <Box
          sx={{
            fontWeight: "bold",
            fontSize: "0.95rem",
            lineHeight: 1.3,
            overflow: "hidden",
            "@container (max-width: 260px)": {
              textAlign: "center",
              width: "100%",
            },
          }}
        >
          {label}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            mt: "2px",
            "@container (max-width: 260px)": { mt: 0 },
          }}
        >
          {controls}
        </Box>
      </Box>
    </Box>
  );
}
