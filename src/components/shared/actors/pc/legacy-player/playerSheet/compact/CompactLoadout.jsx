import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  ButtonBase,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  Divider,
  TableContainer,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LockIcon from "@mui/icons-material/Lock";
import CasinoIcon from "@mui/icons-material/Casino";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { SwapHoriz, Message } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import {
  resolveEffectiveSlot,
  getActiveVehicle,
} from "/src/libs/player/slots/equipmentSlots";
import {
  getSlotLocks,
  getEquippedModulesForSlot,
  getEquippedModuleForSlot,
  getVehicleModuleUsage,
  getAvailableSupportModules,
  getSupportSlots,
  getAuxHandItem,
  getPilotSpellInfo,
} from "/src/libs/player/slots/loadoutSelectors";
import { useLoadoutStore } from "/src/store/playerLoadoutStore";
import { calculateAttribute } from "/src/libs/playerCalculations";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import {
  sendRollMessage,
  sendDisplayMessage,
} from "/src/hooks/useRollToChat";
import SlotPickerDialog from "/src/components/shared/actors/pc/editors/equipment/slots/SlotPickerDialog";
import VehicleEnterDialog from "/src/components/shared/actors/pc/editors/equipment/slots/VehicleEnterDialog";
import SpellPilotVehiclesModal from "/src/components/shared/actors/pc/spells/SpellPilotVehiclesModal";
import PlayerEquipment from "/src/components/shared/actors/pc/legacy-player/playerSheet/compact/PlayerEquipment";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import PlayerWeaponModal from "/src/components/shared/actors/pc/editors/equipment/weapons/PlayerWeaponModal";
import PlayerCustomWeaponModal from "/src/components/shared/actors/pc/editors/equipment/customWeapons/PlayerCustomWeaponModal";
import PlayerShieldModal from "/src/components/shared/actors/pc/editors/equipment/shields/PlayerShieldModal";
import PlayerArmorModal from "/src/components/shared/actors/pc/editors/equipment/armor/PlayerArmorModal";
import PlayerAccessoryModal from "/src/components/shared/actors/pc/editors/equipment/accessories/PlayerAccessoryModal";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

// const SLOTS = ['mainHand', 'offHand', 'armor', 'accessory'];
const LOADOUT_LABEL_COL_WIDTH = { xs: "58px", sm: "68px" };
const LOADOUT_STATUS_ICON_BOX = "12px";
const LOADOUT_ACTION_COL_WIDTH = "48px";
const LOADOUT_ROW_MIN_HEIGHT = "40px";
const LOADOUT_ROW_PX = 0.75;
const LOADOUT_ROW_PY = 0.35;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;

  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={`${part}-${index}`}
        style={{ backgroundColor: "yellow", padding: 0 }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function slotLabel(t, slot) {
  return {
    mainHand: t("Main Hand"),
    offHand: t("Off Hand"),
    armor: t("Armor"),
    accessory: t("Accessory"),
    aux: t("Aux Hand"),
  }[slot];
}

function isWeaponResolved(resolved) {
  if (!resolved) return false;
  if (resolved.kind === "vehicleModule") {
    return (
      resolved.module.type === "pilot_module_weapon" &&
      !resolved.module.isShield
    );
  }
  const item = resolved.item;
  return !!(item?.accuracy?.attr1 && item?.accuracy?.attr2);
}

function hasTransforming(resolved) {
  if (!resolved || resolved.kind !== "playerItem") return false;
  return (
    resolved.item?.customizations?.some(
      (c) => c.name === "weapon_customization_transforming",
    ) ?? false
  );
}

function getVehicleModuleDisplayName(module, t) {
  const custom = String(module?.customName ?? "").trim();
  if (custom) return custom;
  const translatedName = String(t(module?.name ?? module?.key ?? "") || "").trim();
  if (translatedName.length > 1) return translatedName;
  const translatedType = String(t(module?.type || "") || "").trim();
  if (translatedType.length > 1) return translatedType;
  return t("Vehicle Module");
}

function getSupportModuleDisplayName(module, t) {
  const base = getVehicleModuleDisplayName(module, t);
  const genericSupportLabels = new Set([
    t("Vehicle Module"),
    t("Support Module"),
    t("pilot_module_support"),
  ]);
  if (base && !genericSupportLabels.has(base)) return base;
  const desc = String(
    (module?.name ?? module?.key) === "pilot_custom_support"
      ? module?.description || ""
      : t(module?.description || ""),
  ).trim();
  if (desc.length > 1) return desc.slice(0, 36);
  return t("Support Module");
}

// function moduleStatLine(module) {
//   if (!module) return '-';
//   if (module.type === 'pilot_module_weapon') {
//     if (module.isShield) return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
//     const a1 = attributes[module.att1]?.shortcaps ?? module.att1;
//     const a2 = attributes[module.att2]?.shortcaps ?? module.att2;
//     const hands = module.cumbersome ? '2H' : '1H';
//     return `${a1}+${a2} / ${module.damage ?? '?'} ${module.damageType ?? ''} / ${hands}`.trim();
//   }
//   if (module.type === 'pilot_module_armor') {
//     return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
//   }
//   return module.description ? module.description.slice(0, 40) : '-';
// }

export default function CompactLoadout({
  player,
  setPlayer,
  isEditMode,
  withEquipment = false,
  isMainTab = true,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] =
    useState(false);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [equipOpen, setEquipOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleEnterOpen, setVehicleEnterOpen] = useState(false);
  const [createItemType, setCreateItemType] = useState(null);
  const [slotImportOpen, setSlotImportOpen] = useState(false);
  const [slotImportType, setSlotImportType] = useState("weapons");
  const canClickSlot = isEditMode || !!setPlayer;

  const store = useLoadoutStore();
  useEffect(() => {
    store.init(setPlayer);
  }, [setPlayer, store]);

  // Attributes
  const getAttrDie = (key) => {
    const normKey = key === "will" ? "willpower" : key;
    const base = player?.attributes?.[normKey]?.base ?? 8;
    const cfg = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    }[normKey] ?? [[], []];
    return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
  };

  // Vehicle / selectors
  const activeVehicle = getActiveVehicle(player);
  // const vs = player?.vehicleSlots;

  const vehicleModuleUsage = getVehicleModuleUsage(player);
  const pilotSpellInfo = getPilotSpellInfo(player);
  const pilotVehicles = pilotSpellInfo
    ? Array.isArray(pilotSpellInfo.spell.vehicles)
      ? pilotSpellInfo.spell.vehicles
      : Array.isArray(pilotSpellInfo.spell.currentVehicles)
        ? pilotSpellInfo.spell.currentVehicles
        : []
    : [];
  const equippedSupportModules = getAvailableSupportModules(player);
  const supportSlots = getSupportSlots(player);
  const auxHandItem = getAuxHandItem(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);

  // Slot click routing
  const handleSlotClick = (slot) => {
    const hasActiveModuleInSlot =
      ["mainHand", "offHand", "armor"].includes(slot) &&
      Boolean(activeVehicle) &&
      Boolean(getEquippedModuleForSlot(player, slot));
    setPickerOpenModuleOverride(hasActiveModuleInSlot);
    setPickerSlot(slot);
  };

  // Vehicle handlers
  const handleToggleVehicle = () => {
    if (activeVehicle) {
      store.toggleVehicle();
      return;
    }
    setVehicleEnterOpen(true);
  };
  const handleEnterVehicle = (vehicleIndex) => {
    store.enterVehicle(vehicleIndex);
  };
  const handleSaveVehicles = (_, updatedPilot) => {
    store.saveVehicles(updatedPilot);
    setVehicleModalOpen(false);
  };

  // Roll
  const handleRollSlot = (slot) => {
    const resolved =
      slot === "aux"
        ? auxHandItem
          ? { kind: "playerItem", item: auxHandItem }
          : null
        : resolveEffectiveSlot(player, slot);
    if (!resolved) return;

    let weaponOption;
    if (resolved.kind === "vehicleModule") {
      const m = resolved.module;
      if (m.type !== "pilot_module_weapon" || m.isShield) return;
      const acc = m.accuracy ?? {};
      const dmg = m.damage ?? {};
      if (!acc.attr1 || !acc.attr2) return;
      weaponOption = {
        arg: m.customName || m.name || m.key || slot,
        name: m.customName || m.name || m.key || slot,
        attr1: acc.attr1,
        attr2: acc.attr2,
        accuracyBonus: acc.value ?? 0,
        baseDamage: dmg.value ?? 0,
        damageType: dmg.type ?? "physical",
        accuracyDefense: acc.defense ?? "def",
        isWeaponModule: true,
        category: m.category,
        damageHrZero: dmg.hrZero === true,
        range:
          m.range === "ranged" || m.range === "weapon_range_ranged"
            ? "ranged"
            : "melee",
      };
    } else {
      const item = resolved.item;
      const isSecondary = item.activeForm === "secondary";
      const acc = isSecondary
        ? (item.secondAccuracy ?? item.accuracy)
        : item.accuracy;
      const dmg = isSecondary
        ? (item.secondDamage ?? item.damage)
        : item.damage;
      if (!acc?.attr1 || !acc?.attr2) return;
      weaponOption = {
        arg: item.name || slot,
        name: item.name || slot,
        attr1: acc.attr1,
        attr2: acc.attr2,
        accuracyBonus: acc.value ?? 0,
        baseDamage: dmg?.value ?? 0,
        damageType: dmg?.type ?? "physical",
        accuracyDefense: acc.defense ?? "def",
        hands: item.hands,
        category: item.category,
        range:
          item.range === "ranged" || item.range === "weapon_range_ranged"
            ? "ranged"
            : "melee",
      };
    }

    const speaker = player?.info?.name || player?.name || "";
    const intent = prepareAccuracyCheck(weaponOption);
    const dieSizes = {
      primary: getAttrDie(intent.primary),
      secondary: getAttrDie(intent.secondary),
    };
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(intent, rolls, dieSizes, speaker);
    sendRollMessage(buildAccuracyCheckMessage(result));
  };

  // Swap (Transforming weapon)
  const handleSwapSlot = (slot) => {
    store.swapForm(slot);
  };

  const mainHandResolved = resolveEffectiveSlot(player, "mainHand");
  const offHandResolved = resolveEffectiveSlot(player, "offHand");

  const allSlots = [
    {
      slot: "mainHand",
      resolved: mainHandResolved,
      locked: mainHandLocked,
      isAux: false,
    },
    {
      slot: "offHand",
      resolved: offHandResolved,
      locked: offHandLocked,
      isAux: false,
    },
    {
      slot: "armor",
      resolved: resolveEffectiveSlot(player, "armor"),
      locked: false,
      isAux: false,
    },
    {
      slot: "accessory",
      resolved: resolveEffectiveSlot(player, "accessory"),
      locked: false,
      isAux: false,
    },
    ...(auxHandItem
      ? [
          {
            slot: "aux",
            resolved: { kind: "playerItem", item: auxHandItem },
            locked: false,
            isAux: true,
          },
        ]
      : []),
  ];
  const visibleSlots = isMainTab
    ? allSlots.filter(({ resolved }) => Boolean(resolved))
    : allSlots;
  const visibleSupportSlots = isMainTab
    ? supportSlots.filter((entry) => Boolean(entry.module))
    : supportSlots;

  const appendEquipmentItem = (sourceKey, item) => {
    setPlayer((prev) => {
      const eq0 = prev?.equipment?.[0] ?? {};
      const next = [...(eq0?.[sourceKey] ?? []), item];
      const equipment = prev?.equipment
        ? [{ ...eq0, [sourceKey]: next }, ...prev.equipment.slice(1)]
        : [{ ...eq0, [sourceKey]: next }];
      return { ...prev, equipment };
    });
  };

  const handleCreateNewItem = (kind) => {
    setPickerSlot(null);
    setPickerOpenModuleOverride(false);
    setCreateItemType(kind);
  };

  const handleImportFromCompendium = (slot) => {
    const typeMap = {
      mainHand: "weapons",
      offHand: "shields",
      armor: "armor",
      accessory: "accessories",
    };
    setSlotImportType(typeMap[slot] ?? "weapons");
    setPickerSlot(null);
    setPickerOpenModuleOverride(false);
    setSlotImportOpen(true);
  };

  const handleSlotImportAdd = (item, type) => {
    if (type === "weapons") appendEquipmentItem("weapons", item);
    if (type === "custom-weapons") appendEquipmentItem("customWeapons", item);
    if (type === "shields") appendEquipmentItem("shields", item);
    if (type === "armor") appendEquipmentItem("armor", item);
    if (type === "accessories") appendEquipmentItem("accessories", item);
    setSlotImportOpen(false);
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 1, containerType: "inline-size" }}>
      <Box>
        {/* Header */}
        <Box
          sx={{
            background: theme.primary,
            pl: "46px",
            pr: 0.75,
            py: 0.35,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              textTransform: "uppercase",
              color: "#fff",
              flex: 1,
            }}
          >
            {t("Loadout")}
          </Typography>

          {pilotSpellInfo && canClickSlot && (
            <>
              <Tooltip
                title={activeVehicle ? t("Exit Vehicle") : t("Enter Vehicle")}
              >
                <IconButton
                  size="small"
                  onClick={handleToggleVehicle}
                  sx={{ color: activeVehicle ? "#ff7070" : "#aaffaa", p: 0.15, width: 22, height: 22 }}
                >
                  <DirectionsWalkIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
              {isEditMode && (
                <Tooltip title={t("Swap Vehicle")}>
                  <IconButton
                    size="small"
                    onClick={() => setVehicleModalOpen(true)}
                    sx={{ color: "#fff", p: 0.15, width: 22, height: 22 }}
                  >
                    <SyncAltIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}

          {withEquipment && (
            <IconButton
              size="small"
              onClick={() => setEquipOpen((v) => !v)}
              sx={{ color: "#fff", p: 0.15, width: 22, height: 22 }}
            >
              {equipOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
        {/* Main 4 slots + aux */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", "@container (max-width: 400px)": { gridTemplateColumns: "1fr" } }}>
          {visibleSlots.map(({ slot, resolved, locked, isAux }) => {
            const isEmpty = !resolved;
            const isVehicle = resolved?.kind === "vehicleModule";
            const hasModule =
              !isAux && !!getEquippedModuleForSlot(player, slot);
            const clickable = !isAux && !locked && canClickSlot;
            const showRoll =
              (slot === "mainHand" || slot === "offHand" || slot === "aux") &&
              !locked &&
              isWeaponResolved(resolved);
            const showSwap =
              (slot === "mainHand" || slot === "offHand") &&
              hasTransforming(resolved);
            const showChat =
              !isEmpty &&
              !locked &&
              ((!isVehicle && slot !== "mainHand") ||
                (isVehicle &&
                  resolved?.module?.type !== "pilot_module_weapon"));

            const name = locked
              ? slot === "offHand"
                ? t("2-Handed")
                : t("Locked")
              : isEmpty
                ? "- Empty -"
                : isVehicle
                  ? getVehicleModuleDisplayName(resolved.module, t)
                  : (() => {
                      const item = resolved.item;
                      if (
                        "secondAccuracy" in item &&
                        item.activeForm === "secondary"
                      )
                        return item.secondWeaponName || `${item.name} (Alt)`;
                      return item.name ?? t("- Empty -");
                    })();

            const inner = (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: LOADOUT_ROW_PX,
                  py: LOADOUT_ROW_PY,
                  minHeight: LOADOUT_ROW_MIN_HEIGHT,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  minWidth: 0,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: locked ? "text.disabled" : "text.secondary",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    mr: 0.5,
                    width: LOADOUT_LABEL_COL_WIDTH,
                  }}
                >
                  {slotLabel(t, slot)}
                </Typography>
                <Box
                  sx={{
                    width: LOADOUT_STATUS_ICON_BOX,
                    height: LOADOUT_STATUS_ICON_BOX,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mr: 0.35,
                  }}
                >
                  {locked ? (
                    <LockIcon
                      sx={{
                        fontSize: "0.65rem",
                        color: "text.disabled",
                      }}
                    />
                  ) : isVehicle ? (
                    <PrecisionManufacturingIcon
                      sx={{
                        fontSize: "0.65rem",
                        color: "success.main",
                      }}
                    />
                  ) : hasModule && !isEmpty ? (
                    <PrecisionManufacturingIcon
                      sx={{
                        fontSize: "0.65rem",
                        color: "success.light",
                        opacity: 0.6,
                      }}
                    />
                  ) : null}
                </Box>
                <Typography
                  component="span"
                  noWrap
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: isEmpty || locked ? 400 : 600,
                    color: locked
                      ? "text.disabled"
                      : isEmpty
                        ? "text.secondary"
                        : isVehicle
                          ? "success.main"
                          : isAux
                            ? "warning.main"
                            : "text.primary",
                    fontStyle: isEmpty || locked ? "italic" : "normal",
                    opacity: isEmpty ? 0.72 : 1,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {highlightMatch(name, searchQuery)}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexShrink: 0,
                    ml: 0.25,
                    width: LOADOUT_ACTION_COL_WIDTH,
                    minWidth: LOADOUT_ACTION_COL_WIDTH,
                    justifyContent: "flex-end",
                  }}
                >
                  {(showSwap || showRoll || showChat) && (
                    <>
                    {showSwap && (
                      <Tooltip title={t("weapon_customization_swap_form")}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwapSlot(slot);
                          }}
                          sx={{ p: 0.25 }}
                        >
                          <SwapHoriz sx={{ fontSize: "0.85rem" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {showRoll && (
                      <Tooltip title={t("Roll")}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRollSlot(slot);
                          }}
                          sx={{ p: 0.25 }}
                        >
                          <CasinoIcon sx={{ fontSize: "0.85rem" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {showChat && (
                      <Tooltip title={t("Send to Chat")}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const tags = [];
                            if (isVehicle) {
                              const module = resolved.module;
                              if (module.type === "pilot_module_armor") {
                                tags.push(`DEF +${module.def ?? 0}`);
                                tags.push(`M.DEF +${module.mdef ?? 0}`);
                              } else if (
                                module.type === "pilot_module_support"
                              ) {
                                tags.push(t("Support Module"));
                              }
                              sendDisplayMessage(
                                "item",
                                getVehicleModuleDisplayName(module, t),
                                {
                                  speaker:
                                    player?.info?.name || player?.name || "",
                                  tags,
                                  description:
                                    (module.name ?? module.key) === "pilot_custom_support"
                                      ? module.description || undefined
                                      : t(module.description || "") ||
                                        undefined,
                                },
                              );
                            } else {
                              const item = resolved.item;
                              if (slot === "armor") {
                                const def = item.def ?? 0;
                                const mdef = item.mdef ?? 0;
                                const init = item.init ?? 0;
                                tags.push(
                                  `DEF: ${item.martial ? def : def === 0 ? t("DEX die") : `${t("DEX die")} + ${def}`}`,
                                );
                                tags.push(
                                  `M.DEF: ${mdef === 0 ? t("INS die") : `${t("INS die")} + ${mdef}`}`,
                                );
                                if (init !== 0)
                                  tags.push(
                                    `Init ${init > 0 ? "+" : ""}${init}`,
                                  );
                              } else if (slot === "offHand") {
                                const source =
                                  player.equippedSlots?.offHand?.source;
                                if (source === "shields") {
                                  const def = item.def ?? 0;
                                  const mdef = item.mdef ?? 0;
                                  const init = item.init ?? 0;
                                  tags.push(`DEF +${def}`);
                                  tags.push(`M.DEF +${mdef}`);
                                  if (init !== 0)
                                    tags.push(
                                      `Init ${init > 0 ? "+" : ""}${init}`,
                                    );
                                }
                              }
                              sendDisplayMessage("item", item.name, {
                                speaker:
                                  player?.info?.name || player?.name || "",
                                tags,
                                description:
                                  item.quality ||
                                  item.description ||
                                  undefined,
                              });
                            }
                          }}
                          sx={{ p: 0.25 }}
                        >
                          <Message sx={{ fontSize: "0.85rem" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    </>
                  )}
                </Box>
              </Box>
            );

            return clickable ? (
              <ButtonBase
                key={slot}
                component="div"
                onClick={() => handleSlotClick(slot)}
                sx={{
                  display: "block",
                  textAlign: "left",
                  width: "100%",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {inner}
              </ButtonBase>
            ) : (
              <Box key={slot}>{inner}</Box>
            );
          })}
        </Box>
        {/* Vehicle support slots */}
        {activeVehicle && visibleSupportSlots.length > 0 && (
          <>
            <Divider sx={{ my: 0.25 }}>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Chip
                  icon={<PrecisionManufacturingIcon />}
                  label={activeVehicle.customName || t("Vehicle")}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem", height: 18 }}
                />
                {vehicleModuleUsage &&
                  [
                    { key: "weapon", label: t("Weapon") },
                    { key: "armor", label: t("Armor") },
                    { key: "support", label: t("Support") },
                  ].map(({ key, label }) => {
                    const used = vehicleModuleUsage.counts[key];
                    const max = vehicleModuleUsage.limits[key];
                    const over = max !== -1 && used > max;
                    return (
                      <Chip
                        key={key}
                        label={`${label}: ${used}/${max === -1 ? "∞" : max}`}
                        size="small"
                        color={over ? "error" : "success"}
                        variant={over ? "filled" : "outlined"}
                        sx={{ fontSize: "0.6rem", height: 18 }}
                      />
                    );
                  })}
              </Box>
            </Divider>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {visibleSupportSlots.map((entry, i) => {
                const isEmpty = !entry.module;
                const inner = (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: LOADOUT_ROW_PX,
                      py: LOADOUT_ROW_PY,
                      minHeight: LOADOUT_ROW_MIN_HEIGHT,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      minWidth: 0,
                    }}
                  >
                    <PrecisionManufacturingIcon
                      sx={{
                        fontSize: "0.65rem",
                        color: "success.main",
                        flexShrink: 0,
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        mr: 0.5,
                        width: LOADOUT_LABEL_COL_WIDTH,
                      }}
                    >
                      {t("Support")}
                    </Typography>
                    <Typography
                      component="span"
                      noWrap
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: isEmpty ? 400 : 600,
                        color: isEmpty ? "text.disabled" : "success.main",
                        fontStyle: isEmpty ? "italic" : "normal",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {isEmpty
                        ? t("- Empty -")
                        : highlightMatch(
                            getSupportModuleDisplayName(entry.module, t),
                            searchQuery,
                          )}
                    </Typography>
                    <Box
                      sx={{
                        width: LOADOUT_ACTION_COL_WIDTH,
                        minWidth: LOADOUT_ACTION_COL_WIDTH,
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      {!isEmpty && (
                        <Tooltip title={t("Send to Chat")}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const module = entry.module;
                              sendDisplayMessage(
                                "item",
                                getSupportModuleDisplayName(module, t),
                                {
                                  speaker:
                                    player?.info?.name || player?.name || "",
                                  tags: [t("Support Module")],
                                  description:
                                    module?.name === "pilot_custom_support"
                                      ? module?.description || undefined
                                      : t(module?.description || "") ||
                                        undefined,
                                },
                              );
                            }}
                            sx={{ p: 0.25 }}
                          >
                            <Message sx={{ fontSize: "0.85rem" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                );
                return canClickSlot ? (
                  <ButtonBase
                    key={i}
                    onClick={() => setSupportPickerOpen(true)}
                    sx={{
                      display: "block",
                      textAlign: "left",
                      width: "100%",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {inner}
                  </ButtonBase>
                ) : (
                  <Box key={i}>{inner}</Box>
                );
              })}
            </Box>
          </>
        )}
        {/* Collapsible equipment list */}
        {withEquipment && (
          <Collapse in={equipOpen}>
            <PlayerEquipment
              player={player}
              setPlayer={setPlayer}
              isEditMode={isEditMode}
              isCharacterSheet
              isMainTab={isMainTab}
              searchQuery={searchQuery}
            />
          </Collapse>
        )}
        {/* Slot picker dialog (includes module override view) */}
        {pickerSlot && (
          <SlotPickerDialog
            open
            onClose={() => {
              setPickerSlot(null);
              setPickerOpenModuleOverride(false);
            }}
            slot={pickerSlot}
            player={player}
            setPlayer={setPlayer}
            vehicleModules={
              activeVehicle &&
              ["mainHand", "offHand", "armor"].includes(pickerSlot)
                ? getEquippedModulesForSlot(player, pickerSlot)
                : []
            }
            onSelectModule={(idx) => store.selectModule(pickerSlot, idx)}
            onDisableModule={() => store.disableModule(pickerSlot)}
            openModuleOverride={pickerOpenModuleOverride}
            onClearOtherHandModule={
              activeVehicle && ["mainHand", "offHand"].includes(pickerSlot)
                ? () =>
                    store.disableModule(
                      pickerSlot === "mainHand" ? "offHand" : "mainHand",
                    )
                : undefined
            }
            onCreateNewItem={handleCreateNewItem}
            onImportFromCompendium={handleImportFromCompendium}
          />
        )}
        <CompendiumViewerModal
          open={slotImportOpen}
          onClose={() => setSlotImportOpen(false)}
          onAddItem={handleSlotImportAdd}
          initialType={slotImportType}
        />
        <PlayerWeaponModal
          open={createItemType === "weapon"}
          onClose={() => setCreateItemType(null)}
          editWeaponIndex={null}
          weapon={null}
          onAddWeapon={(item) => {
            appendEquipmentItem("weapons", item);
            setCreateItemType(null);
          }}
          onDeleteWeapon={() => {}}
        />
        <PlayerCustomWeaponModal
          open={createItemType === "custom-weapon"}
          onClose={() => setCreateItemType(null)}
          editCustomWeaponIndex={null}
          customWeapon={null}
          onAddCustomWeapon={(item) => {
            appendEquipmentItem("customWeapons", item);
            setCreateItemType(null);
          }}
          onDeleteCustomWeapon={() => {}}
          player={player}
          setPlayer={setPlayer}
        />
        <PlayerShieldModal
          open={createItemType === "shield"}
          onClose={() => setCreateItemType(null)}
          editShieldIndex={null}
          shield={null}
          onAddShield={(item) => {
            appendEquipmentItem("shields", item);
            setCreateItemType(null);
          }}
          onDeleteShield={() => {}}
        />
        <PlayerArmorModal
          open={createItemType === "armor"}
          onClose={() => setCreateItemType(null)}
          editArmorIndex={null}
          armorPlayer={null}
          onAddArmor={(item) => {
            appendEquipmentItem("armor", item);
            setCreateItemType(null);
          }}
          onDeleteArmor={() => {}}
          player={player}
          setPlayer={setPlayer}
        />
        <PlayerAccessoryModal
          open={createItemType === "accessory"}
          onClose={() => setCreateItemType(null)}
          editAccIndex={null}
          accessory={null}
          onAddAccessory={(item) => {
            appendEquipmentItem("accessories", item);
            setCreateItemType(null);
          }}
          onDeleteAccessory={() => {}}
        />
        {/* Support module picker */}
        <Dialog
          open={supportPickerOpen}
          onClose={() => setSupportPickerOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PrecisionManufacturingIcon color="success" fontSize="small" />
            {t("Support Modules")}
          </DialogTitle>
          <DialogContent sx={{ pb: 1 }}>
            {equippedSupportModules.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                }}
              >
                {t("No support modules installed on this vehicle.")}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="caption"
                  gutterBottom
                  sx={{
                    color: "text.secondary",
                    display: "block",
                  }}
                >
                  {t("Enable or disable support modules:")}
                </Typography>
                <List dense>
                  {equippedSupportModules.map((m) => (
                    <ListItem key={m.originalIndex} disablePadding>
                      <ListItemButton
                        onClick={() =>
                          store.toggleSupportModule(m.originalIndex)
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={m.enabled ?? false}
                            disableRipple
                            size="small"
                            color="success"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={getSupportModuleDisplayName(m, t)}
                          secondary={
                            <Typography
                              component="div"
                              sx={{
                                fontSize: "0.72rem",
                                color: "text.secondary",
                                lineHeight: 1.35,
                                mt: 0.25,
                              }}
                            >
                              {m.isComplex ? `${t("Complex")} - ` : ""}
                              <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                  p: (p) => (
                                    <p style={{ margin: 0, display: "inline" }} {...p} />
                                  ),
                                  strong: (p) => <strong style={{ fontWeight: 700 }} {...p} />,
                                  em: (p) => <em style={{ fontStyle: "italic" }} {...p} />,
                                }}
                              >
                                {(m.name ?? m.key) === "pilot_custom_support"
                                  ? m.description || ""
                                  : t(m.description || "")}
                              </ReactMarkdown>
                            </Typography>
                          }
                          slotProps={{
                            primary: {
                              variant: "body2",
                              fontWeight: m.enabled ? 700 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button size="small" onClick={() => setSupportPickerOpen(false)}>
              {t("Done")}
            </Button>
          </DialogActions>
        </Dialog>
        {/* Vehicle swap modal */}
        {vehicleModalOpen && pilotSpellInfo && (
          <SpellPilotVehiclesModal
            open
            onClose={() => setVehicleModalOpen(false)}
            pilot={pilotSpellInfo.spell}
            onSave={handleSaveVehicles}
          />
        )}
        {pilotSpellInfo && (
          <VehicleEnterDialog
            open={vehicleEnterOpen}
            onClose={() => setVehicleEnterOpen(false)}
            vehicles={pilotVehicles}
            onEnter={handleEnterVehicle}
          />
        )}
      </Box>
    </TableContainer>
  );
}
