import React, { useState, useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionDetails,
  IconButton,
  Tooltip,
  Badge,
  Box,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import PrettyCustomWeapon from "../../../../routes/equip/customWeapons/PrettyCustomWeapon";
import { Edit, WarningAmber, SwapHoriz } from "@mui/icons-material";
import { Equip } from "../../../icons";
import Export from "../../../Export";
import CustomHeaderAccordion from "../../../common/CustomHeaderAccordion";
import { useTheme } from "@mui/material/styles";
import { MeleeIcon } from "../../../icons";

export default function PlayerCustomWeapons({
  player,
  customWeapons,
  onEditCustomWeapon,
  onEquipCustomWeapon,
  onUnequipCustomWeapon,
  onUpdateCustomWeapons,
  onAddItem,
  onOpenCompendium,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  const checkIfEquippable = (customWeapon) => {
    const { classes } = player;

    // Check if any customizations make this weapon martial
    const martialCustomizations = [
      "weapon_customization_quick",
      "weapon_customization_magicdefenseboost",
      "weapon_customization_powerful",
    ];
    const isMartialFromCustomization =
      customWeapon.customizations &&
      customWeapon.customizations.some((c) =>
        martialCustomizations.includes(c.name),
      );
    const isMartial = customWeapon.martial || isMartialFromCustomization;

    // If the weapon is not martial, it is always equippable
    if (!isMartial) {
      return true;
    }

    const isRanged = customWeapon.range === "weapon_range_ranged";
    const isMelee =
      customWeapon.range === "weapon_range_melee" ||
      customWeapon.range === "weapon_range_reach";

    // Iterate through each class to check if the weapon is equippable based on their benefits
    for (const playerClass of classes) {
      const { benefits } = playerClass;

      // Check if the class benefits allow equipping armor, shields, melee, or ranged weapons
      if (benefits.martials) {
        if (
          (isMelee && benefits.martials.melee) ||
          (isRanged && benefits.martials.ranged)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const handleEquipClick = (index) => {
    const cw = customWeapons[index];
    if (cw.isEquipped) {
      onUnequipCustomWeapon(index);
    } else {
      onEquipCustomWeapon(index);
    }
  };

  const handleSwapForm = (index) => {
    const updatedCustomWeapons = customWeapons.map((cw, i) => {
      if (i !== index) return cw;
      return {
        ...cw,
        activeForm: cw.activeForm === "secondary" ? "primary" : "secondary",
      };
    });
    onUpdateCustomWeapons(updatedCustomWeapons);
  };

  useEffect(() => {
    // Open the Accordion when a new custom weapon is added
    if (customWeapons.length > 0) {
      setExpanded(true);
    }
  }, [customWeapons]);

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
        headerText={t("Custom Weapons")}
        showIconButton={false}
        icon={<MeleeIcon />}
        addItem={isEditMode ? onAddItem : undefined}
        openCompendium={isEditMode ? onOpenCompendium : undefined}
      />
      <AccordionDetails>
        <Grid container sx={{ justifyContent: "flex-end" }} spacing={2}>
          {customWeapons.map((customWeapon, index) => {
            // Check if weapon has transforming customization
            const hasTransforming =
              customWeapon.customizations &&
              customWeapon.customizations.some(
                (c) => c.name === "weapon_customization_transforming",
              );

            return (
              <React.Fragment key={index}>
                <Grid sx={{ mb: 2 }} size={12}>
                  {/* Primary Weapon */}
                  <Box
                    sx={{
                      opacity:
                        customWeapon.activeForm === "secondary" ? 0.6 : 1,
                    }}
                  >
                    <PrettyCustomWeapon
                      weaponData={{
                        ...customWeapon,
                        hands: 2, // Custom weapons are always two-handed
                        cost: customWeapon.cost || 300, // Custom weapons have base cost of 300
                        damageModifier: customWeapon.damageModifier || 0,
                        precModifier: customWeapon.precModifier || 0,
                        defModifier: customWeapon.defModifier || 0,
                        mDefModifier: customWeapon.mDefModifier || 0,
                        overrideDamageType:
                          customWeapon.overrideDamageType || false,
                        customDamageType:
                          customWeapon.customDamageType || "physical",
                      }}
                      showActions={false}
                    />
                  </Box>

                  {/* Secondary Weapon (Transforming Form) */}
                  {hasTransforming && (
                    <Box
                      sx={{
                        mt: 0.5,
                        opacity:
                          customWeapon.activeForm === "secondary" ? 1 : 0.6,
                      }}
                    >
                      {(() => {
                        const secondWeaponData = {
                          ...customWeapon,
                          name:
                            customWeapon.secondWeaponName ||
                            `${customWeapon.name} (Transforming)`,
                          category:
                            customWeapon.secondSelectedCategory ||
                            "weapon_category_brawling",
                          range:
                            customWeapon.secondSelectedRange ||
                            "weapon_range_melee",
                          accuracyCheck:
                            customWeapon.secondSelectedAccuracyCheck || {
                              att1: "dexterity",
                              att2: "might",
                            },
                          type: customWeapon.secondSelectedType || "physical",
                          customizations:
                            customWeapon.secondCurrentCustomizations || [],
                          hands: 2, // Custom weapons are always two-handed
                          cost: customWeapon.cost || 300, // Same cost as primary
                          damageModifier:
                            customWeapon.secondDamageModifier || 0,
                          precModifier: customWeapon.secondPrecModifier || 0,
                          defModifier: customWeapon.secondDefModifier || 0,
                          mDefModifier: customWeapon.secondMDefModifier || 0,
                          overrideDamageType:
                            customWeapon.secondOverrideDamageType || false,
                          customDamageType:
                            customWeapon.secondCustomDamageType || "physical",
                        };

                        return (
                          <PrettyCustomWeapon
                            weaponData={secondWeaponData}
                            showActions={false}
                          />
                        );
                      })()}
                    </Box>
                  )}

                  {/* Compact Actions Row Below Card */}
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
                          onClick={() => onEditCustomWeapon(index)}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Box sx={{ ml: 0.5 }}>
                      {checkIfEquippable(customWeapon) ? (
                        <Tooltip
                          title={
                            customWeapon.isEquipped
                              ? t("Unequip Weapon") +
                                ` (${t("Main Hand")} + ${t("Off Hand")})`
                              : t("Equip Weapon") +
                                ` (${t("Main Hand")} + ${t("Off Hand")})`
                          }
                        >
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
                                  defaultRef.source === "customWeapons" &&
                                  (defaultRef.index !== undefined
                                    ? defaultRef.index === index
                                    : defaultRef.name === customWeapon.name);

                                // For default unarmed strike, show which slots it would fill (based on empty slots)
                                if (isDefaultUnarmed && autoEquipEnabled) {
                                  const slots = player.equippedSlots ?? {};
                                  // Custom weapons are always 2-handed, check if mainHand has a custom weapon
                                  const mainHandIsCustomWeapon =
                                    slots.mainHand?.source === "customWeapons";

                                  const mainHandEmpty = !slots.mainHand;
                                  const offHandEmpty =
                                    !slots.offHand && !mainHandIsCustomWeapon;

                                  if (mainHandEmpty && offHandEmpty)
                                    return "M+O";
                                  if (mainHandEmpty && !offHandEmpty)
                                    return "M";
                                  if (!mainHandEmpty && offHandEmpty)
                                    return "O";
                                  return null;
                                }

                                // For regular custom weapons, always show M+O
                                return "M+O";
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
                                    defaultRef.source === "customWeapons" &&
                                    (defaultRef.index !== undefined
                                      ? defaultRef.index === index
                                      : defaultRef.name === customWeapon.name);

                                  if (isDefaultUnarmed && autoEquipEnabled) {
                                    const slots = player.equippedSlots ?? {};
                                    // Custom weapons are always 2-handed, check if mainHand has a custom weapon
                                    const mainHandIsCustomWeapon =
                                      slots.mainHand?.source ===
                                      "customWeapons";

                                    const mainHandEmpty = !slots.mainHand;
                                    const offHandEmpty =
                                      !slots.offHand && !mainHandIsCustomWeapon;

                                    if (mainHandEmpty && offHandEmpty)
                                      return "M+O";
                                    if (mainHandEmpty && !offHandEmpty)
                                      return "M";
                                    if (!mainHandEmpty && offHandEmpty)
                                      return "O";
                                    return null;
                                  }

                                  return "M+O";
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
                                onClick={() => handleEquipClick(index)}
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
                                      defaultRef.source === "customWeapons" &&
                                      (defaultRef.index !== undefined
                                        ? defaultRef.index === index
                                        : defaultRef.name ===
                                          customWeapon.name);
                                    return isDefaultUnarmed && autoEquipEnabled;
                                  })()
                                }
                                size="small"
                                sx={{
                                  backgroundColor: customWeapon.isEquipped
                                    ? theme.palette.ternary.main
                                    : theme.palette.background.paper,
                                  "&:hover": {
                                    backgroundColor: customWeapon.isEquipped
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
                                    customWeapon.isEquipped
                                      ? theme.palette.mode === "dark"
                                        ? theme.palette.white.main
                                        : theme.palette.primary.main
                                      : theme.palette.text.secondary
                                  }
                                  strokeColor={
                                    customWeapon.isEquipped &&
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
                              onClick={() => handleEquipClick(index)}
                              disabled={!isEditMode}
                              size="small"
                            >
                              <WarningAmber color="warning" fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Box>

                    {hasTransforming && (
                      <Box sx={{ ml: 0.5 }}>
                        <Tooltip title={t("weapon_customization_swap_form")}>
                          <span>
                            <IconButton
                              onClick={() => handleSwapForm(index)}
                              disabled={!isEditMode}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.background.paper,
                                "&:hover": {
                                  backgroundColor: theme.palette.secondary.main,
                                },
                                p: 0.5,
                                border: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <SwapHoriz fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    )}

                    <Box sx={{ ml: 0.5 }}>
                      <Export
                        name={customWeapon.name}
                        dataType="weapon"
                        data={customWeapon}
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
    </Accordion>
  );
}
