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
import { Edit, WarningAmber } from "@mui/icons-material";
import { Equip } from "../../../icons";
import PrettyAccessory from "./PrettyAccessory";
import Export from "../../../Export";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import { useTheme } from "@mui/material/styles";
import { AccessoryIcon } from "../../../icons";

export default function PlayerAccessories({
  player,
  accessories,
  onEditAccessory,
  onEquipAccessory,
  onAddItem,
  onOpenCompendium,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  const checkIfEquippable = (accessory) => {
    // if armor is not martial then is always equippable
    // true = equippable, false = not equippable

    const { classes } = player;

    // If the armor is not martial, it is always equippable
    if (!accessory.martial) {
      return true;
    }

    // Iterate through each class to check if the armor is equippable based on their benefits
    for (const playerClass of classes) {
      const { benefits } = playerClass;

      // Check if the class benefits allow equipping martial armor
      if (benefits.martials) {
        if (accessory.martial && benefits.martials.armor) {
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
    if (accessories.length > 0) {
      setExpanded(true);
    }
  }, [accessories]);

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
        headerText={t("Accessories")}
        showIconButton={false}
        icon={<AccessoryIcon />}
        addItem={isEditMode ? onAddItem : undefined}
        openCompendium={isEditMode ? onOpenCompendium : undefined}
      />
      <AccordionDetails>
        <Grid container sx={{ justifyContent: "flex-end" }} spacing={2}>
          {/* map the weapons and display them with a PrettyWeapon component if they exist */}
          {accessories.map((accessory, index) => (
            <React.Fragment key={index}>
              <Grid  sx={{ mb: 1 }} size={12}>
                <Box>
                  <PrettyAccessory accessory={accessory} />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 0.25 }}>
                  {isEditMode && (
                    <Tooltip title={t("Edit")}>
                      <IconButton onClick={() => onEditAccessory(index)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Box sx={{ ml: 0.5 }}>
                    {checkIfEquippable(accessory) ? (
                      <Tooltip
                        title={
                          accessory.isEquipped
                            ? t("Unequip Accessory")
                            : t("Equip Accessory")
                        }
                      >
                        <span>
                          <Badge
                          badgeContent="E"
                          color="primary"
                          invisible={!accessory.isEquipped}
                          sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                          >
                            <IconButton
                              onClick={() => onEquipAccessory(index)}

                              disabled={!isEditMode}
                              size="small"
                              sx={{
                                backgroundColor: accessory.isEquipped
                                  ? theme.palette.ternary.main
                                  : theme.palette.background.paper,
                                "&:hover": {
                                  backgroundColor: accessory.isEquipped
                                    ? theme.palette.quaternary.main
                                    : theme.palette.secondary.main,
                                },
                                transition: "background-color 0.3s",
                                p: 0.5,
                                border: `1px solid ${theme.palette.divider}`
                              }}
                            >
                              <Equip
                                size={18}
                                color={
                                  accessory.isEquipped
                                    ? theme.palette.mode === "dark"
                                      ? theme.palette.white.main
                                      : theme.palette.primary.main
                                    : theme.palette.text.secondary
                                }
                                strokeColor={
                                  accessory.isEquipped &&
                                  theme.palette.mode === "dark"
                                    ? theme.palette.white.main
                                    : theme.palette.secondary.main
                                }
                              />
                            </IconButton>
                          </Badge>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("Not proficient  -  martial item")}>
                        <span>
                          <IconButton
                            onClick={() => onEquipAccessory(index)}
                            disabled={!isEditMode}
                            size="small"
                          >
                            <WarningAmber color="warning" fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ ml: 0.5 }}>
                    <Export
                      name={accessory.name}
                      dataType="accessory"
                      data={accessory}
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
