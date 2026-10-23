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
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import ItemEditModal from "/src/forms/ui/ItemEditModal";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
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
    clock: form.clockEnabled
      ? { sections: Number(form.clockSections) || 6 }
      : undefined,
  };
}

function OtherRow({ other, index, isEditMode, onEdit, onDelete, onRoll }) {
  const { t } = useTranslate();
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const hasDetails = other.description || other.effect;

  const handleAddToCompendium = async (e) => {
    e.stopPropagation();
    setMenuAnchor(null);
    try {
      const personalPack =
        packs.find((p) => p.isPersonal) ?? (await ensurePersonalPack());
      await addItem(personalPack.id, "optional", {
        ...other,
        subtype: "other",
      });
      setSnackbar({
        open: true,
        message: t("Added to compendium"),
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message ?? t("Failed to add"),
        severity: "error",
      });
    }
  };

  return (
    <>
      <ItemRowCard
        variant="outlined"
        onCardClick={hasDetails ? () => setExpanded((v) => !v) : undefined}
        label={other.name || t("Unnamed Optional")}
        actions={
          <>
            <Tooltip title={t("Roll")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRoll(other);
                }}
              >
                <Casino />
              </IconButton>
            </Tooltip>
            {isEditMode && (
              <Tooltip title={t("Edit")}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(index);
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor(e.currentTarget);
                  }}
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem onClick={handleAddToCompendium}>
                    <ListItemIcon>
                      <LibraryAdd fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t("Add to Compendium")}</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAnchor(null);
                      onDelete(index);
                    }}
                  >
                    <ListItemIcon>
                      <DeleteForever fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t("Delete")}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </>
        }
      >
        {expanded && hasDetails && (
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
        )}
      </ItemRowCard>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function EditPlayerOthers({
  player,
  setPlayer,
  isEditMode,
  externalEditIndex = null,
  onExternalClose,
  externalCreateOpen = false,
  onExternalCreateClose,
  externalCompendiumOpen = false,
  onExternalCompendiumClose,
  modalOnly = false,
}) {
  const { t } = useTranslate();
  const addMessage = useAddChatMessage();

  const [internalEditIndex, setInternalEditIndex] = useState(null);
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);
  const createOpen = externalCreateOpen || internalCreateOpen;
  const setCreateOpen = (v) => {
    setInternalCreateOpen(v);
    if (!v) onExternalCreateClose?.();
  };
  const editIndex = externalEditIndex ?? internalEditIndex;
  const setEditIndex = (v) => {
    setInternalEditIndex(v);
    if (v === null) onExternalClose?.();
  };
  const [internalCompendiumOpen, setInternalCompendiumOpen] = useState(false);
  const compendiumOpen = externalCompendiumOpen || internalCompendiumOpen;
  const setCompendiumOpen = (v) => {
    setInternalCompendiumOpen(v);
    if (!v) onExternalCompendiumClose?.();
  };

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
                Array.isArray(entry.clockState) &&
                entry.clockState.length === entry.clock.sections
                  ? entry.clockState
                  : new Array(entry.clock.sections).fill(false),
              name: entry.name || t("Optional"),
            },
          }
        : {}),
    });

  const handleDelete = (i) =>
    setPlayer((prev) => ({
      ...prev,
      others: (prev.others ?? []).filter((_, idx) => idx !== i),
    }));

  if (modalOnly) {
    return (
      <>
        {(createOpen || editIndex !== null) && editingItem && (
          <ItemEditModal
            open
            onClose={() => {
              setCreateOpen(false);
              setEditIndex(null);
            }}
            itemType="otherOptional"
            item={editingItem}
            editIndex={createOpen ? null : editIndex}
            onSave={(payload) => {
              const nextEntry = fromFormState(payload);
              setPlayer((prev) => {
                const next = [...(prev.others ?? [])];
                if (createOpen) next.push(nextEntry);
                else if (editIndex !== null && next[editIndex])
                  next[editIndex] = nextEntry;
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
                ...(item.clock?.sections
                  ? { clock: { sections: item.clock.sections } }
                  : {}),
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
      </>
    );
  }

  return (
    <SectionCard
      title={t("Other Optionals")}
      actions={
        isEditMode && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title={t("Add Optional")}>
              <IconButton
                size="small"
                onClick={() => setCreateOpen(true)}
                sx={{ color: "#fff" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("Open Compendium")}>
              <IconButton
                size="small"
                onClick={() => setCompendiumOpen(true)}
                sx={{ color: "#fff" }}
              >
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: "4px", p: 0.75 }}
      >
        {others.length === 0 ? (
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ px: 0.5, py: 0.25 }}
          >
            {t("No optional entries yet.")}
          </Typography>
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
            />
          ))
        )}
      </Box>

      {(createOpen || editIndex !== null) && editingItem && (
        <ItemEditModal
          open
          onClose={() => {
            setCreateOpen(false);
            setEditIndex(null);
          }}
          itemType="otherOptional"
          item={editingItem}
          editIndex={createOpen ? null : editIndex}
          onSave={(payload) => {
            const nextEntry = fromFormState(payload);
            setPlayer((prev) => {
              const next = [...(prev.others ?? [])];
              if (createOpen) next.push(nextEntry);
              else if (editIndex !== null && next[editIndex])
                next[editIndex] = nextEntry;
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
              ...(item.clock?.sections
                ? { clock: { sections: item.clock.sections } }
                : {}),
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
