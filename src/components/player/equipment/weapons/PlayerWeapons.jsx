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
import { SharedWeaponCard } from "../../../../components/shared/itemCards";
import { Edit, WarningAmber, Error as ErrorIcon } from "@mui/icons-material";
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
    const isTechnospheresStandard =
      player.settings?.optionalRules?.technospheres &&
      (player.settings?.optionalRules?.technospheresVariant ?? "standard") ===
        "standard";
    if (isTechnospheresStandard) return true;
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

  const getWeaponSlot = (weapon, index) => {
    const slots = player.equippedSlots;
    if (!slots) return null;
    const isMain =
      slots.mainHand?.source === "weapons" &&
      (slots.mainHand?.index !== undefined
        ? slots.mainHand.index === index
        : slots.mainHand?.name === weapon.name);
    if (isMain) return "mainHand";
    const isOff =
      slots.offHand?.source === "weapons" &&
      (slots.offHand?.index !== undefined
        ? slots.offHand.index === index
        : slots.offHand?.name === weapon.name);
    if (isOff) return "offHand";
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
      onEquipWeapon(index, "mainHand");
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

  const slotLabels = { mainHand: t("Main Hand"), offHand: t("Off Hand") };
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
        <Grid container sx={{ justifyContent: "flex-end" }} spacing={2}>
          {weapons.map((weapon, index) => {
            const equippedSlot = getWeaponSlot(weapon, index);
            const isTwoHand = weapon.hands === 2 || weapon.isTwoHand;
            const tooltipTitle = weapon.isEquipped
              ? `${t("Unequip Weapon")}${equippedSlot ? ` (${slotLabels[equippedSlot]})` : ""}`
              : isTwoHand
                ? `${t("Equip Weapon")} (${slotLabels.mainHand})`
                : t("Equip Weapon");

            return (
              <React.Fragment key={index}>
                <Grid sx={{ mb: 2 }} size={12}>
                  <Box>
                    <SharedWeaponCard item={weapon} />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      mt: 0.25,
                    }}
                  >
                    {isEditMode && (
                      <Tooltip title={t("Edit")}>
                        <IconButton
                          onClick={() => onEditWeapon(index)}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Box sx={{ ml: 0.5 }}>
                      {checkIfEquippable(weapon) ? (
                        <Tooltip title={tooltipTitle}>
                          <span>
                            <Badge
                              badgeContent={(() => {
                                const settings = player.settings ?? {};
                                const defaultRef =
                                  settings.defaultUnarmedStrikeRef;
                                const autoEquipEnabled =
                                  settings.autoEquipUnarmed ?? !!defaultRef;
                                const isDefaultUnarmed =
                                  defaultRef &&
                                  defaultRef.source === "weapons" &&
                                  (defaultRef.index !== undefined
                                    ? defaultRef.index === index
                                    : defaultRef.name === weapon.name);

                                if (
                                  isDefaultUnarmed &&
                                  autoEquipEnabled &&
                                  !equippedSlot
                                ) {
                                  const slots = player.equippedSlots ?? {};
                                  const playerInv = player.equipment?.[0];
                                  const mainHandWeapon = slots.mainHand
                                    ? (playerInv?.weapons ?? []).find(
                                        (w, i) =>
                                          i === slots.mainHand.index ||
                                          w.name === slots.mainHand.name,
                                      )
                                    : null;
                                  const mainHandIs2H =
                                    mainHandWeapon &&
                                    (mainHandWeapon.isTwoHand ||
                                      mainHandWeapon.hands === 2);

                                  const mainHandEmpty = !slots.mainHand;
                                  const offHandEmpty =
                                    !slots.offHand && !mainHandIs2H;

                                  if (mainHandEmpty && offHandEmpty)
                                    return "M+O";
                                  if (mainHandEmpty && !offHandEmpty)
                                    return "M";
                                  if (!mainHandEmpty && offHandEmpty)
                                    return "O";
                                  return null;
                                }

                                if (equippedSlot === "mainHand") {
                                  const offRef = player.equippedSlots?.offHand;
                                  const sameInBoth =
                                    offRef?.source === "weapons" &&
                                    (offRef?.index === index ||
                                      offRef?.name === weapon.name);
                                  return isTwoHand || sameInBoth ? "M+O" : "M";
                                }
                                return equippedSlot === "offHand" ? "O" : null;
                              })()}
                              color="primary"
                              invisible={(() => {
                                const badge = (() => {
                                  const settings = player.settings ?? {};
                                  const defaultRef =
                                    settings.defaultUnarmedStrikeRef;
                                  const autoEquipEnabled =
                                    settings.autoEquipUnarmed ?? !!defaultRef;
                                  const isDefaultUnarmed =
                                    defaultRef &&
                                    defaultRef.source === "weapons" &&
                                    (defaultRef.index !== undefined
                                      ? defaultRef.index === index
                                      : defaultRef.name === weapon.name);

                                  if (
                                    isDefaultUnarmed &&
                                    autoEquipEnabled &&
                                    !equippedSlot
                                  ) {
                                    const slots = player.equippedSlots ?? {};
                                    const playerInv = player.equipment?.[0];
                                    const mainHandWeapon = slots.mainHand
                                      ? (playerInv?.weapons ?? []).find(
                                          (w, i) =>
                                            i === slots.mainHand.index ||
                                            w.name === slots.mainHand.name,
                                        )
                                      : null;
                                    const mainHandIs2H =
                                      mainHandWeapon &&
                                      (mainHandWeapon.isTwoHand ||
                                        mainHandWeapon.hands === 2);

                                    const mainHandEmpty = !slots.mainHand;
                                    const offHandEmpty =
                                      !slots.offHand && !mainHandIs2H;

                                    if (mainHandEmpty && offHandEmpty)
                                      return "M+O";
                                    if (mainHandEmpty && !offHandEmpty)
                                      return "M";
                                    if (!mainHandEmpty && offHandEmpty)
                                      return "O";
                                    return null;
                                  }

                                  if (equippedSlot === "mainHand") {
                                    // Check if offHand has the same weapon (both hands)
                                    const offRef =
                                      player.equippedSlots?.offHand;
                                    const sameInBoth =
                                      offRef?.source === "weapons" &&
                                      (offRef?.index === index ||
                                        offRef?.name === weapon.name);
                                    return isTwoHand || sameInBoth
                                      ? "M+O"
                                      : "M";
                                  }
                                  return equippedSlot === "offHand"
                                    ? "O"
                                    : null;
                                })();

                                return !badge;
                              })()}
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.6rem",
                                  height: 14,
                                  minWidth: 14,
                                },
                              }}
                            >
                              <IconButton
                                onClick={(e) => handleEquipClick(e, index)}
                                disabled={
                                  !isEditMode ||
                                  (() => {
                                    const settings = player.settings ?? {};
                                    const defaultRef =
                                      settings.defaultUnarmedStrikeRef;
                                    const autoEquipEnabled =
                                      settings.autoEquipUnarmed ?? !!defaultRef;
                                    const isDefaultUnarmed =
                                      defaultRef &&
                                      defaultRef.source === "weapons" &&
                                      (defaultRef.index !== undefined
                                        ? defaultRef.index === index
                                        : defaultRef.name === weapon.name);
                                    return isDefaultUnarmed && autoEquipEnabled;
                                  })()
                                }
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
                                  border: `1px solid ${theme.palette.divider}`,
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
                                    weapon.isEquipped &&
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
                            <Badge
                              badgeContent={(() => {
                                const settings = player.settings ?? {};
                                const defaultRef =
                                  settings.defaultUnarmedStrikeRef;
                                const autoEquipEnabled =
                                  settings.autoEquipUnarmed ?? !!defaultRef;
                                const isDefaultUnarmed =
                                  defaultRef &&
                                  defaultRef.source === "weapons" &&
                                  (defaultRef.index !== undefined
                                    ? defaultRef.index === index
                                    : defaultRef.name === weapon.name);

                                // For default unarmed strike, show which slots it would fill (based on empty slots)
                                if (isDefaultUnarmed && autoEquipEnabled) {
                                  const slots = player.equippedSlots ?? {};
                                  // Check if mainHand has a 2-handed weapon (occupies both slots)
                                  const playerInv = player.equipment?.[0];
                                  const mainHandWeapon = slots.mainHand
                                    ? (playerInv?.weapons ?? []).find(
                                        (w, i) =>
                                          i === slots.mainHand.index ||
                                          w.name === slots.mainHand.name,
                                      )
                                    : null;
                                  const mainHandIs2H =
                                    mainHandWeapon &&
                                    (mainHandWeapon.isTwoHand ||
                                      mainHandWeapon.hands === 2);

                                  const mainHandEmpty = !slots.mainHand;
                                  const offHandEmpty =
                                    !slots.offHand && !mainHandIs2H;

                                  if (mainHandEmpty && offHandEmpty)
                                    return "M+O";
                                  if (mainHandEmpty && !offHandEmpty)
                                    return "M";
                                  if (!mainHandEmpty && offHandEmpty)
                                    return "O";
                                  return null;
                                }

                                return equippedSlot === "mainHand"
                                  ? isTwoHand
                                    ? "M+O"
                                    : "M"
                                  : equippedSlot === "offHand"
                                    ? "O"
                                    : null;
                              })()}
                              color="primary"
                              invisible={(() => {
                                const badge = (() => {
                                  const settings = player.settings ?? {};
                                  const defaultRef =
                                    settings.defaultUnarmedStrikeRef;
                                  const autoEquipEnabled =
                                    settings.autoEquipUnarmed ?? !!defaultRef;
                                  const isDefaultUnarmed =
                                    defaultRef &&
                                    defaultRef.source === "weapons" &&
                                    (defaultRef.index !== undefined
                                      ? defaultRef.index === index
                                      : defaultRef.name === weapon.name);

                                  if (isDefaultUnarmed && autoEquipEnabled) {
                                    const slots = player.equippedSlots ?? {};
                                    const playerInv = player.equipment?.[0];
                                    const mainHandWeapon = slots.mainHand
                                      ? (playerInv?.weapons ?? []).find(
                                          (w, i) =>
                                            i === slots.mainHand.index ||
                                            w.name === slots.mainHand.name,
                                        )
                                      : null;
                                    const mainHandIs2H =
                                      mainHandWeapon &&
                                      (mainHandWeapon.isTwoHand ||
                                        mainHandWeapon.hands === 2);

                                    const mainHandEmpty = !slots.mainHand;
                                    const offHandEmpty =
                                      !slots.offHand && !mainHandIs2H;

                                    if (mainHandEmpty && offHandEmpty)
                                      return "M+O";
                                    if (mainHandEmpty && !offHandEmpty)
                                      return "M";
                                    if (!mainHandEmpty && offHandEmpty)
                                      return "O";
                                    return null;
                                  }

                                  if (equippedSlot === "mainHand") {
                                    // Check if offHand has the same weapon (both hands)
                                    const offRef =
                                      player.equippedSlots?.offHand;
                                    const sameInBoth =
                                      offRef?.source === "weapons" &&
                                      (offRef?.index === index ||
                                        offRef?.name === weapon.name);
                                    return isTwoHand || sameInBoth
                                      ? "M+O"
                                      : "M";
                                  }
                                  return equippedSlot === "offHand"
                                    ? "O"
                                    : null;
                                })();

                                return !badge;
                              })()}
                              sx={{
                                "& .MuiBadge-badge": {
                                  fontSize: "0.6rem",
                                  height: 14,
                                  minWidth: 14,
                                },
                              }}
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
                                  border: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {weapon.isEquipped ? (
                                  <Equip
                                    color={
                                      theme.palette.mode === "dark"
                                        ? theme.palette.white.main
                                        : theme.palette.primary.main
                                    }
                                    strokeColor={
                                      theme.palette.mode === "dark"
                                        ? theme.palette.white.main
                                        : theme.palette.secondary.main
                                    }
                                  />
                                ) : (
                                  <ErrorIcon
                                    sx={{
                                      fontSize: "1.1rem",
                                      color: "error.main",
                                    }}
                                  />
                                )}
                              </IconButton>
                            </Badge>
                          </span>
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
        <MenuItem onClick={() => handleSlotSelect("mainHand")}>
          <ListItemText
            primary={t("Main Hand")}
            secondary={mainHandOccupant ?? undefined}
          />
        </MenuItem>
        <MenuItem
          onClick={() => handleSlotSelect("offHand")}
          disabled={offHandLocked}
        >
          <ListItemText
            primary={t("Off Hand")}
            secondary={
              offHandLocked
                ? t("Locked by two-handed weapon")
                : (offHandOccupant ?? undefined)
            }
          />
        </MenuItem>
      </Menu>
    </Accordion>
  );
}
