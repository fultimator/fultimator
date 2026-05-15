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

function RareGearContextMenu({ raregear, npcName, onDelete }) {
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
              itemType: "item",
              name: raregear.name,
              tags: ["Rare Equipment"],
              description: raregear.effect,
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

export default function EditRareGear({ npc, setNpc }) {
  const { t } = useTranslate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingGearIndex, setPendingGearIndex] = useState(null);
  const onChangeRareGear = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.raregear[i][key] = value;
      return newState;
    });
  };

  const addRareGear = () => {
    setNpc((prevState) => ({
      ...prevState,
      raregear: [
        ...(prevState.raregear || []),
        {
          name: "",
          effect: "",
        },
      ],
    }));
  };

  const removeRareGear = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      raregear: (prevState.raregear || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingGearIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="middle"
        addItem={addRareGear}
        headerText={t("Rare Equipment")}
        icon={Add}
      />
      {npc.raregear?.map((raregear, i) => {
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
              <RareGearContextMenu
                raregear={raregear}
                npcName={npc.name}
                onDelete={() => openDeleteDialog(i)}
              />
            </Grid>
            <Grid size="grow">
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={raregear.name}
                  onChange={(e) => {
                    return onChangeRareGear(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={raregear.effect}
                  onChange={(e) => {
                    return onChangeRareGear(i, "effect", e.target.value);
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
    </>
  );
}
