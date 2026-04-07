import React, { useState } from "react";
import {
  Grid, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Collapse,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip
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
import { Casino, RadioButtonUnchecked, Error, SwapHoriz } from "@mui/icons-material";
import { calculateAttribute, calculateCustomWeaponStats } from "../../common/playerCalculations";
import { isItemEquipped } from "../../equipment/slots/equipmentSlots";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });

export default function PlayerEquipment({
  player,
  setPlayer,
  isMainTab,
  isEditMode,
  searchQuery = ''
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [dialogMessage, setDialogMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSeverity, setDialogSeverity] = useState("info");
  const [currentWeapon, setCurrentWeapon] = useState(null);

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

  const handleEquipment = (item) => {
    if (!setPlayer || !isEditMode) return;

    // Handle custom weapons
    if (item.isCustomWeapon) {
      handleEquipCustomWeapon(item);
    }
    // Determine the equipment type and handle accordingly
    else if (item.category === 'Weapon' || item.melee || item.ranged) {
      handleEquipWeapon(item);
    } else if (item.category === 'Armor') {
      handleEquipArmor(item);
    } else if (item.category === 'Shield') {
      handleEquipShield(item);
    } else if (item.category === 'Accessory' || (!item.category && inv.accessories?.some(a => a === item))) {
      handleEquipAccessory(item);
    }
  };

  const handleEquipCustomWeapon = (item) => {
    const customWeapon = item.originalData;
    setPlayer(prevPlayer => {
      const updatedCustomWeapons = [...(prevPlayer.customWeapons || [])];
      const weaponIndex = updatedCustomWeapons.findIndex(w => w === customWeapon);
      if (weaponIndex !== -1) {
        const isEquipping = !customWeapon.isEquipped;
        updatedCustomWeapons[weaponIndex] = { ...customWeapon, isEquipped: isEquipping };

        // If equipping, unequip regular weapons and shields
        if (isEquipping) {
          const updatedWeapons = (prevPlayer.weapons || []).map(weapon => ({
            ...weapon,
            isEquipped: false
          }));
          const updatedShields = (prevPlayer.shields || []).map(shield => ({
            ...shield,
            isEquipped: false
          }));
          
          // Also unequip other custom weapons
          updatedCustomWeapons.forEach((cw, i) => {
            if (i !== weaponIndex) {
              cw.isEquipped = false;
            }
          });

          return {
            ...prevPlayer,
            customWeapons: updatedCustomWeapons,
            weapons: updatedWeapons,
            shields: updatedShields
          };
        }

        return { ...prevPlayer, customWeapons: updatedCustomWeapons };
      }
      return prevPlayer;
    });
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

  const canEquipWeapon = (weapon) => {
    const { oneHandedCount, twoHandedCount } = countEquippedWeapons();
    const shieldsCount = countEquippedShields();

    if (weapon.hands === 2) {
      // Two-handed weapon can be equipped only if both hands are free
      return oneHandedCount === 0 && twoHandedCount === 0 && shieldsCount === 0;
    } else if (weapon.hands === 1) {
      // One-handed weapon can be equipped if there is at least one hand free
      // Player can't equip 2 one-handed weapons and a shield
      if (twoHandedCount > 0) {
        return false;
      }
      return (
        oneHandedCount < 2 &&
        shieldsCount < 2 &&
        !(oneHandedCount === 1 && shieldsCount === 1)
      );
    }

    return false;
  };

  const countEquippedWeapons = () => {
    let oneHandedCount = 0;
    let twoHandedCount = 0;

    const inv = player.equipment?.[0];

    // Count regular weapons
    if (inv?.weapons) {
      inv.weapons.forEach((weapon) => {
        if (weapon.isEquipped) {
          if (weapon.hands === 1) {
            oneHandedCount++;
          } else if (weapon.hands === 2) {
            twoHandedCount++;
          }
        }
      });
    }

    // Count custom weapons (all are two-handed)
    if (inv?.customWeapons) {
      inv.customWeapons.forEach((weapon) => {
        if (weapon.isEquipped) {
          twoHandedCount++;
        }
      });
    }

    return { oneHandedCount, twoHandedCount };
  };

  const countEquippedShields = () => {
    let count = 0;
    const inv = player.equipment?.[0];
    if (inv?.shields && inv.shields.length > 0) {
      inv.shields.forEach((shield) => {
        if (shield.isEquipped) {
          count++;
        }
      });
    }
    return count;
  };

  const handleEquipWeapon = (weapon) => {
    if (canEquipWeapon(weapon) || weapon.isEquipped) {
      setPlayer(prevPlayer => {
        const updatedWeapons = [...(prevPlayer.weapons || [])];
        const weaponIndex = updatedWeapons.findIndex(w => w === weapon);
        if (weaponIndex !== -1) {
          updatedWeapons[weaponIndex] = { ...weapon, isEquipped: !weapon.isEquipped };
          return { ...prevPlayer, weapons: updatedWeapons };
        }
        return prevPlayer;
      });
    } else {
      const message = t("You cannot equip this weapon as no hands are free.");
      if (window.electron) {
        window.electron.alert(message);
      } else {
        alert(message);
      }
    }
  };

  const handleEquipArmor = (armor) => {
    setPlayer(prevPlayer => {
      const updatedArmor = [...(prevPlayer.armor || [])];
      const armorIndex = updatedArmor.findIndex(a => a === armor);
      if (armorIndex !== -1) {
        // Unequip all other armor first
        const newArmor = updatedArmor.map(a => ({ ...a, isEquipped: false }));
        // Equip the selected armor
        newArmor[armorIndex] = { ...armor, isEquipped: !armor.isEquipped };
        return { ...prevPlayer, armor: newArmor };
      }
      return prevPlayer;
    });
  };

  const handleEquipShield = (shield) => {
    const shieldsCount = countEquippedShields();
    const { twoHandedCount } = countEquippedWeapons();

    if (shield.isEquipped || (shieldsCount < (hasDualShieldBearer ? 2 : 1) && twoHandedCount === 0)) {
      setPlayer(prevPlayer => {
        const updatedShields = [...(prevPlayer.shields || [])];
        const shieldIndex = updatedShields.findIndex(s => s === shield);
        if (shieldIndex !== -1) {
          updatedShields[shieldIndex] = { ...shield, isEquipped: !shield.isEquipped };
          return { ...prevPlayer, shields: updatedShields };
        }
        return prevPlayer;
      });
    } else {
      const message = hasDualShieldBearer
        ? t("You can only equip up to 2 shields.")
        : t("You can only equip 1 shield or your hands are occupied.");
      if (window.electron) {
        window.electron.alert(message);
      } else {
        alert(message);
      }
    }
  };

  const handleEquipAccessory = (accessory) => {
    setPlayer(prevPlayer => {
      const updatedAccessories = [...(prevPlayer.accessories || [])];
      const accessoryIndex = updatedAccessories.findIndex(a => a === accessory);
      if (accessoryIndex !== -1) {
        updatedAccessories[accessoryIndex] = { ...accessory, isEquipped: !accessory.isEquipped };
        return { ...prevPlayer, accessories: updatedAccessories };
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
              <StyledTableCellHeader sx={{ width: 34 }} />
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
                <StyledTableCellHeader />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Weapon")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Accuracy")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Damage")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader />
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
                <StyledTableCellHeader />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Custom Weapon")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Accuracy")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Damage")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader />
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
                <StyledTableCellHeader />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Shield")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("M. Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader />
              </TableRow>
            </TableHead>
          </Table>
        )}
        {equippedShields.length > 0 && (
          <CollapsibleArmor armors={equippedShields} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} />
        )}
        {!isMainTab && (
          <AllArmor
            armors={inv?.shields?.filter(s => !isItemEquipped(player, s)) || []}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            checkIfEquippable={checkIfEquippable}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
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
                <StyledTableCellHeader />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Armor")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("M. Defense")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader />
              </TableRow>
            </TableHead>
          </Table>
        )}
        {equippedArmor.length > 0 && (
          <CollapsibleArmor armors={equippedArmor} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} />
        )}
        {!isMainTab && (
          <AllArmor
            armors={inv?.armor?.filter(a => !isItemEquipped(player, a)) || []}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            checkIfEquippable={checkIfEquippable}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
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
                <StyledTableCellHeader />
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="left">
                    {t("Accessory")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader>
                  <Typography variant="h4" textAlign="center">
                    {t("Cost")}
                  </Typography>
                </StyledTableCellHeader>
                <StyledTableCellHeader />
              </TableRow>
            </TableHead>
          </Table>
        )}
        {equippedAccessories.length > 0 && (
          <CollapsibleAccessory accessorys={equippedAccessories} handleEquipment={handleEquipment} handleDiceRoll={handleDiceRoll} isMainTab={isMainTab} searchQuery={searchQuery} />
        )}
        {!isMainTab && (
          <AllAccessory
            accessorys={inv?.accessories?.filter(ac => !isItemEquipped(player, ac)) || []}
            handleEquipment={handleEquipment}
            handleDiceRoll={handleDiceRoll}
            isMainTab={isMainTab}
            searchQuery={searchQuery}
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

function CollapsibleWeapon({ weapons, handleEquipment, handleDiceRoll, handleSwapForm, isMainTab, searchQuery }) {
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
                <StyledTableCell sx={{ width: '1%', whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    width: { xs: '100px', md: '128px' },
                    maxWidth: { xs: '100px', md: '128px' },
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
                <StyledTableCell>
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
                <StyledTableCell>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <OpenBracket />
                    {t("HR")} {weapon.damage >= 0 ? "+" : ""} {weapon.damage}
                    <CloseBracket />
                    {types[weapon.type].long}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  <Tooltip title={t("Unequip")} arrow>
                    <IconButton onClick={() => handleEquipment(weapon)} aria-label="expand row" size="small">
                      <MeleeIcon />
                    </IconButton>
                  </Tooltip>
                  {weapon.isTransforming && (
                    <Tooltip title={t("weapon_customization_swap_form")} arrow>
                      <IconButton onClick={() => handleSwapForm(weapon)} size="small">
                        <SwapHoriz />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Roll")} arrow>
                    <IconButton onClick={() => handleDiceRoll(weapon)} aria-label="expand row" size="small">
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

function CollapsibleArmor({ armors, handleEquipment, isMainTab, searchQuery }) {
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
          {armors.map((armor, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <StyledTableCell sx={{ width: '1%', whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    width: { xs: '100px', md: '128px' },
                    maxWidth: { xs: '100px', md: '128px' },
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
                <StyledTableCell>
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
                <StyledTableCell>
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
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  <Tooltip title={t("Unequip")} arrow>
                    <IconButton onClick={() => handleEquipment(armor)} aria-label="expand row" size="small">
                      {armor.category === "Armor" && <ArmorIcon />}
                      {armor.category === "Shield" && <ShieldIcon />}
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

function CollapsibleAccessory({ accessorys, handleEquipment, isMainTab, searchQuery }) {
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
                <StyledTableCell sx={{ width: '1%', whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    width: { xs: '100px', md: '128px' },
                    maxWidth: { xs: '100px', md: '128px' },
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
                <StyledTableCell>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    {`${accessory.cost}z`}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  <Tooltip title={t("Unequip")} arrow>
                    <IconButton onClick={() => handleEquipment(accessory)} aria-label="expand row" size="small">
                      <AccessoryIcon />
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

function AllWeapon({ weapons, handleEquipment, handleDiceRoll, handleSwapForm, checkIfEquippable, isMainTab, searchQuery }) {
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
                <StyledTableCell sx={{ width: '1%', whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    width: { xs: '100px', md: '128px' },
                    maxWidth: { xs: '100px', md: '128px' },
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
                <StyledTableCell>
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
                <StyledTableCell>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    <OpenBracket />
                    {t("HR")} {weapon.damage >= 0 ? "+" : ""} {weapon.damage}
                    <CloseBracket />
                    {types[weapon.type].long}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  {checkIfEquippable(weapon) ? (
                    <Tooltip title={t("Equip")} arrow>
                      <IconButton onClick={() => handleEquipment(weapon)} aria-label="expand row" size="small">
                        <RadioButtonUnchecked />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("Not Equippable")}>
                      <IconButton>
                        <Error color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {weapon.isTransforming && (
                    <Tooltip title={t("weapon_customization_swap_form")} arrow>
                      <IconButton onClick={() => handleSwapForm(weapon)} size="small">
                        <SwapHoriz />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t("Roll")} arrow>
                    <IconButton onClick={() => handleDiceRoll(weapon)} aria-label="expand row" size="small">
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

function AllArmor({ armors, handleEquipment, checkIfEquippable, isMainTab, searchQuery }) {
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
                <StyledTableCell sx={{ width: '1%', whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    width: { xs: '100px', md: '128px' },
                    maxWidth: { xs: '100px', md: '128px' },
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
                <StyledTableCell>
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
                <StyledTableCell>
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
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  {checkIfEquippable(armor) ? (
                    <Tooltip title={t("Equip")} arrow>
                      <IconButton
                        onClick={() => {
                          handleEquipment(armor);
                        }}
                        aria-label="equip"
                        size="small"
                      >
                        <RadioButtonUnchecked />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("Not Equippable")}>
                      <IconButton>
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

function AllAccessory({ accessorys, handleEquipment, handleDiceRoll, isMainTab, searchQuery }) {
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
                <StyledTableCell sx={{ width: '1%', whiteSpace: 'nowrap', padding: 0 }}>
                  <IconButton onClick={() => toggleRow(index)} size="small">
                    {open[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    width: { xs: '100px', md: '128px' },
                    maxWidth: { xs: '100px', md: '128px' },
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
                <StyledTableCell>
                  <Typography variant="body2" fontWeight="bold" textAlign="center">
                    {`${accessory.cost}z`}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell sx={{ textAlign: 'right' }}>
                  <Tooltip title={t("Equip")} arrow>
                    <IconButton onClick={() => handleEquipment(accessory)} aria-label="expand row" size="small">
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