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
  Card,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import PrettyWeapon from "../equipment/weapons/PrettyWeapon";
import PrettyArmor from "../equipment/armor/PrettyArmor";
import PrettyAccessory from "../equipment/accessories/PrettyAccessory";
import PrettyCustomWeapon from "../equipment/customWeapons/PrettyCustomWeapon";
import { Casino, SwapHoriz } from "@mui/icons-material";
import attributes from "../../../libs/attributes";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import { calculateAttribute, calculateCustomWeaponStats } from "../common/playerCalculations";

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
  const equippedWeapons = player.weapons
    ? player.weapons.filter((weapon) => weapon.isEquipped)
    : [];

  // Retrieve equipped custom weapons
  const equippedCustomWeapons = player.customWeapons
    ? player.customWeapons.filter((weapon) => weapon.isEquipped)
    : [];

  const equippedArmor = player.armor
    ? player.armor.filter((armor) => armor.isEquipped)
    : [];

  const equippedShields = player.shields
    ? player.shields.filter((shield) => shield.isEquipped)
    : [];

  const equippedAccessories = player.accessories
    ? player.accessories.filter((accessory) => accessory.isEquipped)
    : [];

  // Find all pilot-vehicle spells
  const pilotSpells = (player.classes || [])
    .flatMap((c) => c.spells || [])
    .filter(
      (spell) =>
        spell &&
        spell.spellType === "pilot-vehicle" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined)
    );

  // Find the enabled vehicle
  const activeVehicle = pilotSpells
    .flatMap((s) => s.vehicles || [])
    .find((v) => v.enabled);

  const equippedModules = activeVehicle?.modules
    ? activeVehicle.modules.filter((m) => m.equipped)
    : [];

  const hasArmorModule = equippedModules.some(
    (m) => m.type === "pilot_module_armor"
  );
  const hasWeaponModule = equippedModules.some(
    (m) => m.type === "pilot_module_weapon"
  );

  // Helper function to format custom weapon for display
  const formatCustomWeaponForDisplay = (customWeapon) => {
    const isTransforming = customWeapon.customizations?.some(
      (c) => c.name === "weapon_customization_transforming"
    );
    
    const isSecondaryForm = customWeapon.activeForm === "secondary";

    const baseData = {
      ...customWeapon,
      isCustomWeapon: true,
      isTransforming: isTransforming,
      hands: 2, // Custom weapons are always two-handed
      originalData: customWeapon // Preserve original reference
    };

    if (isSecondaryForm) {
      return {
        ...baseData,
        name: customWeapon.secondWeaponName || `${customWeapon.name} (Transforming)`,
        category: customWeapon.secondSelectedCategory || "weapon_category_brawling",
        range: customWeapon.secondSelectedRange || "weapon_range_melee",
        accuracyCheck: customWeapon.secondSelectedAccuracyCheck || { att1: "dexterity", att2: "might" },
        type: customWeapon.secondSelectedType || "physical",
        customizations: customWeapon.secondCurrentCustomizations || [],
        quality: customWeapon.secondQuality || "",
        qualityCost: customWeapon.secondQualityCost || 0,
        isSecondaryForm: true,
        melee: (customWeapon.secondSelectedRange || "weapon_range_melee") === "weapon_range_melee",
        ranged: (customWeapon.secondSelectedRange || "weapon_range_melee") === "weapon_range_ranged"
      };
    }

    return {
      ...baseData,
      category: customWeapon.category || "weapon_category_brawling",
      melee: (customWeapon.range || "weapon_range_melee") === "weapon_range_melee",
      ranged: (customWeapon.range || "weapon_range_melee") === "weapon_range_ranged"
    };
  };

  // Combine regular weapons and custom weapons
  const allEquippedWeapons = [
    ...equippedWeapons,
    // Add custom weapons with proper formatting (showing only active form)
    ...equippedCustomWeapons.map((customWeapon) => formatCustomWeaponForDisplay(customWeapon))
  ];

  // Add Twin Shields to equipped weapons if the player has Dual Shieldbearer and 2 shields equipped
  if (hasDualShieldBearer && equippedShields.length >= 2) {
    allEquippedWeapons.push(twinShields);
  }

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

  const handleSwapForm = (weapon) => {
    if (!setPlayer || !isEditMode) return;
    
    const customWeapon = weapon.originalData;
    if (!customWeapon) return;

    setPlayer(prevPlayer => {
      const updatedCustomWeapons = [...(prevPlayer.customWeapons || [])];
      // Search by reference to original data
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

    // Handle attribute mapping for custom weapons
    const att1 = weapon.isCustomWeapon
      ? weapon.accuracyCheck?.att1 || weapon.att1 || "dexterity"
      : weapon.att1 || "dexterity";
    const att2 = weapon.isCustomWeapon
      ? weapon.accuracyCheck?.att2 || weapon.att2 || "might"
      : weapon.att2 || "might";

    let att1Value = attributeMap[att1] || 8;
    let att2Value = attributeMap[att2] || 8;

    // Calculate weapon stats for custom weapons
    let weaponPrec = weapon.prec || 0;
    let weaponDamage = weapon.damage || 5;

    if (weapon.isCustomWeapon) {
      const stats = calculateCustomWeaponStats(weapon, weapon.activeForm === "secondary");
      weaponDamage = stats.damage;
      weaponPrec = stats.precision;
    }

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
    const damage = weaponDamage;

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

  return (
    <>
      {(allEquippedWeapons.length > 0 || equippedArmor.length > 0) && (
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
              <Typography
                variant="h1"
                sx={{
                  textTransform: "uppercase",
                  padding: "5px", // Adjust padding instead of margins
                  backgroundColor: primary,
                  color: custom.white,
                  borderRadius: "8px 8px 0 0", // Rounded corners only at the top
                  fontSize: "1.5em",
                }}
                align="center"
              >
                {t("Equipment")}
              </Typography>
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
            <Grid container spacing={2} sx={{ padding: "1em" }}>
              {allEquippedWeapons.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ 
                    backgroundColor: custom.mode === "dark" ? "#181a1b" : "#ffffff", 
                    boxShadow: isCharacterSheet ? 0 : 2,
                    opacity: hasWeaponModule ? 0.5 : 1
                  }}>
                    <Stack>
                      {allEquippedWeapons.map((weapon, index) => (
                        <React.Fragment key={index}>
                          <Grid container alignItems="center">
                            <Grid item xs={isEditMode ? 10 : 12}>
                              {weapon.isCustomWeapon ? (
                                <PrettyCustomWeapon
                                  weaponData={weapon}
                                  isCharacterSheet={isCharacterSheet}
                                  showActions={false}
                                  showCard={false}
                                  showHeader={index === 0}
                                />
                              ) : (
                                <PrettyWeapon
                                  weapon={weapon}
                                  player={player}
                                  setPlayer={setPlayer}
                                  isCharacterSheet={isCharacterSheet}
                                  showCard={false}
                                  showHeader={index === 0}
                                />
                              )}
                            </Grid>
                            {isEditMode && (
                              <Grid item xs={2} container direction="column" alignItems="center" justifyContent="center">
                                {weapon.isTransforming && (
                                  <Tooltip title={t("weapon_customization_swap_form")}>
                                    <IconButton
                                      onClick={() => handleSwapForm(weapon)}
                                    >
                                      <SwapHoriz />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title={t("Roll")}>
                                  <IconButton
                                    onClick={() => handleDiceRoll(weapon)}
                                  >
                                    <Casino />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            )}
                          </Grid>
                          {index < allEquippedWeapons.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              )}
              {equippedArmor.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ 
                    backgroundColor: custom.mode === "dark" ? "#181a1b" : "#ffffff", 
                    boxShadow: isCharacterSheet ? 0 : 2,
                    opacity: hasArmorModule ? 0.5 : 1
                  }}>
                    <Stack>
                      {equippedArmor.map((armor, index) => (
                        <React.Fragment key={index}>
                          <PrettyArmor 
                            armor={armor} 
                            isCharacterSheet={isCharacterSheet}
                            showCard={false}
                            showHeader={index === 0}
                          />
                          {index < equippedArmor.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              )}
              {equippedShields.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: custom.mode === "dark" ? "#181a1b" : "#ffffff", boxShadow: isCharacterSheet ? 0 : 2 }}>
                    <Stack>
                      {equippedShields.map((shield, index) => (
                        <React.Fragment key={index}>
                          <PrettyArmor 
                            armor={shield} 
                            isCharacterSheet={isCharacterSheet}
                            showCard={false}
                            showHeader={index === 0}
                          />
                          {index < equippedShields.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              )}
              {equippedAccessories.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: custom.mode === "dark" ? "#181a1b" : "#ffffff", boxShadow: isCharacterSheet ? 0 : 2 }}>
                    <Stack>
                      {equippedAccessories.map((accessory, index) => (
                        <React.Fragment key={index}>
                          <PrettyAccessory 
                            accessory={accessory} 
                            isCharacterSheet={isCharacterSheet}
                            showCard={false}
                            showHeader={index === 0}
                          />
                          {index < equippedAccessories.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              )}
              {(precMeleeModifier !== 0 ||
                precRangedModifier !== 0 ||
                damageMeleeModifier !== 0 ||
                damageRangedModifier !== 0) && (
                  <Grid item xs={12}>
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
                <Button onClick={handleDialogClose} color="secondary" variant="contained">
                  {t("Close")}
                </Button>
                <Button
                  onClick={() => handleDiceRoll(currentWeapon)}
                  color="primary"
                  autoFocus
                  variant="contained"
                >
                  {t("Re-roll")}
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </>
      )}
    </>
  );
}
