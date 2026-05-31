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
import ItemEditModal from "/src/forms/ui/ItemEditModal";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import { SharedOptionalCard } from "/src/components/shared/items";

const QUIRK_SUBTYPES = ["quirk"];

function toFormState(quirk) {
  return {
    itemType: "quirkOptional",
    name: quirk?.name ?? "",
    description: quirk?.description ?? "",
    effect: quirk?.effect ?? "",
    hasClock: !!quirk?.clock,
    clockSections: quirk?.clock?.sections ?? 6,
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    description: form.description ?? "",
    effect: form.effect ?? "",
    clock: form.hasClock ? { sections: form.clockSections ?? 6 } : undefined,
  };
}

export default function EditPlayerQuirk({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const addMessage = useAddChatMessage();
  const { ensurePersonalPack, addItem } = useCompendiumPacks();

  const [editorOpen, setEditorOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const quirk = useMemo(() => player.quirk, [player.quirk]);
  const hasQuirk = Boolean(
    quirk &&
    (quirk.name?.trim() || quirk.description?.trim() || quirk.effect?.trim() || quirk.clock),
  );

  const handleRoll = () =>
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "optional",
      name: quirk.name || t("Quirk"),
      tags: [t("Quirk")],
      description: quirk.description || "",
      effect: quirk.effect || "",
    });

  return (
    <SectionCard
      title={t("Quirk")}
      actions={
        isEditMode && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("Add Quirk")}>
              <IconButton size="small" onClick={() => { setCreating(true); setEditorOpen(true); }} sx={{ color: "#fff" }}>
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
      <Box sx={{ p: 0.75 }}>
        {!hasQuirk ? (
          <Typography color="text.secondary" variant="body2" sx={{ px: 0.5, py: 0.25 }}>{t("No quirk yet.")}</Typography>
        ) : (
          <ItemRowCard
            variant="outlined"
            onCardClick={quirk.description || quirk.effect ? () => setExpanded((v) => !v) : undefined}
            label={quirk.name || t("Unnamed Quirk")}
            actions={
              <>
                <Tooltip title={t("Roll")}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRoll(); }}>
                    <Casino />
                  </IconButton>
                </Tooltip>
                {isEditMode && (
                  <Tooltip title={t("Edit")}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setCreating(false); setEditorOpen(true); }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); }}>
                  <MenuIcon />
                </IconButton>
                <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
                  <MenuItem onClick={async () => { const pack = await ensurePersonalPack(); await addItem(pack.id, "optional", { subtype: "quirk", ...quirk }); setMenuAnchorEl(null); }}>
                    <ListItemText>{t("Add to Compendium")}</ListItemText>
                  </MenuItem>
                  {isEditMode && (
                    <MenuItem onClick={() => { setPlayer((prev) => { const next = { ...prev }; delete next.quirk; return next; }); setMenuAnchorEl(null); }} sx={{ color: "error.main" }}>
                      <Delete fontSize="small" sx={{ mr: 1 }} />
                      <ListItemText>{t("Delete")}</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </>
            }
          >
            {expanded && (
              <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(0,0,0,0.03)", borderTop: "1px solid", borderColor: "divider" }}>
                <SharedOptionalCard item={{ ...quirk, subtype: "quirk" }} />
              </Box>
            )}
          </ItemRowCard>
        )}
      </Box>

      {editorOpen && (
        <ItemEditModal
          open
          onClose={() => { setEditorOpen(false); setCreating(false); }}
          itemType="quirkOptional"
          item={toFormState(creating ? null : quirk)}
          editIndex={creating || !hasQuirk ? null : 0}
          onSave={(payload) => {
            const next = fromFormState(payload);
            setPlayer((prev) => {
              const prevSections = prev.quirk?.clock?.sections;
              const nextSections = next.clock?.sections;
              const resetClock = next.clock && prevSections !== nextSections;
              return {
                ...prev,
                quirk: {
                  ...next,
                  clockState: resetClock
                    ? new Array(nextSections).fill(false)
                    : (prev.quirk?.clockState ?? undefined),
                },
              };
            });
            setEditorOpen(false);
            setCreating(false);
          }}
          onDelete={() => {
            setPlayer((prev) => { const next = { ...prev }; delete next.quirk; return next; });
            setEditorOpen(false);
            setCreating(false);
          }}
          ctx={{ player, setPlayer }}
        />
      )}

      {isEditMode && (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={(item) => {
            setPlayer((prev) => ({
              ...prev,
              quirk: { name: item.name ?? "", description: item.description ?? "", effect: item.effect ?? "", clock: item.clock },
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={QUIRK_SUBTYPES}
        />
      )}
    </SectionCard>
  );
}
