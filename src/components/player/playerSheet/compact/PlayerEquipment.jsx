import React, { useState } from "react";
import {
  Grid, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Collapse,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip,
  Badge, Menu, MenuItem
} from "@mui/material";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import { Martial, MeleeIcon, ArmorIcon, ShieldIcon, AccessoryIcon } from "../../../icons";
import Diamond from "../../../Diamond";
import ReactMarkdown from "react-markdown";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import types from "../../../../libs/types";
import attributes from "../../../../libs/attributes";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { Casino, RadioButtonUnchecked, Error, SwapHoriz, Edit, Add, Search as SearchIcon } from "@mui/icons-material";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import { calculateAttribute, calculateCustomWeaponStats } from "../../common/playerCalculations";
import { isItemEquipped, validateSlots, deriveVehicleSlots } from "../../equipment/slots/equipmentSlots";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerEquipment({
  player,
  setPlayer,
  isMainTab,
  isEditMode,
  searchQuery = '',
  onAddWeapon,
  onEditWeapon,
  onAddCustomWeapon,
  onEditCustomWeapon,
  onAddArmor,
  onEditArmor,
  onAddShield,
  onEditShield,
  onAddAccessory,
  onEditAccessory,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [dialogMessage, setDialogMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSeverity, setDialogSeverity] = useState("info");
  const [currentWeapon, setCurrentWeapon] = useState(null);
  const [compendiumType, setCompendiumType] = useState(null);

  // Guardian - Dual Shieldbearer
  const hasDualShieldBearer = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.specialSkill === "Dual Shieldbearer" && skill.currentLvl === 1
    )
  );

  const getSkillLevel = (player, skillName) =>
    player.classes.flatMap(cls => cls.skills)
      .filter(skill => skill.specialSkill === skillName)
      .reduce((acc, skill) => acc + skill.currentLvl, 0);

  // Guardian - Defensive Mastery
  const defensiveMasteryBonus = getSkillLevel(player, "Defensive Mastery");

  // Weaponmaster - Melee Weapon Mastery Skill Bonus
  const meleeMasteryModifier = getSkillLevel(player, "Melee Weapon Mastery");

  // Sharpshooter - Ranged Weapon Mastery Skill Bonus
  const rangedMasteryModifier = getSkillLevel(player, "Ranged Weapon Mastery");

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
    quality:
      t("Deals extra damage equal to your【 **SL**】in **defensive mastery**."),
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

  // Retrieve equipped custom weapons and format them for display
  const equippedCustomWeapons = inv?.customWeapons
    ? inv.customWeapons.filter((weapon) => isItemEquipped(player, weapon))
    : [];

  // Function to format custom weapons for display
  const formatCustomWeapon = (customWeapon, forceSecondaryForm = null) => {
    const isTransforming = customWeapon.customizations?.some(
      (c) => c.name === "weapon_customization_transforming"
    );
    
    const isSecondaryForm = forceSecondaryForm !== null 
      ? forceSecondaryForm 
      : customWeapon.activeForm === "secondary";

    const weaponName = isSecondaryForm
      ? customWeapon.secondWeaponName || `${customWeapon.name} (Transforming)`
      : customWeapon.name;

    // Calculate weapon stats using shared utility
    const stats = calculateCustomWeaponStats(customWeapon, isSecondaryForm);
    const accuracyCheck = isSecondaryForm ? customWeapon.secondSelectedAccuracyCheck : customWeapon.accuracyCheck;
    const damageType = isSecondaryForm ? customWeapon.secondSelectedType : customWeapon.type;
    const category = isSecondaryForm ? customWeapon.secondSelectedCategory : customWeapon.category;
    const quality = isSecondaryForm ? customWeapon.secondQuality : customWeapon.quality;

    // Check if martial
    const martialCustomizations = [
      'weapon_customization_quick',
      'weapon_customization_magicdefenseboost',
      'weapon_customization_powerful'
    ];
    const customizations = isSecondaryForm ? customWeapon.secondCurrentCustomizations || [] : customWeapon.customizations || [];
    const isMartial = customizations.some(c => martialCustomizations.includes(c.name));

    return {
      name: weaponName,
      cost: customWeapon.cost || 300,
      category: category,
      att1: accuracyCheck?.att1 || "dexterity",
      att2: accuracyCheck?.att2 || "might",
      prec: stats.precision,
      damage: stats.damage,
      type: damageType || "physical",
      hands: 2, // Custom weapons are always two-handed
      melee: (isSecondaryForm ? customWeapon.secondSelectedRange : customWeapon.range) === "weapon_range_melee",
      ranged: (isSecondaryForm ? customWeapon.secondSelectedRange : customWeapon.range) === "weapon_range_ranged",
      martial: isMartial,
      quality: quality || "",
      isEquipped: customWeapon.isEquipped,
      isCustomWeapon: true,
      isTransforming: isTransforming,
      isSecondaryForm: isSecondaryForm,
      originalData: customWeapon
    };
  };

  // Format equipped custom weapons for display
  const formattedCustomWeapons = equippedCustomWeapons.map(cw => formatCustomWeapon(cw));

  const equippedArmor = inv?.armor
    ? inv.armor.filter((armor) => isItemEquipped(player, armor))
    : [];

  const equippedShields = inv?.shields
    ? inv.shields.filter((shield) => isItemEquipped(player, shield))
    : [];

  const equippedAccessories = inv?.accessories
    ? inv.accessories.filter((accessory) => isItemEquipped(player, accessory))
    : [];

  // Combine regular weapons and custom weapons
  const allEquippedWeapons = [...equippedWeapons];

  // Add Twin Shields to equipped weapons if the player has Dual Shieldbearer and 2 shields equipped
  if (hasDualShieldBearer && equippedShields.length >= 2) {
    allEquippedWeapons.push(twinShields);
  }

  const precMeleeModifier =
    (player.modifiers?.meleePrec || 0) +
    (equippedArmor.length > 0 ? equippedArmor[0].precModifier || 0 : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.precModifier || 0),
      0
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.precModifier || 0),
      0
    ) +
    meleeMasteryModifier;

  const precRangedModifier =
    (player.modifiers?.rangedPrec || 0) +
    (equippedArmor.length > 0 ? equippedArmor[0].precModifier || 0 : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.precModifier || 0),
      0
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.precModifier || 0),
      0
    ) +
    rangedMasteryModifier;

  const damageMeleeModifier =
    (equippedArmor.length > 0 ? equippedArmor[0].damageMeleeModifier || 0 : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.damageMeleeModifier || 0),
      0
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.damageMeleeModifier || 0),
      0
    );

  const damageRangedModifier =
    (equippedArmor.length > 0
      ? equippedArmor[0].damageRangedModifier || 0
      : 0) +
    equippedShields.reduce(
      (total, shield) => total + (shield.damageRangedModifier || 0),
      0
    ) +
    equippedAccessories.reduce(
      (total, accessory) => total + (accessory.damageRangedModifier || 0),
      0
    );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12
  );

  const attributeMap = {
    dexterity: currDex,
    insight: currInsight,
    might: currMight,
    will: currWillpower,
  };

  // --- Equip helpers (mirrors EditPlayerEquipment) ---
  const patchInv = (p, source, updater) => {
    const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
    const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
    return { ...p, equipment };
  };

  const preserveSlots = (p) => {
    const validated = validateSlots(p);
    return { ...validated, vehicleSlots: deriveVehicleSlots(validated) };
  };

  const equipToSlot = (source, itemName, slot, isTwoHand) => {
    let updated = player;
    const currentRef = updated.equippedSlots?.[slot];
    if (currentRef) {
      updated = patchInv(updated, currentRef.source, arr =>
        arr.map(it => it.name === currentRef.name ? { ...it, isEquipped: false } : it)
      );
    }
    if (isTwoHand && slot === 'mainHand') {
      const offRef = updated.equippedSlots?.offHand;
      if (offRef) {
        updated = patchInv(updated, offRef.source, arr =>
          arr.map(it => it.name === offRef.name ? { ...it, isEquipped: false } : it)
        );
      }
    }
    updated = patchInv(updated, source, arr =>
      arr.map(it => it.name === itemName ? { ...it, isEquipped: true } : it)
    );
    const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
    setPlayer({
      ...updated,
      equippedSlots: {
        ...prevSlots,
        [slot]: { source, name: itemName },
        ...(isTwoHand && slot === 'mainHand' ? { offHand: null } : {}),
      },
      vehicleSlots: deriveVehicleSlots(updated),
    });
  };

  const unequipItem = (source, itemName) => {
    const slots = player.equippedSlots ?? {};
    const slotKey = Object.keys(slots).find(k => {
      const ref = slots[k];
      return ref?.source === source && ref?.name === itemName;
    });
    let updated = patchInv(player, source, arr =>
      arr.map(it => it.name === itemName ? { ...it, isEquipped: false } : it)
    );
    if (slotKey) {
      const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
      setPlayer({
        ...updated,
        equippedSlots: { ...prevSlots, [slotKey]: null },
        vehicleSlots: deriveVehicleSlots(updated),
      });
    } else {
      setPlayer(preserveSlots(updated));
    }
  };

  // Slot menu state for 1H weapons and shields
  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuWeapon, setSlotMenuWeapon] = useState(null);
  const [shieldMenuAnchor, setShieldMenuAnchor] = useState(null);
  const [shieldMenuName, setShieldMenuName] = useState(null);

  const handleWeaponSlotSelect = (slot) => {
    if (slotMenuWeapon) equipToSlot('weapons', slotMenuWeapon, slot, false);
    setSlotMenuAnchor(null);
    setSlotMenuWeapon(null);
  };

  const handleShieldSlotSelect = (slot) => {
    if (shieldMenuName) equipToSlot('shields', shieldMenuName, slot, false);
    setShieldMenuAnchor(null);
    setShieldMenuName(null);
  };

  const handleEquipment = (item, event) => {
    if (!setPlayer || !isEditMode) return;

    if (item.isCustomWeapon) {
      const cw = item.originalData;
      if (cw.isEquipped) {
        unequipItem('customWeapons', cw.name);
      } else {
        equipToSlot('customWeapons', cw.name, 'mainHand', true);
      }
      return;
    }

    const invItem = (() => {
      const eq0 = player.equipment?.[0];
      if (item.category === 'Shield') return eq0?.shields?.find(s => s === item || s.name === item.name);
      if (item.category === 'Armor') return eq0?.armor?.find(a => a === item || a.name === item.name);
      if (!item.category || item.melee !== undefined || item.ranged !== undefined) return eq0?.weapons?.find(w => w === item || w.name === item.name);
      return eq0?.accessories?.find(a => a === item || a.name === item.name);
    })();

    if (!invItem && item.category !== 'Accessory') {
      // fallback for accessories that don't have category
      const eq0 = player.equipment?.[0];
      const acc = eq0?.accessories?.find(a => a === item || a.name === item.name);
      if (acc) {
        if (acc.isEquipped) {
          unequipItem('accessories', acc.name);
        } else {
          equipToSlot('accessories', acc.name, 'accessory', false);
        }
      }
      return;
    }

    if (!invItem) return;

    if (item.category === 'Armor') {
      if (invItem.isEquipped) {
        unequipItem('armor', invItem.name);
      } else {
        equipToSlot('armor', invItem.name, 'armor', false);
      }
    } else if (item.category === 'Shield') {
      if (invItem.isEquipped) {
        unequipItem('shields', invItem.name);
      } else if (hasDualShieldBearer && event) {
        setShieldMenuAnchor({ top: event.clientY, left: event.clientX });
        setShieldMenuName(invItem.name);
      } else {
        equipToSlot('shields', invItem.name, 'offHand', false);
      }
    } else if (item.category === 'Accessory' || (!item.melee && !item.ranged && !item.hands)) {
      if (invItem.isEquipped) {
        unequipItem('accessories', invItem.name);
      } else {
        equipToSlot('accessories', invItem.name, 'accessory', false);
      }
    } else {
      // Regular weapon
      const isTwoHand = invItem.hands === 2 || invItem.isTwoHand;
      if (invItem.isEquipped) {
        unequipItem('weapons', invItem.name);
      } else if (isTwoHand) {
        equipToSlot('weapons', invItem.name, 'mainHand', true);
      } else if (event) {
        setSlotMenuAnchor({ top: event.clientY, left: event.clientX });
        setSlotMenuWeapon(invItem.name);
      } else {
        // fallback: pick first free slot
        const slots = player.equippedSlots ?? {};
        const slot = !slots.mainHand ? 'mainHand' : !slots.offHand ? 'offHand' : null;
        if (slot) equipToSlot('weapons', invItem.name, slot, false);
      }
    }
  };

  const handleSwapForm = (item) => {
    if (!setPlayer || !isEditMode) return;
    
    const customWeapon = item.originalData;
    setPlayer(prevPlayer => {
      const updatedCustomWeapons = [...(prevPlayer.customWeapons || [])];
      const weaponIndex = updatedCustomWeapons.findIndex(w => w === customWeapon);
      if (weaponIndex !== -1) {
        const cw = updatedCustomWeapons[weaponIndex];
        const newForm = cw.activeForm === "secondary" ? "primary" : "secondary";
        updatedCustomWeapons[weaponIndex] = { ...cw, activeForm: newForm };
        return { ...prevPlayer, customWeapons: updatedCustomWeapons };
      }
      return prevPlayer;
    });
  };

  const handleDiceRoll = (weapon) => {
    setCurrentWeapon(weapon);

    const att1 = weapon.att1;
    const att2 = weapon.att2;
    let att1Value = attributeMap[att1];
    let att2Value = attributeMap[att2];

    const weaponPrec = weapon.prec;
    const meleeModifier = precMeleeModifier;
    const rangedModifier = precRangedModifier;

    const meleeDmgModifier = damageMeleeModifier;
    const rangedDmgModifier = damageRangedModifier;

    const die1 = Math.floor(Math.random() * att1Value) + 1;
    const die2 = Math.floor(Math.random() * att2Value) + 1;

    // Check for critical failure
    const isCriticalFailure = die1 === 1 && die2 === 1;
    // Check for critical success
    const isCriticalSuccess = die1 >= 6 && die2 >= 6 && die1 === die2;

    const result =
      die1 +
      die2 +
      weaponPrec +
      (weapon.melee ? meleeModifier : rangedModifier);

    const maxDie = Math.max(die1, die2);
    const damage = weapon.damage;

    const damageDealt =
      maxDie + damage + (weapon.melee ? meleeDmgModifier : rangedDmgModifier);

    const dialogContent = (
      <>
        <Grid container spacing={2} sx={{ textAlign: "center" }}>
          <Grid item container xs={6}>
            <Grid item xs={12}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                {t("Accuracy")}
              </Typography>
              <Typography variant="h1" sx={{ textAlign: "center" }}>
                {result}
              </Typography>
            </Grid>
          </Grid>
          <Grid item container xs={6}>
            <Grid item xs={12}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                {t("Damage")}
              </Typography>
              <Typography variant="h1" sx={{ textAlign: "center" }}>
                {damageDealt}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                {t(weapon.type)}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: "20px" }}>
            <Typography component="span">
              {` ${die1} [${attributes[att1].shortcaps}] + ${die2} [${attributes[att2].shortcaps
                }] ${weaponPrec !== 0 ? "+" + weaponPrec : ""} ${weapon.melee
                  ? meleeModifier !== 0
                    ? "+" + meleeModifier
                    : rangedModifier
                  : rangedModifier !== 0
                    ? "+" + rangedModifier
                    : ""
                }`}
            </Typography>
            <br />
            <Typography
              component="span"
              sx={{ fontWeight: "bold", textTransform: "uppercase" }}
            >
              {t("Damage")}:
            </Typography>
            <Typography component="span">
              {` ${maxDie} + ${damage}`}
              {weapon.melee
                ? meleeDmgModifier !== 0
                  ? " + " + meleeDmgModifier
                  : ""
                : rangedDmgModifier !== 0
                  ? " + " + rangedDmgModifier
                  : ""}
            </Typography>
          </Grid>
        </Grid>
      </>
    );

    // Add critical success/failure visualization
    if (isCriticalFailure) {
      setDialogSeverity("error");
      setDialogMessage(
        <>
          <Typography
            variant="h1"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            {t("Critical Failure")}!
            <br />
          </Typography>
          {dialogContent}
        </>
      );
    } else if (isCriticalSuccess) {
      setDialogSeverity("success");
      setDialogMessage(
        <>
          <Typography
            variant="h1"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            {t("Critical Success")}!
            <br />
          </Typography>
          {dialogContent}
        </>
      );
    } else {
      setDialogSeverity("info");
      setDialogMessage(dialogContent);
    }

    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Edit helpers — resolve item to inventory index and call parent callback
  const handleEditWeaponItem = (weapon) => {
    if (weapon.isCustomWeapon) {
      const idx = inv?.customWeapons?.indexOf(weapon.originalData) ?? -1;
      if (idx >= 0 && onEditCustomWeapon) onEditCustomWeapon(idx);
    } else {
      const idx = inv?.weapons?.indexOf(weapon) ?? -1;
      if (idx >= 0 && onEditWeapon) onEditWeapon(idx);
    }
  };
  const handleEditArmorOrShieldItem = (item) => {
    if (item.category === "Shield") {
      const idx = inv?.shields?.indexOf(item) ?? -1;
      if (idx >= 0 && onEditShield) onEditShield(idx);
    } else {
      const idx = inv?.armor?.indexOf(item) ?? -1;
      if (idx >= 0 && onEditArmor) onEditArmor(idx);
    }
  };
  const handleEditAccessoryItem = (accessory) => {
    const idx = inv?.accessories?.indexOf(accessory) ?? -1;
    if (idx >= 0 && onEditAccessory) onEditAccessory(idx);
  };

  const checkIfEquippable = (item) => {
    const { classes } = player;

    if (!item.martial) {
      return true;
    }

    for (const playerClass of classes) {
      const { benefits } = playerClass;

      if (benefits.martials) {
        if (
          (item.category === 'Weapon' || item.melee || item.ranged || item.isCustomWeapon) &&
          ((item.melee && benefits.martials.melee) || (item.ranged && benefits.martials.ranged))
        ) {
          return true;
        }
        if (item.category === 'Armor' && benefits.martials.armor) {
          return true;
        }
        if (item.category === 'Shield' && benefits.martials.shield) {
          return true;
        }
      }
    }
    return false;
  };

  const handleImportFromCompendium = (item, type) => {
    if (!setPlayer) return;
    const patchInv = (p, source, updater) => {
      const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
      const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
      return { ...p, equipment };
    };
    if (type === "weapons") {
      setPlayer(prev => patchInv(prev, 'weapons', arr => [...arr, {
        base: item, name: item.name, category: item.category || "",
        melee: item.melee || false, ranged: !item.melee, type: item.type,
        hands: item.hands, att1: item.att1, att2: item.att2,
        martial: item.martial || false, damageBonus: false,
        damageReworkBonus: false, precBonus: false, rework: false,
        quality: "", qualityCost: 0, totalBonus: 0, selectedQuality: "",
        cost: item.cost || 0, damage: item.damage || 0, prec: item.prec || 0,
        isEquipped: false,
      }]));
    } else if (type === "armor") {
      setPlayer(prev => patchInv(prev, 'armor', arr => [...arr, {
        base: item, name: item.name, quality: "",
        martial: item.martial || false, qualityCost: 0, selectedQuality: "",
        init: item.init || 0, rework: false, cost: item.cost || 0, isEquipped: false,
      }]));
    } else if (type === "shields") {
      setPlayer(prev => patchInv(prev, 'shields', arr => [...arr, {
        base: item, name: item.name, quality: "",
        martial: item.martial || false, qualityCost: 0, selectedQuality: "",
        init: item.init || 0, rework: false, cost: item.cost || 0, isEquipped: false,
      }]));
    } else if (type === "custom-weapons") {
      setPlayer(prev => patchInv(prev, 'customWeapons', arr => [...arr, { ...item, isEquipped: false }]));
    } else if (type === "accessories") {
      setPlayer(prev => patchInv(prev, 'accessories', arr => [...arr, { ...item, isEquipped: false }]));
    }
  };

  return (
    <>
      <Grid container spacing={0} sx={{ padding: 0 }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: theme.primary,
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textTransform: "uppercase",
                },
              }}
            >
              <StyledTableCellHeader sx={{ width: 36 }} />
              <StyledTableCellHeader>
                <Typography variant="h4">{t("Equipment")}</Typography>
              </StyledTableCellHeader>
            </TableRow>
          </TableHead>

        </Table>
        {!isMainTab && (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  p: 0.5,
                  background: `${theme.primary}`,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}>
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Weapon")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 80 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Accuracy")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 90 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Damage")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 100, textAlign: "right" }}>
                  {isEditMode && onAddWeapon && (
                    <Tooltip title={t("Add Weapon")}><IconButton size="small" onClick={onAddWeapon} sx={{ color: '#fff', p: 0 }}><Add fontSize="small" /></IconButton></Tooltip>
                  )}
                  {isEditMode && (
                    <Tooltip title={t("Search Weapons")}><IconButton size="small" onClick={() => setCompendiumType("weapons")} sx={{ color: '#fff', p: 0 }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                  )}
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
          </Table>
        )}
        {allEquippedWeapons.length > 0 && (
          <CollapsibleWeapon
            weapons={allEquippedWeapons}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditWeaponItem}
            equippedSlots={player.equippedSlots}
          />
        )}
        {!isMainTab && (
          <AllWeapon
            weapons={[
              ...(inv?.weapons?.filter(w => !isItemEquipped(player, w)) || []),
            ]}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            checkIfEquippable={checkIfEquippable}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditWeaponItem}
          />
        )}
        {!isMainTab && (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  p: 0.5,
                  background: `${theme.primary}`,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}>
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Custom Weapon")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 80 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Accuracy")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 90 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Damage")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 100, textAlign: "right" }}>
                  {isEditMode && onAddCustomWeapon && (
                    <Tooltip title={t("Add Custom Weapon")}><IconButton size="small" onClick={onAddCustomWeapon} sx={{ color: '#fff', p: 0 }}><Add fontSize="small" /></IconButton></Tooltip>
                  )}
                  {isEditMode && (
                    <Tooltip title={t("Search Custom Weapons")}><IconButton size="small" onClick={() => setCompendiumType("custom-weapons")} sx={{ color: '#fff', p: 0 }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                  )}
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
          </Table>
        )}
        {formattedCustomWeapons.length > 0 && (
          <CollapsibleWeapon
            weapons={formattedCustomWeapons}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            handleSwapForm={handleSwapForm}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditWeaponItem}
            equippedSlots={player.equippedSlots}
          />
        )}
        {!isMainTab && (
          <AllWeapon
            weapons={[
              ...((inv?.customWeapons?.filter(w => !isItemEquipped(player, w)) || []).map(cw => formatCustomWeapon(cw)))
            ]}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            handleSwapForm={handleSwapForm}
            checkIfEquippable={checkIfEquippable}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditWeaponItem}
          />
        )}
        {!isMainTab && (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  p: 0.5,
                  background: `${theme.primary}`,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}>
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Shield")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 80 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 90 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("M. Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 100, textAlign: "right" }}>
                  {isEditMode && onAddShield && (
                    <Tooltip title={t("Add Shield")}><IconButton size="small" onClick={onAddShield} sx={{ color: '#fff', p: 0 }}><Add fontSize="small" /></IconButton></Tooltip>
                  )}
                  {isEditMode && (
                    <Tooltip title={t("Search Shields")}><IconButton size="small" onClick={() => setCompendiumType("shields")} sx={{ color: '#fff', p: 0 }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                  )}
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
          </Table>
        )}
        {equippedShields.length > 0 && (
          <CollapsibleArmor armors={equippedShields} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} isEditMode={isEditMode} onEdit={handleEditArmorOrShieldItem} equippedSlots={player.equippedSlots} />
        )}
        {!isMainTab && (
          <AllArmor
            armors={inv?.shields?.filter(s => !isItemEquipped(player, s)) || []}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            checkIfEquippable={checkIfEquippable}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditArmorOrShieldItem}
          />
        )}
        {!isMainTab && (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  p: 0.5,
                  background: `${theme.primary}`,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}>
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Armor")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 80 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 90 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("M. Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 100, textAlign: "right" }}>
                  {isEditMode && onAddArmor && (
                    <Tooltip title={t("Add Armor")}><IconButton size="small" onClick={onAddArmor} sx={{ color: '#fff', p: 0 }}><Add fontSize="small" /></IconButton></Tooltip>
                  )}
                  {isEditMode && (
                    <Tooltip title={t("Search Armor")}><IconButton size="small" onClick={() => setCompendiumType("armor")} sx={{ color: '#fff', p: 0 }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                  )}
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
          </Table>
        )}
        {equippedArmor.length > 0 && (
          <CollapsibleArmor armors={equippedArmor} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} isEditMode={isEditMode} onEdit={handleEditArmorOrShieldItem} equippedSlots={player.equippedSlots} />
        )}
        {!isMainTab && (
          <AllArmor
            armors={inv?.armor?.filter(a => !isItemEquipped(player, a)) || []}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            checkIfEquippable={checkIfEquippable}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditArmorOrShieldItem}
          />
        )}
        {!isMainTab && (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  p: 0.5,
                  background: `${theme.primary}`,
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    textTransform: "uppercase",
                  },
                }}>
                <StyledTableCellHeader sx={{ width: 36 }} />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Accessory")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 80 }}>
                  <Typography variant="h4" textAlign="center">
                    {t("Cost")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader sx={{ width: 90 }} />
                <StyledTableCellHeader sx={{ width: 100, textAlign: "right" }}>
                  {isEditMode && onAddAccessory && (
                    <Tooltip title={t("Add Accessory")}><IconButton size="small" onClick={onAddAccessory} sx={{ color: '#fff', p: 0 }}><Add fontSize="small" /></IconButton></Tooltip>
                  )}
                  {isEditMode && (
                    <Tooltip title={t("Search Accessories")}><IconButton size="small" onClick={() => setCompendiumType("accessories")} sx={{ color: '#fff', p: 0 }}><SearchIcon fontSize="small" /></IconButton></Tooltip>
                  )}
                </StyledTableCellHeader>
              </TableRow>
            </TableHead>
          </Table>
        )}
        {equippedAccessories.length > 0 && (
          <CollapsibleAccessory accessorys={equippedAccessories} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} isEditMode={isEditMode} onEdit={handleEditAccessoryItem} equippedSlots={player.equippedSlots} />
        )}
        {!isMainTab && (
          <AllAccessory
            accessorys={inv?.accessories?.filter(ac => !isItemEquipped(player, ac)) || []}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
            isEditMode={isEditMode}
            onEdit={handleEditAccessoryItem}
          />
        )}
        {!isMainTab && (
          (precMeleeModifier !== 0 ||
            precRangedModifier !== 0 ||
            damageMeleeModifier !== 0 ||
            damageRangedModifier !== 0) && (
            <Grid item xs={12} sx={{ p: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {t("Modifiers")}
              </Typography>
              {precMeleeModifier !== 0 && (
                <Typography variant="h6">
                  {t("Melee Accuracy Bonus")}: {precMeleeModifier}
                </Typography>
              )}
              {precRangedModifier !== 0 && (
                <Typography variant="h6">
                  {t("Ranged Accuracy Bonus")}: {precRangedModifier}
                </Typography>
              )}
              {damageMeleeModifier !== 0 && (
                <Typography variant="h6">
                  {t("Melee Damage Bonus")}: {damageMeleeModifier}
                </Typography>
              )}
              {damageRangedModifier !== 0 && (
                <Typography variant="h6">
                  {t("Ranged Damage Bonus")}: {damageRangedModifier}
                </Typography>
              )}
            </Grid>
          )
        )}
      </Grid>
      {/* Slot selection menu for 1H weapons */}
      <Menu
        open={Boolean(slotMenuAnchor)}
        onClose={() => { setSlotMenuAnchor(null); setSlotMenuWeapon(null); }}
        anchorReference="anchorPosition"
        anchorPosition={slotMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => handleWeaponSlotSelect('mainHand')}>{t("Main Hand")}</MenuItem>
        <MenuItem onClick={() => handleWeaponSlotSelect('offHand')}>{t("Off Hand")}</MenuItem>
      </Menu>
      {/* Slot selection menu for shields (dual shieldbearer) */}
      <Menu
        open={Boolean(shieldMenuAnchor)}
        onClose={() => { setShieldMenuAnchor(null); setShieldMenuName(null); }}
        anchorReference="anchorPosition"
        anchorPosition={shieldMenuAnchor ?? undefined}
      >
        <MenuItem onClick={() => handleShieldSlotSelect('mainHand')}>{t("Main Hand")}</MenuItem>
        <MenuItem onClick={() => handleShieldSlotSelect('offHand')}>{t("Off Hand")}</MenuItem>
      </Menu>
      <CompendiumViewerModal
        open={compendiumType !== null}
        onClose={() => setCompendiumType(null)}
        onAddItem={handleImportFromCompendium}
        initialType={compendiumType ?? "weapons"}
        restrictToTypes={compendiumType ? [compendiumType] : undefined}
        context="player"
      />
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { width: { xs: "90%", md: "30%" } } }}
      >
        <DialogTitle
          id="alert-dialog-title"
          variant="h3"
          sx={{
            backgroundColor:
              dialogSeverity === "error"
                ? "#bb2124"
                : dialogSeverity === "success"
                  ? "#22bb33"
                  : "#aaaaaa",
          }}
        >
          {t("Result")}
        </DialogTitle>
        <DialogContent sx={{ marginTop: "10px" }}>
          <DialogContent id="alert-dialog-description">
            {dialogMessage}
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            {t("Close")}
          </Button>
          <Button
            onClick={() => handleDiceRoll(currentWeapon)}
            color="primary"
            autoFocus
          >
            {t("Re-roll")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function highlightMatch(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'ig');
  const parts = text.split(regex);

  return parts.map((part, idx) =>
    regex.test(part) ? (
      <span key={idx} style={{ backgroundColor: 'yellow' }}>{part}</span>
    ) : (
      part
    )
  );
}

function CollapsibleWeapon({ weapons, handleEquipment, handleDiceRoll, handleSwapForm, isMainTab, searchQuery, isEditMode, onEdit, equippedSlots }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const getWeaponBadge = (weapon) => {
    const slots = equippedSlots ?? {};
    const source = weapon.isCustomWeapon ? 'customWeapons' : 'weapons';
    const name = weapon.isCustomWeapon ? weapon.originalData?.name : weapon.name;
    if (slots.mainHand?.source === source && slots.mainHand?.name === name) {
      const isTwoHand = weapon.hands === 2 || weapon.isTwoHand || weapon.isCustomWeapon;
      return isTwoHand ? 'M+O' : 'M';
    }
    if (slots.offHand?.source === source && slots.offHand?.name === name) return 'O';
    return null;
  };

  const toggleRow = (index) => {
    setOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const StyledTableCell = styled(TableCell)({
    padding: 0,
  })

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 0 }} spacing={0}>
      <Table spacing={0}>
        <TableBody>
          {weapons.map((weapon, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: 36, whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box onClick={() => toggleRow(index)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="left" sx={{ marginRight: "4px" }}>
                      {highlightMatch(t(weapon.name), searchQuery)}
                    </Typography>
                    {weapon.martial && <Martial />}
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <OpenBracket />
                    {`${attributes[weapon.att1].shortcaps} + ${attributes[weapon.att2].shortcaps
                      }`}
                    <CloseBracket />
                    {weapon.prec > 0
                      ? `+${weapon.prec}`
                      : weapon.prec < 0
                        ? `${weapon.prec}`
                        : ""}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <OpenBracket />
                    {t("HR")} {weapon.damage >= 0 ? "+" : ""} {weapon.damage}
                    <CloseBracket />
                    {types[weapon.type].long}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 100, textAlign: 'right', overflow: 'visible', pr: 1 }}>
                  {isEditMode && onEdit && (
                    <Tooltip title={t("Edit")} arrow>
                      <IconButton onClick={() => onEdit(weapon)} size="small" sx={{ p: 0.25 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Unequip")} arrow>
                    <Badge
                      badgeContent={getWeaponBadge(weapon)}
                      color="primary"
                      invisible={!getWeaponBadge(weapon)}
                      sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                    >
                      <IconButton onClick={(e) => handleEquipment(weapon, e)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                        <MeleeIcon />
                      </IconButton>
                    </Badge>
                  </Tooltip>
                  {weapon.isTransforming && (
                    <Tooltip title={t("weapon_customization_swap_form")} arrow>
                      <IconButton onClick={() => handleSwapForm(weapon)} size="small" sx={{ p: 0.25 }}>
                        <SwapHoriz />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Roll")} arrow>
                    <IconButton onClick={() => handleDiceRoll(weapon)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                      <Casino />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Typography sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontFamily: "PT Sans Narrow",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexWrap: 'wrap'
                              }}>
                                {`${weapon.cost}z`}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {t(weapon.category)}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {weapon.hands === 1 && t("One-handed")}
                                {weapon.hands === 2 && t("Two-handed")}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {weapon.melee && t("Melee")}
                                {weapon.ranged && t("Ranged")}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {weapon.isCustomWeapon && (
                                  <>
                                    {(weapon.isSecondaryForm ? weapon.originalData.secondCurrentCustomizations : weapon.originalData.customizations || []).map((c, i) => (
                                      <React.Fragment key={i}>
                                        {t(c.name)}
                                        <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                      </React.Fragment>
                                    ))}
                                  </>
                                )}
                                {weapon.quality && (
                                  <StyledMarkdown
                                    allowedElements={["strong"]}
                                    unwrapDisallowed={true}
                                  >
                                    {weapon.quality}
                                  </StyledMarkdown>
                                )}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Collapse>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function CollapsibleArmor({ armors, handleEquipment, isMainTab, searchQuery, isEditMode, onEdit, equippedSlots }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const getArmorBadge = (armor) => {
    if (armor.category === 'Shield') {
      const slots = equippedSlots ?? {};
      if (slots.mainHand?.source === 'shields' && slots.mainHand?.name === armor.name) return 'M';
      if (slots.offHand?.source === 'shields' && slots.offHand?.name === armor.name) return 'O';
      return null;
    }
    return 'E';
  };

  const toggleRow = (index) => {
    setOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const StyledTableCell = styled(TableCell)({
    padding: 0,
  })

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 0 }} spacing={0}>
      <Table spacing={0}>
        <TableBody>
          {armors.map((armor, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: 36, whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box onClick={() => toggleRow(index)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="left" sx={{ marginRight: "4px" }}>
                      {highlightMatch(t(armor.name), searchQuery)}
                    </Typography>
                    {armor.martial && <Martial />}
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <Box component="span" sx={{ mr: '4px' }}>{t("DEF")}:</Box>
                    <Box component="span">
                      {armor.category === "Shield"
                        ? "+" + parseInt(armor.def + (armor.defModifier || 0))
                        : ""}
                      {armor.category === "Armor" && armor.martial
                        ? armor.def + (armor.defModifier || 0)
                        : ""}
                      {armor.category === "Armor" && !armor.martial
                        ? armor.def + (armor.defModifier || 0) === 0
                          ? t("DEX die")
                          : `${t("DEX die")} + ${armor.def + (armor.defModifier || 0)
                          }`
                        : ""}
                    </Box>
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <Box component="span" sx={{ mr: '4px' }}>{t("M.DEF")}:</Box>
                    <Box component="span">
                      {armor.category === "Shield"
                        ? "+" + parseInt(armor.mdef + (armor.mDefModifier || 0))
                        : ""}
                      {armor.category === "Armor"
                        ? armor.mdef + (armor.mDefModifier || 0) === 0
                          ? t("INS die")
                          : `${t("INS die")} + ${armor.mdef + (armor.mDefModifier || 0)}`
                        : ""}
                    </Box>
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 100, textAlign: 'right', overflow: 'visible', pr: 1 }}>
                  {isEditMode && onEdit && (
                    <Tooltip title={t("Edit")} arrow>
                      <IconButton onClick={() => onEdit(armor)} size="small" sx={{ p: 0.25 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Unequip")} arrow>
                    <Badge
                      badgeContent={getArmorBadge(armor)}
                      color="primary"
                      invisible={!getArmorBadge(armor)}
                      sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                    >
                      <IconButton onClick={(e) => handleEquipment(armor, e)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                        {armor.category === "Armor" && <ArmorIcon />}
                        {armor.category === "Shield" && <ShieldIcon />}
                      </IconButton>
                    </Badge>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Typography sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontFamily: "PT Sans Narrow",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                                {`${armor.cost}z`}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {t("Initiative")}:
                                {!armor.rework && (
                                  (armor.category === "Armor" || armor.category === "Shield")
                                    ? (armor.init + (armor.initModifier || 0) === 0
                                      ? " 0"
                                      : (armor.init + (armor.initModifier || 0) > 0
                                        ? "+"
                                        : "") + parseInt(armor.init + (armor.initModifier || 0)))
                                    : ""
                                )}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {armor.quality && (
                                  <StyledMarkdown
                                    allowedElements={["strong"]}
                                    unwrapDisallowed={true}
                                  >
                                    {armor.quality}
                                  </StyledMarkdown>

                                )}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Collapse>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function CollapsibleAccessory({ accessorys, handleEquipment, isMainTab, searchQuery, isEditMode, onEdit, equippedSlots }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const toggleRow = (index) => {
    setOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const StyledTableCell = styled(TableCell)({
    padding: 0,
  })

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 0 }} spacing={0}>
      <Table spacing={0}>
        <TableBody>
          {accessorys.map((accessory, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: 36, whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box onClick={() => toggleRow(index)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="left" sx={{ marginRight: "4px" }}>
                      {highlightMatch(t(accessory.name), searchQuery)}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    {`${accessory.cost}z`}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }} />
                <StyledTableCell sx={{ width: 100, textAlign: 'right', overflow: 'visible', pr: 1 }}>
                  {isEditMode && onEdit && (
                    <Tooltip title={t("Edit")} arrow>
                      <IconButton onClick={() => onEdit(accessory)} size="small" sx={{ p: 0.25 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Unequip")} arrow>
                    <Badge badgeContent="E" color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}>
                      <IconButton onClick={(e) => handleEquipment(accessory, e)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                        <AccessoryIcon />
                      </IconButton>
                    </Badge>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Typography sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontFamily: "PT Sans Narrow",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                                {accessory.quality && (
                                  <StyledMarkdown
                                    allowedElements={["strong"]}
                                    unwrapDisallowed={true}
                                  >
                                    {accessory.quality}
                                  </StyledMarkdown>
                                )}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Collapse>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AllWeapon({ weapons, handleEquipment, handleDiceRoll, handleSwapForm, checkIfEquippable, isMainTab, searchQuery, isEditMode, onEdit }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const toggleRow = (index) => {
    setOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const StyledTableCell = styled(TableCell)({
    padding: 0,
  })
  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 0 }} spacing={0}>
      <Table spacing={0}>
        <TableBody>
          {weapons.map((weapon, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: 36, whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box onClick={() => toggleRow(index)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="left" sx={{ marginRight: "4px" }}>
                      {highlightMatch(t(weapon.name), searchQuery)}
                    </Typography>
                    {weapon.martial && <Martial />}
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <OpenBracket />
                    {`${attributes[weapon.att1].shortcaps} + ${attributes[weapon.att2].shortcaps
                      }`}
                    <CloseBracket />
                    {weapon.prec > 0
                      ? `+${weapon.prec}`
                      : weapon.prec < 0
                        ? `${weapon.prec}`
                        : ""}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <OpenBracket />
                    {t("HR")} {weapon.damage >= 0 ? "+" : ""} {weapon.damage}
                    <CloseBracket />
                    {types[weapon.type].long}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 100, textAlign: 'right' }}>
                  {isEditMode && onEdit && (
                    <Tooltip title={t("Edit")} arrow>
                      <IconButton onClick={() => onEdit(weapon)} size="small" sx={{ p: 0.25 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {checkIfEquippable(weapon) ? (
                    <Tooltip title={t("Equip")} arrow>
                      <IconButton onClick={(e) => handleEquipment(weapon, e)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                        <RadioButtonUnchecked />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("Not Equippable")}>
                      <IconButton sx={{ p: 0.25 }}>
                        <Error color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {weapon.isTransforming && (
                    <Tooltip title={t("weapon_customization_swap_form")} arrow>
                      <IconButton onClick={() => handleSwapForm(weapon)} size="small" sx={{ p: 0.25 }}>
                        <SwapHoriz />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Roll")} arrow>
                    <IconButton onClick={() => handleDiceRoll(weapon)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                      <Casino />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Typography sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontFamily: "PT Sans Narrow",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexWrap: 'wrap'
                              }}>
                                {`${weapon.cost}z`}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {t(weapon.category)}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {weapon.hands === 1 && t("One-handed")}
                                {weapon.hands === 2 && t("Two-handed")}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {weapon.melee && t("Melee")}
                                {weapon.ranged && t("Ranged")}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {weapon.isCustomWeapon && (
                                  <>
                                    {(weapon.isSecondaryForm ? weapon.originalData.secondCurrentCustomizations : weapon.originalData.customizations || []).map((c, i) => (
                                      <React.Fragment key={i}>
                                        {t(c.name)}
                                        <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                      </React.Fragment>
                                    ))}
                                  </>
                                )}
                                {weapon.quality && (
                                  <StyledMarkdown
                                    allowedElements={["strong"]}
                                    unwrapDisallowed={true}
                                  >
                                    {weapon.quality}
                                  </StyledMarkdown>
                                )}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Collapse>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AllArmor({ armors, handleEquipment, checkIfEquippable, isMainTab, searchQuery, isEditMode, onEdit }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  if (!Array.isArray(armors)) return null;

  const toggleRow = (index) => {
    setOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const StyledTableCell = styled(TableCell)({
    padding: 0,
  })

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 0 }} spacing={0}>
      <Table spacing={0}>
        <TableBody>
          {armors.map((armor, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: 36, whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box onClick={() => toggleRow(index)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="left" sx={{ marginRight: "4px" }}>
                      {highlightMatch(t(armor.name), searchQuery)}
                    </Typography>
                    {armor.martial && <Martial />}
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <Box component="span" sx={{ mr: '4px' }}>{t("DEF")}:</Box>
                    <Box component="span">
                      {armor.category === "Shield"
                        ? "+" + parseInt(armor.def + (armor.defModifier || 0))
                        : ""}
                      {armor.category === "Armor" && armor.martial
                        ? armor.def + (armor.defModifier || 0)
                        : ""}
                      {armor.category === "Armor" && !armor.martial
                        ? armor.def + (armor.defModifier || 0) === 0
                          ? t("DEX die")
                          : `${t("DEX die")} + ${armor.def + (armor.defModifier || 0)
                          }`
                        : ""}
                    </Box>
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <Box component="span" sx={{ mr: '4px' }}>{t("M.DEF")}:</Box>
                    <Box component="span">
                      {armor.category === "Shield"
                        ? "+" + parseInt(armor.mdef + (armor.mDefModifier || 0))
                        : ""}
                      {armor.category === "Armor"
                        ? armor.mdef + (armor.mDefModifier || 0) === 0
                          ? t("INS die")
                          : `${t("INS die")} + ${armor.mdef + (armor.mDefModifier || 0)}`
                        : ""}
                    </Box>
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 100, textAlign: 'right' }}>
                  {isEditMode && onEdit && (
                    <Tooltip title={t("Edit")} arrow>
                      <IconButton onClick={() => onEdit(armor)} size="small" sx={{ p: 0.25 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {checkIfEquippable(armor) ? (
                    <Tooltip title={t("Equip")} arrow>
                      <IconButton
                        onClick={(e) => handleEquipment(armor, e)}
                        aria-label="equip"
                        size="small"
                        sx={{ p: 0.25 }}
                      >
                        <RadioButtonUnchecked />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("Not Equippable")}>
                      <IconButton sx={{ p: 0.25 }}>
                        <Error color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Typography sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontFamily: "PT Sans Narrow",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                                {`${armor.cost}z`}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {t("Initiative")}:
                                {!armor.rework && (
                                  (armor.category === "Armor" || armor.category === "Shield")
                                    ? (armor.init + (armor.initModifier || 0) === 0
                                      ? " 0"
                                      : (armor.init + (armor.initModifier || 0) > 0
                                        ? "+"
                                        : "") + parseInt(armor.init + (armor.initModifier || 0)))
                                    : ""
                                )}
                                <Diamond color={theme.primary} sx={{ mx: 1 }} />
                                {armor.quality && (
                                  <StyledMarkdown
                                    allowedElements={["strong"]}
                                    unwrapDisallowed={true}
                                  >
                                    {armor.quality}
                                  </StyledMarkdown>

                                )}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Collapse>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function AllAccessory({ accessorys, handleEquipment, handleDiceRoll, isMainTab, searchQuery, isEditMode, onEdit }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const toggleRow = (index) => {
    setOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const StyledTableCell = styled(TableCell)({
    padding: 0,
  })

  const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div
        style={{
          whiteSpace: "pre-line",
          display: "inline",
          margin: 0,
          padding: 1,
        }}
      >
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ padding: 0 }} spacing={0}>
      <Table spacing={0}>
        <TableBody>
          {accessorys.map((accessory, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: 36, whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Box onClick={() => toggleRow(index)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="body2" fontWeight="bold" textAlign="left" sx={{ marginRight: "4px" }}>
                      {highlightMatch(t(accessory.name), searchQuery)}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 80 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    {`${accessory.cost}z`}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }} />
                <StyledTableCell sx={{ width: 100, textAlign: 'right' }}>
                  {isEditMode && onEdit && (
                    <Tooltip title={t("Edit")} arrow>
                      <IconButton onClick={() => onEdit(accessory)} size="small" sx={{ p: 0.25 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Equip")} arrow>
                    <IconButton onClick={(e) => handleEquipment(accessory, e)} aria-label="expand row" size="small" sx={{ p: 0.25 }}>
                      <RadioButtonUnchecked />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={open[index]} timeout="auto" unmountOnExit>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <StyledTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Typography sx={{
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                fontFamily: "PT Sans Narrow",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                                {accessory.quality && (
                                  <StyledMarkdown
                                    allowedElements={["strong"]}
                                    unwrapDisallowed={true}
                                  >
                                    {accessory.quality}
                                  </StyledMarkdown>
                                )}
                              </Typography>
                            </Box>
                          </StyledTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Collapse>
                </StyledTableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}