import React, { useState, useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionDetails,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import PrettyWeapon from "./PrettyWeapon";
import { Edit, Error } from "@mui/icons-material";
import { Equip } from "../../../icons";
import Export from "../../../Export";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import { useTheme } from "@mui/material/styles";
import { MeleeIcon } from "../../../icons";

export default function PlayerWeapons({
  player,
  weapons,
  onEditWeapon,
  onEquipWeapon,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

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

    // Count regular weapons
    weapons.forEach((weapon) => {
      if (weapon.isEquipped) {
        if (weapon.hands === 1) {
          oneHandedCount++;
        } else if (weapon.hands === 2) {
          twoHandedCount++;
        }
      }
    });

    // Count custom weapons (all are two-handed)
    if (player.customWeapons) {
      player.customWeapons.forEach((customWeapon) => {
        if (customWeapon.isEquipped) {
          twoHandedCount++;
        }
      });
    }

    return { oneHandedCount, twoHandedCount };
  };

  const countEquippedShields = () => {
    let count = 0;
    if (player.shields && player.shields.length > 0) {
      player.shields.forEach((shield) => {
        if (shield.isEquipped) {
          count++;
        }
      });
    }
    return count;
  };

  const handleEquipWeapon = (index, checked) => {
    const weapon = weapons[index];
    if (canEquipWeapon(weapon) || !checked) {
      const updatedWeapons = [...weapons];
      updatedWeapons[index].isEquipped = checked;
      onEquipWeapon(updatedWeapons);
    } else {
      if (window.electron) {
        window.electron.alert(
          t("You cannot equip this weapon as no hands are free.")
        );
      } else {
        alert(t("You cannot equip this weapon as no hands are free."));
      }
    }
  };

  return (
    <Accordion
      elevation={3}
      sx={{
        borderRadius: "8px",
        border: "2px solid",
        borderColor: theme.palette.secondary.main,
        marginBottom: 3,
      }}
      expanded={expanded}
      onChange={handleAccordionChange}
    >
      <CustomHeaderAccordion
        isExpanded={expanded}
        handleAccordionChange={handleAccordionChange}
        headerText={t("Weapon")}
        showIconButton={false}        
        icon={<MeleeIcon />}
      />
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={3}>
          {/* map the weapons and display them with a PrettyWeapon component if they exist */}
          {weapons.map((weapon, index) => (
            <React.Fragment key={index}>
              <Grid item container xs={12} alignItems="center" spacing={1}>
                {/* Updated grid item */}
                <Grid item xs={11}>
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
                  {isEditMode && (
                    <Grid item xs={12}>
                      <IconButton onClick={() => onEditWeapon(index)}>
                        <Edit />
                      </IconButton>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    {checkIfEquippable(weapon) ? (
                      <Tooltip
                        title={
                          weapon.isEquipped
                            ? t("Unequip Weapon")
                            : t("Equip Weapon")
                        }
                      >
                        <IconButton
                          onClick={() =>
                            handleEquipWeapon(index, !weapon.isEquipped)
                          }
                          disabled={!isEditMode}
                          sx={{
                            mt: 1,
                            boxShadow: "1px 1px 5px",
                            backgroundColor: weapon.isEquipped
                              ? theme.palette.ternary.main
                              : theme.palette.background.paper,
                            "&:hover": {
                              backgroundColor: weapon.isEquipped
                                ? theme.palette.quaternary.main // Darker for equipped state
                                : theme.palette.secondary.main, // Highlight when not equipped
                            },
                            transition: "background-color 0.3s",
                          }}
                        >
                          <Equip
                            color={
                              weapon.isEquipped
                                ? theme.palette.mode === "dark"
                                  ? theme.palette.white.main // White in dark mode
                                  : theme.palette.primary.main // Primary in light mode
                                : theme.palette.background.default
                            }
                            strokeColor={
                              weapon.isEquipped && theme.palette.mode === "dark"
                                ? theme.palette.white.main // White stroke in dark mode
                                : theme.palette.secondary.main // Default primary stroke
                            }
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
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Export
                      name={weapon.name}
                      dataType="weapon"
                      data={weapon}
                    />
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
