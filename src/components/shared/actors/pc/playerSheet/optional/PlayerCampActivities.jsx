import { useState } from "react";
import { Box, Paper, IconButton, Tooltip, Typography } from "@mui/material";
import { Edit, ChatOutlined } from "@mui/icons-material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import { useTranslate } from "/src/translation/translate";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";
import { SharedOptionalCard } from "/src/components/shared/items";

function CampActivityItem({ activity, isEditMode, onEdit, speaker, compact }) {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails = !!(activity.description || activity.effect);

  const handleSendToChat = (e) => {
    e.stopPropagation();
    sendDisplayMessage("campActivity", activity.name, {
      description: activity.description || undefined,
      effect: activity.effect || undefined,
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

  const body = isOpen ? (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        bgcolor: "rgba(0,0,0,0.03)",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <SharedOptionalCard item={{ ...activity, subtype: "camp-activities" }} />
    </Box>
  ) : null;

  return (
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
          {activity.name}
        </Typography>
      }
      actions={actions}
    >
      {body}
    </ItemRowCard>
  );
}

export default function PlayerCampActivities({
  player,
  isEditMode = false,
  onEdit,
  speaker = "",
  compact = false,
  headerActions,
}) {
  const { t } = useTranslate();

  const activities = (player.campActivities ?? []).filter((a) => a?.name);
  if (activities.length === 0) return null;

  const list = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        p: compact ? "4px" : 1,
      }}
    >
      {activities.map((activity, index) => (
        <CampActivityItem
          key={index}
          activity={activity}
          isEditMode={isEditMode}
          onEdit={onEdit ? () => onEdit(index) : undefined}
          speaker={speaker}
          compact={compact}
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
        <CompactSectionHeader title={t("Camp Activities (Max 2)")}>
          {headerActions}
        </CompactSectionHeader>
        {list}
      </Paper>
    );
  }

  return (
    <SectionCard
      title={t("Camp Activities (Max 2)")}
      noShadow
      sx={{ mb: 1 }}
      actions={headerActions}
    >
      {list}
    </SectionCard>
  );
}
