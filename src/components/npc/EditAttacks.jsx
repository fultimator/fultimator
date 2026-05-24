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
import { useState } from "react";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../common/CustomHeader";
import { TabbedSchemaFormRenderer } from "../../forms/rendering/TabbedSchemaFormRenderer";
import {
  npcAttackFieldConfig,
  npcAttackGroupLabels,
  npcAttackTabs,
} from "../../forms/rendering/config/itemConfigs/npcAttack";
import {
  Add,
  ArrowDownward,
  ArrowUpward,
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
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../app-drawer/panels/chat/domain/accuracy-checks";
import { TypeName } from "../types";
import { MeleeIcon, DistanceIcon } from "../icons";
import { OpenBracket, CloseBracket } from "../Bracket";

const ATTR_SHORT = {
  dexterity: "DEX",
  insight: "INS",
  might: "MIG",
  will: "WLP",
};

const ATTR_ROLL = {
  dexterity: "dex",
  insight: "ins",
  might: "mig",
  will: "wlp",
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

function AttackContextMenu({
  attack,
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
      await addItem(packId, "npc-attack", attack);
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
    if (unlockedNonPersonal.length > 0) setPackMenuAnchor(e.currentTarget);
    else if (personalPack && !personalPack.locked) await doAdd(personalPack.id);
    else {
      const p = await ensurePersonalPack();
      await doAdd(p.id);
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

export default function EditAttacks({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAttackIndex, setPendingAttackIndex] = useState(null);

  const allExpanded =
    (npc.attacks?.length ?? 0) > 0 &&
    expandedSet.size === (npc.attacks?.length ?? 0);

  const toggleAll = () => {
    if (allExpanded) setExpandedSet(new Set());
    else setExpandedSet(new Set((npc.attacks ?? []).map((_, i) => i)));
  };

  const toggleExpanded = (i) => {
    setExpandedSet((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i);
      else s.add(i);
      return s;
    });
  };

  const addAttack = () => {
    setNpc((prev) => {
      const nextIndex = prev.attacks?.length ?? 0;
      setExpandedSet((s) => new Set([...s, nextIndex]));
      return {
        ...prev,
        attacks: [
          ...(prev.attacks || []),
          {
            itemType: "basic",
            name: "",
            fuid: "",
            range: "melee",
            accuracy: {
              attr1: "dexterity",
              attr2: "dexterity",
              value: 0,
              defense: "def",
            },
            damage: { value: 0, type: "physical", hrZero: false },
            effect: "",
          },
        ],
      };
    });
  };

  const removeAttack = (i) => {
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
      attacks: (prev.attacks || []).filter((_, index) => index !== i),
    }));
  };

  const moveAttack = (fromIndex, toIndex) => {
    setNpc((prev) => {
      const attacks = [...(prev.attacks || [])];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= attacks.length ||
        toIndex >= attacks.length
      ) {
        return prev;
      }
      [attacks[fromIndex], attacks[toIndex]] = [
        attacks[toIndex],
        attacks[fromIndex],
      ];
      return { ...prev, attacks };
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
    setPendingAttackIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="top"
        openCompendium={() => setModalOpen(true)}
        addItem={addAttack}
        headerText={t("Basic Attacks")}
        icon={Add}
        onExpandCollapse={toggleAll}
        allExpanded={allExpanded}
      />
      <Grid container spacing={1}>
        {npc.attacks?.map((attack, i) => {
          const attr1 = ATTR_SHORT[attack.accuracy?.attr1] ?? "DEX";
          const attr2 = ATTR_SHORT[attack.accuracy?.attr2] ?? "DEX";
          const accBonus = attack.accuracy?.value ?? 0;
          const dmgValue = attack.damage?.value ?? 0;
          const dmgType = attack.damage?.type ?? "physical";
          const hrZero = attack.damage?.hrZero === true;

          const handleRoll = (e) => {
            e.stopPropagation();
            const dieSizes = {
              primary: npc.attributes?.[attack.accuracy?.attr1]?.base ?? 6,
              secondary: npc.attributes?.[attack.accuracy?.attr2]?.base ?? 6,
            };
            const intent = prepareAccuracyCheck({
              attr1: ATTR_ROLL[attack.accuracy?.attr1] ?? "dex",
              attr2: ATTR_ROLL[attack.accuracy?.attr2] ?? "dex",
              accuracyBonus: accBonus,
              name: attack.name,
              description: attack.effect ?? attack.special?.[0] ?? undefined,
              baseDamage: dmgValue,
              damageType: dmgType,
              accuracyDefense: attack.accuracy?.defense ?? "def",
              range: attack.range,
              hrZero,
            });
            const rolls = rollAccuracyCheck(dieSizes);
            const result = processAccuracyCheck(
              intent,
              rolls,
              dieSizes,
              npc.name || "NPC",
            );
            addMessage(buildAccuracyCheckMessage(result));
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
                      <IconButton component="span" onClick={handleRoll}>
                        <Casino />
                      </IconButton>
                    </Tooltip>
                    <AttackContextMenu
                      attack={attack}
                      onDelete={() => openDeleteDialog(i)}
                      onMoveUp={() => moveAttack(i, i - 1)}
                      onMoveDown={() => moveAttack(i, i + 1)}
                      showMoveUp={i > 0}
                      showMoveDown={i < (npc.attacks?.length ?? 0) - 1}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      mx: 0.5,
                    }}
                  >
                    {attack.range === "ranged" ? (
                      <DistanceIcon />
                    ) : (
                      <MeleeIcon />
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1, mx: 1, overflow: "hidden" }}>
                    <Typography noWrap>
                      {attack.name || t("(unnamed)")}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={SUMMARY_META_SX}>
                    <OpenBracket />
                    {attr1}+{attr2}
                    <CloseBracket />
                    {accBonus !== 0 && `${accBonus > 0 ? "+" : ""}${accBonus}`}
                    {" ⬥ "}
                    <OpenBracket />
                    {hrZero ? "HR0" : "HR+"}
                    {dmgValue}
                    <CloseBracket />
                    <TypeName type={dmgType} />
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TabbedSchemaFormRenderer
                    tabs={npcAttackTabs}
                    config={npcAttackFieldConfig}
                    groupLabels={npcAttackGroupLabels}
                    state={attack}
                    onChange={(next) => {
                      setNpc((prev) => {
                        const attacks = [...(prev.attacks || [])];
                        attacks[i] = next;
                        return { ...prev, attacks };
                      });
                    }}
                    surface="edit"
                    cols={2}
                    extraProps={{ name: String(attack.name ?? "") }}
                  />
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
        initialType="attacks"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            attacks: [
              ...(prev.attacks || []),
              {
                itemType: "basic",
                fuid: item.fuid ?? "",
                name: item.name,
                range: item.ranged === true ? "ranged" : "melee",
                accuracy: {
                  attr1: item.accuracy?.attr1 ?? "dexterity",
                  attr2: item.accuracy?.attr2 ?? "dexterity",
                  value: item.accuracy?.value ?? 0,
                  defense: item.accuracy?.defense ?? "def",
                },
                damage: {
                  value: item.damage?.value ?? 0,
                  type: item.damage?.type ?? "physical",
                  hrZero: item.damage?.hrZero === true,
                },
                effect: item.effect || item.special?.[0] || "",
              },
            ],
          }));
        }}
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingAttackIndex(null);
        }}
        onConfirm={() => {
          if (pendingAttackIndex === null) return;
          removeAttack(pendingAttackIndex);
          setIsDeleteDialogOpen(false);
          setPendingAttackIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingAttackIndex !== null
            ? npc.attacks?.[pendingAttackIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
