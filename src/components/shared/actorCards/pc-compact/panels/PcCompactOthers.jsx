import { useState } from "react";
import { Paper, Typography, IconButton, Box } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  StickyNote2Outlined,
} from "@mui/icons-material";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import ClockControls from "../ClockControls";
import CompactSectionHeader from "../CompactSectionHeader";
import { highlightMatch, highlightMarkdownText } from "../highlightUtils";

function OtherCard({
  other,
  index,
  setPlayer,
  searchQuery,
  normalizedQuery,
  theme,
  t,
}) {
  const [descOpen, setDescOpen] = useState(false);

  const sections = other.clock?.sections ?? 0;
  const hasClock = sections > 0;
  const clockState = hasClock
    ? (other.clockState ?? new Array(sections).fill(false))
    : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => {
      const updated = [...(prev.others ?? [])];
      updated[index] = { ...updated[index], clockState: newState };
      return { ...prev, others: updated };
    });
  };

  const hasDetails = other.description || other.effect;
  const forceOpen =
    !!normalizedQuery &&
    (other.description?.toLowerCase().includes(normalizedQuery) ||
      other.effect?.toLowerCase().includes(normalizedQuery));
  const isOpen = descOpen || forceOpen;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {/* Name card */}
      <Box
        onClick={() => hasDetails && setDescOpen((v) => !v)}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: `${theme.panelRadius}px`,
          overflow: "hidden",
          cursor: hasDetails ? "pointer" : "default",
          transition: "border-color 0.15s ease",
          "&:hover": { borderColor: theme.primary },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: "8px",
            py: "5px",
          }}
        >
          {hasDetails ? (
            <IconButton
              size="small"
              sx={{ p: 0, flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setDescOpen((v) => !v);
              }}
            >
              {isOpen ? (
                <KeyboardArrowUp sx={{ fontSize: "1rem" }} />
              ) : (
                <KeyboardArrowDown sx={{ fontSize: "1rem" }} />
              )}
            </IconButton>
          ) : (
            <StickyNote2Outlined
              sx={{ fontSize: "1rem", color: theme.secondary, flexShrink: 0 }}
            />
          )}
          <Typography
            sx={{
              flex: 1,
              fontWeight: "bold",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
            noWrap
          >
            {highlightMatch(other.name, searchQuery)}
          </Typography>
        </Box>
        {hasDetails && isOpen && (
          <Box
            sx={{
              px: 1.5,
              py: 0.75,
              bgcolor: "rgba(0,0,0,0.03)",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {other.description && (
              <NotesMarkdown compact>
                {highlightMarkdownText(other.description, searchQuery)}
              </NotesMarkdown>
            )}
            {other.effect && (
              <NotesMarkdown compact>
                {highlightMarkdownText(other.effect, searchQuery)}
              </NotesMarkdown>
            )}
          </Box>
        )}
      </Box>

      {hasClock && (
        <ClockControls
          sections={sections}
          state={clockState}
          setState={persistState}
          label={t("Clock")}
          theme={theme}
        />
      )}
    </Box>
  );
}

export default function PcCompactOthers({
  player,
  setPlayer,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const others = (player.others ?? [])
    .map((o, i) => ({ ...o, originalIndex: i }))
    .filter((o) => o?.name)
    .filter(
      (o) =>
        !normalizedQuery ||
        o.name?.toLowerCase().includes(normalizedQuery) ||
        o.description?.toLowerCase().includes(normalizedQuery) ||
        o.effect?.toLowerCase().includes(normalizedQuery),
    );
  if (others.length === 0) return null;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader title={t("Other Optionals")} />

      {/* Card list */}
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "4px" }}
      >
        {others.map((other) => (
          <OtherCard
            key={other.originalIndex}
            other={other}
            index={other.originalIndex}
            setPlayer={setPlayer}
            searchQuery={searchQuery}
            normalizedQuery={normalizedQuery}
            theme={theme}
            t={t}
          />
        ))}
      </Box>
    </Paper>
  );
}
