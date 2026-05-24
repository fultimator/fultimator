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
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import ItemEditModal from "../../../forms/ui/ItemEditModal";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";
import { SharedOptionalCard } from "../../shared/itemCards";

const QUIRK_SUBTYPES = ["quirk"];
const CONTROL_SIZE = 32;

function toFormState(quirk) {
  return {
    itemType: "quirkOptional",
    name: quirk?.name ?? "",
    description: quirk?.description ?? "",
    effect: quirk?.effect ?? "",
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    description: form.description ?? "",
    effect: form.effect ?? "",
  };
}

export default function EditPlayerQuirk({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();

  const [editorOpen, setEditorOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const quirk = useMemo(() => player.quirk, [player.quirk]);
  const hasQuirk = Boolean(
    quirk &&
    (quirk.name?.trim() || quirk.description?.trim() || quirk.effect?.trim()),
  );

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
            headerText={t("Quirk")}
            showIconButton={isEditMode}
            addItem={() => {
              setCreating(true);
              setEditorOpen(true);
            }}
            openCompendium={
              isEditMode ? () => setCompendiumOpen(true) : undefined
            }
            icon={AddIcon}
            customTooltip={t("Add Quirk")}
          />
        </Grid>

        {!hasQuirk ? (
          <Grid size={12} sx={{ py: 2 }}>
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              {t("No quirk yet.")}
            </Typography>
          </Grid>
        ) : (
          <Grid size={12}>
            <Accordion
              disableGutters
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
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
                      onClick={() =>
                        addMessage({
                          id: crypto.randomUUID(),
                          createdAt: Date.now(),
                          speaker: player?.name || "Player",
                          kind: "display",
                          itemType: "optional",
                          name: quirk.name || t("Quirk"),
                          tags: [t("Quirk")],
                          description: quirk.description || "",
                          effect: quirk.effect || "",
                        })
                      }
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
                      onClick={async () => {
                        const pack = await ensurePersonalPack();
                        await addItem(pack.id, "optional", {
                          subtype: "quirk",
                          ...quirk,
                        });
                        setMenuAnchorEl(null);
                      }}
                    >
                      <ListItemText>{t("Add to Compendium")}</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setPlayer((prev) => {
                          const next = { ...prev };
                          delete next.quirk;
                          return next;
                        });
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
                    {quirk.name || t("Unnamed Quirk")}
                  </Typography>
                </Box>
                <Box onClick={(e) => e.stopPropagation()}>
                  <Tooltip title={t("Edit")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setCreating(false);
                        setEditorOpen(true);
                      }}
                      sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}
                    >
                      <EditIcon sx={{ fontSize: "1.2rem" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <SharedOptionalCard item={{ ...quirk, subtype: "quirk" }} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>

      {editorOpen ? (
        <ItemEditModal
          open
          onClose={() => {
            setEditorOpen(false);
            setCreating(false);
          }}
          itemType="quirkOptional"
          item={toFormState(creating ? null : quirk)}
          editIndex={creating || !hasQuirk ? null : 0}
          onSave={(payload) => {
            setPlayer((prev) => ({ ...prev, quirk: fromFormState(payload) }));
            setEditorOpen(false);
            setCreating(false);
          }}
          onDelete={() => {
            setPlayer((prev) => {
              const next = { ...prev };
              delete next.quirk;
              return next;
            });
            setEditorOpen(false);
            setCreating(false);
          }}
          ctx={{ player, setPlayer }}
        />
      ) : null}

      {isEditMode ? (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={(item) => {
            setPlayer((prev) => ({
              ...prev,
              quirk: {
                name: item.name ?? "",
                description: item.description ?? "",
                effect: item.effect ?? "",
              },
            }));
            setCompendiumOpen(false);
          }}
          initialType="optionals"
          restrictToTypes={["optionals"]}
          initialOptionalSubtypes={QUIRK_SUBTYPES}
        />
      ) : null}
    </Paper>
  );
}
