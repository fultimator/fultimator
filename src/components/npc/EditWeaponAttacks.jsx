import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Martial, MeleeIcon, DistanceIcon } from "../icons";
import { useState } from "react";
import attributes from "../../libs/attributes";
import weapons from "../../libs/weapons";
import { CloseBracket, OpenBracket } from "../Bracket";
import { useTranslate } from "../../translation/translate";
import CustomHeader from "../common/CustomHeader";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import {
  npcAttackFieldConfig,
  npcAttackGroupLabels,
} from "../../forms/rendering/config/itemConfigs/npcAttack";
import {
  Add,
  Casino,
  Delete,
  ExpandMore,
  LibraryAdd,
  Menu as MenuIcon,
} from "@mui/icons-material";
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

function weaponToAttackFields(weapon) {
  return {
    range: weapon.range ?? "melee",
    accuracy: {
      attr1: weapon.accuracy?.attr1 ?? "dexterity",
      attr2: weapon.accuracy?.attr2 ?? "might",
      value: weapon.accuracy?.value ?? 0,
      defense: "def",
    },
    damage: {
      value: weapon.damage?.value ?? 0,
      type: weapon.damage?.type ?? "physical",
      hrZero: weapon.damage?.hrZero === true,
    },
  };
}

function SelectWeapon({ attack, onChange }) {
  const { t } = useTranslate();
  const selectedWeapon =
    weapons.find(
      (w) =>
        w.accuracy?.attr1 === attack.accuracy?.attr1 &&
        w.accuracy?.attr2 === attack.accuracy?.attr2 &&
        w.damage?.value === attack.damage?.value,
    ) ?? weapons[0];

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{t("Weapon:")}</InputLabel>
      <Select
        value={selectedWeapon.name}
        label={t("Weapon:")}
        onChange={(e) => {
          const w = weapons.find((w) => w.name === e.target.value);
          if (w) onChange(weaponToAttackFields(w));
        }}
      >
        {weapons.map((w) => (
          <MenuItem key={w.name} value={w.name}>
            {w.name} {w.martial && <Martial />} <OpenBracket />
            {attributes[w.accuracy?.attr1]?.shortcaps}+
            {attributes[w.accuracy?.attr2]?.shortcaps}
            {w.accuracy?.value > 0 && `+${w.accuracy.value}`}
            <CloseBracket /> <OpenBracket />
            {t("HR +")} {w.damage?.value}
            <CloseBracket />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function WeaponAttackContextMenu({ attack, onDelete }) {
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

export default function EditWeaponAttacks({ npc, setNpc }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [expandedSet, setExpandedSet] = useState(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAttackIndex, setPendingAttackIndex] = useState(null);

  const allExpanded =
    (npc.weaponattacks?.length ?? 0) > 0 &&
    expandedSet.size === (npc.weaponattacks?.length ?? 0);

  const toggleAll = () => {
    if (allExpanded) setExpandedSet(new Set());
    else setExpandedSet(new Set((npc.weaponattacks ?? []).map((_, i) => i)));
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
      const nextIndex = prev.weaponattacks?.length ?? 0;
      setExpandedSet((s) => new Set([...s, nextIndex]));
      return {
        ...prev,
        weaponattacks: [
          ...(prev.weaponattacks || []),
          {
            ...weaponToAttackFields(weapons[0]),
            name: "",
            fuid: "",
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
      weaponattacks: (prev.weaponattacks || []).filter(
        (_, index) => index !== i,
      ),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingAttackIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="middle"
        addItem={addAttack}
        headerText={t("Attacks with Weapons")}
        icon={Add}
        onExpandCollapse={toggleAll}
        allExpanded={allExpanded}
      />
      <Grid container spacing={1}>
        {npc.weaponattacks?.map((attack, i) => {
          const attr1 = ATTR_SHORT[attack.accuracy?.attr1] ?? "DEX";
          const attr2 = ATTR_SHORT[attack.accuracy?.attr2] ?? "DEX";
          const accBonus = attack.accuracy?.value ?? 0;
          const dmgValue = attack.damage?.value ?? 0;
          const dmgType = attack.damage?.type ?? "physical";
          const hrZero = attack.damage?.hrZero === true;

          const handleRoll = (e) => {
            e.stopPropagation();
            const dieSizes = {
              primary:
                npc.attributes?.[attack.accuracy?.attr1]?.base ??
                npc.attributes?.[attack.accuracy?.attr1] ??
                6,
              secondary:
                npc.attributes?.[attack.accuracy?.attr2]?.base ??
                npc.attributes?.[attack.accuracy?.attr2] ??
                6,
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

          const updateAttack = (next) => {
            setNpc((prev) => {
              const weaponattacks = [...(prev.weaponattacks || [])];
              weaponattacks[i] = next;
              return { ...prev, weaponattacks };
            });
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
                    <WeaponAttackContextMenu
                      attack={attack}
                      onDelete={() => openDeleteDialog(i)}
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
                  <Grid container spacing={1}>
                    {/* Weapon preset picker, not in schema config */}
                    <Grid size={12}>
                      <SelectWeapon
                        attack={attack}
                        onChange={(fields) =>
                          updateAttack({ ...attack, ...fields })
                        }
                      />
                    </Grid>
                    <SchemaFieldRenderer
                      config={npcAttackFieldConfig}
                      groupLabels={npcAttackGroupLabels}
                      state={attack}
                      onChange={updateAttack}
                      surface="edit"
                      group="core"
                      cols={2}
                      extraProps={{ name: String(attack.name ?? "") }}
                    />
                    <SchemaFieldRenderer
                      config={npcAttackFieldConfig}
                      groupLabels={npcAttackGroupLabels}
                      state={attack}
                      onChange={updateAttack}
                      surface="edit"
                      group="accuracy"
                      cols={2}
                    />
                    <SchemaFieldRenderer
                      config={npcAttackFieldConfig}
                      groupLabels={npcAttackGroupLabels}
                      state={attack}
                      onChange={updateAttack}
                      surface="edit"
                      group="damage"
                      cols={2}
                    />
                    <SchemaFieldRenderer
                      config={npcAttackFieldConfig}
                      groupLabels={npcAttackGroupLabels}
                      state={attack}
                      onChange={updateAttack}
                      surface="edit"
                      group="effect"
                      cols={1}
                    />
                    <SchemaFieldRenderer
                      config={npcAttackFieldConfig}
                      groupLabels={npcAttackGroupLabels}
                      state={attack}
                      onChange={updateAttack}
                      surface="edit"
                      group="meta"
                      cols={2}
                      hidden
                    />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        })}
      </Grid>
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
            ? npc.weaponattacks?.[pendingAttackIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}
