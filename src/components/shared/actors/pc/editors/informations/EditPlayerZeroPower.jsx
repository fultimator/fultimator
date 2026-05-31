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
import ItemEditModal from "/src/forms/ui/ItemEditModal";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import { SharedZeroPowerCard } from "/src/components/shared/items";

const ZERO_POWER_SUBTYPES = ["zero-power", "zero-trigger", "zero-effect"];

function toFormState(zeroPower) {
  return {
    itemType: "zeroPowerOptional",
    name: zeroPower?.name ?? "",
    clockSections: Number(zeroPower?.clock?.sections) || 6,
    triggerName: zeroPower?.zeroTrigger?.name ?? "",
    triggerDescription: zeroPower?.zeroTrigger?.description ?? "",
    effectName: zeroPower?.zeroEffect?.name ?? "",
    effectDescription: zeroPower?.zeroEffect?.description ?? "",
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    zeroTrigger: { name: form.triggerName ?? "", description: form.triggerDescription ?? "" },
    zeroEffect: { name: form.effectName ?? "", description: form.effectDescription ?? "" },
    clock: { sections: Number(form.clockSections) || 6 },
  };
}

export default function EditPlayerZeroPower({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();

  const [editorOpen, setEditorOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const zeroPower = useMemo(() => player.zeroPower, [player.zeroPower]);
  const hasZeroPower = Boolean(
    zeroPower &&
    (zeroPower.name?.trim() ||
      zeroPower.zeroTrigger?.name?.trim() ||
      zeroPower.zeroEffect?.name?.trim()),
  );

  const handleRoll = () =>
    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "optional",
      name: zeroPower.name || t("Zero Power"),
      tags: [t("Zero Power")],
      description: zeroPower.zeroTrigger?.description || "",
      effect: zeroPower.zeroEffect?.description || "",
      ...(zeroPower.clock?.sections
        ? {
            clock: {
              sections: zeroPower.clock.sections,
              state:
                Array.isArray(zeroPower.clockState) &&
                zeroPower.clockState.length === zeroPower.clock.sections
                  ? zeroPower.clockState
                  : new Array(zeroPower.clock.sections).fill(false),
              name: zeroPower.name || t("Zero Power"),
            },
          }
        : {}),
    });

  const hasDetails = zeroPower?.zeroTrigger?.description || zeroPower?.zeroEffect?.description;

  return (
    <SectionCard
      title={t("Zero Power")}
      actions={
        isEditMode && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("Add Zero Power")}>
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
        {!hasZeroPower ? (
          <Typography color="text.secondary" variant="body2" sx={{ px: 0.5, py: 0.25 }}>{t("No zero power yet.")}</Typography>
        ) : (
          <ItemRowCard
            variant="outlined"
            onCardClick={hasDetails ? () => setExpanded((v) => !v) : undefined}
            label={zeroPower.name || t("Unnamed Zero Power")}
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
                  <MenuItem onClick={async () => {
                    const pack = await ensurePersonalPack();
                    await addItem(pack.id, "optional", {
                      subtype: "zero-power",
                      name: zeroPower.name || "",
                      zeroTrigger: zeroPower.zeroTrigger || { name: "", description: "" },
                      zeroEffect: zeroPower.zeroEffect || { name: "", description: "" },
                      zeroTriggerRef: "",
                      zeroEffectRef: "",
                      clock: { sections: zeroPower.clock?.sections || 6 },
                    });
                    setMenuAnchorEl(null);
                  }}>
                    <ListItemText>{t("Add to Compendium")}</ListItemText>
                  </MenuItem>
                  {isEditMode && (
                    <MenuItem onClick={() => { setPlayer((prev) => { const next = { ...prev }; delete next.zeroPower; return next; }); setMenuAnchorEl(null); }} sx={{ color: "error.main" }}>
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
                <SharedZeroPowerCard item={{ ...zeroPower, clock: zeroPower.clock?.sections || 6 }} />
              </Box>
            )}
          </ItemRowCard>
        )}
      </Box>

      {editorOpen && (
        <ItemEditModal
          open
          onClose={() => { setEditorOpen(false); setCreating(false); }}
          itemType="zeroPowerOptional"
          item={toFormState(creating ? null : zeroPower)}
          editIndex={creating || !hasZeroPower ? null : 0}
          onSave={(payload) => {
            setPlayer((prev) => ({ ...prev, zeroPower: fromFormState(payload) }));
            setEditorOpen(false);
            setCreating(false);
          }}
          onDelete={() => {
            setPlayer((prev) => { const next = { ...prev }; delete next.zeroPower; return next; });
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
            if (item.subtype === "zero-trigger") {
              setPlayer((prev) => ({
                ...prev,
                zeroPower: { ...(prev.zeroPower ?? {}), zeroTrigger: { name: item.name ?? "", description: item.description ?? item.effect ?? "" } },
              }));
              setCompendiumOpen(false);
              return;
            }
            if (item.subtype === "zero-effect") {
              setPlayer((prev) => ({
                ...prev,
                zeroPower: { ...(prev.zeroPower ?? {}), zeroEffect: { name: item.name ?? "", description: item.description ?? item.effect ?? "" } },
              }));
              setCompendiumOpen(false);
              return;
            }
            const triggerName = typeof item.zeroTrigger === "string" ? item.zeroTrigger : (item.zeroTrigger?.name ?? "");
            const triggerDesc = typeof item.zeroTrigger === "object" ? (item.zeroTrigger?.description ?? "") : "";
            const effectName = typeof item.zeroEffect === "string" ? item.zeroEffect : (item.zeroEffect?.name ?? "");
            const effectDesc = typeof item.zeroEffect === "object" ? (item.zeroEffect?.description ?? "") : "";
            setPlayer((prev) => ({
              ...prev,
              zeroPower: {
                name: item.name ?? "",
                zeroTrigger: { name: triggerName, description: triggerDesc },
                zeroEffect: { name: effectName, description: effectDesc },
                clock: { sections: item.clock?.sections ?? 6 },
              },
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={ZERO_POWER_SUBTYPES}
        />
      )}
    </SectionCard>
  );
}
