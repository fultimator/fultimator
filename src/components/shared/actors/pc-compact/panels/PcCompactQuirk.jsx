import { useState } from "react";
import { Paper, Typography, IconButton, Box } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import ClockControls from "../ClockControls";
import CompactSectionHeader from "../CompactSectionHeader";
import { highlightMatch, highlightMarkdownText } from "../highlightUtils";

export default function PcCompactQuirk({ player, setPlayer, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [descOpen, setDescOpen] = useState(false);

  const quirk = player.quirk;
  if (!quirk?.name) return null;

  const sections = quirk.clock?.sections ?? 0;
  const clockState =
    sections > 0
      ? (quirk.clockState ?? new Array(sections).fill(false))
      : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      quirk: { ...prev.quirk, clockState: newState },
    }));
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasDetails = quirk.description || quirk.effect;
  const matches =
    !normalizedQuery ||
    quirk.name?.toLowerCase().includes(normalizedQuery) ||
    quirk.description?.toLowerCase().includes(normalizedQuery) ||
    quirk.effect?.toLowerCase().includes(normalizedQuery);
  if (!matches) return null;

  const forceOpen =
    !!normalizedQuery &&
    (quirk.description?.toLowerCase().includes(normalizedQuery) ||
      quirk.effect?.toLowerCase().includes(normalizedQuery));
  const isOpen = descOpen || forceOpen;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader title={t("Quirk")} />

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "4px" }}
      >
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
            {hasDetails && (
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
              {highlightMatch(quirk.name, searchQuery)}
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
              {quirk.description && (
                <NotesMarkdown compact>
                  {highlightMarkdownText(quirk.description, searchQuery)}
                </NotesMarkdown>
              )}
              {quirk.effect && (
                <NotesMarkdown compact>
                  {highlightMarkdownText(quirk.effect, searchQuery)}
                </NotesMarkdown>
              )}
            </Box>
          )}
        </Box>

        {/* Clock */}
        {sections > 0 && (
          <ClockControls
            sections={sections}
            state={clockState}
            setState={persistState}
            label={
              <Typography
                sx={{ fontWeight: "bold", fontSize: "0.85rem", lineHeight: 1.3 }}
                noWrap
              >
                {t("Clock")}
              </Typography>
            }
            clockSize={36}
            compact
            theme={theme}
          />
        )}
      </Box>
    </Paper>
  );
}
