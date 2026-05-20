import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../common/CustomHeader";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import {
  npcActionFieldConfig,
  npcActionGroupLabels,
} from "../../forms/rendering/config/itemConfigs/npcAction";
import {
  Add,
  Casino,
  Delete,
  ExpandMore,
  LibraryAdd,
  Menu as MenuIcon,
} from "@mui/icons-material";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useChatMessagesStore } from "../../store/chatMessagesStore";

function ActionContextMenu({ action, npcName: _npcName, onDelete }) {
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

  const openDeleteDialog = (index) => {
    setPendingActionIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="top"
        addItem={addActions}
        headerText={t("Other Actions")}
        icon={Add}
        openCompendium={() => setModalOpen(true)}
        onExpandCollapse={toggleAll}
        allExpanded={allExpanded}
      />
      <Grid container spacing={1}>
        {npc.actions?.map((action, i) => {
          return (
            <Grid key={i} size={12}>
              <Accordion
                expanded={expandedSet.has(i)}
                onChange={() => toggleExpanded(i)}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  "&:before": { display: "none" },
                  mb: 0.5,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      overflow: "hidden",
                    },
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center" }}
                    onClick={(e) => e.stopPropagation()}
                  >
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
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, mx: 1, overflow: "hidden" }}>
                    <Typography noWrap>
                      {action.name || t("(unnamed)")}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                      mr: 1,
                    }}
                  >
                    SP: {action.spCost ?? 1}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    <SchemaFieldRenderer
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
                      group="core"
                      label={t("Other Action")}
                      cols={2}
                      extraProps={{ name: String(action.name ?? "") }}
                    />
                    <SchemaFieldRenderer
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
                      group="body"
                      cols={1}
                    />
                    <SchemaFieldRenderer
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
                      group="meta"
                      cols={2}
                      hidden
                    />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        })}
      </Grid>
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
    </>
  );
}
