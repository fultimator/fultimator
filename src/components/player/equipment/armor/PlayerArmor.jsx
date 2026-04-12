import React, { useState, useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionDetails,
  IconButton,
  Tooltip,
  Box,
  Badge,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import PrettyArmor from "./PrettyArmor";
import { Edit, WarningAmber } from "@mui/icons-material";
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
  onAddItem,
  isEditMode,
  onOpenCompendium,
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
        addItem={isEditMode ? onAddItem : undefined}
        openCompendium={isEditMode ? onOpenCompendium : undefined}
      />
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={2}>
          {/* map the weapons and display them with a PrettyWeapon component if they exist */}
          {armor.map((armorItem, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Box>
                  <PrettyArmor armor={armorItem} />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 0.25 }}>
                  {isEditMode && (
                    <Tooltip title={t("Edit")}>
                      <IconButton onClick={() => onEditArmor(index)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Box sx={{ ml: 0.5 }}>
                    {checkIfEquippable(armorItem) ? (
                      <Tooltip
                        title={
                          armorItem.isEquipped
                            ? t("Unequip Armor")
                            : t("Equip Armor")
                        }
                      >
                        <Badge
                          badgeContent="E"
                          color="primary"
                          invisible={!armorItem.isEquipped}
                          sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                        >
                          <IconButton
                            onClick={() => onEquipArmor(index)}

                            disabled={!isEditMode}
                            size="small"
                            sx={{
                              backgroundColor: armorItem.isEquipped
                                ? theme.palette.ternary.main
                                : theme.palette.background.paper,
                              "&:hover": {
                                backgroundColor: armorItem.isEquipped
                                  ? theme.palette.quaternary.main
                                  : theme.palette.secondary.main,
                              },
                              transition: "background-color 0.3s",
                              p: 0.5,
                              border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <Equip
                              color={
                                armorItem.isEquipped
                                  ? theme.palette.mode === "dark"
                                    ? theme.palette.white.main
                                    : theme.palette.primary.main
                                  : theme.palette.text.secondary
                              }
                              strokeColor={
                                armorItem.isEquipped &&
                                theme.palette.mode === "dark"
                                  ? theme.palette.white.main
                                  : theme.palette.secondary.main
                              }
                            />
                          </IconButton>
                        </Badge>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("Not proficient  -  martial item")}>
                        <IconButton
                          onClick={() => onEquipArmor(index)}
                          disabled={!isEditMode}
                          size="small"
                        >
                          <WarningAmber color="warning" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ ml: 0.5 }}>
                    <Export
                      name={armorItem.name}
                      dataType="armor"
                      data={armorItem}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
