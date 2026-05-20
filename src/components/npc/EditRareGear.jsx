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
  Casino,
  Delete,
  ExpandMore,
  Menu as MenuIcon,
} from "@mui/icons-material";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
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

  const openDeleteDialog = (i) => {
    setPendingGearIndex(i);
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
      {npc.raregear?.map((raregear, i) => (
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
              />
            </Box>
            <Box sx={{ flexGrow: 1, mx: 1, overflow: "hidden" }}>
              <Typography noWrap>{raregear.name || t("(unnamed)")}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
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
          </AccordionDetails>
        </Accordion>
      ))}
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
