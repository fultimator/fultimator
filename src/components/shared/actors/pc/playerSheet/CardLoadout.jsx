import React, { useState, useEffect } from "react";
import { Box, Typography, Tooltip, IconButton, Paper } from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import LockIcon from "@mui/icons-material/Lock";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { useTranslate } from "/src/translation/translate";
import { useTheme } from "@mui/material/styles";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import {
  resolveEffectiveSlot,
  getActiveVehicle,
} from "/src/libs/player/slots/equipmentSlots";
import {
  getSlotLocks,
  getEquippedModulesForSlot,
  getEquippedModuleForSlot,
  getEquippedSupportModules,
} from "/src/libs/player/slots/loadoutSelectors";
import { useLoadoutStore } from "/src/store/playerLoadoutStore";
import { SlotPickerDialog } from "/src/components/shared/actors/pc/editors";
import CompendiumViewerModal from "/src/components/compendium/CompendiumViewerModal";
import { PlayerWeaponModal } from "/src/components/shared/actors/pc/editors";
import { PlayerCustomWeaponModal } from "/src/components/shared/actors/pc/editors";
import { PlayerShieldModal } from "/src/components/shared/actors/pc/editors";
import { PlayerArmorModal } from "/src/components/shared/actors/pc/editors";
import { PlayerAccessoryModal } from "/src/components/shared/actors/pc/editors";
import { calculateAttribute } from "/src/libs/playerCalculations";
import { availableModules } from "/src/libs/pilotVehicleData";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import { useCombatEncounterStore } from "/src/stores/combatEncounterStore";
import {
  buildAccuracyCheckMessage,
  prepareAccuracyCheck,
  processAccuracyCheck,
  rollAccuracyCheck,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import { accuracyModifiersFromEffects } from "/src/components/app-drawer/panels/chat/domain/effect-modifiers";

const SLOT_LABEL_KEY = {
  mainHand: "MAIN",
  offHand: "OFF",
  armor: "ARM",
  accessory: "ACC",
};

const officialVehicleModules = Object.values(availableModules).flat();

function getOfficialVehicleModule(module) {
  return officialVehicleModules.find(
    (official) =>
      (module?.fuid && official.fuid === module.fuid) ||
      (module?.name && official.name === module.name),
  );
}

function getVehicleModuleDisplayName(module, t) {
  if (!module) return "";
  if (module.customName) return module.customName;
  return t(module.name || getOfficialVehicleModule(module)?.name || "");
}

function getVehicleModuleCategory(module) {
  return module?.category || getOfficialVehicleModule(module)?.category;
}

function resolvedName(resolved, locked, t) {
  if (locked) return t("2-Handed");
  if (!resolved) return " - ";
  if (resolved.kind === "vehicleModule") {
    return resolved.module.customName || t(resolved.module.name);
  }
  const item = resolved.item;
  if ("secondAccuracy" in item && item.activeForm === "secondary") {
    return item.secondWeaponName || `${item.name} (Alt)`;
  }
  return item?.name ?? " - ";
}

export default function CardLoadout({
  player,
  setPlayer,
  isEditMode,
  isOwner,
  showHeader = true,
  showSideDivider = true,
  showSupportColumn = false,
  compact = false,
  hideActions = false,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const [pickerSlot, setPickerSlot] = useState(null);
  const [pickerOpenModuleOverride, setPickerOpenModuleOverride] =
    useState(false);
  const [createItemType, setCreateItemType] = useState(null);
  const [slotImportOpen, setSlotImportOpen] = useState(false);
  const [slotImportType, setSlotImportType] = useState("weapons");

  const store = useLoadoutStore();
  const addMessage = useAddChatMessage();
  useEffect(() => {
    store.init(setPlayer);
  }, [setPlayer, store]);

  const activeVehicle = getActiveVehicle(player);
  const { mainHandLocked, offHandLocked } = getSlotLocks(player);
  const supportModules = getEquippedSupportModules(player).filter(
    (m) => m.enabled,
  );
  const hasSupportColumn = showSupportColumn && supportModules.length > 0;

  const mainHandResolved = resolveEffectiveSlot(player, "mainHand");
  const offHandResolved = resolveEffectiveSlot(player, "offHand");

  const SLOTS = [
    { key: "mainHand", resolved: mainHandResolved, locked: mainHandLocked },
    { key: "offHand", resolved: offHandResolved, locked: offHandLocked },
    {
      key: "armor",
      resolved: resolveEffectiveSlot(player, "armor"),
      locked: false,
    },
    {
      key: "accessory",
      resolved: resolveEffectiveSlot(player, "accessory"),
      locked: false,
    },
  ];

  const handleSlotClick = (slot) => {
    const hasModule =
      ["mainHand", "offHand", "armor"].includes(slot) &&
      Boolean(getEquippedModuleForSlot(player, slot));
    setPickerOpenModuleOverride(hasModule);
    setPickerSlot(slot);
  };

  const divider = theme.palette.divider;
  const supportLabel = t("pilot_module_support");

  const getAttrDie = (attr) => {
    const key = String(attr || "").toLowerCase();
    const attrKey = key.startsWith("dex")
      ? "dexterity"
      : key.startsWith("ins")
        ? "insight"
        : key.startsWith("mig")
          ? "might"
          : key.startsWith("wil") || key.startsWith("wlp")
            ? "willpower"
            : attr;
    const base = player?.attributes?.[attrKey]?.base ?? 8;
    const statusConfig = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    }[attrKey] ?? [[], []];
    return calculateAttribute(
      player,
      base,
      statusConfig[0],
      statusConfig[1],
      6,
      12,
    );
  };

  const handleRollSlot = (slot) => {
    const resolved = resolveEffectiveSlot(player, slot);
    if (!resolved) return;

    let weaponOption;
    if (resolved.kind === "vehicleModule") {
      const module = resolved.module;
      if (module.type !== "pilot_module_weapon" || module.isShield) return;
      const accuracy = module.accuracy ?? {};
      const damage = module.damage ?? {};
      if (!accuracy.attr1 || !accuracy.attr2) return;
      const name = getVehicleModuleDisplayName(module, t);
      weaponOption = {
        name: name || module.key || slot,
        attr1: accuracy.attr1,
        attr2: accuracy.attr2,
        accuracyBonus: accuracy.value ?? 0,
        baseDamage: damage.value ?? 0,
        damageType: damage.type ?? "physical",
        accuracyDefense: accuracy.defense ?? "def",
        category: getVehicleModuleCategory(module),
        isWeaponModule: true,
        damageHrZero: damage.hrZero === true,
        range:
          module.range === "ranged" || module.range === "weapon_range_ranged"
            ? "ranged"
            : "melee",
      };
    } else {
      const item = resolved.item;
      const isSecondary = item.activeForm === "secondary";
      const accuracy = isSecondary
        ? (item.secondAccuracy ?? item.accuracy)
        : item.accuracy;
      const damage = isSecondary
        ? (item.secondDamage ?? item.damage)
        : item.damage;
      if (!accuracy?.attr1 || !accuracy?.attr2) return;
      weaponOption = {
        name: item.name || slot,
        attr1: accuracy.attr1,
        attr2: accuracy.attr2,
        accuracyBonus: accuracy.value ?? 0,
        description: item.quality || undefined,
        baseDamage: damage?.value ?? damage ?? 0,
        damageType: damage?.type ?? item.type ?? "physical",
        accuracyDefense: accuracy.defense ?? "def",
        hands: item.hands,
        category: item.category,
        damageHrZero: damage?.hrZero === true,
        range:
          item.range === "ranged" || item.range === "weapon_range_ranged"
            ? "ranged"
            : "melee",
      };
    }

    const effectModifiers = accuracyModifiersFromEffects(player, {
      range: weaponOption.range,
      category: weaponOption.category,
    });
    const intent = prepareAccuracyCheck(weaponOption, effectModifiers);
    const dieSizes = {
      primary: getAttrDie(intent.primary),
      secondary: getAttrDie(intent.secondary),
    };
    const rolls = rollAccuracyCheck(dieSizes);
    const speaker = player?.info?.name || player?.name || "Player";
    const result = processAccuracyCheck(intent, rolls, dieSizes, speaker);
    const msg = buildAccuracyCheckMessage(result);
    const targets = useCombatEncounterStore.getState().targets;
    if (targets.length > 0) {
      msg.check = { ...msg.check, targetsSnapshot: [...targets] };
    }
    addMessage(msg);
  };

  const sendSlotToChat = (slot, resolved) => {
    if (!resolved) return;
    const item =
      resolved.kind === "vehicleModule" ? resolved.module : resolved.item;
    const name = resolvedName(resolved, false, t);
    const section =
      slot === "armor"
        ? "Armor"
        : slot === "mainHand" || slot === "offHand"
          ? item?.isShield || item?.category === "Shield"
            ? "Shield"
            : "Weapon"
          : slot === "accessory"
            ? "Accessory"
            : t(SLOT_LABEL_KEY[slot] ?? slot);
    const signed = (value) => `${value >= 0 ? "+" : ""}${value}`;
    const tags = [t("Equipment"), t(section)];

    if (section === "Armor" || section === "Shield") {
      if (item?.def != null) tags.push(`DEF ${signed(item.def)}`);
      if (item?.mdef != null) tags.push(`M.DEF ${signed(item.mdef)}`);
      if ((item?.init ?? 0) > 0) tags.push(`INIT ${signed(item.init)}`);
    }

    if (section === "Weapon") {
      const category = item?.category ? t(item.category) : "";
      if (category) tags.push(category);
      const hands =
        item?.hands === 2 || item?.isTwoHand
          ? "2H"
          : item?.hands === 1
            ? "1H"
            : "";
      if (hands) tags.push(hands);
    }

    addMessage({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      speaker: player?.info?.name || player?.name || "Player",
      kind: "display",
      itemType: "equipment",
      name: name || t("Equipment"),
      tags,
      description: item?.quality || item?.description || "",
    });
  };

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

  const renderSlotRow = ({ key, resolved, locked }) => {
    const isEmpty = !locked && !resolved;
    const isVehicle = resolved?.kind === "vehicleModule";
    const hasModule = !locked && !!getEquippedModuleForSlot(player, key);
    const name = resolvedName(resolved, locked, t);
    const clickable = (isEditMode || isOwner) && !locked;
    const isRollable =
      !locked &&
      (resolved?.kind === "vehicleModule"
        ? resolved.module?.type === "pilot_module_weapon" &&
          !resolved.module?.isShield
        : Boolean(
            resolved?.item?.accuracy?.attr1 && resolved?.item?.accuracy?.attr2,
          ));
    const canSendToChat = !locked && Boolean(resolved);

    const inner = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.45,
          px: "6px",
          py: "4px",
          minWidth: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Slot abbreviation */}
        <Typography
          sx={{
            fontFamily: "Antonio",
            fontSize: compact ? "0.68rem" : "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: theme.palette.text.secondary,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t(SLOT_LABEL_KEY[key])}
        </Typography>
        <Box
          sx={{
            width: "1px",
            alignSelf: "stretch",
            my: "6px",
            bgcolor: theme.palette.divider,
            flexShrink: 0,
          }}
        />

        {/* Lock / vehicle icon */}
        {locked && (
          <LockIcon
            sx={{
              fontSize: { xs: "0.5rem", sm: "0.6rem" },
              color: "text.disabled",
              flexShrink: 0,
            }}
          />
        )}
        {isVehicle && !locked && (
          <PrecisionManufacturingIcon
            sx={{
              fontSize: { xs: "0.5rem", sm: "0.6rem" },
              color: "success.main",
              flexShrink: 0,
            }}
          />
        )}
        {hasModule && !isVehicle && !isEmpty && !locked && (
          <PrecisionManufacturingIcon
            sx={{
              fontSize: { xs: "0.5rem", sm: "0.6rem" },
              color: "success.light",
              opacity: 0.6,
              flexShrink: 0,
            }}
          />
        )}

        {/* Item name */}
        <Tooltip
          title={isEmpty || locked ? "" : name}
          placement="top"
          enterDelay={600}
        >
          <Typography
            noWrap
            sx={{
              fontFamily: "Antonio",
              fontSize: compact ? "0.9rem" : "1rem",
              fontWeight: isEmpty || locked ? 500 : 800,
              textTransform: "uppercase",
              color: locked
                ? theme.palette.text.disabled
                : isEmpty
                  ? theme.palette.text.disabled
                  : isVehicle
                    ? theme.palette.success.main
                    : theme.palette.text.primary,
              fontStyle: isEmpty || locked ? "italic" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
              minWidth: 0,
              lineHeight: 1.2,
            }}
          >
            {name}
          </Typography>
        </Tooltip>
      </Box>
    );

    const rowContent = (
      <Box
        key={key}
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
        }}
      >
        {inner}
      </Box>
    );

    const slotActions = isRollable ? (
      <Tooltip title={t("Roll")}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleRollSlot(key);
          }}
        >
          <CasinoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : canSendToChat ? (
      <Tooltip title={t("Send to chat")}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            sendSlotToChat(key, resolved);
          }}
        >
          <ChatOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : locked ? (
      <Box
        sx={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LockIcon sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.75)" }} />
      </Box>
    ) : null;

    const slotActionsWithSpacer = hideActions
      ? null
      : (slotActions ?? (
          <Box
            sx={{
              width: compact ? 28 : 32,
              height: compact ? 28 : 32,
              flexShrink: 0,
            }}
          />
        ));

    return (
      <ItemRowCard
        key={key}
        label={rowContent}
        onClick={clickable ? () => handleSlotClick(key) : undefined}
        actions={slotActionsWithSpacer}
        variant="outlined"
        compact={compact}
        paperSx={{
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.03)"
              : "background.paper",
        }}
      />
    );
  };

  const dialogs = (
    <>
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
    </>
  );

  const slotContent = hasSupportColumn ? (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr) minmax(88px, 38%)",
          sm: "minmax(0, 1fr) minmax(96px, 40%)",
          md: "minmax(0, 1fr) minmax(110px, 36%)",
        },
        "@media (max-width:430px)": { gridTemplateColumns: "1fr" },
        columnGap: 0.65,
        rowGap: 0.55,
        alignItems: "start",
        flex: 1,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1,
          width: "100%",
        }}
      >
        {SLOTS.map(renderSlotRow)}
      </Box>
      <Box
        sx={{
          minWidth: 0,
          borderLeft: `1px solid ${divider}`,
          pl: 0.65,
          pt: 0,
          "@media (max-width:430px)": {
            borderLeft: "none",
            borderTop: `1px solid ${divider}`,
            pl: 0,
            pt: 0.5,
          },
        }}
      >
        <Typography
          sx={{
            fontFamily: "Antonio",
            fontSize: { xs: "0.66rem", sm: "0.72rem" },
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: theme.palette.text.secondary,
            mb: 0.3,
            lineHeight: 1.1,
          }}
        >
          {supportLabel}
        </Typography>
        {supportModules.map((module, idx) => {
          const displayName = module.customName || t(module.name);
          return (
            <Tooltip
              key={`${module.originalIndex}-${module.name}-${idx}`}
              title={displayName || ""}
              placement="top"
              enterDelay={600}
            >
              <Box
                sx={{
                  px: 0.55,
                  py: 0.35,
                  mb: 0.35,
                  borderRadius: 0.8,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.015)",
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontFamily: "Antonio",
                    fontSize: { xs: "0.74rem", sm: "0.8rem" },
                    fontWeight: module.isEquipped ? 700 : 500,
                    color: module.isEquipped
                      ? theme.palette.text.primary
                      : theme.palette.text.disabled,
                    fontStyle: module.isEquipped ? "normal" : "italic",
                    lineHeight: 1.15,
                  }}
                >
                  {displayName || " - "}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 1,
        flex: 1,
        width: "100%",
      }}
    >
      {SLOTS.map(renderSlotRow)}
    </Box>
  );

  if (showHeader) {
    if (compact) {
      return (
        <>
          <Paper
            sx={{ mb: 1, overflow: "hidden" }}
            elevation={0}
            variant="outlined"
          >
            <CompactSectionHeader title={t("Loadout")} />
            <Box sx={{ p: "4px" }}>{slotContent}</Box>
          </Paper>
          {dialogs}
        </>
      );
    }
    return (
      <>
        <SectionCard title={t("Loadout")}>
          <Box sx={{ p: 0.75 }}>{slotContent}</Box>
        </SectionCard>
        {dialogs}
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          borderLeft: showSideDivider ? `1px solid ${divider}` : "none",
          pl: showSideDivider ? "6px" : 0,
          ml: showSideDivider ? "4px" : 0,
          height: "100%",
          width: "100%",
        }}
      >
        {slotContent}
      </Box>
      {dialogs}
    </>
  );
}
