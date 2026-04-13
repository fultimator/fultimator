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
import PrettyArmor from "../armor/PrettyArmor";
import { Edit, WarningAmber } from "@mui/icons-material";
import { Equip } from "../../../icons";
import Export from "../../../Export";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import { useTheme } from "@mui/material/styles";
import { ShieldIcon } from "../../../icons";
import { isTwoHandedEquipped } from "../slots/equipmentSlots";

export default function PlayerShields({
  player,
  shields,
  onEditShield,
  onEquipShield,
  onUnequipShield,
  onAddItem,
  isEditMode,
  onOpenCompendium,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [slotMenuAnchor, setSlotMenuAnchor] = useState(null);
  const [slotMenuIndex, setSlotMenuIndex] = useState(null);

  const hasDualShieldBearer = player.classes.some((playerClass) =>
    playerClass.skills.some(
      (skill) =>
        skill.specialSkill === "Dual Shieldbearer" && skill.currentLvl === 1
    )
  );

  const checkIfEquippable = (shield) => {
    const { classes } = player;
    if (!shield.martial) return true;
    for (const playerClass of classes) {
      const { benefits } = playerClass;
      if (benefits.martials) {
        if (shield.martial && benefits.martials.shields) {
          return true;
        }
      }
    }
    return false;
  };

  const getShieldSlot = (shield, index) => {
    const slots = player.equippedSlots;
    if (!slots) return null;
    const isMain =
      slots.mainHand?.source === 'shields' &&
      (slots.mainHand?.index !== undefined ? slots.mainHand.index === index : slots.mainHand?.name === shield.name);
    if (isMain) return 'mainHand';
    const isOff =
      slots.offHand?.source === 'shields' &&
      (slots.offHand?.index !== undefined ? slots.offHand.index === index : slots.offHand?.name === shield.name);
    if (isOff) return 'offHand';
    return null;
  };

  const handleEquipClick = (event, index) => {
    const shield = shields[index];
    if (shield.isEquipped) {
      onUnequipShield(index);
      return;
    }
    // 2H or custom weapon in main hand locks both hands
    if (isTwoHandedEquipped(player)) return;
    if (hasDualShieldBearer) {
      setSlotMenuAnchor(event.currentTarget);
      setSlotMenuIndex(index);
    } else {
      onEquipShield(index, 'offHand');
    }
  };

  const handleSlotSelect = (slot) => {
    onEquipShield(slotMenuIndex, slot);
    setSlotMenuAnchor(null);
    setSlotMenuIndex(null);
  };

  useEffect(() => {
    if (shields.length > 0) {
      setExpanded(true);
    }
  }, [shields]);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  const slotLabels = { mainHand: t('Main Hand'), offHand: t('Off Hand') };
  const mainHandOccupant = player.equippedSlots?.mainHand?.name;
  const offHandOccupant = player.equippedSlots?.offHand?.name;

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
        headerText={t("Shield")}
        showIconButton={false}
        icon={<ShieldIcon />}
        addItem={isEditMode ? onAddItem : undefined}
        openCompendium={isEditMode ? onOpenCompendium : undefined}
      />
      <AccordionDetails>
        <Grid container sx={{ justifyContent: "flex-end" }} spacing={2}>
          {shields.map((shield, index) => {
            const equippedSlot = getShieldSlot(shield, index);
            const twoHandedBlocked = !shield.isEquipped && isTwoHandedEquipped(player);
            const tooltipTitle = twoHandedBlocked
              ? t('Both hands are occupied by a two-handed weapon')
              : shield.isEquipped
              ? `${t('Unequip Shield')}${equippedSlot ? ` (${slotLabels[equippedSlot]})` : ''}`
              : hasDualShieldBearer
                ? t('Equip Shield')
                : `${t('Equip Shield')} (${slotLabels.offHand})`;

            return (
              <React.Fragment key={index}>
                <Grid  sx={{ mb: 1 }} size={12}>
                  <Box>
                    <PrettyArmor armor={shield} />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 0.25 }}>
                    {isEditMode && (
                      <Tooltip title={t("Edit")}>
                        <IconButton onClick={() => onEditShield(index)} size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Box sx={{ ml: 0.5 }}>
                      {checkIfEquippable(shield) ? (
                        <Tooltip title={tooltipTitle}>
                          <Badge
                            badgeContent={equippedSlot === 'mainHand' ? 'M' : equippedSlot === 'offHand' ? 'O' : null}
                            color="primary"
                            invisible={!shield.isEquipped || !equippedSlot}
                            sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                          >
                            <IconButton
                              onClick={(e) => handleEquipClick(e, index)}
                              disabled={!isEditMode}
                              size="small"
                              sx={{
                                backgroundColor: shield.isEquipped
                                  ? theme.palette.ternary.main
                                  : theme.palette.background.paper,
                                "&:hover": {
                                  backgroundColor: shield.isEquipped
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
                                  shield.isEquipped
                                    ? theme.palette.mode === "dark"
                                      ? theme.palette.white.main
                                      : theme.palette.primary.main
                                    : theme.palette.text.secondary
                                }
                                strokeColor={
                                  shield.isEquipped && theme.palette.mode === "dark"
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
                            onClick={(e) => handleEquipClick(e, index)}
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
                        name={shield.name}
                        dataType="shield"
                        data={shield}
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
        <MenuItem onClick={() => handleSlotSelect('offHand')}>
          <ListItemText
            primary={t('Off Hand')}
            secondary={offHandOccupant ?? undefined}
          />
        </MenuItem>
      </Menu>
    </Accordion>
  );
}
