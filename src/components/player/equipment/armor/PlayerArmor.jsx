import React, { useState, useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionDetails,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import PrettyArmor from "./PrettyArmor";
import { Edit, Error } from "@mui/icons-material";
import { Equip } from "../../../icons";
import Export from "../../../Export";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import { useTheme } from "@mui/material/styles";
import { ArmorIcon } from "../../../icons";

export default function PlayerArmor({
  player,
  armor,
  onEditArmor,
  onEquipArmor,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  const checkIfEquippable = (armorItem) => {
    // if armor is not martial then is always equippable
    // true = equippable, false = not equippable

    const { classes } = player;

    // If the armor is not martial, it is always equippable
    if (!armorItem.martial) {
      return true;
    }

    // Iterate through each class to check if the armor is equippable based on their benefits
    for (const playerClass of classes) {
      const { benefits } = playerClass;

      // Check if the class benefits allow equipping martial armor
      if (benefits.martials) {
        if (armorItem.martial && benefits.martials.armor) {
          // The armor is equippable based on the current class
          return true;
        }
      }
    }

    // The armor is not equippable based on any of the player's classes
    return false;
  };

  const countEquippedArmor = () => {
    let count = 0;
    armor.forEach((armor) => {
      if (armor.isEquipped) {
        count++;
      }
    });
    return count;
  };

  const canEquipArmor = () => {
    if (countEquippedArmor() === 0) {
      return true;
    }
    return false;
  };

  const handleEquipArmor = (index, checked) => {
    const armorSelected = armor[index];
    if (canEquipArmor(armorSelected) || !checked) {
      const updatedArmor = { ...armor };
      updatedArmor[index].isEquipped = checked;
      onEquipArmor(updatedArmor);
    } else {
      if (window.electron) {
        window.electron.alert(
          t("You cannot equip this armor as you have already equipped one.")
        );
      } else {
        alert(
          t("You cannot equip this armor as you have already equipped one.")
        );
      }
    }
  };

  useEffect(() => {
    // Open the Accordion when a new weapon is added
    if (armor.length > 0) {
      setExpanded(true);
    }
  }, [armor]);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
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
        headerText={t("Armor")}
        showIconButton={false}
        icon={<ArmorIcon />}
      />
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={3}>
          {/* map the weapons and display them with a PrettyWeapon component if they exist */}
          {armor.map((armorItem, index) => (
            <React.Fragment key={index}>
              <Grid item container xs={12} alignItems="center" spacing={1}>
                {/* Updated grid item */}
                <Grid item xs={11}>
                  <PrettyArmor armor={armorItem} />
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
                      <IconButton onClick={() => onEditArmor(index)}>
                        <Edit />
                      </IconButton>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    {checkIfEquippable(armorItem) ? (
                      <Tooltip
                        title={
                          armorItem.isEquipped
                            ? t("Unequip Armor")
                            : t("Equip Armor")
                        }
                      >
                        <IconButton
                          onClick={() =>
                            handleEquipArmor(index, !armorItem.isEquipped)
                          }
                          disabled={!isEditMode}
                          sx={{
                            mt: 1,
                            boxShadow: "1px 1px 5px",
                            backgroundColor: armorItem.isEquipped
                              ? theme.palette.ternary.main
                              : theme.palette.background.paper,
                            "&:hover": {
                              backgroundColor: armorItem.isEquipped
                                ? theme.palette.quaternary.main // Darker for equipped state
                                : theme.palette.secondary.main, // Highlight when not equipped
                            },
                            transition: "background-color 0.3s",
                          }}
                        >
                          <Equip
                            color={
                              armorItem.isEquipped
                                ? theme.palette.mode === "dark"
                                  ? theme.palette.white.main // White in dark mode
                                  : theme.palette.primary.main // Primary in light mode
                                : theme.palette.background.default
                            }
                            strokeColor={
                              armorItem.isEquipped &&
                              theme.palette.mode === "dark"
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
                      name={armorItem.name}
                      dataType="armor"
                      data={armorItem}
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
