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
import { SharedZeroPowerCard } from "../../shared/itemCards";

const ZERO_POWER_SUBTYPES = ["zero-power", "zero-trigger", "zero-effect"];
const CONTROL_SIZE = 32;

function toFormState(zeroPower) {
  return {
    itemType: "zeroPowerOptional",
    name: zeroPower?.name ?? "",
    clockSections: Number(zeroPower?.clock?.sections) || 6,
    triggerName: zeroPower?.zeroTrigger?.name ?? "",
    triggerDescription: zeroPower?.zeroTrigger?.description ?? "",
    effectName: zeroPower?.zeroEffect?.name ?? "",
    effectDescription: zeroPower?.zeroEffect?.description ?? "",
  };
}

function fromFormState(form) {
  return {
    name: form.name ?? "",
    zeroTrigger: { name: form.triggerName ?? "", description: form.triggerDescription ?? "" },
    zeroEffect: { name: form.effectName ?? "", description: form.effectDescription ?? "" },
    clock: { sections: Number(form.clockSections) || 6 },
  };
}

export default function EditPlayerZeroPower({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const { ensurePersonalPack, addItem } = useCompendiumPacks();

  const [editorOpen, setEditorOpen] = useState(false);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const zeroPower = useMemo(() => player.zeroPower, [player.zeroPower]);
  const hasZeroPower = Boolean(zeroPower && (zeroPower.name?.trim() || zeroPower.zeroTrigger?.name?.trim() || zeroPower.zeroEffect?.name?.trim()));

  return (
    <Paper elevation={3} sx={{ p: "15px", borderRadius: "8px", border: "2px solid", borderColor: secondary }}>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CustomHeader type="top" headerText={t("Zero Power")} showIconButton={isEditMode} addItem={() => { setCreating(true); setEditorOpen(true); }} openCompendium={isEditMode ? () => setCompendiumOpen(true) : undefined} icon={AddIcon} customTooltip={t("Add Zero Power")} />
        </Grid>

        {!hasZeroPower ? (
          <Grid size={12} sx={{ py: 2 }}><Typography sx={{ textAlign: "center", color: "text.secondary" }}>{t("No zero power yet.")}</Typography></Grid>
        ) : (
          <Grid size={12}>
            <Accordion disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 56, "&.Mui-expanded": { minHeight: 56 }, "& .MuiAccordionSummary-content": { alignItems: "center", my: 0, "&.Mui-expanded": { my: 0 } } }}>
                <Box sx={{ display: "flex", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title={t("Roll")}><IconButton size="small" onClick={() => addMessage({ id: crypto.randomUUID(), createdAt: Date.now(), speaker: player?.name || "Player", kind: "display", itemType: "optional", name: zeroPower.name || t("Zero Power"), tags: [t("Zero Power")], description: zeroPower.zeroTrigger?.description || "", effect: zeroPower.zeroEffect?.description || "", ...(zeroPower.clock?.sections ? { clock: { sections: zeroPower.clock.sections, state: Array.isArray(zeroPower.clockState) && zeroPower.clockState.length === zeroPower.clock.sections ? zeroPower.clockState : new Array(zeroPower.clock.sections).fill(false), name: zeroPower.name || t("Zero Power") } } : {}) })} sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}><Casino sx={{ fontSize: "1.2rem" }} /></IconButton></Tooltip>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchorEl(e.currentTarget); }} sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}><MenuIcon sx={{ fontSize: "1.2rem" }} /></IconButton>
                  <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
                    <MenuItem onClick={async () => { const pack = await ensurePersonalPack(); await addItem(pack.id, "optional", { subtype: "zero-power", name: zeroPower.name || "", zeroTrigger: zeroPower.zeroTrigger || { name: "", description: "" }, zeroEffect: zeroPower.zeroEffect || { name: "", description: "" }, zeroTriggerRef: "", zeroEffectRef: "", clock: { sections: zeroPower.clock?.sections || 6 } }); setMenuAnchorEl(null); }}><ListItemText>{t("Add to Compendium")}</ListItemText></MenuItem>
                    <MenuItem onClick={() => { setPlayer((prev) => { const next = { ...prev }; delete next.zeroPower; return next; }); setMenuAnchorEl(null); }} sx={{ color: "error.main" }}><ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon><ListItemText>{t("Delete")}</ListItemText></MenuItem>
                  </Menu>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}><Typography noWrap sx={{ fontWeight: 700 }}>{zeroPower.name || t("Unnamed Zero Power")}</Typography></Box>
                <Box onClick={(e) => e.stopPropagation()}><Tooltip title={t("Edit")}><IconButton size="small" onClick={() => { setCreating(false); setEditorOpen(true); }} sx={{ width: CONTROL_SIZE, height: CONTROL_SIZE }}><EditIcon sx={{ fontSize: "1.2rem" }} /></IconButton></Tooltip></Box>
              </AccordionSummary>
              <AccordionDetails>
                <SharedZeroPowerCard item={{ ...zeroPower, clock: zeroPower.clock?.sections || 6 }} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>

      {editorOpen ? <ItemEditModal open onClose={() => { setEditorOpen(false); setCreating(false); }} itemType="zeroPowerOptional" item={toFormState(creating ? null : zeroPower)} editIndex={creating || !hasZeroPower ? null : 0} onSave={(payload) => { setPlayer((prev) => ({ ...prev, zeroPower: fromFormState(payload) })); setEditorOpen(false); setCreating(false); }} onDelete={() => { setPlayer((prev) => { const next = { ...prev }; delete next.zeroPower; return next; }); setEditorOpen(false); setCreating(false); }} ctx={{ player, setPlayer }} /> : null}

      {isEditMode ? <CompendiumViewerModal open={compendiumOpen} onClose={() => setCompendiumOpen(false)} onAddItem={(item) => {
        if (item.subtype === "zero-trigger") {
          setPlayer((prev) => ({ ...prev, zeroPower: { ...(prev.zeroPower ?? {}), zeroTrigger: { name: item.name ?? "", description: item.description ?? item.effect ?? "" } } }));
          setCompendiumOpen(false);
          return;
        }
        if (item.subtype === "zero-effect") {
          setPlayer((prev) => ({ ...prev, zeroPower: { ...(prev.zeroPower ?? {}), zeroEffect: { name: item.name ?? "", description: item.description ?? item.effect ?? "" } } }));
          setCompendiumOpen(false);
          return;
        }
        const triggerName = typeof item.zeroTrigger === "string" ? item.zeroTrigger : (item.zeroTrigger?.name ?? "");
        const triggerDesc = typeof item.zeroTrigger === "object" ? (item.zeroTrigger?.description ?? "") : "";
        const effectName = typeof item.zeroEffect === "string" ? item.zeroEffect : (item.zeroEffect?.name ?? "");
        const effectDesc = typeof item.zeroEffect === "object" ? (item.zeroEffect?.description ?? "") : "";
        setPlayer((prev) => ({ ...prev, zeroPower: { name: item.name ?? "", zeroTrigger: { name: triggerName, description: triggerDesc }, zeroEffect: { name: effectName, description: effectDesc }, clock: { sections: item.clock?.sections ?? 6 } } }));
        setCompendiumOpen(false);
      }} initialType="optionals" restrictToTypes={["optionals"]} initialOptionalSubtypes={ZERO_POWER_SUBTYPES} /> : null}
    </Paper>
  );
}
