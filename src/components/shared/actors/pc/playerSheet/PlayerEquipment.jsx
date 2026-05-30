import React, { useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Box,
  Card,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../../translation/translate";
import SectionCard from "../../common/SectionCard";
import {
  Casino,
  SwapHoriz,
  Edit,
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
} from "../../../items";
// import { OpenBracket, CloseBracket } from "../../Bracket";
// import types from "../../../../../libs/types";
import { isItemEquipped } from "../../../../../libs/player/slots/equipmentSlots";
import { EditPlayerEquipment } from "/src/components/shared/actors/pc/editors";
import CompendiumViewerModal from "../../../../compendium/CompendiumViewerModal";
import ActorEditModal from "../../../../../forms/ui/ActorEditModal";
import { useChatMessagesStore } from "../../../../../store/chatMessagesStore";
import {
  buildAccuracyCheckMessage,
  prepareAccuracyCheck,
  processAccuracyCheck,
  rollAccuracyCheck,
} from "../../../../app-drawer/panels/chat/domain/accuracy-checks";
import { PlayerWeaponModal } from "/src/components/shared/actors/pc/editors";
import { PlayerCustomWeaponModal } from "/src/components/shared/actors/pc/editors";
import { PlayerShieldModal } from "/src/components/shared/actors/pc/editors";
import { PlayerArmorModal } from "/src/components/shared/actors/pc/editors";
import { PlayerAccessoryModal } from "/src/components/shared/actors/pc/editors";

export default function PlayerEquipment({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
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
      hands: weapon?.hands,
      category: weapon?.category,
      range: weapon?.range ?? (weapon?.melee ? "melee" : "ranged"),
      damageHrZero: weapon?.damage?.hrZero === true,
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
    const signed = (value) => `${value >= 0 ? "+" : ""}${value}`;

    if (sectionKey === "armor" || sectionKey === "shield") {
      if (item?.def != null)
        tags.push(`DEF ${signed(item.def)}`);
      if (item?.mdef != null)
        tags.push(`M.DEF ${signed(item.mdef)}`);
      if ((item?.init ?? 0) > 0)
        tags.push(`INIT ${signed(item.init)}`);
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 40,
            px: 1,
            py: 0.5,
            borderRadius: "8px",
            bgcolor: primary,
            gap: 1,
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontFamily: "Antonio",
              fontWeight: 800,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              textTransform: "uppercase",
              lineHeight: 1.2,
              letterSpacing: "0.04em",
            }}
          >
            {sectionMeta[key].label}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setCreateItemType(sectionMeta[key].create)}
            sx={{
              p: "4px",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "4px",
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
              p: "4px",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "4px",
            }}
          >
            <Search fontSize="small" />
          </IconButton>
          </Box>
        </Box>
      </Grid>
    ) : null;

  return (
    <>
      {(allVisibleWeapons.length > 0 ||
        visibleArmor.length > 0 ||
        isEditMode) && (
        <>
          <SectionCard
            title={t("Equipment")}
            noShadow={isCharacterSheet}
            actions={
              isEditMode && (
                <IconButton
                  size="small"
                  onClick={() => setOpenEdit(true)}
                  sx={{ p: 0.5, color: "#fff" }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )
            }
          >
            <Grid
              container
              spacing={1}
              sx={{ p: 0.75, flex: 1, width: "100%" }}
            >
              {renderSectionHeader("weapons")}
              {equippedBaseWeaponsDisplay.map((weapon, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44 }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography
                        onClick={() => { setSelectedItem(weapon); setInfoModalOpen(true); }}
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: 800,
                          fontSize: { xs: "0.9rem", sm: "0.95rem" },
                          textTransform: "uppercase",
                          flex: 1,
                          px: 1,
                          color: "text.primary",
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {weapon.name}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: primary,
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "stretch",
                          px: 1,
                          gap: 0.25,
                        }}
                      >
                        {weapon.isTransforming && isEditMode && (
                          <Tooltip title={t("weapon_customization_swap_form")}>
                            <IconButton
                              size="small"
                              onClick={() => handleSwapForm(weapon)}
                              sx={{ p: 0.5, color: "#fff" }}
                            >
                              <SwapHoriz fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t("Roll")}>
                          <IconButton
                            size="small"
                            onClick={() => handleDiceRoll(weapon)}
                            sx={{ p: 0.5, color: "#fff" }}
                          >
                            <Casino fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {renderSectionHeader("customWeapons")}
              {equippedCustomWeaponsDisplay.map((weapon, index) => (
                <Grid key={`custom-weapon-${index}`} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44 }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography
                        onClick={() => { setSelectedItem(weapon); setInfoModalOpen(true); }}
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: 800,
                          fontSize: { xs: "0.9rem", sm: "0.95rem" },
                          textTransform: "uppercase",
                          flex: 1,
                          px: 1,
                          color: "text.primary",
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {weapon.name}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: primary,
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "stretch",
                          px: 1,
                          gap: 0.25,
                        }}
                      >
                        {weapon.isTransforming && isEditMode && (
                          <Tooltip title={t("weapon_customization_swap_form")}>
                            <IconButton
                              size="small"
                              onClick={() => handleSwapForm(weapon)}
                              sx={{ p: 0.5, color: "#fff" }}
                            >
                              <SwapHoriz fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t("Roll")}>
                          <IconButton
                            size="small"
                            onClick={() => handleDiceRoll(weapon)}
                            sx={{ p: 0.5, color: "#fff" }}
                          >
                            <Casino fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {renderSectionHeader("armor")}
              {visibleArmor.map((armor, index) => (
                <Grid key={`armor-${index}`} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44 }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography
                        onClick={() => { setSelectedItem(armor); setInfoModalOpen(true); }}
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: 800,
                          fontSize: { xs: "0.9rem", sm: "0.95rem" },
                          textTransform: "uppercase",
                          flex: 1,
                          px: 1,
                          color: "text.primary",
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {armor.name}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: primary,
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "stretch",
                          px: 1,
                          gap: 0.25,
                        }}
                      >
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            size="small"
                            onClick={() => sendEquipmentToChat(armor, "Armor")}
                            sx={{ p: 0.5, color: "#fff" }}
                          >
                            <ChatOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {renderSectionHeader("shields")}
              {visibleShields.map((shield, index) => (
                <Grid key={`shield-${index}`} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44 }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography
                        onClick={() => { setSelectedItem(shield); setInfoModalOpen(true); }}
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: 800,
                          fontSize: { xs: "0.9rem", sm: "0.95rem" },
                          textTransform: "uppercase",
                          flex: 1,
                          px: 1,
                          color: "text.primary",
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {shield.name}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: primary,
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "stretch",
                          px: 1,
                          gap: 0.25,
                        }}
                      >
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            size="small"
                            onClick={() => sendEquipmentToChat(shield, "Shield")}
                            sx={{ p: 0.5, color: "#fff" }}
                          >
                            <ChatOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {renderSectionHeader("accessories")}
              {visibleAccessories.map((accessory, index) => (
                <Grid key={`accessory-${index}`} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44 }}>
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                      <Typography
                        onClick={() => { setSelectedItem(accessory); setInfoModalOpen(true); }}
                        sx={{
                          fontFamily: "Antonio",
                          fontWeight: 800,
                          fontSize: { xs: "0.9rem", sm: "0.95rem" },
                          textTransform: "uppercase",
                          flex: 1,
                          px: 1,
                          color: "text.primary",
                          cursor: "pointer",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {accessory.name}
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: primary,
                          display: "flex",
                          alignItems: "center",
                          alignSelf: "stretch",
                          px: 1,
                          gap: 0.25,
                        }}
                      >
                        <Tooltip title={t("Send to chat")}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              sendEquipmentToChat(accessory, "Accessory")
                            }
                            sx={{ p: 0.5, color: "#fff" }}
                          >
                            <ChatOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {[
                { label: t("Melee Accuracy Bonus"), value: precMeleeModifier },
                { label: t("Ranged Accuracy Bonus"), value: precRangedModifier },
                { label: t("Melee Damage Bonus"), value: damageMeleeModifier },
                { label: t("Ranged Damage Bonus"), value: damageRangedModifier },
              ]
                .filter(({ value }) => value !== 0)
                .map(({ label, value }) => (
                  <Grid key={label} size={{ xs: 12, sm: 6 }}>
                    <Card sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44 }}>
                      <Box sx={{ display: "flex", alignItems: "stretch", width: "100%" }}>
                        <Typography
                          sx={{
                            fontFamily: "Antonio",
                            fontWeight: 800,
                            fontSize: { xs: "0.82rem", sm: "0.88rem" },
                            textTransform: "uppercase",
                            flex: 1,
                            px: 1,
                            display: "flex",
                            alignItems: "center",
                            color: "text.primary",
                          }}
                        >
                          {label}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: primary,
                            display: "flex",
                            alignItems: "center",
                            alignSelf: "stretch",
                            px: 1,
                            minWidth: 48,
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#fff",
                              fontFamily: "Antonio",
                              fontWeight: 800,
                              fontSize: { xs: "0.82rem", sm: "0.88rem" },
                            }}
                          >
                            {value > 0 ? `+${value}` : value}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </SectionCard>
        </>
      )}
      <ActorEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title={t("Equipment")}
        maxWidth="lg"
        actions={
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => setOpenEdit(false)}
              variant="contained"
              color="primary"
            >
              {t("Close")}
            </Button>
          </Box>
        }
      >
        <Box sx={{ mx: -3, mt: -2.5 }}>
          <EditPlayerEquipment
            player={player}
            setPlayer={setPlayer}
            isEditMode={true}
          />
        </Box>
      </ActorEditModal>
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
