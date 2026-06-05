import { useState } from "react";
import { Typography, Box, Paper, IconButton, Tooltip } from "@mui/material";
import { Edit, ChatOutlined } from "@mui/icons-material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/actors/common/ItemRowCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { useTranslate } from "/src/translation/translate";
import { useTheme } from "@mui/material/styles";
import ClockControls from "/src/components/shared/actors/pc/variants/compact/ClockControls";
import { highlightMatch } from "/src/components/shared/actors/pc/variants/compact/highlightUtils";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import { SharedOptionalCard } from "/src/components/shared/items";

export default function PlayerQuirk({ player, setPlayer, isEditMode = false, onEdit, speaker = "", compact = false, searchQuery = "", headerActions }) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;
  const [isOpen, setIsOpen] = useState(false);

  const quirk = player.quirk;
  if (!quirk?.name) return null;

  const sections = quirk.clock?.sections ?? 0;
  const clockState = sections > 0 ? (quirk.clockState ?? new Array(sections).fill(false)) : [];

  const persistState = (newState) => {
    if (!setPlayer) return;
    setPlayer((prev) => ({ ...prev, quirk: { ...prev.quirk, clockState: newState } }));
  };

  const hasDetails = !!(quirk.description || quirk.effect);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const forceOpen = !!normalizedQuery && (
    quirk.description?.toLowerCase().includes(normalizedQuery) ||
    quirk.effect?.toLowerCase().includes(normalizedQuery)
  );
  const open = isOpen || forceOpen;

  const handleSendToChat = (e) => {
    e.stopPropagation();
    sendDisplayMessage("quirk", quirk.name, {
      description: quirk.description || undefined,
      effect: quirk.effect || undefined,
      speaker,
    });
  };

  const actions = (
    <>
      <Tooltip title={t("Send to chat")} arrow>
        <IconButton size="small" onClick={handleSendToChat}><ChatOutlined /></IconButton>
      </Tooltip>
      {isEditMode && (
        <Tooltip title={t("Edit")} arrow>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}><Edit /></IconButton>
        </Tooltip>
      )}
    </>
  );

  const body = open ? (
    <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
      <SharedOptionalCard item={{ ...quirk, subtype: "quirk" }} />
    </Box>
  ) : null;

  const clock = sections > 0 ? (
    <ClockControls
      sections={sections} state={clockState} setState={persistState}
      label={<Typography sx={{ fontWeight: "bold", fontSize: compact ? "0.85rem" : "0.9rem", lineHeight: 1.3 }} noWrap>{t("Clock")}</Typography>}
      clockSize={compact ? 36 : 60}
      compact={compact}
      theme={{ primary }}
    />
  ) : null;

  if (compact) {
    const matches = !normalizedQuery ||
      quirk.name?.toLowerCase().includes(normalizedQuery) ||
      quirk.description?.toLowerCase().includes(normalizedQuery) ||
      quirk.effect?.toLowerCase().includes(normalizedQuery);
    if (!matches) return null;

    return (
      <Paper sx={{ mb: 1, overflow: "hidden" }} elevation={0} variant="outlined">
        <CompactSectionHeader title={t("Quirk")}>{headerActions}</CompactSectionHeader>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: "4px" }}>
          <ItemRowCard compact onCardClick={hasDetails ? () => setIsOpen((v) => !v) : undefined} variant="outlined"
            label={<Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase", lineHeight: 1.3 }}>{highlightMatch(quirk.name, searchQuery)}</Typography>}
            actions={actions}
          >
            {body}
          </ItemRowCard>
          {clock}
        </Box>
      </Paper>
    );
  }

  return (
    <SectionCard title={t("Quirk")} noShadow sx={{ mb: 1 }} actions={headerActions}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 1 }}>
        <ItemRowCard onCardClick={hasDetails ? () => setIsOpen((v) => !v) : undefined} elevation={3} paperSx={{ borderRadius: "8px" }}
          label={<Typography noWrap sx={{ fontFamily: "Antonio", fontWeight: 800, fontSize: { xs: "1.0rem", sm: "1.1rem" }, textTransform: "uppercase", lineHeight: 1.3 }}>{quirk.name}</Typography>}
          actions={actions}
        >
          {body}
        </ItemRowCard>
        {clock}
      </Box>
    </SectionCard>
  );
}
