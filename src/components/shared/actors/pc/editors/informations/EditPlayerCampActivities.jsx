import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Casino from "@mui/icons-material/Casino";
import Delete from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MenuIcon from "@mui/icons-material/Menu";
import Search from "@mui/icons-material/Search";
import { useTranslate } from "/src/translation/translate";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/actors/common/ItemRowCard";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import ItemEditModal from "/src/forms/ui/ItemEditModal";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import { SharedOptionalCard } from "/src/components/shared/items";

const CAMP_ACTIVITY_SUBTYPES = ["camp-activities"];

function toFormState(activity) {
  return {
    itemType: "campActivity",
    name: activity?.name ?? "",
    description: activity?.description,
    targetDescription: activity?.targetDescription ?? "",
    effect: activity?.effect ?? "",
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    description: form.description,
    targetDescription: form.targetDescription ?? "",
    effect: form.effect ?? "",
  };
}

function ActivityRow({ activity, index, isEditMode, onEdit, onDelete, onRoll, onAddToCompendium }) {
  const { t } = useTranslate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const hasDetails = activity.description || activity.targetDescription || activity.effect;

  return (
    <ItemRowCard
      variant="outlined"
      onCardClick={hasDetails ? () => setExpanded((v) => !v) : undefined}
      label={activity.name || t("Unnamed Camp Activity")}
      actions={
        <>
          <Tooltip title={t("Roll")}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRoll(activity); }}>
              <Casino />
            </IconButton>
          </Tooltip>
          {isEditMode && (
            <Tooltip title={t("Edit")}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(index); }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); }}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
            <MenuItem onClick={async (e) => { e.stopPropagation(); await onAddToCompendium(activity); setMenuAnchorEl(null); }}>
              <ListItemText>{t("Add to Compendium")}</ListItemText>
            </MenuItem>
            {isEditMode && (
              <MenuItem onClick={(e) => { e.stopPropagation(); onDelete(index); setMenuAnchorEl(null); }} sx={{ color: "error.main" }}>
                <Delete fontSize="small" sx={{ mr: 1 }} />
                <ListItemText>{t("Delete")}</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      }
    >
      {expanded && hasDetails && (
        <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
          <SharedOptionalCard item={{ ...activity, subtype: "camp-activities" }} />
        </Box>
      )}
    </ItemRowCard>
  );
}

export default function EditPlayerCampActivities({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();
  const [editIndex, setEditIndex] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const activities = useMemo(() => player.campActivities ?? [], [player.campActivities]);

  const editingItem = createOpen
    ? toFormState(null)
    : editIndex !== null
      ? toFormState(activities[editIndex])
      : null;

  const handleRoll = (entry) =>
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "optional",
      name: entry.name || t("Camp Activity"),
      tags: [t("Camp Activities")],
      description: entry.description,
      ...(entry.targetDescription ? { targetDescription: entry.targetDescription } : {}),
      effect: entry.effect || "",
    });

  const handleAddToCompendium = async (entry) => {
    const pack = await ensurePersonalPack();
    await addItem(pack.id, "optional", {
      subtype: "camp-activities",
      name: entry.name || "",
      description: entry.description,
      ...(entry.targetDescription ? { targetDescription: entry.targetDescription } : {}),
      effect: entry.effect || "",
    });
  };

  const handleDelete = (i) =>
    setPlayer((prev) => ({
      ...prev,
      campActivities: (prev.campActivities ?? []).filter((_, idx) => idx !== i),
    }));

  return (
    <SectionCard
      title={t("Camp Activities (Max 2)")}
      actions={
        isEditMode && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("Add Camp Activity")}>
              <IconButton size="small" onClick={() => setCreateOpen(true)} sx={{ color: "#fff" }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Open Compendium")}>
              <IconButton size="small" onClick={() => setCompendiumOpen(true)} sx={{ color: "#fff" }}>
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 0.75 }}>
        {activities.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ px: 0.5, py: 0.25 }}>{t("No camp activities yet.")}</Typography>
        ) : (
          activities.map((activity, index) => (
            <ActivityRow
              key={`${activity.name || "camp"}-${index}`}
              activity={activity}
              index={index}
              isEditMode={isEditMode}
              onEdit={setEditIndex}
              onDelete={handleDelete}
              onRoll={handleRoll}
              onAddToCompendium={handleAddToCompendium}
            />
          ))
        )}
      </Box>

      {(createOpen || editIndex !== null) && editingItem && (
        <ItemEditModal
          open
          onClose={() => { setCreateOpen(false); setEditIndex(null); }}
          itemType="campActivity"
          item={editingItem}
          editIndex={createOpen ? null : editIndex}
          onSave={(payload) => {
            const nextEntry = fromFormState(payload);
            setPlayer((prev) => {
              const next = [...(prev.campActivities ?? [])];
              if (createOpen) next.push(nextEntry);
              else if (editIndex !== null && next[editIndex]) next[editIndex] = nextEntry;
              return { ...prev, campActivities: next };
            });
            setCreateOpen(false);
            setEditIndex(null);
          }}
          onDelete={(index) => {
            setPlayer((prev) => {
              const next = [...(prev.campActivities ?? [])];
              if (index >= 0) next.splice(index, 1);
              return { ...prev, campActivities: next };
            });
            setCreateOpen(false);
            setEditIndex(null);
          }}
          ctx={{ player, setPlayer }}
        />
      )}

      {isEditMode && (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={(item) => {
            const nextEntry = {
              name: item.name ?? "",
              description: item.description,
              targetDescription: item.targetDescription ?? "",
              effect: item.effect ?? "",
            };
            setPlayer((prev) => ({
              ...prev,
              campActivities: [...(prev.campActivities ?? []), nextEntry],
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={CAMP_ACTIVITY_SUBTYPES}
        />
      )}
    </SectionCard>
  );
}
