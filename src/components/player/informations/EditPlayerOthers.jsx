import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
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

const OTHER_SUBTYPES = ["other"];
const CONTROL_SIZE = 32;

function toFormState(other) {
  return {
    itemType: "otherOptional",
    name: other?.name ?? "",
    description: other?.description ?? "",
    effect: other?.effect ?? "",
    clockEnabled: Boolean(other?.clock?.sections),
    clockSections: Number(other?.clock?.sections) || 6,
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    description: form.description ?? "",
    effect: form.effect ?? "",
    clock: form.clockEnabled
      ? { sections: Number(form.clockSections) || 6 }
      : undefined,
  };
}

function OtherRow({
  other,
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
              onClick={() => onRoll(other)}
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
                await onAddToCompendium(other);
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
            {other.name || t("Unnamed Optional")}
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
        <SharedOptionalCard item={{ ...other, subtype: "other" }} />
      </AccordionDetails>
    </Accordion>
  );
}

export default function EditPlayerOther({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();

  const [editIndex, setEditIndex] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const others = useMemo(() => player.others ?? [], [player.others]);

  const editingItem = createOpen
    ? toFormState(null)
    : editIndex !== null
      ? toFormState(others[editIndex])
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
            headerText={t("Other Optionals")}
            showIconButton={isEditMode}
            addItem={() => setCreateOpen(true)}
            openCompendium={
              isEditMode ? () => setCompendiumOpen(true) : undefined
            }
            icon={AddIcon}
            customTooltip={t("Add Optional")}
          />
        </Grid>

        {others.length === 0 ? (
          <Grid size={12} sx={{ py: 2 }}>
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              {t("No optional entries yet.")}
            </Typography>
          </Grid>
        ) : (
          <Grid size={12}>
            {others.map((other, index) => (
              <OtherRow
                key={`${other.name || "other"}-${index}`}
                other={other}
                index={index}
                onEdit={setEditIndex}
                onDelete={(i) => {
                  setPlayer((prev) => ({
                    ...prev,
                    others: (prev.others ?? []).filter((_, idx) => idx !== i),
                  }));
                }}
                onRoll={(entry) => {
                  addMessage({
                    id: crypto.randomUUID(),
                    createdAt: Date.now(),
                    speaker: player?.name || "Player",
                    kind: "display",
                    itemType: "optional",
                    name: entry.name || t("Optional"),
                    tags: [t("Optional")],
                    description: entry.description || "",
                    effect: entry.effect || "",
                    ...(entry.clock?.sections
                      ? {
                          clock: {
                            sections: entry.clock.sections,
                            state:
                              Array.isArray(entry.clockState) &&
                              entry.clockState.length === entry.clock.sections
                                ? entry.clockState
                                : new Array(entry.clock.sections).fill(false),
                            name: entry.name || t("Optional"),
                          },
                        }
                      : {}),
                  });
                }}
                onAddToCompendium={async (entry) => {
                  const pack = await ensurePersonalPack();
                  await addItem(pack.id, "optional", {
                    subtype: "other",
                    name: entry.name || "",
                    description: entry.description || "",
                    effect: entry.effect || "",
                    ...(entry.clock?.sections
                      ? { clock: { sections: entry.clock.sections } }
                      : {}),
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
          itemType="otherOptional"
          item={editingItem}
          editIndex={createOpen ? null : editIndex}
          onSave={(payload) => {
            const nextEntry = fromFormState(payload);
            setPlayer((prev) => {
              const next = [...(prev.others ?? [])];
              if (createOpen) next.push(nextEntry);
              else if (editIndex !== null && next[editIndex])
                next[editIndex] = nextEntry;
              return { ...prev, others: next };
            });
            setCreateOpen(false);
            setEditIndex(null);
          }}
          onDelete={(index) => {
            setPlayer((prev) => {
              const next = [...(prev.others ?? [])];
              if (index >= 0) next.splice(index, 1);
              return { ...prev, others: next };
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
              description: item.description ?? "",
              effect: item.effect ?? "",
              ...(item.clock?.sections
                ? { clock: { sections: item.clock.sections } }
                : {}),
            };
            setPlayer((prev) => ({
              ...prev,
              others: [...(prev.others ?? []), nextEntry],
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={OTHER_SUBTYPES}
        />
      ) : null}
    </Paper>
  );
}
