import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import {
  Casino,
  SwapHoriz,
  Edit,
  Info,
  Add,
  Search,
  ChatOutlined,
} from "@mui/icons-material";
import {
  SharedWeaponCard,
  SharedArmorCard,
  SharedShieldCard,
  SharedCustomWeaponCard,
  SharedAccessoryCard,
} from "../../shared/itemCards";
// import { OpenBracket, CloseBracket } from "../../Bracket";
// import types from "../../../libs/types";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { calculateAttribute } from "../common/playerCalculations";
import { isItemEquipped } from "../equipment/slots/equipmentSlots";
import EditPlayerEquipment from "../equipment/EditPlayerEquipment";
import CompendiumViewerModal from "../../compendium/CompendiumViewerModal";
import { useChatMessagesStore } from "../../../store/chatMessagesStore";
import {
  buildAccuracyCheckMessage,
  prepareAccuracyCheck,
  processAccuracyCheck,
  rollAccuracyCheck,
} from "../../app-drawer/panels/chat/domain/accuracy-checks";
import PlayerWeaponModal from "../equipment/weapons/PlayerWeaponModal";
import PlayerCustomWeaponModal from "../equipment/customWeapons/PlayerCustomWeaponModal";
import PlayerShieldModal from "../equipment/shields/PlayerShieldModal";
import PlayerArmorModal from "../equipment/armor/PlayerArmorModal";
import PlayerAccessoryModal from "../equipment/accessories/PlayerAccessoryModal";

export default function PlayerEquipment({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const addMessage = useChatMessagesStore((s) => s.addMessage);

  const [openEdit, setOpenEdit] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [createItemType, setCreateItemType] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importType, setImportType] = useState("weapons");

  // Guardian - Dual Shieldbearer
  const hasDualShieldBearer = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.specialSkill === "Dual Shieldbearer" && skill.currentLvl === 1,
    ),
  );

  // Guardian - Defensive Mastery
  const defensiveMasteryBonus = player.classes
    .map((cls) => cls.skills)
    .flat()
    .filter((skill) => skill.specialSkill === "Defensive Mastery")
    .map((skill) => skill.currentLvl)
    .reduce((a, b) => a + b, 0);

  // Twin Shields object as described in the comments
  const twinShields = {
    base: {
      category: "Brawling",
      name: "Twin Shields",
      cost: 0,
      att1: "might",
      att2: "might",
      prec: 0,
      damage: 5,
      type: "physical",
      hands: 2,
      melee: true,
      martial: false,
    },
    name: "Twin Shields",
    category: "Brawling",
    melee: true,
    ranged: false,
    type: "physical",
    hands: 2,
    att1: "might",
    att2: "might",
    martial: false,
    damageBonus: false,
    damageReworkBonus: false,
    precBonus: false,
    rework: false,
    quality: t(
      "Deals extra damage equal to your【 **SL**】in **defensive mastery**.",
    ),
    qualityCost: "0",
    totalBonus: 0,
    selectedQuality: "",
    cost: 0,
    damage: 5 + defensiveMasteryBonus,
    prec: 0,
    damageModifier: 0,
    precModifier: 0,
    defModifier: 0,
    mDefModifier: 0,
    isEquipped: true,
  };

  // Retrieve equipped weapons, armor, shields, and accessories
  const inv = player.equipment?.[0];
  const equippedWeapons = inv?.weapons
    ? inv.weapons.filter((weapon) => isItemEquipped(player, weapon))
    : [];

  // Retrieve equipped custom weapons
  const equippedCustomWeapons = inv?.customWeapons
    ? inv.customWeapons.filter((weapon) => isItemEquipped(player, weapon))
    : [];

  const equippedArmor = inv?.armor
    ? inv.armor.filter((armor) => isItemEquipped(player, armor))
    : [];

  const equippedShields = inv?.shields
    ? inv.shields.filter((shield) => isItemEquipped(player, shield))
    : [];

  const equippedAccessories = inv?.accessories
    ? inv.accessories.filter((accessory) => isItemEquipped(player, accessory))
    : [];

  // In edit mode we show full inventory so newly imported items appear immediately.
  const visibleWeapons = isEditMode ? (inv?.weapons ?? []) : equippedWeapons;
  const visibleCustomWeapons = isEditMode
    ? (inv?.customWeapons ?? [])
    : equippedCustomWeapons;
  const visibleArmor = isEditMode ? (inv?.armor ?? []) : equippedArmor;
  const visibleShields = isEditMode ? (inv?.shields ?? []) : equippedShields;
  const visibleAccessories = isEditMode
    ? (inv?.accessories ?? [])
    : equippedAccessories;

  // Find all pilot-vehicle spells
  // const pilotSpells = (player.classes || [])
  //   .flatMap((c) => c.spells || [])
  //   .filter(
  //     (spell) =>
  //       spell &&
  //       spell.spellType === "pilot-vehicle" &&
  //       (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
  //   );

  // Find the enabled vehicle
  // const activeVehicle = pilotSpells
  //   .flatMap((s) => s.vehicles || [])
  //   .find((v) => v.enabled);

  // const equippedModules = activeVehicle?.modules
  //   ? activeVehicle.modules.filter((m) => m.equipped)
  //   : [];

  // const hasArmorModule = equippedModules.some(
  //   (m) => m.type === "pilot_module_armor"
  // );
  // const hasWeaponModule = equippedModules.some(
  //   (m) => m.type === "pilot_module_weapon"
  // );

  // Helper function to format custom weapon for display
  const formatCustomWeaponForDisplay = (customWeapon) => {
    const isTransforming = customWeapon.customizations?.some(
      (c) => c.name === "weapon_customization_transforming",
    );

    const isSecondaryForm = customWeapon.activeForm === "secondary";

    const baseData = {
      ...customWeapon,
      isCustomWeapon: true,
      isTransforming: isTransforming,
      hands: 2, // Custom weapons are always two-handed
      originalData: customWeapon, // Preserve original reference
    };

    if (isSecondaryForm) {
      return {
        ...baseData,
        name:
          customWeapon.secondWeaponName ||
          `${customWeapon.name} (Transforming)`,
        category:
          customWeapon.secondSelectedCategory || "weapon_category_brawling",
        range: customWeapon.secondSelectedRange || "weapon_range_melee",
        accuracy: customWeapon.secondAccuracy ?? customWeapon.accuracy,
        damage: customWeapon.secondDamage ?? customWeapon.damage,
        customizations: customWeapon.secondCurrentCustomizations || [],
        quality: customWeapon.secondQuality || "",
        qualityCost: customWeapon.secondQualityCost || 0,
        isSecondaryForm: true,
        melee:
          (customWeapon.secondSelectedRange || "weapon_range_melee") ===
          "weapon_range_melee",
        ranged:
          (customWeapon.secondSelectedRange || "weapon_range_melee") ===
          "weapon_range_ranged",
      };
    }

    return {
      ...baseData,
      category: customWeapon.category || "weapon_category_brawling",
      melee:
        (customWeapon.range || "weapon_range_melee") === "weapon_range_melee",
      ranged:
        (customWeapon.range || "weapon_range_melee") === "weapon_range_ranged",
    };
  };

  // Combine regular weapons and custom weapons
  const allVisibleWeapons = [
    ...visibleWeapons,
    // Add custom weapons with proper formatting (showing only active form)
    ...visibleCustomWeapons.map((customWeapon) =>
      formatCustomWeaponForDisplay(customWeapon),
    ),
  ];

  // Add Twin Shields to equipped weapons if the player has Dual Shieldbearer and 2 shields equipped
  if (!isEditMode && hasDualShieldBearer && equippedShields.length >= 2) {
    allVisibleWeapons.push(twinShields);
  }
  const equippedCustomWeaponsDisplay = allVisibleWeapons.filter(
    (w) => w.isCustomWeapon,
  );
  const equippedBaseWeaponsDisplay = allVisibleWeapons.filter(
    (w) => !w.isCustomWeapon,
  );

  // Weaponmaster - Melee Weapon Mastery Skill Bonus
  const meleeMasteryModifier = player.classes
    .map((cls) => cls.skills)
    .flat()
    .filter((skill) => skill.specialSkill === "Melee Weapon Mastery")
    .map((skill) => skill.currentLvl)
    .reduce((a, b) => a + b, 0);

  // Sharpshooter - Ranged Weapon Mastery Skill Bonus
  const rangedMasteryModifier = player.classes
    .map((cls) => cls.skills)
    .flat()
    .filter((skill) => skill.specialSkill === "Ranged Weapon Mastery")
    .map((skill) => skill.currentLvl)
    .reduce((a, b) => a + b, 0);

  const precMeleeModifier =
    (player.modifiers?.meleePrec || 0) +
    (equippedArmor.length > 0
      ? (equippedArmor[0].modifiers?.accuracy ?? 0)
      : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.modifiers?.accuracy ?? 0),
      0,
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.modifiers?.accuracy ?? 0),
      0,
    ) +
    meleeMasteryModifier;

  const precRangedModifier =
    (player.modifiers?.rangedPrec || 0) +
    (equippedArmor.length > 0
      ? (equippedArmor[0].modifiers?.accuracy ?? 0)
      : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.modifiers?.accuracy ?? 0),
      0,
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.modifiers?.accuracy ?? 0),
      0,
    ) +
    rangedMasteryModifier;

  const damageMeleeModifier =
    (equippedArmor.length > 0 ? equippedArmor[0].damageMeleeModifier || 0 : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.damageMeleeModifier || 0),
      0,
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.damageMeleeModifier || 0),
      0,
    );

  const damageRangedModifier =
    (equippedArmor.length > 0
      ? equippedArmor[0].damageRangedModifier || 0
      : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.damageRangedModifier || 0),
      0,
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.damageRangedModifier || 0),
      0,
    );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might?.base,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower?.base,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  const attributeMap = {
    dexterity: currDex,
    insight: currInsight,
    might: currMight,
    will: currWillpower,
  };

  const handleSwapForm = (weapon) => {
    if (!setPlayer || !isEditMode) return;

    const customWeapon = weapon.originalData;
    if (!customWeapon) return;

    setPlayer((prevPlayer) => {
      const customWeapons = prevPlayer.equipment?.[0]?.customWeapons ?? [];
      const weaponIndex = customWeapons.findIndex((w) => w === customWeapon);
      if (weaponIndex === -1) return prevPlayer;
      const updated = customWeapons.map((cw, i) =>
        i === weaponIndex
          ? {
              ...cw,
              activeForm:
                cw.activeForm === "secondary" ? "primary" : "secondary",
            }
          : cw,
      );
      const equipment = [
        { ...prevPlayer.equipment[0], customWeapons: updated },
        ...(prevPlayer.equipment?.slice(1) ?? []),
      ];
      return { ...prevPlayer, equipment };
    });
  };

  const handleDiceRoll = (weapon) => {
    if (!weapon?.accuracy) return;
    const attr1 = weapon.accuracy?.attr1 || "dexterity";
    const attr2 = weapon.accuracy?.attr2 || "might";
    const dieSizes = {
      primary:
        player?.attributes?.[attr1]?.base ?? player?.attributes?.[attr1] ?? 6,
      secondary:
        player?.attributes?.[attr2]?.base ?? player?.attributes?.[attr2] ?? 6,
    };
    const toRollKey = (attr) => {
      const key = String(attr || "").toLowerCase();
      if (key.startsWith("dex")) return "dex";
      if (key.startsWith("ins")) return "ins";
      if (key.startsWith("mig")) return "mig";
      if (key.startsWith("wil") || key.startsWith("wlp")) return "wlp";
      return "dex";
    };

    const intent = prepareAccuracyCheck({
      attr1: toRollKey(attr1),
      attr2: toRollKey(attr2),
      accuracyBonus: weapon?.accuracy?.value ?? 0,
      name: weapon?.name || "Attack",
      description: weapon?.quality || undefined,
      baseDamage: weapon?.damage?.value ?? weapon?.damage ?? 0,
      damageType: weapon?.damage?.type ?? weapon?.type ?? "physical",
      accuracyDefense: weapon?.accuracy?.defense ?? "def",
      range: weapon?.range ?? (weapon?.melee ? "melee" : "ranged"),
      hrZero: weapon?.damage?.hrZero === true,
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

  const sendEquipmentToChat = (item, section) => {
    const tags = [t("Equipment"), t(section)];
    const sectionKey = String(section || "").toLowerCase();

    if (sectionKey === "armor" || sectionKey === "shield") {
      if (item?.def != null)
        tags.push(`DEF ${item.def >= 0 ? `+${item.def}` : item.def}`);
      if (item?.mdef != null)
        tags.push(`M.DEF ${item.mdef >= 0 ? `+${item.mdef}` : item.mdef}`);
    }

    if (
      sectionKey === "weapon" ||
      sectionKey === "weapons" ||
      sectionKey === "customweapon" ||
      sectionKey === "customweapons"
    ) {
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
      speaker: player?.name || "Player",
      kind: "display",
      itemType: "equipment",
      name: item?.name || t("Equipment"),
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

  const sectionMeta = {
    weapons: {
      label: t("Weapons"),
      create: "weapon",
      import: "weapons",
      source: "weapons",
    },
    customWeapons: {
      label: t("Custom Weapons"),
      create: "custom-weapon",
      import: "custom-weapons",
      source: "customWeapons",
    },
    shields: {
      label: t("Shields"),
      create: "shield",
      import: "shields",
      source: "shields",
    },
    armor: {
      label: t("Armor"),
      create: "armor",
      import: "armor",
      source: "armor",
    },
    accessories: {
      label: t("Accessories"),
      create: "accessory",
      import: "accessories",
      source: "accessories",
    },
  };

  const renderSectionHeader = (key) =>
    isEditMode ? (
      <Grid size={12}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Divider sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, textTransform: "uppercase" }}
            >
              {sectionMeta[key].label}
            </Typography>
          </Divider>
          <IconButton
            size="small"
            onClick={() => setCreateItemType(sectionMeta[key].create)}
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Add fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setImportType(sectionMeta[key].import);
              setImportOpen(true);
            }}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Search fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    ) : null;

  return (
    <>
      {(allVisibleWeapons.length > 0 ||
        visibleArmor.length > 0 ||
        isEditMode) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={
              isCharacterSheet
                ? {
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "none",
                  }
                : {
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: secondary,
                    display: "flex",
                  }
            }
          >
            {isCharacterSheet ? (
              <Box
                sx={{
                  backgroundColor: primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    textTransform: "uppercase",
                    padding: "5px", // Adjust padding instead of margins
                    color: custom.white,
                    fontSize: "1.5em",
                  }}
                  align="center"
                >
                  {t("Equipment")}
                </Typography>
                {isEditMode && (
                  <IconButton
                    size="small"
                    onClick={() => setOpenEdit(true)}
                    sx={{ position: "absolute", right: 8, color: custom.white }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ) : (
              <Typography
                variant="h1"
                sx={{
                  writingMode: "vertical-lr",
                  textTransform: "uppercase",
                  marginLeft: "-1px",
                  marginRight: "10px",
                  marginTop: "-1px",
                  marginBottom: "-1px",
                  paddingY: "10px",
                  backgroundColor: primary,
                  color: custom.white,
                  borderRadius: "0 8px 8px 0",
                  transform: "rotate(180deg)",
                  fontSize: "2em",
                }}
                align="center"
              >
                {t("Equipment")}
              </Typography>
            )}
            <Grid
              container
              spacing={1}
              sx={{ padding: "1em", flex: 1, width: "100%" }}
            >
              {renderSectionHeader("weapons")}
              {equippedBaseWeaponsDisplay.map((weapon, index) => (
                <Grid
                  container
                  spacing={0}
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    maxHeight: "40px",
                  }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Grid sx={{ display: "flex" }} size="grow">
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: primary,
                        padding: "5px",
                        paddingLeft: "10px",
                        color: "#fff",
                        borderRadius: "8px 0 0 8px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {weapon.name}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "stretch" }}
                    size="auto"
                  >
                    <Box
                      sx={{
                        padding: "5px",
                        backgroundColor: theme.palette.ternary?.main || "#999",
                        borderRadius: "0 8px 8px 0",
                        marginRight: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 0.5,
                      }}
                    >
                      {weapon.isTransforming && isEditMode && (
                        <Tooltip title={t("weapon_customization_swap_form")}>
                          <IconButton
                            size="small"
                            onClick={() => handleSwapForm(weapon)}
                            sx={{ p: 0.5 }}
                          >
                            <SwapHoriz fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t("Info")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(weapon);
                            setInfoModalOpen(true);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Send to chat")}>
                        <IconButton
                          size="small"
                          onClick={() => sendEquipmentToChat(weapon, "Weapons")}
                          sx={{ p: 0.5 }}
                        >
                          <ChatOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Roll")}>
                        <IconButton
                          size="small"
                          onClick={() => handleDiceRoll(weapon)}
                          sx={{ p: 0.5 }}
                        >
                          <Casino fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              ))}
              {renderSectionHeader("customWeapons")}
              {equippedCustomWeaponsDisplay.map((weapon, index) => (
                <Grid
                  container
                  spacing={0}
                  key={`custom-weapon-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    maxHeight: "40px",
                  }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Grid sx={{ display: "flex" }} size="grow">
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: primary,
                        padding: "5px",
                        paddingLeft: "10px",
                        color: "#fff",
                        borderRadius: "8px 0 0 8px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {weapon.name}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "stretch" }}
                    size="auto"
                  >
                    <Box
                      sx={{
                        padding: "5px",
                        backgroundColor: theme.palette.ternary?.main || "#999",
                        borderRadius: "0 8px 8px 0",
                        marginRight: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 0.5,
                      }}
                    >
                      {weapon.isTransforming && isEditMode && (
                        <Tooltip title={t("weapon_customization_swap_form")}>
                          <IconButton
                            size="small"
                            onClick={() => handleSwapForm(weapon)}
                            sx={{ p: 0.5 }}
                          >
                            <SwapHoriz fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t("Info")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(weapon);
                            setInfoModalOpen(true);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Send to chat")}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            sendEquipmentToChat(weapon, "CustomWeapons")
                          }
                          sx={{ p: 0.5 }}
                        >
                          <ChatOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Roll")}>
                        <IconButton
                          size="small"
                          onClick={() => handleDiceRoll(weapon)}
                          sx={{ p: 0.5 }}
                        >
                          <Casino fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              ))}
              {renderSectionHeader("armor")}
              {visibleArmor.map((armor, index) => (
                <Grid
                  container
                  spacing={0}
                  key={`armor-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    maxHeight: "40px",
                  }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Grid sx={{ display: "flex" }} size="grow">
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: primary,
                        padding: "5px",
                        paddingLeft: "10px",
                        color: "#fff",
                        borderRadius: "8px 0 0 8px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {armor.name}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "stretch" }}
                    size="auto"
                  >
                    <Box
                      sx={{
                        padding: "5px",
                        backgroundColor: theme.palette.ternary?.main || "#999",
                        borderRadius: "0 8px 8px 0",
                        marginRight: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Tooltip title={t("Info")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(armor);
                            setInfoModalOpen(true);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Send to chat")}>
                        <IconButton
                          size="small"
                          onClick={() => sendEquipmentToChat(armor, "Armor")}
                          sx={{ p: 0.5 }}
                        >
                          <ChatOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              ))}
              {renderSectionHeader("shields")}
              {visibleShields.map((shield, index) => (
                <Grid
                  container
                  spacing={0}
                  key={`shield-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    maxHeight: "40px",
                  }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Grid sx={{ display: "flex" }} size="grow">
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: primary,
                        padding: "5px",
                        paddingLeft: "10px",
                        color: "#fff",
                        borderRadius: "8px 0 0 8px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {shield.name}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "stretch" }}
                    size="auto"
                  >
                    <Box
                      sx={{
                        padding: "5px",
                        backgroundColor: theme.palette.ternary?.main || "#999",
                        borderRadius: "0 8px 8px 0",
                        marginRight: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Tooltip title={t("Info")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(shield);
                            setInfoModalOpen(true);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Send to chat")}>
                        <IconButton
                          size="small"
                          onClick={() => sendEquipmentToChat(shield, "Shield")}
                          sx={{ p: 0.5 }}
                        >
                          <ChatOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              ))}
              {renderSectionHeader("accessories")}
              {visibleAccessories.map((accessory, index) => (
                <Grid
                  container
                  spacing={0}
                  key={`accessory-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    maxHeight: "40px",
                  }}
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Grid sx={{ display: "flex" }} size="grow">
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: primary,
                        padding: "5px",
                        paddingLeft: "10px",
                        color: "#fff",
                        borderRadius: "8px 0 0 8px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {accessory.name}
                    </Typography>
                  </Grid>
                  <Grid
                    sx={{ display: "flex", alignItems: "stretch" }}
                    size="auto"
                  >
                    <Box
                      sx={{
                        padding: "5px",
                        backgroundColor: theme.palette.ternary?.main || "#999",
                        borderRadius: "0 8px 8px 0",
                        marginRight: "15px",
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Tooltip title={t("Info")}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(accessory);
                            setInfoModalOpen(true);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Send to chat")}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            sendEquipmentToChat(accessory, "Accessory")
                          }
                          sx={{ p: 0.5 }}
                        >
                          <ChatOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              ))}
              {(precMeleeModifier !== 0 ||
                precRangedModifier !== 0 ||
                damageMeleeModifier !== 0 ||
                damageRangedModifier !== 0) && (
                <Grid size={12}>
                  <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                    {t("Modifiers")}
                  </Typography>
                  {precMeleeModifier !== 0 && (
                    <Typography variant="h4">
                      {t("Melee Accuracy Bonus")}: {precMeleeModifier}
                    </Typography>
                  )}
                  {precRangedModifier !== 0 && (
                    <Typography variant="h4">
                      {t("Ranged Accuracy Bonus")}: {precRangedModifier}
                    </Typography>
                  )}
                  {damageMeleeModifier !== 0 && (
                    <Typography variant="h4">
                      {t("Melee Damage Bonus")}: {damageMeleeModifier}
                    </Typography>
                  )}
                  {damageRangedModifier !== 0 && (
                    <Typography variant="h4">
                      {t("Ranged Damage Bonus")}: {damageRangedModifier}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      )}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 0 }}>
          <EditPlayerEquipment
            player={player}
            setPlayer={setPlayer}
            isEditMode={true}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEdit(false)}
            variant="contained"
            color="primary"
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
      <CompendiumViewerModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onAddItem={(item, type) => {
          if (type === "weapons") appendEquipmentItem("weapons", item);
          if (type === "custom-weapons")
            appendEquipmentItem("customWeapons", item);
          if (type === "shields") appendEquipmentItem("shields", item);
          if (type === "armor") appendEquipmentItem("armor", item);
          if (type === "accessories") appendEquipmentItem("accessories", item);
          setImportOpen(false);
        }}
        initialType={importType}
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
      <Dialog
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedItem && (
            <>
              {selectedItem.isCustomWeapon ? (
                <SharedCustomWeaponCard item={selectedItem} />
              ) : allVisibleWeapons.includes(selectedItem) ? (
                <SharedWeaponCard item={selectedItem} />
              ) : visibleArmor.includes(selectedItem) ? (
                <SharedArmorCard item={selectedItem} />
              ) : visibleShields.includes(selectedItem) ? (
                <SharedShieldCard item={selectedItem} />
              ) : visibleAccessories.includes(selectedItem) ? (
                <SharedAccessoryCard item={selectedItem} />
              ) : null}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInfoModalOpen(false)}
            variant="contained"
            color="primary"
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
