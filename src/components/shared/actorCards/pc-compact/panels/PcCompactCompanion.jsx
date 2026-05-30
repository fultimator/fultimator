import { Paper, Typography, Box } from "@mui/material";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import NpcActorCard from "../../../actorCards/npc/NpcActorCard";

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmed = query?.trim();
  if (!trimmed) return source;
  const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.split(new RegExp(`(${safe})`, "ig")).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export default function PcCompactCompanion({ player, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const faithfulCompanionSkills = player.classes
    .flatMap((cls) => cls.skills)
    .filter(
      (skill) =>
        skill.specialSkill === "Faithful Companion" && skill.currentLvl > 0,
    );

  let companion = null;
  for (const cls of player.classes) {
    if (cls.companion) {
      companion = cls.companion;
      break;
    }
  }

  if (faithfulCompanionSkills.length !== 1 || !companion) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matches =
    !normalizedQuery ||
    t("Faithful Companion").toLowerCase().includes(normalizedQuery) ||
    companion?.name?.toLowerCase().includes(normalizedQuery);
  if (!matches) return null;

  const sl = faithfulCompanionSkills[0].currentLvl;

  return (
    <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
      {/* Header bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          pl: "46px",
          pr: "6px",
          pt: "2.8px",
          pb: "2.8px",
          background: theme.primary,
        }}
      >
        <Typography
          sx={{
            flex: 1,
            color: "#fff",
            fontFamily: "Antonio",
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            textTransform: "uppercase",
          }}
        >
          {highlightMatch(t("Faithful Companion"), searchQuery)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 28,
            px: "6px",
            borderRadius: "4px",
            bgcolor: "rgba(255,255,255,0.18)",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontFamily: "Antonio",
              fontSize: "0.85rem",
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            SL {sl}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: "4px" }}>
        <NpcActorCard npc={companion} collapse={true} />
      </Box>
    </Paper>
  );
}
