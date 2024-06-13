import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTranslate } from "../../../translation/translate";
import PrettyWeapon from "./PrettyWeapon";
import { Edit, Error } from "@mui/icons-material";

export default function PlayerWeapons({
  player,
  weapons,
  onEditWeapon,
  onEquipWeapon,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [expanded, setExpanded] = useState(false);

  const checkIfEquippable = (weapon) => {
    // if weapon is not martial then is always equippable
    // true = equippable, false = not equippable

    const { classes } = player;

    // If the weapon is not martial, it is always equippable
    if (!weapon.martial) {
      return true;
    }

    // Iterate through each class to check if the weapon is equippable based on their benefits
    for (const playerClass of classes) {
      const { benefits } = playerClass;

      // Check if the class benefits allow equipping armor, shields, melee, or ranged weapons
      if (benefits.martials) {
        if (
          (weapon.melee && benefits.martials.melee) ||
          (weapon.ranged && benefits.martials.ranged)
        ) {
          // The weapon is equippable based on the current class
          return true;
        }
      }
    }

    // The weapon is not equippable based on any of the player's classes
    return false;
  };

  useEffect(() => {
    // Open the Accordion when a new weapon is added
    if (weapons.length > 0) {
      setExpanded(true);
    }
  }, [weapons]);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const canEquipWeapon = (weapon) => {
    const { oneHandedCount, twoHandedCount } = countEquippedWeapons();

    if (weapon.hands === 2) {
      return oneHandedCount === 0 && twoHandedCount === 0;
    } else if (weapon.hands === 1) {
      return twoHandedCount === 0 && oneHandedCount < 2;
    }

    return false;
  };

  const countEquippedWeapons = () => {
    let oneHandedCount = 0;
    let twoHandedCount = 0;

    weapons.forEach((weapon) => {
      if (weapon.isEquipped) {
        if (weapon.hands === 1) {
          oneHandedCount++;
        } else if (weapon.hands === 2) {
          twoHandedCount++;
        }
      }
    });

    return { oneHandedCount, twoHandedCount };
  };

  const handleEquipWeapon = (index, checked) => {
    const weapon = weapons[index];
    if (canEquipWeapon(weapon) || !checked) {
      const updatedWeapons = [...weapons];
      updatedWeapons[index].isEquipped = checked;
      onEquipWeapon(updatedWeapons);
    }
  };

  return (
    <Accordion
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
        marginBottom: 3,
      }}
      expanded={expanded}
      onChange={handleAccordionChange}
    >
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography
          variant="h2"
          component="legend"
          sx={{
            color: primary,
            textTransform: "uppercase",
            padding: "5px 10px",
            borderRadius: 0,
            margin: "0 0 0 0",
            fontSize: "1.5em",
          }}
        >
          {t("Weapons")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={2}>
          {/* map the weapons and display them with a PrettyWeapon component if they exist */}
          {weapons.map((weapon, index) => (
            <React.Fragment key={index}>
              <Grid item container xs={12} alignItems="center">
                {/* Updated grid item */}
                <Grid item xs={1}>
                  {checkIfEquippable(weapon) ? (
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={weapon.isEquipped}
                            onChange={(e) =>
                              handleEquipWeapon(index, e.target.checked)
                            }
                          />
                        }
                        label={<Typography>{t("Equip Weapon")}</Typography>}
                      />
                    </FormGroup>
                  ) : (
                    <Tooltip title={t("Not Equippable")}>
                      <IconButton>
                        <Error color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid item xs={10}>
                  <PrettyWeapon weapon={weapon} />
                </Grid>
                <Grid
                  item
                  container
                  xs={1}
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Updated grid item */}
                  <Grid item xs={12}>
                    <IconButton onClick={() => onEditWeapon(index)}>
                      <Edit />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    {weapon.equipped && (
                      <Typography
                        variant="h5"
                        sx={{ transform: "rotate(90deg)", marginRight: "20px" }}
                      >
                        {t("Equipped")}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
