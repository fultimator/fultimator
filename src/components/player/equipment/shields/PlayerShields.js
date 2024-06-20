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
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useTranslate } from "../../../../translation/translate";
import PrettyArmor from "../armor/PrettyArmor";
import { Edit, Error } from "@mui/icons-material";
import { Equip } from "../../../icons";

export default function PlayerShields({
  player,
  shields,
  onEditShield,
  onEquipShield,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [expanded, setExpanded] = useState(false);

  const checkIfEquippable = (shield) => {
    // if shield is not martial then is always equippable
    // true = equippable, false = not equippable

    const { classes } = player;

    // If the shield is not martial, it is always equippable
    if (!shield.martial) {
      return true;
    }

    // Iterate through each class to check if the shield is equippable based on their benefits
    for (const playerClass of classes) {
      const { benefits } = playerClass;

      // Check if the class benefits allow equipping martial armor
      if (benefits.martials) {
        if (shield.martial && benefits.martials.shields) {
          // The shield is equippable based on the current class
          return true;
        }
      }
    }

    // The shield is not equippable based on any of the player's classes
    return false;
  };

  const countEquippedShields = () => {
    let count = 0;
    shields.forEach((shield) => {
      if (shield.isEquipped) {
        count++;
      }
    });
    return count;
  };

  const countEquippedWeapons = () => {
    let oneHandedCount = 0;
    let twoHandedCount = 0;

    if (player.weapons && player.weapons.length > 0) {
      player.weapons.forEach((weapon) => {
        if (weapon.isEquipped) {
          if (weapon.hands === 1) {
            oneHandedCount++;
          } else if (weapon.hands === 2) {
            twoHandedCount++;
          }
        }
      });
    }

    return { oneHandedCount, twoHandedCount };
  };

  const canEquipShield = () => {
    const { oneHandedCount, twoHandedCount } = countEquippedWeapons();
    if (twoHandedCount === 1) {
      return false;
    } else if (
      oneHandedCount <= 1 &&
      twoHandedCount === 0 &&
      countEquippedShields() === 0
    ) {
      return true;
    }
    return false;
  };

  const handleEquipShields = (index, checked) => {
    const shieldSelected = shields[index];
    if (canEquipShield(shieldSelected) || !checked) {
      const updatedShield = { ...shields };
      updatedShield[index].isEquipped = checked;
      onEquipShield(updatedShield);
    } else {
      alert(t("You cannot equip this shield as no hands are free."));
    }
  };

  useEffect(() => {
    // Open the Accordion when a new weapon is added
    if (shields.length > 0) {
      setExpanded(true);
    }
  }, [shields]);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
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
          {t("Shields")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={2}>
          {/* map the weapons and display them with a PrettyWeapon component if they exist */}
          {shields.map((shield, index) => (
            <React.Fragment key={index}>
              <Grid item container xs={12} alignItems="center" spacing={1}>
                {/* Updated grid item */}
                <Grid item xs={11}>
                  <PrettyArmor armor={shield} />
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
                    <IconButton onClick={() => onEditShield(index)}>
                      <Edit />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    {checkIfEquippable(shield) ? (
                      <Tooltip
                        title={
                          shield.isEquipped
                            ? t("Unequip Shield")
                            : t("Equip Shield")
                        }
                      >
                        <IconButton
                          onClick={() =>
                            handleEquipShields(index, !shield.isEquipped)
                          }
                          sx={{ mt: 1, boxShadow: "1px 1px 5px" }}
                        >
                          <Equip
                            color={shield.isEquipped ? "green" : ternary}
                            strokeColor={"#000"}
                          />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("Not Equippable")}>
                        <IconButton>
                          <Error color="error" />
                        </IconButton>
                      </Tooltip>
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
