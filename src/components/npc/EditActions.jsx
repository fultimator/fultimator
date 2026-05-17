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
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import {
  Add,
  Menu as MenuIcon,
  Casino,
  Delete,
  LibraryAdd,
} from "@mui/icons-material";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useChatMessagesStore } from "../../store/chatMessagesStore";

function ActionContextMenu({ action, npcName, onDelete }) {
  const { t } = useTranslate();
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
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
      // multiple pack targets — show sub-menu
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
        <MenuItem
          onClick={() => {
            addMessage({
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              speaker: npcName || "NPC",
              kind: "display",
              itemType: "action",
              name: action.name,
              tags: [`SP: ${action.spCost ?? 1}`],
              description: action.effect,
            });
            close();
          }}
        >
          <ListItemIcon>
            <Casino fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Roll")}</ListItemText>
        </MenuItem>

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

      {/* Pack picker shown when multiple targets exist */}
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
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingActionIndex, setPendingActionIndex] = useState(null);
  const onChangeActions = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.actions[i][key] = value;
      return newState;
    });
  };

  const addActions = () => {
    setNpc((prevState) => ({
      ...prevState,
      actions: [
        ...(prevState.actions || []),
        {
          name: "",
          effect: "",
          spCost: 1,
        },
      ],
    }));
  };

  const removeActions = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      actions: (prevState.actions || []).filter((_, index) => index !== i),
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
      />
      {npc.actions?.map((actions, i) => {
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
              <ActionContextMenu
                action={actions}
                npcName={npc.name}
                onDelete={() => openDeleteDialog(i)}
              />
            </Grid>
            <Grid size="grow">
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={actions.name}
                  onChange={(e) => {
                    return onChangeActions(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid size={3}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="spCost"
                  label={t("SP Cost:")}
                  type="number"
                  value={actions?.spCost ?? 1}
                  onChange={(e) =>
                    onChangeActions(
                      i,
                      "spCost",
                      parseInt(e.target.value, 10) || 1,
                    )
                  }
                  size="small"
                  slotProps={{
                    htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                  }}
                />
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl variant="standard" fullWidth>
                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={actions.effect}
                  onChange={(e) => {
                    return onChangeActions(i, "effect", e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
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
