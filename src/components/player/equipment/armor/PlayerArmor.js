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
import PrettyArmor from "./PrettyArmor";
import { Edit, Error } from "@mui/icons-material";
import { Equip } from "../../../icons";
import Export from "../../../Export";

export default function PlayerArmor({
  player,
  armor,
  onEditArmor,
  onEquipArmor,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

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
      alert(t("You cannot equip this armor as you have already equipped one."));
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
          {t("Armor")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={2}>
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
                          sx={{ mt: 1, boxShadow: "1px 1px 5px" }}
                        >
                          <Equip
                            color={armorItem.isEquipped ? "green" : ternary}
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
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Export name={armorItem.name} data={armorItem} />
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
