import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import PrettyWeapon from "../equipment/PrettyWeapon";
import { Casino } from "@mui/icons-material";
import attributes from "../../../libs/attributes";

export default function PlayerEquipment({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const equippedWeapons = player.weapons
    ? player.weapons.filter((weapon) => weapon.isEquipped)
    : [];

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
    const att1 = weapon.att1;
    const att2 = weapon.att2;
    let att1Value = attributeMap[att1];
    let att2Value = attributeMap[att2];

    const weaponPrec = weapon.prec;
    const meleeModifier = player.modifiers.meleePrec;
    const rangedModifier = player.modifiers.rangedPrec;

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

    const damageDealt = maxDie + damage;

    const snackbarContent = (
      <>
        <Typography
          component="span"
          sx={{ fontWeight: "bold", textTransform: "uppercase" }}
        >
          {t("Accuracy")}:
        </Typography>
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
          } = `}
        </Typography>

        <Typography component="span" sx={{ fontWeight: "bold" }}>
          {result}
        </Typography>
        <br />
        <Typography
          component="span"
          sx={{ fontWeight: "bold", textTransform: "uppercase" }}
        >
          {t("Damage")}:
        </Typography>
        <Typography component="span">{` ${maxDie} + ${damage} = `}</Typography>
        <Typography component="span" sx={{ fontWeight: "bold" }}>
          {damageDealt + " " + t(weapon.type)}
        </Typography>
      </>
    );

    // Add critical success/failure visualization
    if (isCriticalFailure) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        <Typography variant="body1">
          Critical Failure!
          <br />
          {snackbarContent}
        </Typography>
      );
    } else if (isCriticalSuccess) {
      setSnackbarSeverity("success");
      setSnackbarMessage(
        <Typography variant="body1">
          Critical Success!
          <br />
          {snackbarContent}
        </Typography>
      );
    } else {
      setSnackbarSeverity("info");
      setSnackbarMessage(snackbarContent);
    }

    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        display: "flex",
      }}
    >
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
      <Grid container spacing={2} sx={{ padding: "1em" }}>
        <Grid item xs={12}>
          <Typography variant="h2" sx={{ fontWeight: "bold" }}>
            {t("Weapons")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {equippedWeapons.map((weapon, index) => (
            <React.Fragment key={index}>
              <Grid container>
                <Grid item xs={11}>
                  <PrettyWeapon
                    weapon={weapon}
                    player={player}
                    setPlayer={setPlayer}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={() => handleDiceRoll(weapon)}>
                    <Casino />
                  </IconButton>
                </Grid>
              </Grid>
              <br />
            </React.Fragment>
          ))}
        </Grid>
        {(player.modifiers.meleePrec !== 0 ||
          player.modifiers.rangedPrec !== 0) && (
          <Grid item xs={12}>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {t("Modifiers")}
            </Typography>
            {player.modifiers.meleePrec !== 0 && (
              <Typography variant="h4">
                {t("Melee Precision Bonus")}: {player.modifiers.meleePrec}
              </Typography>
            )}
            {player.modifiers.rangedPrec !== 0 && (
              <Typography variant="h4">
                {t("Ranged Precision Bonus")}: {player.modifiers.rangedPrec}
              </Typography>
            )}
          </Grid>
        )}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%", fontSize: "1.2rem" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
