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

export default function EditPlayerQuirk({ player, setPlayer, isEditMode, externalOpen = false, onExternalClose, externalCompendiumOpen = false, onExternalCompendiumClose, externalCreating = false, modalOnly = false }) {
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

  if (modalOnly) {
    return (
      <>
        {editorOpen && (
          <ItemEditModal
            open
            onClose={() => { setEditorOpen(false); setCreating(false); onExternalClose?.(); }}
            itemType="quirkOptional"
            item={toFormState(effectiveCreating ? null : quirk)}
            editIndex={effectiveCreating || !hasQuirk ? null : 0}
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
              onExternalClose?.();
            }}
            onDelete={() => {
              setPlayer((prev) => { const next = { ...prev }; delete next.quirk; return next; });
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
      </>
    );
  }

  return (
    <>
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
                {isEditMode && (
                  <>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
                      <MenuIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                      <MenuItem onClick={async (e) => { e.stopPropagation(); setMenuAnchor(null); try { const p = packs.find((x) => x.isPersonal) ?? await ensurePersonalPack(); await addItem(p.id, "optional", { ...quirk, subtype: "quirk" }); setSnackbar({ open: true, message: t("Added to compendium"), severity: "success" }); } catch (err) { setSnackbar({ open: true, message: err?.message ?? t("Failed to add"), severity: "error" }); } }}>
                        <ListItemIcon><LibraryAdd fontSize="small" /></ListItemIcon>
                        <ListItemText>{t("Add to Compendium")}</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); setPlayer((prev) => { const next = { ...prev }; delete next.quirk; return next; }); }}>
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
    <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>{snackbar.message}</Alert>
    </Snackbar>
    </>
  );
}
