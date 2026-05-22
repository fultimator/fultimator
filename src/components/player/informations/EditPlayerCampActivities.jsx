import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Casino from "@mui/icons-material/Casino";
import Delete from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CustomHeader from "../../common/CustomHeader";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import ItemEditModal from "../../../forms/ui/ItemEditModal";
import { useTranslate } from "../../../translation/translate";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";
import { SharedOptionalCard } from "../../shared/itemCards";

const CAMP_ACTIVITY_SUBTYPES = ["camp-activities"];
const CONTROL_SIZE = 32;

function toFormState(activity) {
  return {
    itemType: "campActivity",
    name: activity?.name ?? "",
    description: activity?.description ?? "choice",
    targetDescription: activity?.targetDescription ?? "",
    effect: activity?.effect ?? "",
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    description: form.description ?? "choice",
    targetDescription: form.targetDescription ?? "",
    effect: form.effect ?? "",
  };
}

function ActivityRow({
  activity,
  index,
  onEdit,
  onDelete,
  onRoll,
  onAddToCompendium,
}) {
  const { t } = useTranslate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        mb: 0.75,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 56,
          "&.Mui-expanded": { minHeight: 56 },
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            my: 0,
            "&.Mui-expanded": { my: 0 },
          },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={t("Roll")}>
            <IconButton
              size="small"
              onClick={() => onRoll(activity)}
              sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
            >
              <Casino sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchorEl(e.currentTarget);
            }}
            sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
          >
            <MenuIcon sx={{ fontSize: "1.2rem" }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem
              onClick={async (e) => {
                e.stopPropagation();
                await onAddToCompendium(activity);
                setMenuAnchorEl(null);
              }}
            >
              <ListItemText>{t("Add to Compendium")}</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
                setMenuAnchorEl(null);
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <Delete color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("Delete")}</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 700 }}>
            {activity.name || t("Unnamed Camp Activity")}
          </Typography>
        </Box>
        <Box onClick={(e) => e.stopPropagation()}>
          <Tooltip title={t("Edit")}>
            <IconButton
              size="small"
              onClick={() => onEdit(index)}
              sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
            >
              <EditIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <SharedOptionalCard
          item={{ ...activity, subtype: "camp-activities" }}
        />
      </AccordionDetails>
    </Accordion>
  );
}

export default function EditPlayerCampActivities({
  player,
  setPlayer,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();
  const [editIndex, setEditIndex] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const activities = useMemo(
    () => player.campActivities ?? [],
    [player.campActivities],
  );

  const editingItem = createOpen
    ? toFormState(null)
    : editIndex !== null
      ? toFormState(activities[editIndex])
      : null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={1}>
        <Grid size={12}>
          <CustomHeader
            type="top"
            headerText={t("Camp Activities (Max 2)")}
            showIconButton={isEditMode}
            addItem={() => setCreateOpen(true)}
            openCompendium={
              isEditMode ? () => setCompendiumOpen(true) : undefined
            }
            icon={AddIcon}
            customTooltip={t("Add Camp Activity")}
          />
        </Grid>
        {activities.length === 0 ? (
          <Grid size={12} sx={{ py: 2 }}>
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              {t("No camp activities yet.")}
            </Typography>
          </Grid>
        ) : (
          <Grid size={12}>
            {activities.map((activity, index) => (
              <ActivityRow
                key={`${activity.name || "camp"}-${index}`}
                activity={activity}
                index={index}
                onEdit={setEditIndex}
                onDelete={(i) =>
                  setPlayer((prev) => ({
                    ...prev,
                    campActivities: (prev.campActivities ?? []).filter(
                      (_, idx) => idx !== i,
                    ),
                  }))
                }
                onRoll={(entry) =>
                  addMessage({
                    id: crypto.randomUUID(),
                    createdAt: Date.now(),
                    speaker: player?.name || "Player",
                    kind: "display",
                    itemType: "optional",
                    name: entry.name || t("Camp Activity"),
                    tags: [t("Camp Activities")],
                    description: entry.description || "choice",
                    ...(entry.targetDescription
                      ? { targetDescription: entry.targetDescription }
                      : {}),
                    effect: entry.effect || "",
                  })
                }
                onAddToCompendium={async (entry) => {
                  const pack = await ensurePersonalPack();
                  await addItem(pack.id, "optional", {
                    subtype: "camp-activities",
                    name: entry.name || "",
                    description: entry.description || "choice",
                    ...(entry.targetDescription
                      ? { targetDescription: entry.targetDescription }
                      : {}),
                    effect: entry.effect || "",
                  });
                }}
              />
            ))}
          </Grid>
        )}
      </Grid>

      {(createOpen || editIndex !== null) && editingItem ? (
        <ItemEditModal
          open
          onClose={() => {
            setCreateOpen(false);
            setEditIndex(null);
          }}
          itemType="campActivity"
          item={editingItem}
          editIndex={createOpen ? null : editIndex}
          onSave={(payload) => {
            const nextEntry = fromFormState(payload);
            setPlayer((prev) => {
              const next = [...(prev.campActivities ?? [])];
              if (createOpen) next.push(nextEntry);
              else if (editIndex !== null && next[editIndex])
                next[editIndex] = nextEntry;
              return { ...prev, campActivities: next };
            });
            setCreateOpen(false);
            setEditIndex(null);
          }}
          onDelete={(index) => {
            setPlayer((prev) => {
              const next = [...(prev.campActivities ?? [])];
              if (index >= 0) next.splice(index, 1);
              return { ...prev, campActivities: next };
            });
            setCreateOpen(false);
            setEditIndex(null);
          }}
          ctx={{ player, setPlayer }}
        />
      ) : null}

      {isEditMode ? (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={(item) => {
            const nextEntry = {
              name: item.name ?? "",
              description: item.description ?? "choice",
              targetDescription: item.targetDescription ?? "",
              effect: item.effect ?? "",
            };
            setPlayer((prev) => ({
              ...prev,
              campActivities: [...(prev.campActivities ?? []), nextEntry],
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={CAMP_ACTIVITY_SUBTYPES}
        />
      ) : null}
    </Paper>
  );
}
