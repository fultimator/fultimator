import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Casino,
  Delete,
  ExpandMore,
  Menu as MenuIcon,
} from "@mui/icons-material";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";

function NoteContextMenu({
  note,
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
              itemType: "note",
              name: note.name,
              tags: [],
              description: note.effect || note.description,
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

export default function EditNotes({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingNoteIndex, setPendingNoteIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const onChange = (i, key, value) => {
    setNpc((prev) => {
      const notes = [...(prev.notes || [])];
      notes[i] = { ...notes[i], [key]: value };
      return { ...prev, notes };
    });
  };

  const addNote = () => {
    setNpc((prev) => ({
      ...prev,
      notes: [...(prev.notes || []), { name: "", description: "", effect: "" }],
    }));
  };

  const removeNote = (i) => {
    setNpc((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((_, idx) => idx !== i),
    }));
  };

  const moveNote = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const notes = [...(prev.notes || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= notes.length ||
        toIndex >= notes.length
      ) {
        return prev;
      }
      [notes[fromIndex], notes[toIndex]] = [notes[toIndex], notes[fromIndex]];
      return { ...prev, notes };
    });
  };

  const openDeleteDialog = (i) => {
    setPendingNoteIndex(i);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="middle"
        addItem={addNote}
        headerText={t("Notes")}
        icon={Add}
        openCompendium={() => setModalOpen(true)}
      />
      {npc.notes?.map((note, i) => (
        <Accordion
          key={i}
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
                    itemType: "note",
                    name: note.name,
                    tags: [],
                    description: note.effect || note.description,
                  })
                }
              >
                <Casino />
              </IconButton>
              <NoteContextMenu
                note={note}
                npcName={npc.name}
                onDelete={() => openDeleteDialog(i)}
                onMoveUp={() => moveNote(i, i - 1)}
                onMoveDown={() => moveNote(i, i + 1)}
                showMoveUp={i > 0}
                showMoveDown={i < (npc.notes?.length ?? 0) - 1}
              />
            </Box>
            <Box sx={{ flexGrow: 1, mx: 1, overflow: "hidden" }}>
              <Typography noWrap>{note.name || t("(unnamed)")}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <TextField
                    label={t("Name:")}
                    value={note.name}
                    onChange={(e) => onChange(i, "name", e.target.value)}
                    size="small"
                  />
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <CustomTextarea
                    label={t("Description:")}
                    value={note.description ?? ""}
                    onChange={(e) => onChange(i, "description", e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid size={12}>
                <FormControl fullWidth>
                  <CustomTextarea
                    label={t("Effect:")}
                    value={note.effect ?? ""}
                    onChange={(e) => onChange(i, "effect", e.target.value)}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <CompendiumViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context="npc"
        initialType="note"
        initialCompendium="personal"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            notes: [
              ...(prev.notes || []),
              {
                name: item.name ?? "",
                description: item.description ?? "",
                effect: item.effect ?? "",
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
          setPendingNoteIndex(null);
        }}
        onConfirm={() => {
          if (pendingNoteIndex === null) return;
          removeNote(pendingNoteIndex);
          setIsDeleteDialogOpen(false);
          setPendingNoteIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingNoteIndex !== null
            ? npc.notes?.[pendingNoteIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
