import { useState } from "react";
import { Paper, Typography, IconButton, Box } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import {
  highlightMatch,
  highlightMarkdownText,
} from "/src/components/shared/actors/pc/variants/compact/highlightUtils";

function ActivityCard({ activity, searchQuery, normalizedQuery, theme, t }) {
  const [descOpen, setDescOpen] = useState(false);
  const hasDetails = activity.description || activity.effect;
  const forceOpen =
    !!normalizedQuery &&
    (activity.description?.toLowerCase().includes(normalizedQuery) ||
      activity.effect?.toLowerCase().includes(normalizedQuery));
  const isOpen = descOpen || forceOpen;

  return (
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
          {highlightMatch(activity.name, searchQuery)}
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
          {activity.description && (
            <Typography
              sx={{
                fontSize: "0.85rem",
                mb: 0.5,
                lineHeight: 1.45,
                color: "text.secondary",
              }}
            >
              <strong>{t("Target")}: </strong>
              {highlightMatch(activity.description, searchQuery)}
            </Typography>
          )}
          {activity.effect && (
            <NotesMarkdown compact>
              {highlightMarkdownText(activity.effect, searchQuery)}
            </NotesMarkdown>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function PcCompactCampActivities({ player, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activities = (player.campActivities ?? [])
    .filter((a) => a?.name)
    .filter(
      (a) =>
        !normalizedQuery ||
        a.name?.toLowerCase().includes(normalizedQuery) ||
        a.description?.toLowerCase().includes(normalizedQuery) ||
        a.effect?.toLowerCase().includes(normalizedQuery),
    );
  if (activities.length === 0) return null;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      <CompactSectionHeader title={t("Camp Activities (Max 2)")} />

      {/* 2-col card grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "4px",
          p: "4px",
        }}
      >
        {activities.map((activity, index) => (
          <ActivityCard
            key={index}
            activity={activity}
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
