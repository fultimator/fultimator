import React, { useMemo, useState } from "react";
import {
  Box,
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

const OTHER_SUBTYPES = ["other"];

function toFormState(other) {
  return {
    itemType: "otherOptional",
    name: other?.name ?? "",
    description: other?.description ?? "",
    effect: other?.effect ?? "",
    clockEnabled: Boolean(other?.clock?.sections),
    clockSections: Number(other?.clock?.sections) || 6,
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    description: form.description ?? "",
    effect: form.effect ?? "",
    clock: form.clockEnabled ? { sections: Number(form.clockSections) || 6 } : undefined,
  };
}

function OtherRow({ other, index, isEditMode, onEdit, onDelete, onRoll, onAddToCompendium }) {
  const { t } = useTranslate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const hasDetails = other.description || other.effect;

  return (
    <ItemRowCard
      variant="outlined"
      onCardClick={hasDetails ? () => setExpanded((v) => !v) : undefined}
      label={other.name || t("Unnamed Optional")}
      actions={
        <>
          <Tooltip title={t("Roll")}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRoll(other); }}>
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
            <MenuItem onClick={async (e) => { e.stopPropagation(); await onAddToCompendium(other); setMenuAnchorEl(null); }}>
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
          <SharedOptionalCard item={{ ...other, subtype: "other" }} />
        </Box>
      )}
    </ItemRowCard>
  );
}

export default function EditPlayerOther({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();

  const [editIndex, setEditIndex] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const others = useMemo(() => player.others ?? [], [player.others]);

  const editingItem = createOpen
    ? toFormState(null)
    : editIndex !== null
      ? toFormState(others[editIndex])
      : null;

  const handleRoll = (entry) =>
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "optional",
      name: entry.name || t("Optional"),
      tags: [t("Optional")],
      description: entry.description || "",
      effect: entry.effect || "",
      ...(entry.clock?.sections
        ? {
            clock: {
              sections: entry.clock.sections,
              state:
                Array.isArray(entry.clockState) && entry.clockState.length === entry.clock.sections
                  ? entry.clockState
                  : new Array(entry.clock.sections).fill(false),
              name: entry.name || t("Optional"),
            },
          }
        : {}),
    });

  const handleAddToCompendium = async (entry) => {
    const pack = await ensurePersonalPack();
    await addItem(pack.id, "optional", {
      subtype: "other",
      name: entry.name || "",
      description: entry.description || "",
      effect: entry.effect || "",
      ...(entry.clock?.sections ? { clock: { sections: entry.clock.sections } } : {}),
    });
  };

  const handleDelete = (i) =>
    setPlayer((prev) => ({
      ...prev,
      others: (prev.others ?? []).filter((_, idx) => idx !== i),
    }));

  return (
    <SectionCard
      title={t("Other Optionals")}
      actions={
        isEditMode && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("Add Optional")}>
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
        {others.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ px: 0.5, py: 0.25 }}>{t("No optional entries yet.")}</Typography>
        ) : (
          others.map((other, index) => (
            <OtherRow
              key={`${other.name || "other"}-${index}`}
              other={other}
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
          itemType="otherOptional"
          item={editingItem}
          editIndex={createOpen ? null : editIndex}
          onSave={(payload) => {
            const nextEntry = fromFormState(payload);
            setPlayer((prev) => {
              const next = [...(prev.others ?? [])];
              if (createOpen) next.push(nextEntry);
              else if (editIndex !== null && next[editIndex]) next[editIndex] = nextEntry;
              return { ...prev, others: next };
            });
            setCreateOpen(false);
            setEditIndex(null);
          }}
          onDelete={(index) => {
            setPlayer((prev) => {
              const next = [...(prev.others ?? [])];
              if (index >= 0) next.splice(index, 1);
              return { ...prev, others: next };
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
              description: item.description ?? "",
              effect: item.effect ?? "",
              ...(item.clock?.sections ? { clock: { sections: item.clock.sections } } : {}),
            };
            setPlayer((prev) => ({
              ...prev,
              others: [...(prev.others ?? []), nextEntry],
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={OTHER_SUBTYPES}
        />
      )}
    </SectionCard>
  );
}
