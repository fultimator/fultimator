import { useState } from "react";
import {
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
import { useTranslate, t as staticT } from "/src/translation/translate";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/actors/common/ItemRowCard";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  npcSpellFieldConfig,
  npcSpellGroupLabels,
  npcSpellTabs,
} from "/src/forms/rendering/config/itemConfigs/npcSpell";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Casino,
  Delete,
  LibraryAdd,
  Search,
  UnfoldLess,
  UnfoldMore,
  Menu as MenuIcon,
} from "@mui/icons-material";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "/src/hooks/useCompendiumPacks";
import { useChatMessagesStore } from "/src/store/chatMessagesStore";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/magic-checks";
import { TypeName } from "/src/components/types";
import { SpellIcon, OffensiveSpellIcon } from "/src/components/icons";
import { OpenBracket, CloseBracket } from "/src/components/Bracket";

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
  " (max-width: 460px)": {
    whiteSpace: "normal",
    fontSize: "0.72rem",
    lineHeight: 1.2,
    mr: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  " (max-width:600px)": {
    whiteSpace: "normal",
    fontSize: "0.72rem",
    lineHeight: 1.2,
    mr: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

function SpellContextMenu({
  spell,
  onDelete,
  onMoveUp,
  onMoveDown,
  showMoveUp,
  showMoveDown,
}) {
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
      <IconButton component="span" onClick={open}>
        <MenuIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={handleAddToCompendium}>
          <ListItemIcon>
            <LibraryAdd />
          </ListItemIcon>
          <ListItemText>{t("Add to Compendium")}</ListItemText>
        </MenuItem>
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
      const nextIndex = prev.spells?.length ?? 0;
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
            accuracy: {
              attr1: "insight",
              attr2: "will",
              value: 0,
              defense: "mdef",
            },
            isOffensive: false,
            cost: { resource: "mp", amount: 0, perTarget: true },
            maxTargets: 1,
            targetDescription: "",
            duration: "",
            damage: { value: 0, type: "physical", hrZero: false },
            effect: "",
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

  const moveSpell = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const spells = [...(prev.spells || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= spells.length ||
        toIndex >= spells.length
      ) {
        return prev;
      }
      [spells[fromIndex], spells[toIndex]] = [
        spells[toIndex],
        spells[fromIndex],
      ];
      return { ...prev, spells };
    });
    setExpandedSet((prev) => {
      const next = new Set(prev);
      const hadFrom = next.has(fromIndex);
      const hadTo = next.has(toIndex);
      if (hadFrom) next.add(toIndex);
      else next.delete(toIndex);
      if (hadTo) next.add(fromIndex);
      else next.delete(fromIndex);
      return next;
    });
  };

  const openDeleteDialog = (index) => {
    setPendingSpellIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <SectionCard
      title={t("Spells")}
      actions={
        <>
          <Tooltip title={t("Search Compendium")}>
            <IconButton
              size="small"
              onClick={() => setModalOpen(true)}
              sx={{ color: "#fff" }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={allExpanded ? t("Collapse All") : t("Expand All")}>
            <IconButton size="small" onClick={toggleAll} sx={{ color: "#fff" }}>
              {allExpanded ? (
                <UnfoldLess fontSize="small" />
              ) : (
                <UnfoldMore fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={t("Add Spell")}>
            <IconButton size="small" onClick={addSpell} sx={{ color: "#fff" }}>
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <Box sx={{ p: 1 }}>
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
                const tags = [
                  mpStr,
                  spell.targetDescription,
                  spell.duration,
                ].filter(Boolean);
                addMessage({
                  id: crypto.randomUUID(),
                  createdAt: Date.now(),
                  speaker: npc.name || "NPC",
                  kind: "display",
                  itemType: "spell",
                  name: spell.name,
                  tags,
                  description: spell.effect ?? spell.special?.[0] ?? "",
                });
                return;
              }
              const attrMap = {
                dexterity: "dex",
                insight: "ins",
                might: "mig",
                will: "wlp",
              };
              const dieSizes = {
                primary: npc.attributes?.[spell.accuracy?.attr1]?.base ?? 6,
                secondary: npc.attributes?.[spell.accuracy?.attr2]?.base ?? 6,
              };
              const intent = prepareMagicCheck({
                attr1: attrMap[spell.accuracy?.attr1] ?? "ins",
                attr2: attrMap[spell.accuracy?.attr2] ?? "wlp",
                accuracyBonus: accBonus,
                name: spell.name,
                description: spell.effect ?? spell.special?.[0] ?? undefined,
                baseDamage: dmgValue,
                damageType: dmgType,
                accuracyDefense: "mdef",
                damageHrZero: hrZero,
                spellType: spell.spellType ?? "npc",
              });
              const rolls = rollMagicCheck(dieSizes);
              const result = processMagicCheck(
                intent,
                rolls,
                dieSizes,
                npc.name || "NPC",
              );
              addMessage(buildMagicCheckMessage(result));
            };

            return (
              <Grid
                key={i}
                size={{ xs: 12, md: 6 }}
                sx={{ containerType: "inline-size" }}
              >
                <ItemRowCard
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "text.secondary",
                          flexShrink: 0,
                        }}
                      >
                        <SpellIcon />
                      </Box>
                      <Typography
                        noWrap
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: 800,
                          fontSize: "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {spell.name || t("(unnamed)")}
                      </Typography>
                      {spell.isOffensive && <OffensiveSpellIcon />}
                    </Box>
                  }
                  subtitle={
                    <Typography variant="body2" sx={SUMMARY_META_SX}>
                      {spell.isOffensive && (
                        <>
                          <OpenBracket />
                          {attr1}+{attr2}
                          <CloseBracket />
                          {accBonus !== 0 &&
                            `${accBonus > 0 ? "+" : ""}${accBonus}`}
                          {" ⬥ "}
                          <OpenBracket />
                          {hrZero ? "HR0" : "HR+"}
                          {dmgValue}
                          <CloseBracket />
                          <TypeName type={dmgType} />
                          {" ⬥ "}
                        </>
                      )}
                      {mpStr}
                    </Typography>
                  }
                  actions={
                    <>
                      <Tooltip title={t("Roll")}>
                        <IconButton component="span" onClick={handleRoll}>
                          <Casino />
                        </IconButton>
                      </Tooltip>
                      <SpellContextMenu
                        spell={spell}
                        onDelete={() => openDeleteDialog(i)}
                        onMoveUp={() => moveSpell(i, i - 1)}
                        onMoveDown={() => moveSpell(i, i + 1)}
                        showMoveUp={i > 0}
                        showMoveDown={i < (npc.spells?.length ?? 0) - 1}
                      />
                    </>
                  }
                  onClick={() => toggleExpanded(i)}
                  paperSx={{ mb: 0.5 }}
                >
                  {expandedSet.has(i) && (
                    <Box sx={{ p: 1 }}>
                      <TabbedSchemaFormRenderer
                        tabs={npcSpellTabs}
                        config={npcSpellFieldConfig}
                        groupLabels={npcSpellGroupLabels}
                        state={spell}
                        onChange={(next) => {
                          setNpc((prev) => {
                            const spells = [...(prev.spells || [])];
                            spells[i] = next;
                            return { ...prev, spells };
                          });
                        }}
                        surface="edit"
                        cols={2}
                        extraProps={{ name: String(spell.name ?? "") }}
                      />
                    </Box>
                  )}
                </ItemRowCard>
              </Grid>
            );
          })}
        </Grid>
      </Box>
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
                  damage: item.damage ?? {
                    value: 0,
                    type: "physical",
                    hrZero: false,
                  },
                  cost: item.cost ?? {
                    resource: "mp",
                    amount: 0,
                    perTarget: true,
                  },
                  maxTargets: item.maxTargets || 0,
                  targetDescription: isPlayerSpell
                    ? staticT(item.targetDescription || "")
                    : item.targetDescription || "",
                  duration: isPlayerSpell
                    ? staticT(item.duration || "")
                    : item.duration || "",
                  effect: isPlayerSpell
                    ? staticT(item.description || "")
                    : item.effect || item.special?.[0] || "",
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
          pendingSpellIndex !== null
            ? npc.spells?.[pendingSpellIndex]?.name || ""
            : ""
        }
      />
    </SectionCard>
  );
}
