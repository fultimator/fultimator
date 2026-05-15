import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { Add, Menu as MenuIcon, Casino, Delete } from "@mui/icons-material";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useState } from "react";
import { useChatMessagesStore } from "../../store/chatMessagesStore";

function NoteContextMenu({ note, npcName, onDelete }) {
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
      <IconButton size="small" onClick={open}>
        <MenuIcon fontSize="small" />
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
              description: note.effect,
            });
            close();
          }}
        >
          <ListItemIcon>
            <Casino fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Roll")}</ListItemText>
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
    </>
  );
}

export default function EditNotes({ npc, setNpc }) {
  const { t } = useTranslate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingNoteIndex, setPendingNoteIndex] = useState(null);
  const onChangeNotes = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.notes[i][key] = value;
      return newState;
    });
  };

  const addNotes = () => {
    setNpc((prevState) => ({
      ...prevState,
      notes: [
        ...(prevState.notes || []),
        {
          name: "",
          effect: "",
        },
      ],
    }));
  };

  const removeNotes = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      notes: (prevState.notes || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingNoteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="middle"
        addItem={addNotes}
        headerText={t("Notes")}
        icon={Add}
      />
      {npc.notes?.map((notes, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid
              sx={{
                p: 0,
                m: 0,
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                pt: "4px",
              }}
            >
              <NoteContextMenu
                note={notes}
                npcName={npc.name}
                onDelete={() => openDeleteDialog(i)}
              />
            </Grid>
            <Grid size="grow">
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={notes.name}
                  onChange={(e) => {
                    return onChangeNotes(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <CustomTextarea
                  label={t("Details:")}
                  value={notes.effect}
                  onChange={(e) => {
                    return onChangeNotes(i, "effect", e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingNoteIndex(null);
        }}
        onConfirm={() => {
          if (pendingNoteIndex === null) return;
          removeNotes(pendingNoteIndex);
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
