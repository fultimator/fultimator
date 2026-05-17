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
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../common/CustomHeader";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { npcSpecialFieldConfig } from "../../forms/rendering/config/itemConfigs/npcSpecial";
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

function SpecialContextMenu({ special, npcName, onDelete }) {
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
      <IconButton size="small" onClick={open}>
        <MenuIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={handleAddToCompendium}>
          <ListItemIcon>
            <LibraryAdd fontSize="small" />
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
            <Delete fontSize="small" color="error" />
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
  const isSmallScreen = useMediaQuery("(max-width: 899px)");
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingSpecialIndex, setPendingSpecialIndex] = useState(null);
  const [expandedSet, setExpandedSet] = useState(new Set());

  const allExpanded =
    npc.special?.length > 0 && expandedSet.size === npc.special.length;

  const toggleExpanded = (i) => {
    setExpandedSet((prev) => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  };

  const toggleAll = () => {
    setExpandedSet(
      allExpanded
        ? new Set()
        : new Set(npc.special?.map((_, i) => i) ?? []),
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

  const openDeleteDialog = (index) => {
    setPendingSpecialIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type={isSmallScreen ? "middle" : "top"}
        addItem={addSpecial}
        headerText={t("Special Rules")}
        icon={Add}
        openCompendium={() => setModalOpen(true)}
        onExpandCollapse={toggleAll}
        allExpanded={allExpanded}
      />
      {npc.special?.map((special, i) => (
        <Accordion
          key={i}
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
            sx={{ "& .MuiAccordionSummary-content": { alignItems: "center", overflow: "hidden" } }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                size="small"
                onClick={() =>
                  addMessage({
                    id: crypto.randomUUID(),
                    createdAt: Date.now(),
                    speaker: npc.name || "NPC",
                    kind: "display",
                    itemType: "special",
                    name: special.name,
                    tags: [`SP: ${special.spCost ?? 1}`],
                    description: special.effect,
                  })
                }
              >
                <Casino fontSize="small" />
              </IconButton>
              <SpecialContextMenu
                special={special}
                npcName={npc.name}
                onDelete={() => openDeleteDialog(i)}
              />
            </Box>
            <Box sx={{ flexGrow: 1, mx: 1, overflow: "hidden" }}>
              <Typography noWrap>{special.name || t("(unnamed)")}</Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", whiteSpace: "nowrap", mr: 1 }}
            >
              SP: {special.spCost ?? 1}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <SchemaFieldRenderer
                config={npcSpecialFieldConfig}
                state={special}
                onChange={(next) => {
                  setNpc((prev) => {
                    const special = [...(prev.special || [])];
                    special[i] = next;
                    return { ...prev, special };
                  });
                }}
                surface="edit"
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
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
    </>
  );
}
