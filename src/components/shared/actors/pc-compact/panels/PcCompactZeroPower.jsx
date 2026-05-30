import { useState } from "react";
import { Paper, Typography, IconButton, Box } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import ClockControls from "../ClockControls";
import CompactSectionHeader from "../CompactSectionHeader";
import { highlightMatch, highlightMarkdownText } from "../highlightUtils";

export default function PcCompactZeroPower({
  player,
  setPlayer,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [descOpen, setDescOpen] = useState(false);

  const zeroPower = player.zeroPower;
  const sections = zeroPower?.clock?.sections ?? 6;
  const clockState = zeroPower?.clockState ?? new Array(sections).fill(false);

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      zeroPower: { ...prev.zeroPower, clockState: newState },
    }));
  };

  if (!zeroPower?.name) return null;

  const triggerName =
    typeof zeroPower.zeroTrigger === "string"
      ? zeroPower.zeroTrigger
      : (zeroPower.zeroTrigger?.name ?? "");
  const triggerDesc =
    typeof zeroPower.zeroTrigger === "object"
      ? (zeroPower.zeroTrigger?.description ?? "")
      : "";
  const effectName =
    typeof zeroPower.zeroEffect === "string"
      ? zeroPower.zeroEffect
      : (zeroPower.zeroEffect?.name ?? "");
  const effectDesc =
    typeof zeroPower.zeroEffect === "object"
      ? (zeroPower.zeroEffect?.description ?? "")
      : "";

  const hasDetails = triggerName || effectName;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matches =
    !normalizedQuery ||
    zeroPower.name?.toLowerCase().includes(normalizedQuery) ||
    triggerName?.toLowerCase().includes(normalizedQuery) ||
    triggerDesc?.toLowerCase().includes(normalizedQuery) ||
    effectName?.toLowerCase().includes(normalizedQuery) ||
    effectDesc?.toLowerCase().includes(normalizedQuery);
  if (!matches) return null;

  const forceOpen =
    !!normalizedQuery &&
    (triggerName?.toLowerCase().includes(normalizedQuery) ||
      triggerDesc?.toLowerCase().includes(normalizedQuery) ||
      effectName?.toLowerCase().includes(normalizedQuery) ||
      effectDesc?.toLowerCase().includes(normalizedQuery));
  const isOpen = descOpen || forceOpen;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader title={t("Zero Power")} />

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
              {highlightMatch(zeroPower.name, searchQuery)}
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
              {triggerName && (
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    mb: 0.5,
                    lineHeight: 1.45,
                    color: "text.secondary",
                  }}
                >
                  <strong>{t("Trigger")}: </strong>
                  {highlightMatch(triggerName, searchQuery)}
                </Typography>
              )}
              {triggerDesc && (
                <NotesMarkdown compact>
                  {highlightMarkdownText(triggerDesc, searchQuery)}
                </NotesMarkdown>
              )}
              {effectName && (
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    mb: 0.5,
                    lineHeight: 1.45,
                    color: "text.secondary",
                  }}
                >
                  <strong>{t("Effect")}: </strong>
                  {highlightMatch(effectName, searchQuery)}
                </Typography>
              )}
              {effectDesc && (
                <NotesMarkdown compact>
                  {highlightMarkdownText(effectDesc, searchQuery)}
                </NotesMarkdown>
              )}
            </Box>
          )}
        </Box>

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
      </Box>
    </Paper>
  );
}
