import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  StickyNote2Outlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
} from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../common/NotesMarkdown";
import ClockControls from "../pc-compact/ClockControls";
import { highlightMatch } from "../core-utils";
import { highlightMarkdownText } from "../pc-compact/highlightUtils";

function NoteClockCard({ clock, clockIndex, noteOriginalIndex, setPlayer, searchQuery, compact, theme }) {
  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      notes: prev.notes.map((note, ni) =>
        ni !== noteOriginalIndex ? note : {
          ...note,
          clocks: note.clocks.map((c, ci) => ci !== clockIndex ? c : { ...c, state: newState }),
        },
      ),
    }));
  };

  return (
    <ClockControls
      sections={clock.sections}
      state={clock.state}
      setState={persistState}
      clockSize={compact ? 36 : 60}
      compact={compact}
      label={
        <Typography
          sx={{ fontWeight: "bold", fontSize: compact ? "0.85rem" : "0.9rem", lineHeight: 1.3 }}
          noWrap
        >
          {highlightMatch(clock.name, searchQuery)}
        </Typography>
      }
      theme={theme}
    />
  );
}

/**
 * Shared note card: title row (collapsible description) + clock grid.
 *
 * Props:
 *   note             - note object with name, description, clocks
 *   noteIndex        - display index (for row key)
 *   isOpen           - whether description is expanded
 *   onToggle         - () => void
 *   setPlayer        - state updater for clock persistence
 *   searchQuery      - active search string
 *   isEditMode       - show edit button
 *   onEdit           - (originalIndex) => void
 *   compact          - compact vs full variant
 */
export default function NoteCard({
  note,
  noteIndex,
  isOpen,
  onToggle,
  setPlayer,
  searchQuery = "",
  isEditMode = false,
  onEdit,
  compact = false,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleClocks = (note.clocks || [])
    .map((clock, originalIdx) => ({ clock, originalIdx }))
    .filter(({ clock }) => !normalizedQuery || clock?.name?.toLowerCase().includes(normalizedQuery));

  const clockGridCols = compact
    ? "1fr 1fr"
    : { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" };

  const titleFontSize = compact ? "0.85rem" : "0.9rem";

  return (
    <React.Fragment>
      {note.description ? (
        <Accordion
          disableGutters
          elevation={0}
          square
          expanded={isOpen}
          onChange={onToggle}
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: `${theme.panelRadius}px`,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            sx={{
              p: 0,
              minHeight: 44,
              "& .MuiAccordionSummary-content": { m: 0 },
              "& .MuiAccordionSummary-expandIconWrapper": { display: "none" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 44, width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                  px: 1,
                  cursor: "pointer",
                }}
              >
                <IconButton
                  component="span"
                  size="small"
                  sx={{ p: 0.5, flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); onToggle(); }}
                >
                  {isOpen
                    ? <KeyboardArrowUp sx={{ fontSize: "1.1rem" }} />
                    : <KeyboardArrowDown sx={{ fontSize: "1.1rem" }} />}
                </IconButton>
                <Typography
                  sx={{ flex: 1, fontFamily: "Antonio", fontWeight: 800, fontSize: titleFontSize, textTransform: "uppercase", lineHeight: 1.3, ml: 0.5 }}
                  noWrap
                >
                  {highlightMatch(note.name, searchQuery)}
                </Typography>
              </Box>
              {isEditMode && onEdit && (
                <Box
                  sx={{
                    bgcolor: theme.primary,
                    display: "flex",
                    alignItems: "center",
                    alignSelf: "stretch",
                    px: 1,
                    gap: 0.25,
                  }}
                >
                  <Tooltip title={t("Edit Note")}>
                    <IconButton
                      component="span"
                      size="small"
                      sx={{ p: 0.5, color: "#fff" }}
                      onClick={(e) => { e.stopPropagation(); onEdit(note.originalIndex); }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
              <NotesMarkdown uniform fontSize="1rem">
                {highlightMarkdownText(note.description, searchQuery)}
              </NotesMarkdown>
            </Box>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Card sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "stretch", minHeight: 44 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
                px: 1,
                cursor: "default",
              }}
            >
              <StickyNote2Outlined sx={{ fontSize: "1.1rem", color: theme.secondary, flexShrink: 0, mx: 0.5 }} />
              <Typography
                sx={{ flex: 1, fontFamily: "Antonio", fontWeight: 800, fontSize: titleFontSize, textTransform: "uppercase", lineHeight: 1.3, ml: 0.5 }}
                noWrap
              >
                {highlightMatch(note.name, searchQuery)}
              </Typography>
            </Box>
            {isEditMode && onEdit && (
              <Box
                sx={{
                  bgcolor: theme.primary,
                  display: "flex",
                  alignItems: "center",
                  alignSelf: "stretch",
                  px: 1,
                  gap: 0.25,
                }}
              >
                <Tooltip title={t("Edit Note")}>
                  <IconButton
                    component="span"
                    size="small"
                    sx={{ p: 0.5, color: "#fff" }}
                    onClick={(e) => { e.stopPropagation(); onEdit(note.originalIndex); }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Card>
      )}

      {visibleClocks.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: clockGridCols, gap: "4px" }}>
          {visibleClocks.map(({ clock, originalIdx }) => (
            <NoteClockCard
              key={`clock-${noteIndex}-${originalIdx}`}
              clock={clock}
              clockIndex={originalIdx}
              noteOriginalIndex={note.originalIndex}
              setPlayer={setPlayer}
              searchQuery={searchQuery}
              compact={compact}
              theme={theme}
            />
          ))}
        </Box>
      )}
    </React.Fragment>
  );
}
