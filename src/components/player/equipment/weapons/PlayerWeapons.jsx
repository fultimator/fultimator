import React, { useState, useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionDetails,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  Badge,
  Box,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import PrettyWeapon from "./PrettyWeapon";
import { Edit, Error } from "@mui/icons-material";
import { Equip } from "../../../icons";
import Export from "../../../Export";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import { useTheme } from "@mui/material/styles";
import { MeleeIcon } from "../../../icons";
import { isTwoHandedEquipped } from "../slots/equipmentSlots";

export default function PlayerWeapons({
  player,
  weapons,
  onEditWeapon,
  onEquipWeapon,
  onUnequipWeapon,
  onAddItem,
  isEditMode,
  onOpenCompendium,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuIndex, setSlotMenuIndex] = useState(null);

  const checkIfEquippable = (weapon) => {
    const { classes } = player;
    if (!weapon.martial) return true;
    for (const playerClass of classes) {
      const { benefits } = playerClass;
      if (benefits.martials) {
        if (
          (weapon.melee && benefits.martials.melee) ||
          (weapon.ranged && benefits.martials.ranged)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const getWeaponSlot = (weapon) => {
    const slots = player.equippedSlots;
    if (!slots) return null;
    if (slots.mainHand?.source === 'weapons' && slots.mainHand?.name === weapon.name) return 'mainHand';
    if (slots.offHand?.source === 'weapons' && slots.offHand?.name === weapon.name) return 'offHand';
    return null;
  };

  const handleEquipClick = (event, index) => {
    const weapon = weapons[index];
    if (weapon.isEquipped) {
      onUnequipWeapon(index);
      return;
    }
    const isTwoHand = weapon.hands === 2 || weapon.isTwoHand;
    if (isTwoHand) {
      onEquipWeapon(index, 'mainHand');
    } else {
      setSlotMenuAnchor(event.currentTarget);
      setSlotMenuIndex(index);
    }
  };

  const handleSlotSelect = (slot) => {
    onEquipWeapon(slotMenuIndex, slot);
    setSlotMenuAnchor(null);
    setSlotMenuIndex(null);
  };

  useEffect(() => {
    if (weapons.length > 0) {
      setExpanded(true);
    }
  }, [weapons]);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const slotLabels = { mainHand: t('Main Hand'), offHand: t('Off Hand') };
  const mainHandOccupant = player.equippedSlots?.mainHand?.name;
  const offHandOccupant = player.equippedSlots?.offHand?.name;
  const offHandLocked = isTwoHandedEquipped(player);

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
        addItem={isEditMode ? onAddItem : undefined}
        openCompendium={isEditMode ? onOpenCompendium : undefined}
      />
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={2}>
          {weapons.map((weapon, index) => {
            const equippedSlot = getWeaponSlot(weapon);
            const isTwoHand = weapon.hands === 2 || weapon.isTwoHand;
            const tooltipTitle = weapon.isEquipped
              ? `${t('Unequip Weapon')}${equippedSlot ? ` (${slotLabels[equippedSlot]})` : ''}`
              : isTwoHand
                ? `${t('Equip Weapon')} (${slotLabels.mainHand})`
                : t('Equip Weapon');

            return (
              <React.Fragment key={index}>
                <Grid item xs={12} sx={{ mb: 2 }}>
                  <Box>
                    <PrettyWeapon weapon={weapon} />
                  </Box>
                  
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "flex-end", 
                    alignItems: "center",
                    mt: 0.25
                  }}>
                    {isEditMode && (
                      <Tooltip title={t("Edit")}>
                        <IconButton onClick={() => onEditWeapon(index)} size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Box sx={{ ml: 0.5 }}>
                      {checkIfEquippable(weapon) ? (
                        <Tooltip title={tooltipTitle}>
                          <Badge
                            badgeContent={equippedSlot === 'mainHand' ? (isTwoHand ? 'M+O' : 'M') : equippedSlot === 'offHand' ? 'O' : null}
                            color="primary"
                            invisible={!weapon.isEquipped || !equippedSlot}
                            sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                          >
                            <IconButton
                              onClick={(e) => handleEquipClick(e, index)}
                              disabled={!isEditMode}
                              size="small"
                              sx={{
                                backgroundColor: weapon.isEquipped
                                  ? theme.palette.ternary.main
                                  : theme.palette.background.paper,
                                "&:hover": {
                                  backgroundColor: weapon.isEquipped
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
                                  weapon.isEquipped
                                    ? theme.palette.mode === "dark"
                                      ? theme.palette.white.main
                                      : theme.palette.primary.main
                                    : theme.palette.text.secondary
                                }
                                strokeColor={
                                  weapon.isEquipped && theme.palette.mode === "dark"
                                    ? theme.palette.white.main
                                    : theme.palette.secondary.main
                                }
                              />
                            </IconButton>
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Tooltip title={t("Not Equippable")}>
                          <IconButton size="small">
                            <Error color="error" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Box sx={{ ml: 0.5 }}>
                      <Export
                        name={weapon.name}
                        dataType="weapon"
                        data={weapon}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
              </React.Fragment>
            );
          })}
        </Grid>
      </AccordionDetails>
      <Menu
        anchorEl={slotMenuAnchor}
        open={Boolean(slotMenuAnchor)}
        onClose={() => setSlotMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleSlotSelect('mainHand')}>
          <ListItemText
            primary={t('Main Hand')}
            secondary={mainHandOccupant ?? undefined}
          />
        </MenuItem>
        <MenuItem onClick={() => handleSlotSelect('offHand')} disabled={offHandLocked}>
          <ListItemText
            primary={t('Off Hand')}
            secondary={offHandLocked ? t('Locked by two-handed weapon') : (offHandOccupant ?? undefined)}
          />
        </MenuItem>
      </Menu>
    </Accordion>
  );
}
