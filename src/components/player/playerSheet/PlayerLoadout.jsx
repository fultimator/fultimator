import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Chip,
  Divider,
  Tooltip,
  Button,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import LockIcon from "@mui/icons-material/Lock";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CasinoIcon from "@mui/icons-material/Casino";
import { SwapHoriz } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { useTheme } from "@mui/material/styles";
import attributes from "../../../libs/attributes";
import {
  resolveEffectiveSlot,
  getActiveVehicle,
} from "../equipment/slots/equipmentSlots";
import {
  getSlotLocks,
  getEquippedModulesForSlot,
  getEquippedModuleForSlot,
  getVehicleModuleUsage,
  getAvailableSupportModules,
  getSupportSlots,
  getAuxHandItem,
} from "../equipment/slots/loadoutSelectors";
import { useLoadoutStore } from "../../../store/playerLoadoutStore";
import SlotPickerDialog from "../equipment/slots/SlotPickerDialog";
import VehicleEnterDialog from "../equipment/slots/VehicleEnterDialog";
import SpellPilotVehiclesModal from "../spells/SpellPilotVehiclesModal";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import PlayerWeaponModal from "../equipment/weapons/PlayerWeaponModal";
import PlayerCustomWeaponModal from "../equipment/customWeapons/PlayerCustomWeaponModal";
import PlayerShieldModal from "../equipment/shields/PlayerShieldModal";
import PlayerArmorModal from "../equipment/armor/PlayerArmorModal";
import PlayerAccessoryModal from "../equipment/accessories/PlayerAccessoryModal";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import {
  buildAccuracyCheckMessage,
  prepareAccuracyCheck,
  processAccuracyCheck,
  rollAccuracyCheck,
} from "../../app-drawer/panels/chat/domain/accuracy-checks";

// Stat line helpers

function weaponStatLine(item) {
  if (!item) return "-";
  const acc = item.accuracy;
  if (acc?.attr1 && acc?.attr2) {
    const a1 = attributes[acc.attr1]?.shortcaps ?? acc.attr1;
    const a2 = attributes[acc.attr2]?.shortcaps ?? acc.attr2;
    const dmg = item.damage?.value ?? item.damage ?? "?";
    const type = item.damage?.type ?? item.type ?? "";
    const hands = item.hands === 2 || item.isTwoHand ? "2H" : "1H";
    return `${a1}+${a2} / ${dmg} ${type} / ${hands}`.trim();
  }
  return item.quality || "-";
}

function shieldStatLine(item) {
  if (!item) return "-";
  return `DEF +${item.def}  MDEF +${item.mdef}`;
}

function armorStatLine(item) {
  if (!item) return "-";
  const init = item.init >= 0 ? `+${item.init}` : `${item.init}`;
  return `DEF +${item.def}  MDEF +${item.mdef}  INIT ${init}`;
}

function moduleStatLine(module) {
  if (!module) return "-";
  if (module.type === "pilot_module_weapon") {
    if (module.isShield)
      return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
    const acc = module.accuracy ?? {};
    const dmg = module.damage ?? {};
    const a1 = attributes[acc.attr1]?.shortcaps ?? acc.attr1 ?? "might";
    const a2 = attributes[acc.attr2]?.shortcaps ?? acc.attr2 ?? "dexterity";
    const hands = module.cumbersome ? "2H" : "1H";
    return `${a1}+${a2} / ${dmg.value ?? "?"} ${dmg.type ?? ""} / ${hands}`.trim();
  }
  if (module.type === "pilot_module_armor") {
    return `DEF +${module.def ?? 0}  MDEF +${module.mdef ?? 0}`;
  }
  return module.description ? module.description.slice(0, 40) : "-";
}

// SlotCard

function SlotCard({
  label,
  resolved,
  locked,
  isEditMode,
  onClick,
  hasModule,
  onRoll,
  onSwap,
  isAux,
  primary,
  ternary,
  ternaryContrast,
}) {
  const { t } = useTranslate();
  const isVehicle = resolved?.kind === "vehicleModule";
  const isEmpty = !resolved;

  const itemName = (() => {
    if (isVehicle) return resolved.module.customName || t(resolved.module.name);
    const item = resolved?.item;
    if (!item) return null;
    if ("secondAccuracy" in item && item.activeForm === "secondary") {
      return item.secondWeaponName || `${item.name} (Alt)`;
    }
    return item.name ?? null;
  })();

  const statLine = (() => {
    if (!resolved) return null;
    if (isVehicle) return moduleStatLine(resolved.module);
    const item = resolved.item;
    // Custom weapon: respect active form
    if ("secondAccuracy" in item || "accuracy" in item) {
      const isSecondary = item.activeForm === "secondary";
      const acc = isSecondary
        ? (item.secondAccuracy ?? item.accuracy)
        : item.accuracy;
      const dmg = isSecondary
        ? (item.secondDamage ?? item.damage)
        : item.damage;
      if (acc?.attr1 && acc?.attr2) {
        const a1 = attributes[acc.attr1]?.shortcaps ?? acc.attr1;
        const a2 = attributes[acc.attr2]?.shortcaps ?? acc.attr2;
        return `${a1}+${a2} / ${dmg?.value ?? "?"} ${dmg?.type ?? ""} / 2H`.trim();
      }
    }
    if ("accuracy" in item) return weaponStatLine(item);
    if ("def" in item && "mdef" in item && !("init" in item))
      return shieldStatLine(item);
    if ("def" in item && "mdef" in item && "init" in item)
      return armorStatLine(item);
    return item.quality || "-";
  })();

  // A slot is weapon-type if it has rollable accuracy+damage stats
  const isWeaponType =
    !isEmpty &&
    (isVehicle
      ? resolved.module.type === "pilot_module_weapon" &&
        !resolved.module.isShield
      : !!resolved.item?.accuracy?.attr1 && !!resolved.item?.accuracy?.attr2);

  const clickable = !locked && !!onClick && !isAux;
  const showRoll = !!onRoll && isWeaponType && !isEmpty;
  const showSwap =
    !!onSwap &&
    !isEmpty &&
    !isVehicle &&
    resolved.item?.customizations?.some(
      (c) => c.name === "weapon_customization_transforming",
    );

  const headerBg = isAux
    ? "warning.main"
    : isVehicle
      ? "success.main"
      : primary;

  const labelRow = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.4,
        backgroundColor: headerBg,
        borderRadius: "6px 6px 0 0",
        opacity: locked ? 0.55 : 1,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "#fff",
          fontWeight: 800,
          letterSpacing: 0.6,
          fontSize: { xs: "0.65rem", sm: "0.68rem" },
          textTransform: "uppercase",
          lineHeight: 1.2,
          flex: 1,
        }}
      >
        {label}
      </Typography>
      {isAux && (
        <Tooltip title={t("Auto-generated")}>
          <AutoFixHighIcon sx={{ fontSize: 12, color: "#fff", opacity: 0.85 }} />
        </Tooltip>
      )}
      {isVehicle && !isAux && (
        <Tooltip title={resolved.vehicle.customName}>
          <PrecisionManufacturingIcon sx={{ fontSize: 12, color: "#fff", opacity: 0.85 }} />
        </Tooltip>
      )}
      {hasModule && !isVehicle && !isEmpty && !isAux && (
        <Tooltip title={t("Vehicle module available")}>
          <PrecisionManufacturingIcon sx={{ fontSize: 12, color: "#fff", opacity: 0.7 }} />
        </Tooltip>
      )}
      {locked && <LockIcon sx={{ fontSize: 12, color: "#fff", opacity: 0.7 }} />}
    </Box>
  );

  const bodyInner = (
    <Box sx={{ px: 1, py: 0.75, display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
      {isEmpty ? (
        <Typography
          variant="body2"
          sx={{ color: "text.disabled", fontStyle: "italic" }}
        >
          {t("- Empty -")}
        </Typography>
      ) : (
        <>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 700, fontSize: { xs: "0.84rem", sm: "0.9rem" } }}
          >
            {itemName}
          </Typography>
          {statLine && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.72rem", sm: "0.76rem" },
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
                mt: 0.25,
              }}
            >
              {statLine}
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        minWidth: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: isAux
          ? "1px dashed"
          : isVehicle
            ? "1px solid"
            : hasModule && !isVehicle && !isEmpty
              ? "1px dashed"
              : undefined,
        borderColor: isAux
          ? "warning.main"
          : isVehicle
            ? "success.main"
            : hasModule && !isVehicle && !isEmpty
              ? "success.light"
              : undefined,
      }}
    >
      {labelRow}
      <Box sx={{ display: "flex", alignItems: "stretch", flex: 1 }}>
        {clickable ? (
          <CardActionArea onClick={onClick} sx={{ flex: 1, alignItems: "stretch", "& .MuiCardActionArea-focusHighlight": {} }}>
            {bodyInner}
          </CardActionArea>
        ) : (
          <Box sx={{ flex: 1 }}>{bodyInner}</Box>
        )}
        {(showRoll || showSwap) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 0.75,
              gap: 0.5,
              backgroundColor: ternary,
            }}
          >
            {showSwap && (
              <Tooltip title={t("weapon_customization_swap_form")}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onSwap(); }}
                >
                  <SwapHoriz fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {showRoll && (
              <Tooltip title={t("Roll")}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onRoll(); }}
                >
                  <CasinoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Card>
  );
}

// VehicleSupportCard

function VehicleSupportCard({ label, module, isEditMode, onClick }) {
  const { t } = useTranslate();
  const clickable = !!onClick;
  const content = (
    <CardContent sx={{ px: 1, py: 0.8, "&:last-child": { pb: 0.8 } }}>
      {module ? (
        <>
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              mb: 0.5,
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 800,
                fontSize: { xs: "0.68rem", sm: "0.72rem" },
              }}
            >
              {label}
            </Typography>
            <PrecisionManufacturingIcon
              sx={{ fontSize: 12, color: "success.main" }}
            />
          </Box>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: { xs: "0.84rem", sm: "0.9rem" },
            }}
          >
            {module.customName || t(module.name)}
          </Typography>
          {module.description && (
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.72rem", sm: "0.76rem" },
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.2,
              }}
            >
              <ReactMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed
              >
                {module.name === "pilot_custom_support"
                  ? module.description
                  : t(module.description)}
              </ReactMarkdown>
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.disabled",
              fontStyle: "italic",
            }}
          >
            {t("- Empty -")}
          </Typography>
        </>
      )}
    </CardContent>
  );

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        minWidth: !module ? 120 : 0,
        maxWidth: "100%",
        border: module ? "1px solid" : undefined,
        borderColor: module ? "success.main" : undefined,
      }}
    >
      {clickable ? (
        <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

// PlayerLoadout

export default function PlayerLoadout({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
  isOwner,
}) {
  const { t } = useTranslate();
  const muiTheme = useTheme();
  const theme = useCustomTheme();
  const primary = theme.primary;
  const secondary = theme.secondary;
  const ternary = theme.ternary || "#999";
  const ternaryContrast = muiTheme.palette.getContrastText(ternary);
  const canClickSlot = isEditMode || !!isOwner || !!setPlayer;
  const addMessage = useChatMessagesStore((s) => s.addMessage);

  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] =
    useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleEnterOpen, setVehicleEnterOpen] = useState(false);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [createItemType, setCreateItemType] = useState(null);
  const [slotImportOpen, setSlotImportOpen] = useState(false);
  const [slotImportType, setSlotImportType] = useState("weapons");

  const store = useLoadoutStore();
  useEffect(() => {
    store.init(setPlayer);
  }, [setPlayer, store]);

  // Shared selectors
  const auxHandItem = getAuxHandItem(player);

  const handleRollSlot = (slot) => {
    const resolved =
      slot === "aux"
        ? auxHandItem
          ? { kind: "playerItem", item: auxHandItem }
          : null
        : resolveEffectiveSlot(player, slot);
    if (!resolved) return;

    let att1, att2, prec, damage, type, defense, range, hrZero;
    if (resolved.kind === "vehicleModule") {
      const m = resolved.module;
      if (m.type !== "pilot_module_weapon" || m.isShield) return;
      const acc = m.accuracy;
      const dmg = m.damage;
      att1 = acc?.attr1;
      att2 = acc?.attr2;
      if (!att1 || !att2) return;
      prec = acc?.value ?? 0;
      damage = dmg?.value ?? 0;
      type = dmg?.type ?? "";
      defense = acc?.defense ?? "def";
      range = m?.range ?? "melee";
      hrZero = dmg?.hrZero === true;
    } else {
      const item = resolved.item;
      const isSecondary = item.activeForm === "secondary";
      const acc = isSecondary
        ? (item.secondAccuracy ?? item.accuracy)
        : item.accuracy;
      const dmg = isSecondary
        ? (item.secondDamage ?? item.damage)
        : item.damage;
      att1 = acc?.attr1;
      att2 = acc?.attr2;
      if (!att1 || !att2) return;
      prec = acc?.value ?? 0;
      damage = dmg?.value ?? 0;
      type = dmg?.type ?? "";
      defense = acc?.defense ?? "def";
      range = item?.range ?? (item?.melee ? "melee" : "ranged");
      hrZero = dmg?.hrZero === true;
    }
    const toRollKey = (attr) => {
      const key = String(attr || "").toLowerCase();
      if (key.startsWith("dex")) return "dex";
      if (key.startsWith("ins")) return "ins";
      if (key.startsWith("mig")) return "mig";
      if (key.startsWith("wil") || key.startsWith("wlp")) return "wlp";
      return "dex";
    };
    const dieSizes = {
      primary:
        player?.attributes?.[att1]?.base ?? player?.attributes?.[att1] ?? 6,
      secondary:
        player?.attributes?.[att2]?.base ?? player?.attributes?.[att2] ?? 6,
    };
    const intent = prepareAccuracyCheck({
      attr1: toRollKey(att1),
      attr2: toRollKey(att2),
      accuracyBonus: prec ?? 0,
      name: resolved.kind === "vehicleModule"
        ? (resolved.module.customName || t(resolved.module.name))
        : resolved.item?.name || "Attack",
      description:
        resolved.kind === "vehicleModule"
          ? resolved.module.description || undefined
          : resolved.item?.quality || undefined,
      baseDamage: damage ?? 0,
      damageType: type || "physical",
      accuracyDefense: defense,
      range,
      hrZero,
    });
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(
      intent,
      rolls,
      dieSizes,
      player?.name || "Player",
    );
    addMessage(buildAccuracyCheckMessage(result));
  };

  const handleSwapSlot = (slot) => {
    store.swapForm(slot);
  };

  const mainHandResolved = resolveEffectiveSlot(player, "mainHand");
  const offHandResolved = resolveEffectiveSlot(player, "offHand");
  const armorResolved = resolveEffectiveSlot(player, "armor");
  const accessoryResolved = resolveEffectiveSlot(player, "accessory");

  const activeVehicle = getActiveVehicle(player);
  const vs = player?.vehicleSlots;

  const vehicleModuleUsage = getVehicleModuleUsage(player);
  const equippedSupportModules = getAvailableSupportModules(player);
  const supportSlots = getSupportSlots(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);
  const pilotSpellInfo = (() => {
    for (const [ci, cls] of (player.classes ?? []).entries()) {
      for (const [si, spell] of (cls.spells ?? []).entries()) {
        if (spell.spellType === "pilot-vehicle")
          return { spell, classIndex: ci, spellIndex: si };
      }
    }
    return null;
  })();
  const pilotVehicles = pilotSpellInfo
    ? Array.isArray(pilotSpellInfo.spell.vehicles)
      ? pilotSpellInfo.spell.vehicles
      : Array.isArray(pilotSpellInfo.spell.currentVehicles)
        ? pilotSpellInfo.spell.currentVehicles
        : []
    : [];

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

  const handleSlotClick = (slot) => {
    const hasModuleCandidates =
      ["mainHand", "offHand", "armor"].includes(slot) &&
      Boolean(activeVehicle) &&
      getEquippedModulesForSlot(player, slot).length > 0;
    setPickerOpenModuleOverride(hasModuleCandidates);
    setPickerSlot(slot);
  };

  const vehicleAccessoryModule = vs?.accessory
    ? (activeVehicle?.modules.find(
        (m) => m.name === vs.accessory.moduleName && m.enabled,
      ) ?? null)
    : null;

  const slotCards = [
    {
      slot: "mainHand",
      label: t("Main Hand"),
      resolved: mainHandResolved,
      locked: mainHandLocked,
    },
    {
      slot: "offHand",
      label: t("Off Hand"),
      resolved: offHandResolved,
      locked: offHandLocked,
    },
    {
      slot: "armor",
      label: t("Armor"),
      resolved: armorResolved,
      locked: false,
    },
    {
      slot: "accessory",
      label: t("Accessory"),
      resolved: accessoryResolved,
      locked: false,
    },
  ];

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
    <Paper
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        display: "flex",
        flexDirection: isCharacterSheet ? "column" : "row",
      }}
    >
      {/* Section header */}
      <Typography
        variant="h1"
        sx={
          isCharacterSheet
            ? {
                textTransform: "uppercase",
                padding: "5px",
                backgroundColor: primary,
                color: "#fff",
                borderRadius: "8px 8px 0 0",
                fontSize: "1.5em",
              }
            : {
                writingMode: "vertical-lr",
                textTransform: "uppercase",
                transform: "rotate(180deg)",
                ml: "-1px",
                mr: "10px",
                mt: "-1px",
                mb: "-1px",
                paddingY: "10px",
                backgroundColor: primary,
                color: "#fff",
                borderRadius: "0 8px 8px 0",
                fontSize: "2em",
              }
        }
        align="center"
      >
        {t("Loadout")}
      </Typography>
      <Box sx={{ p: 1.5, flexGrow: 1 }}>
        {/* Vehicle enter/exit + swap: shown when a pilot-vehicle spell exists */}
        {(isOwner || isEditMode) && pilotSpellInfo && (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 1.5,
                alignItems: "center",
              }}
            >
              <PrecisionManufacturingIcon
                sx={{
                  fontSize: 16,
                  color: activeVehicle ? "success.main" : "text.disabled",
                }}
              />
              <Typography
                variant="caption"
                color={activeVehicle ? "success.main" : "text.secondary"}
                sx={{
                  fontWeight: 700,
                }}
              >
                {activeVehicle
                  ? activeVehicle.customName || t("Vehicle")
                  : t("No vehicle active")}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                }}
              />
              <Button
                size="small"
                variant={activeVehicle ? "outlined" : "contained"}
                color={activeVehicle ? "error" : "success"}
                startIcon={<DirectionsWalkIcon />}
                onClick={handleToggleVehicle}
                sx={{ fontSize: "0.7rem", py: 0.25 }}
              >
                {activeVehicle ? t("Exit Vehicle") : t("Enter Vehicle")}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SyncAltIcon />}
                onClick={() => setVehicleModalOpen(true)}
                sx={{ fontSize: "0.7rem", py: 0.25 }}
              >
                {t("Swap Vehicle")}
              </Button>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
          </>
        )}

        {/* 4-slot grid + aux hand */}
        <Grid container spacing={1} sx={{ alignItems: "stretch" }}>
          {slotCards.map(({ slot, label, resolved, locked }) => (
            <Grid
              key={slot}
              sx={{ display: "flex" }}
              size={{
                xs: 6,
                sm: 3,
                md: 3,
              }}
            >
              <SlotCard
                label={label}
                resolved={resolved}
                locked={locked}
                isEditMode={canClickSlot}
                hasModule={!!getEquippedModuleForSlot(player, slot)}
                onClick={() => handleSlotClick(slot)}
                onRoll={
                  slot === "mainHand" || slot === "offHand"
                    ? () => handleRollSlot(slot)
                    : undefined
                }
                onSwap={
                  slot === "mainHand" || slot === "offHand"
                    ? () => handleSwapSlot(slot)
                    : undefined
                }
                primary={primary}
                ternary={ternary}
                ternaryContrast={ternaryContrast}
              />
            </Grid>
          ))}
          {auxHandItem && (
            <Grid
              sx={{ display: "flex" }}
              size={{
                xs: 6,
                sm: 3,
                md: 3,
              }}
            >
              <SlotCard
                label={t("Aux Hand")}
                resolved={{ kind: "playerItem", item: auxHandItem }}
                locked={false}
                isEditMode={canClickSlot}
                isAux
                onRoll={() => handleRollSlot("aux")}
                primary={primary}
                ternary={ternary}
                ternaryContrast={ternaryContrast}
              />
            </Grid>
          )}
        </Grid>

        {/* Vehicle-only slots (accessory + support) */}
        {activeVehicle && (
          <>
            <Divider sx={{ my: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  icon={<PrecisionManufacturingIcon />}
                  label={activeVehicle.customName || t("Vehicle")}
                  size="small"
                  color="success"
                  variant="outlined"
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
                        sx={{ fontSize: "0.7rem", height: 22 }}
                      />
                    );
                  })}
              </Box>
            </Divider>
            <Grid container spacing={1}>
              {vehicleAccessoryModule && (
                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                    md: 3,
                  }}
                >
                  <VehicleSupportCard
                    label={t("Accessory")}
                    module={vehicleAccessoryModule}
                    vehicle={activeVehicle}
                  />
                </Grid>
              )}
              {supportSlots.map((entry, i) => (
                <Grid
                  key={i}
                  size={{
                    xs: 6,
                    sm: 3,
                    md: 3,
                  }}
                >
                  <VehicleSupportCard
                    label={`${t("Support")} ${i + 1}`}
                    module={entry.module}
                    vehicle={activeVehicle}
                    isEditMode={canClickSlot}
                    onClick={
                      canClickSlot
                        ? () => setSupportPickerOpen(true)
                        : undefined
                    }
                  />
                </Grid>
              ))}
              {/* Add empty slot card when no support slots are enabled */}
              {supportSlots.length === 0 && (
                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                    md: 3,
                  }}
                >
                  <VehicleSupportCard
                    label={`${t("Support")} 1`}
                    module={null}
                    vehicle={activeVehicle}
                    isEditMode={canClickSlot}
                    onClick={
                      canClickSlot
                        ? () => setSupportPickerOpen(true)
                        : undefined
                    }
                  />
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>
      {/* Slot picker dialog (includes module override view) */}
      {pickerSlot && (
        <SlotPickerDialog
          open={Boolean(pickerSlot)}
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
      {/* Support module picker dialog */}
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
                      onClick={() => store.toggleSupportModule(m.originalIndex)}
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
                        primary={m.customName || t(m.name)}
                        secondary={
                          <Box
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.75rem",
                            }}
                          >
                            {m.isComplex && (
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, mr: 0.5 }}
                              >
                                {t("Complex")} -{" "}
                              </Typography>
                            )}
                            <ReactMarkdown
                              allowedElements={["strong", "em"]}
                              unwrapDisallowed
                            >
                              {m.name === "pilot_custom_support"
                                ? m.description
                                : t(m.description || "")}
                            </ReactMarkdown>
                          </Box>
                        }
                        slotProps={{
                          primary: {
                            variant: "body2",
                            fontWeight: m.enabled ? 700 : 400,
                          },
                          secondary: { component: "div" },
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
      {pilotSpellInfo && (
        <SpellPilotVehiclesModal
          open={vehicleModalOpen}
          onClose={() => setVehicleModalOpen(false)}
          onSave={handleSaveVehicles}
          pilot={pilotSpellInfo.spell}
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
    </Paper>
  );
}
