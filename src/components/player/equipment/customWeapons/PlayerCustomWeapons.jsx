import React, { useState, useEffect } from "react";
import {
  Grid,
  Accordion,
  AccordionDetails,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import PrettyCustomWeapon from "../../../../routes/equip/customWeapons/PrettyCustomWeapon";
import { Edit, Error } from "@mui/icons-material";
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
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  const checkIfEquippable = (customWeapon) => {
    const { classes } = player;

    // Check if any customizations make this weapon martial
    const martialCustomizations = ['weapon_customization_quick', 'weapon_customization_magicdefenseboost', 'weapon_customization_powerful'];
    const isMartial = customWeapon.customizations && customWeapon.customizations.some(c => martialCustomizations.includes(c.name));
    
    // If the weapon is not martial, it is always equippable
    if (!isMartial) {
      return true;
    }

    // Iterate through each class to check if the weapon is equippable based on their benefits
    for (const playerClass of classes) {
      const { benefits } = playerClass;

      // Check if the class benefits allow equipping martial weapons
      if (benefits.martials) {
        if (isMartial && benefits.martials.melee) {
          return true;
        }
      }
    }

    return false;
  };

  const countEquippedWeapons = () => {
    let oneHandedCount = 0;
    let twoHandedCount = 0;

    // Count regular weapons
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

    // Count custom weapons (all are two-handed)
    customWeapons.forEach((weapon) => {
      if (weapon.isEquipped) {
        twoHandedCount++;
      }
    });

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

  const canEquipCustomWeapon = () => {
    const { oneHandedCount, twoHandedCount } = countEquippedWeapons();
    const shieldsCount = countEquippedShields();

    // Custom weapons are always two-handed, so both hands must be free
    return oneHandedCount === 0 && twoHandedCount === 0 && shieldsCount === 0;
  };

  const handleEquipCustomWeapon = (index, checked) => {
    if (canEquipCustomWeapon() || !checked) {
      const updatedCustomWeapons = [...customWeapons];
      updatedCustomWeapons[index].isEquipped = checked;
      
      // If equipping this custom weapon, unequip all other weapons
      if (checked) {
        // Unequip all regular weapons
        const updatedWeapons = (player.weapons || []).map(weapon => ({
          ...weapon,
          isEquipped: false
        }));
        
        // Unequip all shields
        const updatedShields = (player.shields || []).map(shield => ({
          ...shield,
          isEquipped: false
        }));
        
        // Unequip all other custom weapons
        updatedCustomWeapons.forEach((cw, i) => {
          if (i !== index) {
            cw.isEquipped = false;
          }
        });
        
        // Update all equipment states
        onEquipCustomWeapon(updatedCustomWeapons, updatedWeapons, updatedShields);
      } else {
        onEquipCustomWeapon(updatedCustomWeapons);
      }
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
      />
      <AccordionDetails>
        <Grid container justifyContent="flex-end" spacing={3}>
          {customWeapons.map((customWeapon, index) => {
            // Check if weapon has transforming customization
            const hasTransforming = customWeapon.customizations && customWeapon.customizations.some(
              (c) => c.name === "weapon_customization_transforming"
            );

            return (
              <React.Fragment key={index}>
                {/* Primary Weapon */}
                <Grid item container xs={12} alignItems="center" spacing={1}>
                  <Grid item xs={11}>
                    <PrettyCustomWeapon 
                      weaponData={{
                        ...customWeapon,
                        hands: 2, // Custom weapons are always two-handed
                        cost: customWeapon.cost || 300, // Custom weapons have base cost of 300
                        damageModifier: customWeapon.damageModifier || 0,
                        precModifier: customWeapon.precModifier || 0,
                        defModifier: customWeapon.defModifier || 0,
                        mDefModifier: customWeapon.mDefModifier || 0,
                        overrideDamageType: customWeapon.overrideDamageType || false,
                        customDamageType: customWeapon.customDamageType || "physical",
                      }} 
                      showActions={false}
                    />
                  </Grid>
                  <Grid
                    item
                    container
                    xs={1}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {isEditMode && (
                      <Grid item xs={12}>
                        <IconButton onClick={() => onEditCustomWeapon(index)}>
                          <Edit />
                        </IconButton>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      {checkIfEquippable(customWeapon) ? (
                        <Tooltip
                          title={
                            customWeapon.isEquipped
                              ? t("Unequip Weapon")
                              : t("Equip Weapon")
                          }
                        >
                          <IconButton
                            onClick={() =>
                              handleEquipCustomWeapon(index, !customWeapon.isEquipped)
                            }
                            disabled={!isEditMode}
                            sx={{
                              mt: 1,
                              boxShadow: "1px 1px 5px",
                              backgroundColor: customWeapon.isEquipped
                                ? theme.palette.ternary.main
                                : theme.palette.background.paper,
                              "&:hover": {
                                backgroundColor: customWeapon.isEquipped
                                  ? theme.palette.quaternary.main
                                  : theme.palette.secondary.main,
                              },
                              transition: "background-color 0.3s",
                            }}
                          >
                            <Equip
                              color={
                                customWeapon.isEquipped
                                  ? theme.palette.mode === "dark"
                                    ? theme.palette.white.main
                                    : theme.palette.primary.main
                                  : theme.palette.background.default
                              }
                              strokeColor={
                                customWeapon.isEquipped &&
                                theme.palette.mode === "dark"
                                  ? theme.palette.white.main
                                  : theme.palette.secondary.main
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
                        name={customWeapon.name}
                        dataType="weapon"
                        data={customWeapon}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Secondary Weapon (Transforming Form) */}
                {hasTransforming && (
                  <Grid item container xs={12} alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={11}>
                      {(() => {
                        const secondWeaponData = {
                          name: customWeapon.secondWeaponName || `${customWeapon.name} (Transforming)`,
                          category: customWeapon.secondSelectedCategory || "weapon_category_brawling",
                          range: customWeapon.secondSelectedRange || "weapon_range_melee", 
                          accuracyCheck: customWeapon.secondSelectedAccuracyCheck || {att1: "dexterity", att2: "might"},
                          type: customWeapon.secondSelectedType || "physical",
                          customizations: customWeapon.secondCurrentCustomizations || [],
                          selectedQuality: customWeapon.secondSelectedQuality || "",
                          quality: customWeapon.secondQuality || "",
                          qualityCost: customWeapon.secondQualityCost || 0,
                          hands: 2, // Custom weapons are always two-handed
                          cost: customWeapon.cost || 300, // Same cost as primary
                          damageModifier: customWeapon.secondDamageModifier || 0,
                          precModifier: customWeapon.secondPrecModifier || 0,
                          defModifier: customWeapon.secondDefModifier || 0,
                          mDefModifier: customWeapon.secondMDefModifier || 0,
                          overrideDamageType: customWeapon.secondOverrideDamageType || false,
                          customDamageType: customWeapon.secondCustomDamageType || "physical",
                        };
                        
                        return <PrettyCustomWeapon weaponData={secondWeaponData} showActions={false} />;
                      })()}
                    </Grid>
                    <Grid item xs={1}>
                      {/* Empty space - no buttons for secondary form */}
                    </Grid>
                  </Grid>
                )}
            </React.Fragment>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}