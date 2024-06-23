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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import PrettyWeapon from "../equipment/weapons/PrettyWeapon";
import PrettyArmor from "../equipment/armor/PrettyArmor";
import PrettyAccessory from "../equipment/accessories/PrettyAccessory";
import { Casino } from "@mui/icons-material";
import attributes from "../../../libs/attributes";

export default function PlayerEquipment({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [dialogMessage, setDialogMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSeverity, setDialogSeverity] = useState("info");
  const [currentWeapon, setCurrentWeapon] = useState(null);

  const equippedWeapons = player.weapons
    ? player.weapons.filter((weapon) => weapon.isEquipped)
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

  const precMeleeModifier =
    (player.modifiers.meleePrec || 0) +
    (equippedArmor.length > 0 ? equippedArmor[0].precModifier || 0 : 0) +
    (equippedShields.length > 0 ? equippedShields[0].precModifier || 0 : 0) +
    (equippedAccessories.length > 0
      ? equippedAccessories[0].precModifier || 0
      : 0);

  const precRangedModifier =
    (player.modifiers.rangedPrec || 0) +
    (equippedArmor.length > 0 ? equippedArmor[0].precModifier || 0 : 0) +
    (equippedShields.length > 0 ? equippedShields[0].precModifier || 0 : 0) +
    (equippedAccessories.length > 0
      ? equippedAccessories[0].precModifier || 0
      : 0);

  const damageMeleeModifier =
    (equippedArmor.length > 0 ? equippedArmor[0].damageMeleeModifier || 0 : 0) +
    (equippedShields.length > 0
      ? equippedShields[0].damageMeleeModifier || 0
      : 0) +
    (equippedAccessories.length > 0
      ? equippedAccessories[0].damageMeleeModifier || 0
      : 0);

  const damageRangedModifier =
    (equippedArmor.length > 0
      ? equippedArmor[0].damageRangedModifier || 0
      : 0) +
    (equippedShields.length > 0
      ? equippedShields[0].damageRangedModifier || 0
      : 0) +
    (equippedAccessories.length > 0
      ? equippedAccessories[0].damageRangedModifier || 0
      : 0);

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  const calculateAttribute = (
    base,
    decreaseStatuses,
    increaseStatuses,
    min,
    max
  ) => {
    let adjustedValue = base;

    decreaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue -= 2;
    });

    increaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue += 2;
    });

    return clamp(adjustedValue, min, max);
  };

  const currDex = calculateAttribute(
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12
  );
  const currInsight = calculateAttribute(
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12
  );
  const currMight = calculateAttribute(
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12
  );
  const currWillpower = calculateAttribute(
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
    willpower: currWillpower,
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
              {` ${die1} [${attributes[att1].shortcaps}] + ${die2} [${
                attributes[att2].shortcaps
              }] ${weaponPrec !== 0 ? "+" + weaponPrec : ""} ${
                weapon.melee
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
      {(equippedWeapons.length > 0 || equippedArmor.length > 0) && (
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
                  color: ternary,
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
                  color: ternary,
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
              {equippedWeapons.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                      {t("Weapons")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {equippedWeapons.map((weapon, index) => (
                      <React.Fragment key={index}>
                        <Grid container>
                          <Grid item xs={isEditMode ? 11 : 12}>
                            <PrettyWeapon
                              weapon={weapon}
                              player={player}
                              setPlayer={setPlayer}
                            />
                          </Grid>
                          {isEditMode && (
                            <Grid item xs={1}>
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
                        <br />
                      </React.Fragment>
                    ))}
                  </Grid>
                </>
              )}
              {equippedArmor.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                      {t("Armor")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {equippedArmor.map((armor, index) => (
                      <React.Fragment key={index}>
                        <Grid container>
                          <Grid item xs={isEditMode ? 11 : 12}>
                            <PrettyArmor armor={armor} />
                          </Grid>
                          <Grid item xs={1}></Grid>
                        </Grid>
                        <br />
                      </React.Fragment>
                    ))}
                  </Grid>
                </>
              )}
              {equippedShields.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                      {t("Shields")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {equippedShields.map((shield, index) => (
                      <React.Fragment key={index}>
                        <Grid container>
                          <Grid item xs={isEditMode ? 11 : 12}>
                            <PrettyArmor armor={shield} />
                          </Grid>
                          <Grid item xs={1}></Grid>
                        </Grid>
                        <br />
                      </React.Fragment>
                    ))}
                  </Grid>
                </>
              )}
              {equippedAccessories.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                      {t("Accessory")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    {equippedAccessories.map((accessory, index) => (
                      <React.Fragment key={index}>
                        <Grid container>
                          <Grid item xs={isEditMode ? 11 : 12}>
                            <PrettyAccessory accessory={accessory} />
                          </Grid>
                          <Grid item xs={1}></Grid>
                        </Grid>
                        <br />
                      </React.Fragment>
                    ))}
                  </Grid>
                </>
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
          </Paper>
        </>
      )}
    </>
  );
}
