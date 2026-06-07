import {
  Alert,
  Box,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "/src/translation/translate";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  npcSpecialFieldConfig,
  npcSpecialGroupLabels,
  npcSpecialTabs,
} from "/src/forms/rendering/config/itemConfigs/npcSpecial";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Casino,
  Delete,
  LibraryAdd,
  Menu as MenuIcon,
  Search,
  UnfoldLess,
  UnfoldMore,
} from "@mui/icons-material";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";

function SpecialContextMenu({
  special,
  npcName: _npcName,
  onDelete,
  onMoveUp,
  onMoveDown,
  showMoveUp,
  showMoveDown,
}) {
  const { t } = useTranslate();
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();
  const [anchorEl, setAnchorEl] = useState(null);
  const [packMenuAnchor, setPackMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const personalPack = packs.find((p) => p.isPersonal) ?? null;
  const unlockedNonPersonal = packs.filter((p) => !p.isPersonal && !p.locked);

  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  const doAdd = async (packId) => {
    try {
      await addItem(packId, "npc-special", special);
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

  const handleAddToCompendium = async (e) => {
    close();
    if (unlockedNonPersonal.length > 0) {
      setPackMenuAnchor(e.currentTarget);
    } else if (personalPack && !personalPack.locked) {
      await doAdd(personalPack.id);
    } else {
      const personal = await ensurePersonalPack();
      await doAdd(personal.id);
    }
  };

  return (
    <>
      <IconButton component="span" onClick={open}>
        <MenuIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={handleAddToCompendium}>
          <ListItemIcon>
            <LibraryAdd />
          </ListItemIcon>
          <ListItemText>{t("Add to Compendium")}</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!showMoveUp}
          onClick={() => {
            close();
            onMoveUp();
          }}
        >
          <ListItemIcon>
            <ArrowUpward fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Move Up")}</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!showMoveDown}
          onClick={() => {
            close();
            onMoveDown();
          }}
        >
          <ListItemIcon>
            <ArrowDownward fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Move Down")}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            close();
            onDelete();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete color="error" />
          </ListItemIcon>
          <ListItemText>{t("Delete")}</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={packMenuAnchor}
        open={Boolean(packMenuAnchor)}
        onClose={() => setPackMenuAnchor(null)}
      >
        {personalPack && !personalPack.locked && (
          <MenuItem
            onClick={async () => {
              setPackMenuAnchor(null);
              await doAdd(personalPack.id);
            }}
          >
            <ListItemText>{t("Personal")}</ListItemText>
          </MenuItem>
        )}
        {unlockedNonPersonal.map((pack) => (
          <MenuItem
            key={pack.id}
            onClick={async () => {
              setPackMenuAnchor(null);
              await doAdd(pack.id);
            }}
          >
            <ListItemText>{pack.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

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

export default function EditSpecial({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const _isSmallScreen = useMediaQuery("(max-width: 899px)");
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingSpecialIndex, setPendingSpecialIndex] = useState(null);
  const [expandedSet, setExpandedSet] = useState(new Set());

  const allExpanded =
    npc.special?.length > 0 && expandedSet.size === npc.special.length;

  const toggleExpanded = (i) => {
    setExpandedSet((prev) => {
      const s = new Set(prev);
      if (s.has(i)) {
        s.delete(i);
      } else {
        s.add(i);
      }
      return s;
    });
  };

  const toggleAll = () => {
    setExpandedSet(
      allExpanded ? new Set() : new Set(npc.special?.map((_, i) => i) ?? []),
    );
  };

  const addSpecial = () => {
    const newIndex = npc.special?.length ?? 0;
    setExpandedSet((prev) => new Set([...prev, newIndex]));
    setNpc((prev) => ({
      ...prev,
      special: [...(prev.special || []), { name: "", effect: "", spCost: 1 }],
    }));
  };

  const removeSpecial = (i) => {
    setExpandedSet((prev) => {
      const s = new Set();
      for (const idx of prev) {
        if (idx < i) s.add(idx);
        else if (idx > i) s.add(idx - 1);
      }
      return s;
    });
    setNpc((prev) => ({
      ...prev,
      special: (prev.special || []).filter((_, index) => index !== i),
    }));
  };

  const moveSpecial = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const special = [...(prev.special || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= special.length ||
        toIndex >= special.length
      ) {
        return prev;
      }
      [special[fromIndex], special[toIndex]] = [
        special[toIndex],
        special[fromIndex],
      ];
      return { ...prev, special };
    });
    setExpandedSet((prev) => {
      const next = new Set(prev);
      const hadFrom = next.has(fromIndex);
      const hadTo = next.has(toIndex);
      if (hadFrom) next.add(toIndex);
      else next.delete(toIndex);
      if (hadTo) next.add(fromIndex);
      else next.delete(fromIndex);
      return next;
    });
  };

  const openDeleteDialog = (index) => {
    setPendingSpecialIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <SectionCard
      title={t("Special Rules")}
      actions={
        <>
          <Tooltip title={t("Search Compendium")}>
            <IconButton size="small" onClick={() => setModalOpen(true)} sx={{ color: "#fff" }}>
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={allExpanded ? t("Collapse All") : t("Expand All")}>
            <IconButton size="small" onClick={toggleAll} sx={{ color: "#fff" }}>
              {allExpanded ? <UnfoldLess fontSize="small" /> : <UnfoldMore fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t("Add Special Rule")}>
            <IconButton size="small" onClick={addSpecial} sx={{ color: "#fff" }}>
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <Box sx={{ p: 1 }}>
      <Grid container spacing={1}>
        {npc.special?.map((special, i) => {
          return (
            <Grid key={i} size={12}>
              <ItemRowCard
                label={special.name || t("(unnamed)")}
                subtitle={
                  <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    SP: {special.spCost ?? 1}
                  </Typography>
                }
                actions={
                  <>
                    <IconButton
                      component="span"
                      onClick={(e) => {
                        e.stopPropagation();
                        addMessage({
                          id: crypto.randomUUID(),
                          createdAt: Date.now(),
                          speaker: npc.name || "NPC",
                          kind: "display",
                          itemType: "special",
                          name: special.name,
                          tags: [`SP: ${special.spCost ?? 1}`],
                          description: special.effect,
                        });
                      }}
                    >
                      <Casino />
                    </IconButton>
                    <SpecialContextMenu
                      special={special}
                      npcName={npc.name}
                      onDelete={() => openDeleteDialog(i)}
                      onMoveUp={() => moveSpecial(i, i - 1)}
                      onMoveDown={() => moveSpecial(i, i + 1)}
                      showMoveUp={i > 0}
                      showMoveDown={i < (npc.special?.length ?? 0) - 1}
                    />
                  </>
                }
                onClick={() => toggleExpanded(i)}
                paperSx={{ mb: 0.5 }}
              >
                {expandedSet.has(i) && (
                  <Box sx={{ p: 1 }}>
                    <TabbedSchemaFormRenderer
                      tabs={npcSpecialTabs}
                      config={npcSpecialFieldConfig}
                      groupLabels={npcSpecialGroupLabels}
                      state={special}
                      onChange={(next) => {
                        setNpc((prev) => {
                          const special = [...(prev.special || [])];
                          special[i] = next;
                          return { ...prev, special };
                        });
                      }}
                      surface="edit"
                      cols={2}
                      extraProps={{ name: String(special.name ?? "") }}
                    />
                  </Box>
                )}
              </ItemRowCard>
            </Grid>
          );
        })}
      </Grid>
      </Box>
      <CompendiumViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context="npc"
        initialType="special"
        initialCompendium="personal"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            special: [
              ...(prev.special || []),
              {
                name: item.name,
                effect: item.effect || "",
                spCost: item.spCost ?? 1,
                fuid: item.fuid,
              },
            ],
          }));
        }}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingSpecialIndex(null);
        }}
        onConfirm={() => {
          if (pendingSpecialIndex === null) return;
          removeSpecial(pendingSpecialIndex);
          setIsDeleteDialogOpen(false);
          setPendingSpecialIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingSpecialIndex !== null
            ? npc.special?.[pendingSpecialIndex]?.name || ""
            : ""
        }
      />
    </SectionCard>
  );
}
