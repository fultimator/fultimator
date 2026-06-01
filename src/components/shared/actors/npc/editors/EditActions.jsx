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
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "/src/translation/translate";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { Search, UnfoldLess, UnfoldMore } from "@mui/icons-material";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  npcActionFieldConfig,
  npcActionGroupLabels,
  npcActionTabs,
} from "/src/forms/rendering/config/itemConfigs/npcAction";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Casino,
  Delete,
  LibraryAdd,
  Menu as MenuIcon,
} from "@mui/icons-material";
import ItemRowCard from "/src/components/shared/actors/common/ItemRowCard";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";

function ActionContextMenu({
  action,
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
  const nonPersonalPacks = packs.filter((p) => !p.isPersonal);
  const unlockedNonPersonal = nonPersonalPacks.filter((p) => !p.locked);

  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  const doAdd = async (packId) => {
    try {
      await addItem(packId, "npc-action", action);
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

export default function EditActions({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingActionIndex, setPendingActionIndex] = useState(null);
  const [expandedSet, setExpandedSet] = useState(new Set());

  const allExpanded =
    npc.actions?.length > 0 && expandedSet.size === npc.actions.length;

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
      allExpanded ? new Set() : new Set(npc.actions?.map((_, i) => i) ?? []),
    );
  };

  const addActions = () => {
    const newIndex = npc.actions?.length ?? 0;
    setExpandedSet((prev) => new Set([...prev, newIndex]));
    setNpc((prev) => ({
      ...prev,
      actions: [...(prev.actions || []), { name: "", effect: "", spCost: 1 }],
    }));
  };

  const removeActions = (i) => {
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
      actions: (prev.actions || []).filter((_, index) => index !== i),
    }));
  };

  const moveAction = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const actions = [...(prev.actions || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= actions.length ||
        toIndex >= actions.length
      ) {
        return prev;
      }
      [actions[fromIndex], actions[toIndex]] = [
        actions[toIndex],
        actions[fromIndex],
      ];
      return { ...prev, actions };
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
    setPendingActionIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <SectionCard
      title={t("Other Actions")}
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
          <Tooltip title={t("Add Action")}>
            <IconButton size="small" onClick={addActions} sx={{ color: "#fff" }}>
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <Box sx={{ p: 1 }}>
      <Grid container spacing={1}>
        {npc.actions?.map((action, i) => {
          return (
            <Grid key={i} size={12}>
              <ItemRowCard
                label={action.name || t("(unnamed)")}
                subtitle={
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                  >
                    SP: {action.spCost ?? 1}
                  </Typography>
                }
                actions={
                  <>
                    <IconButton
                      component="span"
                      onClick={() =>
                        addMessage({
                          id: crypto.randomUUID(),
                          createdAt: Date.now(),
                          speaker: npc.name || "NPC",
                          kind: "display",
                          itemType: "action",
                          name: action.name,
                          tags: [`SP: ${action.spCost ?? 1}`],
                          description: action.effect,
                        })
                      }
                    >
                      <Casino />
                    </IconButton>
                    <ActionContextMenu
                      action={action}
                      npcName={npc.name}
                      onDelete={() => openDeleteDialog(i)}
                      onMoveUp={() => moveAction(i, i - 1)}
                      onMoveDown={() => moveAction(i, i + 1)}
                      showMoveUp={i > 0}
                      showMoveDown={i < (npc.actions?.length ?? 0) - 1}
                    />
                  </>
                }
                onClick={() => toggleExpanded(i)}
                paperSx={{ mb: 0.5 }}
              >
                {expandedSet.has(i) && (
                  <Box sx={{ p: 1 }}>
                    <TabbedSchemaFormRenderer
                      tabs={npcActionTabs}
                      config={npcActionFieldConfig}
                      groupLabels={npcActionGroupLabels}
                      state={action}
                      onChange={(next) => {
                        setNpc((prev) => {
                          const actions = [...(prev.actions || [])];
                          actions[i] = next;
                          return { ...prev, actions };
                        });
                      }}
                      surface="edit"
                      cols={2}
                      extraProps={{ name: String(action.name ?? "") }}
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
        initialType="actions"
        initialCompendium="personal"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            actions: [
              ...(prev.actions || []),
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
          setPendingActionIndex(null);
        }}
        onConfirm={() => {
          if (pendingActionIndex === null) return;
          removeActions(pendingActionIndex);
          setIsDeleteDialogOpen(false);
          setPendingActionIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingActionIndex !== null
            ? npc.actions?.[pendingActionIndex]?.name || ""
            : ""
        }
      />
    </SectionCard>
  );
}
