import {
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "/src/translation/translate";
import CustomTextarea from "/src/components/common/CustomTextarea";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Casino,
  Delete,
  Menu as MenuIcon,
} from "@mui/icons-material";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";

function RareGearContextMenu({
  raregear,
  npcName,
  onDelete,
  onMoveUp,
  onMoveDown,
  showMoveUp,
  showMoveDown,
}) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton component="span" onClick={open}>
        <MenuIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem
          onClick={() => {
            addMessage({
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              speaker: npcName || "NPC",
              kind: "display",
              itemType: "item",
              name: raregear.name,
              tags: ["Rare Equipment"],
              description: raregear.effect,
            });
            close();
          }}
        >
          <ListItemIcon>
            <Casino />
          </ListItemIcon>
          <ListItemText>{t("Roll")}</ListItemText>
        </MenuItem>

        <Divider />
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
    </>
  );
}

export default function EditRareGear({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingGearIndex, setPendingGearIndex] = useState(null);
  const [expandedSet, setExpandedSet] = useState(new Set());

  const toggleExpanded = (i) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  };

  const onChange = (i, key, value) => {
    setNpc((prev) => {
      const raregear = [...(prev.raregear || [])];
      raregear[i] = { ...raregear[i], [key]: value };
      return { ...prev, raregear };
    });
  };

  const addRareGear = () => {
    setNpc((prev) => ({
      ...prev,
      raregear: [...(prev.raregear || []), { name: "", effect: "" }],
    }));
  };

  const removeRareGear = (i) => {
    setNpc((prev) => ({
      ...prev,
      raregear: (prev.raregear || []).filter((_, idx) => idx !== i),
    }));
  };

  const moveRareGear = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const raregear = [...(prev.raregear || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= raregear.length ||
        toIndex >= raregear.length
      ) {
        return prev;
      }
      [raregear[fromIndex], raregear[toIndex]] = [
        raregear[toIndex],
        raregear[fromIndex],
      ];
      return { ...prev, raregear };
    });
  };

  const openDeleteDialog = (i) => {
    setPendingGearIndex(i);
    setIsDeleteDialogOpen(true);
  };

  return (
    <SectionCard
      title={t("Rare Equipment")}
      actions={
        <Tooltip title={t("Add Rare Equipment")}>
          <IconButton size="small" onClick={addRareGear} sx={{ color: "#fff" }}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      <Box sx={{ p: 1 }}>
      {npc.raregear?.map((raregear, i) => (
        <ItemRowCard
          key={i}
          label={raregear.name || t("(unnamed)")}
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
                    itemType: "item",
                    name: raregear.name,
                    tags: ["Rare Equipment"],
                    description: raregear.effect,
                  })
                }
              >
                <Casino />
              </IconButton>
              <RareGearContextMenu
                raregear={raregear}
                npcName={npc.name}
                onDelete={() => openDeleteDialog(i)}
                onMoveUp={() => moveRareGear(i, i - 1)}
                onMoveDown={() => moveRareGear(i, i + 1)}
                showMoveUp={i > 0}
                showMoveDown={i < (npc.raregear?.length ?? 0) - 1}
              />
            </>
          }
          onClick={() => toggleExpanded(i)}
          paperSx={{ mb: 0.5 }}
        >
          {expandedSet.has(i) && (
            <Box sx={{ p: 1 }}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <TextField
                      label={t("Name:")}
                      value={raregear.name}
                      onChange={(e) => onChange(i, "name", e.target.value)}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl fullWidth>
                    <CustomTextarea
                      label={t("Effect:")}
                      value={raregear.effect}
                      onChange={(e) => onChange(i, "effect", e.target.value)}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </ItemRowCard>
      ))}
      </Box>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingGearIndex(null);
        }}
        onConfirm={() => {
          if (pendingGearIndex === null) return;
          removeRareGear(pendingGearIndex);
          setIsDeleteDialogOpen(false);
          setPendingGearIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingGearIndex !== null
            ? npc.raregear?.[pendingGearIndex]?.name || ""
            : ""
        }
      />
    </SectionCard>
  );
}
