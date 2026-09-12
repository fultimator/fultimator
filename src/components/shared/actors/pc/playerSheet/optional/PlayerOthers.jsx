import React, { useState } from "react";
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
import { SharedOptionalCard } from "/src/components/shared/items";

function OtherItem({
  other,
  index,
  setPlayer,
  isEditMode,
  onEdit,
  speaker,
  searchQuery,
  normalizedQuery,
  compact,
  primary,
}) {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  const sections = other.clockEnabled
    ? (other.clockSections ?? other.clock?.sections ?? 6)
    : (other.clock?.sections ?? 0);
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

  const hasDetails = !!(other.description || other.effect);
  const forceOpen =
    !!normalizedQuery &&
    (other.description?.toLowerCase().includes(normalizedQuery) ||
      other.effect?.toLowerCase().includes(normalizedQuery));
  const open = isOpen || forceOpen;

  const handleSendToChat = (e) => {
    e.stopPropagation();
    sendDisplayMessage("otherOptional", other.name, {
      description: other.description || undefined,
      effect: other.effect || undefined,
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
      <SharedOptionalCard item={{ ...other, subtype: "other" }} />
    </Box>
  ) : null;

  const clock = hasClock ? (
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
  ) : null;

  return (
    <React.Fragment>
      <ItemRowCard
        compact={compact}
        onCardClick={hasDetails ? () => setIsOpen((v) => !v) : undefined}
        elevation={compact ? 0 : 3}
        variant={compact ? "outlined" : "elevation"}
        paperSx={compact ? undefined : { borderRadius: "8px" }}
        label={
          <Typography
            noWrap
            sx={{
              fontFamily: "Antonio",
              fontWeight: 800,
              fontSize: compact ? "0.9rem" : { xs: "1.0rem", sm: "1.1rem" },
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
          >
            {highlightMatch(other.name, searchQuery)}
          </Typography>
        }
        actions={actions}
      >
        {body}
      </ItemRowCard>
      {clock}
    </React.Fragment>
  );
}

export default function PlayerOthers({
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

  const others = player.others;
  if (!others?.length) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visible = others
    .map((o, i) => ({ ...o, originalIndex: i }))
    .filter((o) => o?.name)
    .filter(
      (o) =>
        !normalizedQuery ||
        o.name?.toLowerCase().includes(normalizedQuery) ||
        o.description?.toLowerCase().includes(normalizedQuery) ||
        o.effect?.toLowerCase().includes(normalizedQuery),
    );
  if (visible.length === 0) return null;

  const list = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        p: compact ? "4px" : 1,
      }}
    >
      {visible.map((other) => (
        <OtherItem
          key={other.originalIndex}
          other={other}
          index={other.originalIndex}
          setPlayer={setPlayer}
          isEditMode={isEditMode}
          onEdit={onEdit ? () => onEdit(other.originalIndex) : undefined}
          speaker={speaker}
          searchQuery={searchQuery}
          normalizedQuery={normalizedQuery}
          compact={compact}
          primary={primary}
        />
      ))}
    </Box>
  );

  if (compact) {
    return (
      <Paper
        sx={{ mb: 1, overflow: "hidden" }}
        elevation={0}
        variant="outlined"
      >
        <CompactSectionHeader title={t("Other Optionals")}>
          {headerActions}
        </CompactSectionHeader>
        {list}
      </Paper>
    );
  }

  return (
    <SectionCard
      title={t("Other Optionals")}
      noShadow
      sx={{ mb: 1 }}
      actions={headerActions}
    >
      {list}
    </SectionCard>
  );
}
