import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Casino from "@mui/icons-material/Casino";
import DeleteForever from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import LibraryAdd from "@mui/icons-material/LibraryAdd";
import MenuIcon from "@mui/icons-material/Menu";
import Search from "@mui/icons-material/Search";
import { useTranslate } from "/src/translation/translate";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/actors/common/ItemRowCard";
import ItemEditModal from "/src/forms/ui/ItemEditModal";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
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

export default function EditPlayerZeroPower({ player, setPlayer, isEditMode, externalOpen = false, onExternalClose, externalCompendiumOpen = false, onExternalCompendiumClose, externalCreating = false, modalOnly = false }) {
  const { t } = useTranslate();
  const addMessage = useAddChatMessage();

  const [internalOpen, setInternalOpen] = useState(false);
  const editorOpen = externalOpen || internalOpen;
  const setEditorOpen = (v) => { setInternalOpen(v); if (!v) onExternalClose?.(); };
  const [internalCompendiumOpen, setInternalCompendiumOpen] = useState(false);
  const compendiumOpen = externalCompendiumOpen || internalCompendiumOpen;
  const setCompendiumOpen = (v) => { setInternalCompendiumOpen(v); if (!v) onExternalCompendiumClose?.(); };
  const [creating, setCreating] = useState(false);
  const effectiveCreating = externalCreating || creating;
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();

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

  if (modalOnly) {
    return (
      <>
        {editorOpen && (
          <ItemEditModal
            open
            onClose={() => { setEditorOpen(false); setCreating(false); onExternalClose?.(); }}
            itemType="zeroPowerOptional"
            item={toFormState(effectiveCreating ? null : zeroPower)}
            editIndex={effectiveCreating || !hasZeroPower ? null : 0}
            onSave={(payload) => {
              setPlayer((prev) => ({ ...prev, zeroPower: fromFormState(payload) }));
              setEditorOpen(false);
              setCreating(false);
              onExternalClose?.();
            }}
            onDelete={() => {
              setPlayer((prev) => { const next = { ...prev }; delete next.zeroPower; return next; });
              setEditorOpen(false);
              setCreating(false);
              onExternalClose?.();
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
      </>
    );
  }

  return (
    <>
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
                {isEditMode && (
                  <>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
                      <MenuIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                      <MenuItem onClick={async (e) => { e.stopPropagation(); setMenuAnchor(null); try { const p = packs.find((x) => x.isPersonal) ?? await ensurePersonalPack(); await addItem(p.id, "optional", { ...zeroPower, subtype: "zero-power" }); setSnackbar({ open: true, message: t("Added to compendium"), severity: "success" }); } catch (err) { setSnackbar({ open: true, message: err?.message ?? t("Failed to add"), severity: "error" }); } }}>
                        <ListItemIcon><LibraryAdd fontSize="small" /></ListItemIcon>
                        <ListItemText>{t("Add to Compendium")}</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); setPlayer((prev) => { const next = { ...prev }; delete next.zeroPower; return next; }); }}>
                        <ListItemIcon><DeleteForever fontSize="small" /></ListItemIcon>
                        <ListItemText>{t("Delete")}</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}
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
    <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>{snackbar.message}</Alert>
    </Snackbar>
    </>
  );
}
