import { useState } from "react";
import { Typography, Box, Paper, IconButton, Tooltip } from "@mui/material";
import { Edit, ChatOutlined } from "@mui/icons-material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { useTranslate } from "/src/translation/translate";
import { useTheme } from "@mui/material/styles";
import ClockControls from "/src/components/shared/actors/pc/variants/compact/ClockControls";
import { highlightMatch } from "/src/components/shared/actors/pc/variants/compact/highlightUtils";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import { SharedZeroPowerCard } from "/src/components/shared/items";

export default function PlayerZeroPower({
  player,
  setPlayer,
  isEditMode = false,
  onEdit,
  speaker = "",
  compact = false,
  searchQuery = "",
  headerActions,
}) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const primary = muiTheme.palette.primary.main;
  const [isOpen, setIsOpen] = useState(false);

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

  const hasDetails = !!(triggerName || triggerDesc || effectName || effectDesc);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const forceOpen =
    !!normalizedQuery &&
    (triggerName?.toLowerCase().includes(normalizedQuery) ||
      triggerDesc?.toLowerCase().includes(normalizedQuery) ||
      effectName?.toLowerCase().includes(normalizedQuery) ||
      effectDesc?.toLowerCase().includes(normalizedQuery));
  const open = isOpen || forceOpen;

  const handleSendToChat = (e) => {
    e.stopPropagation();
    sendDisplayMessage("zeroPower", zeroPower.name, {
      description:
        [triggerName, triggerDesc].filter(Boolean).join(" - ") || undefined,
      effect: [effectName, effectDesc].filter(Boolean).join(" - ") || undefined,
      speaker,
    });
  };

  const actions = (
    <>
      <Tooltip title={t("Send to chat")} arrow>
        <IconButton size="small" onClick={handleSendToChat}>
          <ChatOutlined />
        </IconButton>
      </Tooltip>
      {isEditMode && (
        <Tooltip title={t("Edit")} arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Edit />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  const body = open ? (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: "rgba(0,0,0,0.03)",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <SharedZeroPowerCard
        item={{ ...zeroPower, clock: zeroPower.clock?.sections || 6 }}
      />
    </Box>
  ) : null;

  const clock = (
    <ClockControls
      sections={sections}
      state={clockState}
      setState={persistState}
      label={
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: compact ? "0.85rem" : "0.9rem",
            lineHeight: 1.3,
          }}
          noWrap
        >
          {t("Clock")}
        </Typography>
      }
      clockSize={compact ? 36 : 60}
      compact={compact}
      theme={{ primary }}
    />
  );

  if (compact) {
    const matches =
      !normalizedQuery ||
      zeroPower.name?.toLowerCase().includes(normalizedQuery) ||
      triggerName?.toLowerCase().includes(normalizedQuery) ||
      triggerDesc?.toLowerCase().includes(normalizedQuery) ||
      effectName?.toLowerCase().includes(normalizedQuery) ||
      effectDesc?.toLowerCase().includes(normalizedQuery);
    if (!matches) return null;

    return (
      <Paper
        sx={{ mb: 1, overflow: "hidden" }}
        elevation={0}
        variant="outlined"
      >
        <CompactSectionHeader title={t("Zero Power")}>
          {headerActions}
        </CompactSectionHeader>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            p: "4px",
          }}
        >
          <ItemRowCard
            compact
            onCardClick={hasDetails ? () => setIsOpen((v) => !v) : undefined}
            variant="outlined"
            label={
              <Typography
                noWrap
                sx={{
                  fontFamily: "Antonio",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                }}
              >
                {highlightMatch(zeroPower.name, searchQuery)}
              </Typography>
            }
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
    <SectionCard
      title={t("Zero Power")}
      noShadow
      sx={{ mb: 1 }}
      actions={headerActions}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 1 }}>
        <ItemRowCard
          onCardClick={hasDetails ? () => setIsOpen((v) => !v) : undefined}
          elevation={3}
          paperSx={{ borderRadius: "8px" }}
          label={
            <Typography
              noWrap
              sx={{
                fontFamily: "Antonio",
                fontWeight: 800,
                fontSize: { xs: "1.0rem", sm: "1.1rem" },
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {zeroPower.name}
            </Typography>
          }
          actions={actions}
        >
          {body}
        </ItemRowCard>
        {clock}
      </Box>
    </SectionCard>
  );
}
