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
import { Casino, RadioButtonUnchecked, RadioButtonChecked, SwapHoriz, Edit, Add, Search as SearchIcon } from "@mui/icons-material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
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
  const [martialWarning, setMartialWarning] = useState(null); // { item, event }

  // Guardian: Dual Shieldbearer
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

  // Guardian: Defensive Mastery
  const defensiveMasteryBonus = getSkillLevel(player, "Defensive Mastery");

  // Weaponmaster: Melee Weapon Mastery Skill Bonus
  const meleeMasteryModifier = getSkillLevel(player, "Melee Weapon Mastery");

  // Sharpshooter: Ranged Weapon Mastery Skill Bonus
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

  // Equip helpers (mirrors EditPlayerEquipment)
  const patchInv = (p, source, updater) => {
    const eq0 = { ...(p.equipment?.[0] ?? {}), [source]: updater(p.equipment?.[0]?.[source] ?? []) };
    const equipment = p.equipment ? [eq0, ...p.equipment.slice(1)] : [eq0];
    return { ...p, equipment };
  };

  const preserveSlots = (p) => {
    const validated = validateSlots(p);
    return { ...validated, vehicleSlots: deriveVehicleSlots(validated) };
  };

  const equipToSlot = (source, itemName, itemIndex, slot, isTwoHand) => {
    // Block off-hand equip when main hand holds a two-handed or custom weapon
    if (slot === 'offHand') {
      const mainRef = player.equippedSlots?.mainHand;
      if (mainRef) {
        if (mainRef.source === 'customWeapons') return;
        const inv0 = player.equipment?.[0];
        const mainWeapon = inv0?.weapons?.find(w => w.name === mainRef.name);
        if (mainWeapon?.hands === 2 || mainWeapon?.isTwoHand) return;
      }
    }
    const unequipRef = (p, ref) => {
      if (!ref) return p;
      return patchInv(p, ref.source, arr =>
        arr.map((it, idx) => {
          const match = ref.index !== undefined ? idx === ref.index : it.name === ref.name;
          return match ? { ...it, isEquipped: false } : it;
        })
      );
    };
    let updated = unequipRef(player, player.equippedSlots?.[slot]);
    if (isTwoHand && slot === 'mainHand') {
      updated = unequipRef(updated, updated.equippedSlots?.offHand);
    }
    updated = patchInv(updated, source, arr =>
      arr.map((it, idx) => {
        const match = itemIndex !== undefined ? idx === itemIndex : it.name === itemName;
        return match ? { ...it, isEquipped: true } : it;
      })
    );
    const prevSlots = updated.equippedSlots ?? { mainHand: null, offHand: null, armor: null, accessory: null };
    setPlayer({
      ...updated,
      equippedSlots: {
        ...prevSlots,
        [slot]: { source, name: itemName, index: itemIndex },
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
    const slotRef = slotKey ? slots[slotKey] : null;
    let updated = patchInv(player, source, arr =>
      arr.map((it, idx) => {
        const match = slotRef?.index !== undefined ? idx === slotRef.index : it.name === itemName;
        return match ? { ...it, isEquipped: false } : it;
      })
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

  // Slot menu state for 1H weapons and shields : stores { name, index }
  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuWeapon, setSlotMenuWeapon] = useState(null);
  const [shieldMenuAnchor, setShieldMenuAnchor] = useState(null);
  const [shieldMenuItem, setShieldMenuItem] = useState(null);

  const handleWeaponSlotSelect = (slot) => {
    if (slotMenuWeapon) equipToSlot('weapons', slotMenuWeapon.name, slotMenuWeapon.index, slot, false);
    setSlotMenuAnchor(null);
    setSlotMenuWeapon(null);
  };

  const handleShieldSlotSelect = (slot) => {
    if (shieldMenuItem) equipToSlot('shields', shieldMenuItem.name, shieldMenuItem.index, slot, false);
    setShieldMenuAnchor(null);
    setShieldMenuItem(null);
  };

  const handleEquipment = (item, event) => {
    if (!setPlayer || !isEditMode) return;

    const eq0 = player.equipment?.[0];

    if (item.isCustomWeapon) {
      const cw = item.originalData;
      const cwIndex = eq0?.customWeapons?.findIndex(w => w === cw) ?? -1;
      if (cw.isEquipped) {
        unequipItem('customWeapons', cw.name);
      } else {
        equipToSlot('customWeapons', cw.name, cwIndex >= 0 ? cwIndex : undefined, 'mainHand', true);
      }
      return;
    }

    const findWithIndex = (arr, pred) => {
      const idx = arr ? arr.findIndex(pred) : -1;
      return idx >= 0 ? { item: arr[idx], index: idx } : { item: null, index: undefined };
    };

    // Locate by identity/name in each source array : do NOT rely on item.category
    // because compendium-imported items may be missing it.
    const pred = it => it === item || it.name === item.name;
    const shieldResult    = findWithIndex(eq0?.shields,     pred);
    const armorResult     = findWithIndex(eq0?.armor,       pred);
    const weaponResult    = findWithIndex(eq0?.weapons,     pred);
    const accessoryResult = findWithIndex(eq0?.accessories, pred);

    if (shieldResult.item) {
      const { item: invItem, index: invItemIndex } = shieldResult;
      if (invItem.isEquipped) {
        unequipItem('shields', invItem.name);
      } else if (hasDualShieldBearer && event) {
        setShieldMenuAnchor({ top: event.clientY, left: event.clientX });
        setShieldMenuItem({ name: invItem.name, index: invItemIndex });
      } else {
        equipToSlot('shields', invItem.name, invItemIndex, 'offHand', false);
      }
    } else if (armorResult.item) {
      const { item: invItem, index: invItemIndex } = armorResult;
      if (invItem.isEquipped) {
        unequipItem('armor', invItem.name);
      } else {
        equipToSlot('armor', invItem.name, invItemIndex, 'armor', false);
      }
    } else if (weaponResult.item) {
      const { item: invItem, index: invItemIndex } = weaponResult;
      const isTwoHand = invItem.hands === 2 || invItem.isTwoHand;
      if (invItem.isEquipped) {
        unequipItem('weapons', invItem.name);
      } else if (isTwoHand) {
        equipToSlot('weapons', invItem.name, invItemIndex, 'mainHand', true);
      } else if (event) {
        setSlotMenuAnchor({ top: event.clientY, left: event.clientX });
        setSlotMenuWeapon({ name: invItem.name, index: invItemIndex });
      } else {
        const slots = player.equippedSlots ?? {};
        const slot = !slots.mainHand ? 'mainHand' : !slots.offHand ? 'offHand' : null;
        if (slot) equipToSlot('weapons', invItem.name, invItemIndex, slot, false);
      }
    } else if (accessoryResult.item) {
      const { item: invItem, index: invItemIndex } = accessoryResult;
      if (invItem.isEquipped) {
        unequipItem('accessories', invItem.name);
      } else {
        equipToSlot('accessories', invItem.name, invItemIndex, 'accessory', false);
      }
    }
  };

  /**
   * Wrapper around handleEquipment that shows a warning dialog when the player
   * is not proficient with a martial item before equipping it.
   * Pass this instead of handleEquipment to AllWeapon/AllArmor.
   */
  const handleEquipmentGuarded = (item, event) => {
    // Only intercept equip actions, not unequip (isEquipped check)
    const isCurrentlyEquipped = item.isEquipped ?? false;
    if (!isCurrentlyEquipped && !checkIfEquippable(item)) {
      setMartialWarning({ item, event });
      return;
    }
    handleEquipment(item, event);
  };

  const handleSwapForm = (item) => {
    if (!setPlayer || !isEditMode) return;

    const customWeapon = item.originalData;
    if (!customWeapon) return;

    setPlayer(prevPlayer => {
      const customWeapons = prevPlayer.equipment?.[0]?.customWeapons ?? [];
      const weaponIndex = customWeapons.findIndex(w => w === customWeapon);
      if (weaponIndex === -1) return prevPlayer;
      const updated = customWeapons.map((cw, i) =>
        i === weaponIndex ? { ...cw, activeForm: cw.activeForm === 'secondary' ? 'primary' : 'secondary' } : cw
      );
      const equipment = [
        { ...prevPlayer.equipment[0], customWeapons: updated },
        ...(prevPlayer.equipment?.slice(1) ?? []),
      ];
      return { ...prevPlayer, equipment };
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

  // Edit helpers : resolve item to inventory index and call parent callback
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
        category: "Armor",
        martial: item.martial || false, qualityCost: 0, selectedQuality: "",
        def: item.def || item.defbonus || 0, mdef: item.mdef || item.mdefbonus || 0,
        init: item.init || 0, rework: false, cost: item.cost || 0, isEquipped: false,
      }]));
    } else if (type === "shields") {
      setPlayer(prev => patchInv(prev, 'shields', arr => [...arr, {
        base: item, name: item.name, quality: "",
        category: "Shield",
        martial: item.martial || false, qualityCost: 0, selectedQuality: "",
        def: item.def || item.defbonus || 0, mdef: item.mdef || item.mdefbonus || 0,
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
        {isMainTab && allEquippedWeapons.length > 0 && (
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
              ...(inv?.weapons || []),
            ]}
            handleEquipment={handleEquipmentGuarded}
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
        {isMainTab && formattedCustomWeapons.length > 0 && (
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
              ...((inv?.customWeapons || []).map(cw => formatCustomWeapon(cw)))
            ]}
            handleEquipment={handleEquipmentGuarded}
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
        {isMainTab && equippedShields.length > 0 && (
          <CollapsibleArmor armors={equippedShields} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} isEditMode={isEditMode} onEdit={handleEditArmorOrShieldItem} equippedSlots={player.equippedSlots} />
        )}
        {!isMainTab && (
          <AllArmor
            armors={inv?.shields || []}
            handleEquipment={handleEquipmentGuarded}
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
        {isMainTab && equippedArmor.length > 0 && (
          <CollapsibleArmor armors={equippedArmor} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} isEditMode={isEditMode} onEdit={handleEditArmorOrShieldItem} equippedSlots={player.equippedSlots} />
        )}
        {!isMainTab && (
          <AllArmor
            armors={inv?.armor || []}
            handleEquipment={handleEquipmentGuarded}
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
        {isMainTab && equippedAccessories.length > 0 && (
          <CollapsibleAccessory accessorys={equippedAccessories} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} isEditMode={isEditMode} onEdit={handleEditAccessoryItem} equippedSlots={player.equippedSlots} />
        )}
        {!isMainTab && (
          <AllAccessory
            accessorys={inv?.accessories || []}
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
        onClose={() => { setShieldMenuAnchor(null); setShieldMenuItem(null); }}
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
      {/* Martial proficiency warning */}
      {martialWarning && (
        <Dialog open onClose={() => setMartialWarning(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <WarningAmberIcon fontSize="small" />
            {t('Not Proficient')}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <strong>{martialWarning.item?.name}</strong> {t('is a martial item and your character is not proficient with it.')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('Equipping it without proficiency may be against the rules. Equip anyway?')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMartialWarning(null)} size="small">{t('Cancel')}</Button>
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={() => {
                handleEquipment(martialWarning.item, martialWarning.event);
                setMartialWarning(null);
              }}
            >
              {t('Equip Anyway')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
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
                <StyledTableCell sx={{ width: 100, textAlign: 'right', overflow: 'visible' }}>
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

// Resolve defense values with fallbacks for old compendium imports that used
// base.defbonus / base.mdefbonus instead of base.def / base.mdef.
const resolveArmorDef  = (armor) => armor.def  || 0;
const resolveArmorMdef = (armor) => armor.mdef || 0;
// Resolve category from the item or its base, falling back to "Armor".
const resolveArmorCategory = (armor) => armor.category || armor.base?.category || "Armor";

function CollapsibleArmor({ armors, handleEquipment, isMainTab, searchQuery, isEditMode, onEdit, equippedSlots }) {
  const [open, setOpen] = useState({});
  const { t } = useTranslate();
  const theme = useCustomTheme();

  const getArmorBadge = (armor) => {
    if (resolveArmorCategory(armor) === 'Shield') {
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
                      {resolveArmorCategory(armor) === "Shield"
                        ? "+" + parseInt(resolveArmorDef(armor) + (armor.defModifier || 0))
                        : ""}
                      {resolveArmorCategory(armor) === "Armor" && armor.martial
                        ? resolveArmorDef(armor) + (armor.defModifier || 0)
                        : ""}
                      {resolveArmorCategory(armor) === "Armor" && !armor.martial
                        ? resolveArmorDef(armor) + (armor.defModifier || 0) === 0
                          ? t("DEX die")
                          : `${t("DEX die")} + ${resolveArmorDef(armor) + (armor.defModifier || 0)}`
                        : ""}
                    </Box>
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <Box component="span" sx={{ mr: '4px' }}>{t("M.DEF")}:</Box>
                    <Box component="span">
                      {resolveArmorCategory(armor) === "Shield"
                        ? "+" + parseInt(resolveArmorMdef(armor) + (armor.mDefModifier || 0))
                        : ""}
                      {resolveArmorCategory(armor) === "Armor"
                        ? resolveArmorMdef(armor) + (armor.mDefModifier || 0) === 0
                          ? t("INS die")
                          : `${t("INS die")} + ${resolveArmorMdef(armor) + (armor.mDefModifier || 0)}`
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
                        {resolveArmorCategory(armor) === "Armor" && <ArmorIcon />}
                        {resolveArmorCategory(armor) === "Shield" && <ShieldIcon />}
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
                  <Tooltip title={checkIfEquippable(weapon) ? t("Equip") : t("Not proficient  -  martial item")} arrow>
                    <IconButton onClick={(e) => handleEquipment(weapon, e)} aria-label="equip" size="small" sx={{ p: 0.25 }}>
                      {weapon.isEquipped
                        ? <RadioButtonChecked />
                        : checkIfEquippable(weapon)
                          ? <RadioButtonUnchecked />
                          : <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 20 }} />}
                    </IconButton>
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
                      {resolveArmorCategory(armor) === "Shield"
                        ? "+" + parseInt(resolveArmorDef(armor) + (armor.defModifier || 0))
                        : ""}
                      {resolveArmorCategory(armor) === "Armor" && armor.martial
                        ? resolveArmorDef(armor) + (armor.defModifier || 0)
                        : ""}
                      {resolveArmorCategory(armor) === "Armor" && !armor.martial
                        ? resolveArmorDef(armor) + (armor.defModifier || 0) === 0
                          ? t("DEX die")
                          : `${t("DEX die")} + ${resolveArmorDef(armor) + (armor.defModifier || 0)}`
                        : ""}
                    </Box>
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ width: 90 }}>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <Box component="span" sx={{ mr: '4px' }}>{t("M.DEF")}:</Box>
                    <Box component="span">
                      {resolveArmorCategory(armor) === "Shield"
                        ? "+" + parseInt(resolveArmorMdef(armor) + (armor.mDefModifier || 0))
                        : ""}
                      {resolveArmorCategory(armor) === "Armor"
                        ? resolveArmorMdef(armor) + (armor.mDefModifier || 0) === 0
                          ? t("INS die")
                          : `${t("INS die")} + ${resolveArmorMdef(armor) + (armor.mDefModifier || 0)}`
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
                  <Tooltip title={checkIfEquippable(armor) ? t("Equip") : t("Not proficient  -  martial item")} arrow>
                    <IconButton
                      onClick={(e) => handleEquipment(armor, e)}
                      aria-label="equip"
                      size="small"
                      sx={{ p: 0.25 }}
                    >
                      {armor.isEquipped
                        ? <RadioButtonChecked />
                        : checkIfEquippable(armor)
                          ? <RadioButtonUnchecked />
                          : <WarningAmberIcon sx={{ color: 'warning.main', fontSize: 20 }} />}
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
                      {accessory.isEquipped ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
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
