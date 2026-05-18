import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslate, t as staticT } from "../../translation/translate";
import CustomHeader from "../common/CustomHeader";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { npcSpellFieldConfig } from "../../forms/rendering/config/itemConfigs/npcSpell";
import {
  Add,
  Casino,
  Delete,
  ExpandMore,
  LibraryAdd,
  Menu as MenuIcon,
} from "@mui/icons-material";
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "../app-drawer/panels/chat/domain/magic-checks";
import { TypeName } from "../types";
import { SpellIcon, OffensiveSpellIcon } from "../icons";
import { OpenBracket, CloseBracket } from "../Bracket";

const ATTR_SHORT = {
  dexterity: "DEX",
  insight: "INS",
  might: "MIG",
  will: "WLP",
};

const SUMMARY_META_SX = {
  color: "text.secondary",
  whiteSpace: "nowrap",
  mr: 1,
  fontWeight: "bold",
  flexShrink: 0,
  "@container (max-width: 460px)": {
    display: "none",
  },
};

function SpellContextMenu({ spell, onDelete }) {
  const { t } = useTranslate();
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();
  const [anchorEl, setAnchorEl] = useState(null);
  const [packMenuAnchor, setPackMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const personalPack = packs.find((p) => p.isPersonal) ?? null;
  const unlockedNonPersonal = packs.filter((p) => !p.isPersonal && !p.locked);

  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  const doAdd = async (packId) => {
    try {
      await addItem(packId, "npc-spell", spell);
      setSnackbar({ open: true, message: t("Added to compendium"), severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err?.message ?? t("Failed to add"), severity: "error" });
    }
  };

  const handleAddToCompendium = async (e) => {
    close();
    if (unlockedNonPersonal.length > 0) {
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
      <IconButton component="span" size="small" onClick={open}>
        <MenuIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={handleAddToCompendium}>
          <ListItemIcon><LibraryAdd fontSize="small" /></ListItemIcon>
          <ListItemText>{t("Add to Compendium")}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { close(); onDelete(); }} sx={{ color: "error.main" }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{t("Delete")}</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={packMenuAnchor}
        open={Boolean(packMenuAnchor)}
        onClose={() => setPackMenuAnchor(null)}
      >
        {personalPack && !personalPack.locked && (
          <MenuItem onClick={async () => { setPackMenuAnchor(null); await doAdd(personalPack.id); }}>
            <ListItemText>{t("Personal")}</ListItemText>
          </MenuItem>
        )}
        {unlockedNonPersonal.map((pack) => (
          <MenuItem
            key={pack.id}
            onClick={async () => { setPackMenuAnchor(null); await doAdd(pack.id); }}
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
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function EditSpells({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingSpellIndex, setPendingSpellIndex] = useState(null);

  const allExpanded =
    (npc.spells?.length ?? 0) > 0 &&
    expandedSet.size === (npc.spells?.length ?? 0);

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSet(new Set());
    } else {
      setExpandedSet(new Set((npc.spells ?? []).map((_, i) => i)));
    }
  };

  const toggleExpanded = (i) => {
    setExpandedSet((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i);
      else s.add(i);
      return s;
    });
  };

  const addSpell = () => {
    setNpc((prev) => {
      const nextIndex = (prev.spells?.length ?? 0);
      setExpandedSet((s) => new Set([...s, nextIndex]));
      return {
        ...prev,
        spells: [
          ...(prev.spells || []),
          {
            itemType: "spell",
            spellType: "npc",
            name: "",
            fuid: "",
            range: "ranged",
            accuracy: { attr1: "insight", attr2: "will", value: 0, defense: "mdef" },
            isOffensive: false,
            cost: { resource: "mp", amount: 0, perTarget: true },
            maxTargets: 1,
            targetDescription: "",
            duration: "",
            damage: { value: 0, type: "physical", hrZero: false },
            special: [],
          },
        ],
      };
    });
  };

  const removeSpell = (i) => {
    setExpandedSet((prev) => {
      const s = new Set();
      for (const idx of prev) {
        if (idx < i) s.add(idx);
        else if (idx > i) s.add(idx - 1);
      }
      return s;
    });
    setNpc((prev) => ({
      ...prev,
      spells: (prev.spells || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingSpellIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="top"
        openCompendium={() => setModalOpen(true)}
        addItem={addSpell}
        headerText={t("Spells")}
        icon={Add}
        onExpandCollapse={toggleAll}
        allExpanded={allExpanded}
      />
      <Grid container spacing={1}>
      {npc.spells?.map((spell, i) => {
        const attr1 = ATTR_SHORT[spell.accuracy?.attr1] ?? "INS";
        const attr2 = ATTR_SHORT[spell.accuracy?.attr2] ?? "WLP";
        const accBonus = spell.accuracy?.value ?? 0;
        const dmgValue = spell.damage?.value ?? 0;
        const dmgType = spell.damage?.type ?? "physical";
        const hrZero = spell.damage?.hrZero === true;
        const mpStr = `${spell.cost?.amount ?? 0}${spell.cost?.perTarget ? " × T" : ""} MP`;

        const handleRoll = (e) => {
          e.stopPropagation();
          if (!spell.isOffensive) {
            const tags = [mpStr, spell.targetDescription, spell.duration].filter(Boolean);
            addMessage({
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              speaker: npc.name || "NPC",
              kind: "display",
              itemType: "spell",
              name: spell.name,
              tags,
              description: spell.special?.[0] ?? spell.effect ?? "",
            });
            return;
          }
          const attrMap = { dexterity: "dex", insight: "ins", might: "mig", will: "wlp" };
          const dieSizes = {
            primary: npc.attributes?.[spell.accuracy?.attr1]?.base ?? 6,
            secondary: npc.attributes?.[spell.accuracy?.attr2]?.base ?? 6,
          };
          const intent = prepareMagicCheck({
            attr1: attrMap[spell.accuracy?.attr1] ?? "ins",
            attr2: attrMap[spell.accuracy?.attr2] ?? "wlp",
            accuracyBonus: accBonus,
            name: spell.name,
            description: spell.special?.[0] ?? spell.effect ?? undefined,
            baseDamage: dmgValue,
            damageType: dmgType,
            accuracyDefense: "mdef",
            damageHrZero: hrZero,
            spellType: spell.spellType ?? "npc",
          });
          const rolls = rollMagicCheck(dieSizes);
          const result = processMagicCheck(intent, rolls, dieSizes, npc.name || "NPC");
          addMessage(buildMagicCheckMessage(result));
        };

        return (
        <Grid key={i} size={{ xs: 12, md: 6 }}>
        <Accordion
          expanded={expandedSet.has(i)}
          onChange={() => toggleExpanded(i)}
          disableGutters
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
            mb: 0.5,
            containerType: "inline-size",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              "& .MuiAccordionSummary-content": {
                alignItems: "center",
                overflow: "hidden",
                minWidth: 0,
              },
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title={t("Roll")}>
                <IconButton component="span" size="small" onClick={handleRoll}>
                  <Casino fontSize="small" />
                </IconButton>
              </Tooltip>
              <SpellContextMenu spell={spell} onDelete={() => openDeleteDialog(i)} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary", mx: 0.5 }}>
              <SpellIcon />
            </Box>
            <Box sx={{ flexGrow: 1, mx: 1, overflow: "hidden", display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography noWrap>{spell.name || t("(unnamed)")}</Typography>
              {spell.isOffensive && <OffensiveSpellIcon />}
            </Box>
            <Typography
              variant="body2"
              sx={SUMMARY_META_SX}
            >
              {spell.isOffensive && (
                <>
                  <OpenBracket />{attr1}+{attr2}<CloseBracket />
                  {accBonus !== 0 && `${accBonus > 0 ? "+" : ""}${accBonus}`}
                  {" ⬥ "}
                  <OpenBracket />{hrZero ? "HR0" : "HR+"}{dmgValue}<CloseBracket />
                  <TypeName type={dmgType} />
                  {" ⬥ "}
                </>
              )}
              {mpStr}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <SchemaFieldRenderer
                config={npcSpellFieldConfig}
                state={spell}
                onChange={(next) => {
                  setNpc((prev) => {
                    const spells = [...(prev.spells || [])];
                    spells[i] = next;
                    return { ...prev, spells };
                  });
                }}
                surface="edit"
                group="core"
                cols={2}
                extraProps={{ name: String(spell.name ?? "") }}
              />
              <SchemaFieldRenderer
                config={npcSpellFieldConfig}
                state={spell}
                onChange={(next) => {
                  setNpc((prev) => {
                    const spells = [...(prev.spells || [])];
                    spells[i] = next;
                    return { ...prev, spells };
                  });
                }}
                surface="edit"
                group="accuracy"
                label={t("Accuracy")}
                cols={2}
                hidden={!spell.isOffensive}
              />
              <SchemaFieldRenderer
                config={npcSpellFieldConfig}
                state={spell}
                onChange={(next) => {
                  setNpc((prev) => {
                    const spells = [...(prev.spells || [])];
                    spells[i] = next;
                    return { ...prev, spells };
                  });
                }}
                surface="edit"
                group="damage"
                label={t("Damage")}
                cols={2}
                hidden={!spell.isOffensive}
              />
              <SchemaFieldRenderer
                config={npcSpellFieldConfig}
                state={spell}
                onChange={(next) => {
                  setNpc((prev) => {
                    const spells = [...(prev.spells || [])];
                    spells[i] = next;
                    return { ...prev, spells };
                  });
                }}
                surface="edit"
                group="details"
                label={t("Details")}
                cols={2}
              />
              <SchemaFieldRenderer
                config={npcSpellFieldConfig}
                state={spell}
                onChange={(next) => {
                  setNpc((prev) => {
                    const spells = [...(prev.spells || [])];
                    spells[i] = next;
                    return { ...prev, spells };
                  });
                }}
                surface="edit"
                group="special"
                label={t("Effect")}
                cols={1}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
        </Grid>
        );
      })}
      </Grid>
      <CompendiumViewerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        context="npc"
        initialType="spells"
        onAddItem={(item, sourceType) => {
          setNpc((prev) => {
            const isPlayerSpell = sourceType === "player-spells";
            return {
              ...prev,
              spells: [
                ...(prev.spells || []),
                {
                  itemType: "spell",
                  fuid: item.fuid ?? "",
                  _packItemId: item._packItemId,
                  name: item.name,
                  accuracy: item.accuracy ?? {
                    attr1: item.attr1 || "insight",
                    attr2: item.attr2 || "will",
                    value: 0,
                    defense: "mdef",
                  },
                  isOffensive: !!item.isOffensive,
                  damage: item.damage ?? { value: 0, type: "physical", hrZero: false },
                  cost: item.cost ?? { resource: "mp", amount: 0, perTarget: true },
                  maxTargets: item.maxTargets || 0,
                  targetDescription: isPlayerSpell
                    ? staticT(item.targetDescription || "")
                    : item.targetDescription || "",
                  duration: isPlayerSpell
                    ? staticT(item.duration || "")
                    : item.duration || "",
                  effect: isPlayerSpell
                    ? staticT(item.description || "")
                    : item.effect || "",
                  special: item.special || [],
                },
              ],
            };
          });
        }}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingSpellIndex(null);
        }}
        onConfirm={() => {
          if (pendingSpellIndex === null) return;
          removeSpell(pendingSpellIndex);
          setIsDeleteDialogOpen(false);
          setPendingSpellIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingSpellIndex !== null ? npc.spells?.[pendingSpellIndex]?.name || "" : ""
        }
      />
    </>
  );
}
