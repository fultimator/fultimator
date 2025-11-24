import React from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { VisibilityOff, ExpandMore, DirectionsCar } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import attributes from "../../../libs/attributes";

const availableFrames = [
  {
    name: "pilot_frame_exoskeleton",
    passengers: 0,
    distance: 1,
    limits: {
      weapon: 2,
      armor: 1,
      support: -1,
    },
  },
  {
    name: "pilot_frame_mecha",
    passengers: 1,
    distance: 2,
    limits: {
      weapon: 2,
      armor: 1,
      support: -1,
    },
  },
  {
    name: "pilot_frame_steed",
    passengers: 2,
    distance: 3,
    limits: {
      weapon: 1,
      armor: 1,
      support: -1,
    },
  }
];

function ThemedSpellPilot({ pilot, onEditVehicles, isEditMode, onEdit, onModuleChange, onVehicleChange }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    pilot.showInPlayerSheet || pilot.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ ...props }) => <p style={inlineStyles} {...props} />,
  };

  const getFrameLimits = (vehicle) => {
    const frame = availableFrames.find(f => f.name === (vehicle.frame || "pilot_frame_exoskeleton"));
    
    return frame ? frame.limits : { weapon: 2, armor: 1, support: -1 };
  };

  const getModuleTypeForLimits = (module) => {
    if (module.type === "pilot_module_armor") return "armor";
    if (module.type === "pilot_module_weapon") return "weapon";
    if (module.type === "pilot_module_support") return "support";
    return "custom";
  };

  const getEquippedCount = (vehicle, moduleType) => {
    if (!vehicle.modules) return 0;
    return vehicle.modules.filter(m =>
      m.equipped && getModuleTypeForLimits(m) === moduleType
    ).reduce((count, module) => {
      // Complex support modules take 2 slots
      if (getModuleTypeForLimits(module) === "support" && module.isComplex) {
        return count + 2;
      }
      return count + 1;
    }, 0);
  };

  const canEquipModule = (vehicle, moduleIndex) => {
    const module = vehicle.modules[moduleIndex];
    const frameType = getModuleTypeForLimits(module);
    const frameLimits = getFrameLimits(vehicle);
    const maxEnabledModules = vehicle.maxEnabledModules || (frameLimits.weapon + frameLimits.armor);

    // Calculate total equipped modules
    const equippedWeapons = getEquippedCount(vehicle, "weapon");
    const equippedArmor = getEquippedCount(vehicle, "armor");
    const equippedSupport = getEquippedCount(vehicle, "support");
    const totalEquippedModules = equippedWeapons + equippedArmor + equippedSupport;

    // If we are trying to equip a new module and we are at or over the max, we can't.
    if (!module.equipped && totalEquippedModules >= maxEnabledModules) {
        return false;
    }

    // Check if unlimited slots for this type
    if (frameLimits[frameType] === -1) return true; // Unlimited

    // For weapons, check hand slot availability
    if (frameType === "weapon") {
      const equippedWeapons = vehicle.modules.filter((m, idx) =>
        idx !== moduleIndex &&
        m.equipped &&
        getModuleTypeForLimits(m) === "weapon"
      );

      // Check if any equipped weapon uses both hands (M+O)
      const hasBothHandsWeapon = equippedWeapons.some(m => 
        m.equippedSlot === "both"
      );

      // If there's a both-hands weapon, no other weapons can be equipped
      if (hasBothHandsWeapon) return false;

      // For unequipped weapons, check if they can be equipped to any available hand
      if (!module.equipped) {
        // Shields can only go to off hand
        if (module.isShield) {
          const occupiedSlots = equippedWeapons.map(m => 
            m.isShield ? "off" : (m.equippedSlot || "main")
          );
          return !occupiedSlots.includes("off");
        }
        
        // Regular weapons can go to either main or off hand (whichever is available)
        const occupiedSlots = equippedWeapons.map(m => 
          m.isShield ? "off" : (m.equippedSlot || "main")
        );
        
        // Can equip if either main OR off hand is available
        return !occupiedSlots.includes("main") || !occupiedSlots.includes("off");
      }
      
      // For equipped weapons being re-evaluated, check their specific slot
      const proposedSlot = module.isShield ? "off" : (module.equippedSlot || "main");
      
      // If this weapon uses both hands, check that no other weapons are equipped
      if (proposedSlot === "both") {
        return equippedWeapons.length === 0;
      }

      // Check if the proposed hand slot is available
      const occupiedSlots = equippedWeapons.map(m => 
        m.isShield ? "off" : (m.equippedSlot || "main")
      );
      
      return !occupiedSlots.includes(proposedSlot);
    }

    const currentlyEquippedSlots = vehicle.modules.filter((m, idx) =>
      idx !== moduleIndex &&
      m.equipped &&
      getModuleTypeForLimits(m) === frameType
    ).reduce((count, m) => {
      // Complex support modules take 2 slots
      if (getModuleTypeForLimits(m) === "support" && m.isComplex) {
        return count + 2;
      }
      return count + 1;
    }, 0);

    // Check if this module would fit
    const slotsNeeded = (frameType === "support" && module.isComplex) ? 2 : 1;
    return currentlyEquippedSlots + slotsNeeded <= frameLimits[frameType];
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <DirectionsCar />
          </Icon>
          <Typography variant="h4">{t("pilot_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("pilot_details_1")}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {isEditMode && (
        <Grid
          item
          xs
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Button
            onClick={onEdit}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("pilot_settings_button")}
          </Button>
          <Button
            onClick={onEditVehicles}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("pilot_edit_vehicles_button")}
          </Button>
          {!showInPlayerSheet && (
            <Tooltip title={t("pilot_vehicles_not_shown_tooltip")}>
              <Icon>
                <VisibilityOff style={{ color: "black" }} />
              </Icon>
            </Tooltip>
          )}
        </Grid>
      )}

      {/* VEHICLES */}
      <div
        style={{
          backgroundColor: theme.primary,
          fontFamily: "Antonio",
          fontWeight: "normal",
          fontSize: "1.1em",
          padding: "2px 17px",
          color: theme.white,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("pilot_vehicle")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("pilot_module_enable")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {pilot.vehicles && pilot.vehicles.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("pilot_vehicles_not_available")}
        </Typography>
      ) : (
        pilot.vehicles &&
        pilot.vehicles.map((vehicle, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                padding: "3px 17px",
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid ${theme.secondary}`,
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs={6}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <div>
                    <Typography
                      fontWeight="bold"
                      style={{ flexGrow: 1, marginRight: "5px" }}
                    >
                      {vehicle.customName || t("Vehicle")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontSize: "0.75em" }}
                    >
                      {(() => {
                        const frame = availableFrames.find(f => f.name === (vehicle.frame || "pilot_frame_exoskeleton"));
                        if (!frame) return "";

                        const getPassengersText = (passengers) => {
                          switch (passengers) {
                            case 0: return t("None");
                            case 1: return t("pilot_passengers_up_1");
                            case 2: return t("pilot_passengers_up_2");
                            case 3: return t("pilot_passengers_up_3");
                            default: return t("None");
                          }
                        };

                        const getDistanceText = (distance) => {
                          return distance === 1 ? t("pilot_distance_no_mod") : `×${distance}`;
                        };

                        const passengers = frame.passengers;
                        const distance = frame.distance;

                        // Calculate total equipped modules
                        const equippedWeapons = getEquippedCount(vehicle, "weapon");
                        const equippedArmor = getEquippedCount(vehicle, "armor");
                        const equippedSupport = getEquippedCount(vehicle, "support");
                        const total = equippedWeapons + equippedArmor + equippedSupport;

                        // Use maxEnabledModules from vehicle data, or calculate it if not present
                        const maxDisplay = vehicle.maxEnabledModules || (frame.limits.weapon + frame.limits.armor);

                        return `${t(vehicle.frame || "pilot_frame_exoskeleton")} | ${t("pilot_passengers")}: ${getPassengersText(passengers)} | ${t("pilot_distance")}: ${getDistanceText(distance)} | ${t("pilot_max_enabled_modules")}: ${total}/${maxDisplay}`;
                      })()}
                    </Typography>
                  </div>
                </Grid>
                <Grid
                  item
                  xs={5}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <Typography style={{ flexGrow: 1, marginRight: "5px" }}>
                    {vehicle.modules && vehicle.modules.filter(m => m.equipped).length > 0
                      ? vehicle.modules.filter(m => m.equipped).map(m => {
                        const moduleName = (m.name === "pilot_custom_armor" || m.name === "pilot_custom_weapon" || m.name === "pilot_custom_support") ? m.customName : t(m.name);
                        let slotInfo = "";
                        if (m.type === "pilot_module_weapon") {
                          // Show hand information for weapons
                          const handText = m.equippedSlot === "main" ? "M" : m.equippedSlot === "off" ? "O" : "M+O";
                          slotInfo = `[${handText}]`;
                        } else if (m.type === "pilot_module_support" && m.isComplex) {
                          slotInfo = "(2 slots)";
                        } else {
                          slotInfo = "(1 slot)";
                        }
                        return `${moduleName} ${slotInfo}`;
                      }).join(", ")
                      : t("No modules equipped")}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {isEditMode && (
                    <Button
                      variant={vehicle.enabled ? "contained" : "outlined"}
                      color={vehicle.enabled ? "success" : "primary"}
                      size="small"
                      onClick={() => onVehicleChange && onVehicleChange(i, "enabled", !vehicle.enabled)}
                      sx={{ minWidth: 60 }}
                    >
                      {vehicle.enabled ? "Active" : "Enable"}
                    </Button>
                  )}
                </Grid>
              </Grid>
              {isEditMode && (
                <Grid
                  item
                  xs
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    minHeight: 34,
                  }}
                ></Grid>
              )}
            </div>

            {/* Vehicle Modules */}
            {vehicle.modules && vehicle.modules.length > 0 ? (
              <>
                <div
                  style={{
                    backgroundColor: theme.secondary,
                    fontFamily: "Antonio",
                    fontWeight: "normal",
                    fontSize: "0.9em",
                    padding: "2px 17px",
                    color: theme.white,
                    textTransform: "uppercase",
                  }}
                >
                  <Grid container>
                    <Grid item xs={4}>
                      <Typography variant="h3">{t("pilot_module")}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3">{t("Description")}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h3">{t("Status")}</Typography>
                    </Grid>
                  </Grid>
                </div>
                {/* Group modules by module type */}
                {(() => {
                  const modulesByType = vehicle.modules.reduce((acc, module, originalIndex) => {
                    let typeKey;

                    // Determine category based on module type
                    if (module.type === "pilot_module_armor") {
                      typeKey = "armor";
                    } else if (module.type === "pilot_module_weapon") {
                      typeKey = "weapon"; // Both weapons and shields are weapon modules
                    } else if (module.type === "pilot_module_support") {
                      typeKey = "support";
                    } else {
                      typeKey = "custom";
                    }

                    if (!acc[typeKey]) acc[typeKey] = [];
                    acc[typeKey].push({ ...module, originalIndex });
                    return acc;
                  }, {});

                  const typeOrder = [
                    "armor",
                    "weapon",
                    "support",
                    "custom"
                  ];

                  return typeOrder.map(moduleType => {
                    if (!modulesByType[moduleType] || modulesByType[moduleType].length === 0) return null;

                    const getSlotUsageText = (moduleType) => {
                      const frameLimits = getFrameLimits(vehicle);
                      const equipped = getEquippedCount(vehicle, moduleType);
                      const limit = frameLimits[moduleType];

                      if (limit === -1) return `(${equipped}/∞)`;
                      return `(${equipped}/${limit})`;
                    };

                    const typeHeaders = {
                      armor: `Armor Modules ${getSlotUsageText("armor")}`,
                      weapon: `Weapon Modules ${getSlotUsageText("weapon")}`, // Includes both weapons and shields
                      support: `Support Modules ${getSlotUsageText("support")}`,
                      custom: "Custom Modules"
                    };

                    return [
                      // Type header
                      <div
                        key={`header-${moduleType}`}
                        style={{
                          backgroundColor: theme.primary + "aa",
                          padding: "2px 17px",
                          fontSize: "0.85em",
                          fontWeight: "bold",
                          color: theme.white,
                          textTransform: "uppercase",
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: "inherit", fontWeight: "bold" }}>
                          {t(typeHeaders[moduleType])}
                        </Typography>
                      </div>,
                      // Type modules
                      ...modulesByType[moduleType].map((module, moduleIndex) => (
                        <div
                          key={`${moduleType}-${moduleIndex}`}
                          style={{
                            padding: "3px 17px",
                            borderBottom: `1px solid ${theme.secondary}`,
                            backgroundColor: module.enabled ? theme.ternary + "20" : "transparent",
                            borderLeft: module.enabled ? `4px solid ${theme.primary}` : "none",
                          }}
                        >
                          <Grid container>
                            <Grid item xs={4}>
                              <Typography fontWeight={module.enabled ? "bold" : "normal"} sx={{ fontSize: "1em" }}>
                                {(module.name === "pilot_custom_armor" || module.name === "pilot_custom_weapon" || module.name === "pilot_custom_support")
                                  ? module.customName
                                  : t(module.name)}
                                {module.cumbersome && " ⚠"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              {(module.type === "pilot_module_weapon") ? (
                                <div>
                                  <Typography sx={{ fontSize: "0.9em", fontWeight: "bold" }}>
                                    {t("Accuracy")}: [{attributes[module.att1 || "might"].shortcaps} + {attributes[module.att2 || "dexterity"].shortcaps}] {(module.prec || 0) >= 0 ? `+${module.prec || 0}` : module.prec}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.9em", fontWeight: "bold" }}>
                                    {t("Damage")}: [HR + {module.damage || 0}]
                                  </Typography>
                                  <div style={{ fontSize: "0.95em", marginTop: "4px" }}>
                                    <ReactMarkdown components={components}>
                                      {module.name === "pilot_custom_weapon"
                                        ? module.description
                                        : t(module.description)}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              ) : module.type === "pilot_module_armor" ? (
                                <div>
                                  <Typography sx={{ fontSize: "0.9em", fontWeight: "bold" }}>
                                    Defense: {module.martial
                                      ? (module.def || 0)
                                      : (module.def && module.def > 0)
                                        ? `${t("DEX die")} + ${module.def}`
                                        : t("DEX die")}
                                  </Typography>
                                  <Typography sx={{ fontSize: "0.9em", fontWeight: "bold" }}>
                                    M. Defense: {module.martial
                                      ? (module.mdef || 0)
                                      : (module.mdef && module.mdef > 0)
                                        ? `${t("INS die")} + ${module.mdef}`
                                        : t("INS die")}
                                  </Typography>
                                  {/* {module.cost && module.cost > 0 && (
                                  <Typography sx={{ fontSize: "0.75em", fontWeight: "bold" }}>
                                    Cost: {module.cost}z
                                  </Typography>
                                )} */}
                                  {/* No description for armor modules */}
                                </div>
                              ) : (
                                <div style={{ fontSize: "0.95em" }}>
                                  <ReactMarkdown components={components}>
                                    {(module.name === "pilot_custom_armor" || module.name === "pilot_custom_weapon" || module.name === "pilot_custom_support")
                                      ? module.description
                                      : t(module.description)}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </Grid>
                            <Grid item xs={2}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                                {isEditMode && (
                                  <>
                                    <Button
                                      variant={module.equipped ? "contained" : "outlined"}
                                      color={module.equipped ? "success" : "primary"}
                                      size="small"
                                      disabled={!module.equipped && !canEquipModule(vehicle, module.originalIndex)}
                                      onClick={() => onModuleChange && onModuleChange(i, module.originalIndex, "equipped", !module.equipped)}
                                      sx={{ minWidth: 60 }}
                                    >
                                      {module.equipped ? "Equipped" : "Equip"}
                                    </Button>
                                    {/* Hand toggle for equipped weapons */}
                                    {module.equipped && module.type === "pilot_module_weapon" && (
                                      <div style={{ marginLeft: 8 }}>
                                        {module.isShield ? (
                                          // Shields are locked to off-hand
                                          <Button
                                            variant="contained"
                                            size="small"
                                            disabled
                                            sx={{ minWidth: 40, fontSize: '0.75rem' }}
                                          >
                                            O
                                          </Button>
                                        ) : module.cumbersome ? (
                                          // Cumbersome weapons use both hands
                                          <Button
                                            variant="contained"
                                            size="small"
                                            disabled
                                            sx={{ minWidth: 40, fontSize: '0.75rem' }}
                                          >
                                            M+O
                                          </Button>
                                        ) : (
                                          // Regular weapons can toggle between main/off/both
                                          <ToggleButtonGroup
                                            value={module.equippedSlot || "main"}
                                            exclusive
                                            onChange={(e, newValue) => {
                                              if (newValue !== null && onModuleChange) {
                                                onModuleChange(i, module.originalIndex, "equippedSlot", newValue);
                                              }
                                            }}
                                            size="small"
                                          >
                                            <ToggleButton value="main" sx={{ minWidth: 30, fontSize: '0.7rem', px: 1 }}>M</ToggleButton>
                                            <ToggleButton value="off" sx={{ minWidth: 30, fontSize: '0.7rem', px: 1 }}>O</ToggleButton>
                                          </ToggleButtonGroup>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                                {!isEditMode && (
                                  <Typography
                                    sx={{
                                      color: module.enabled ? "success.main" : "text.disabled",
                                      fontWeight: module.enabled ? "bold" : "normal",
                                      fontSize: "0.85em"
                                    }}
                                  >
                                    {module.enabled ? "Active" : "Inactive"}
                                  </Typography>
                                )}
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      ))
                    ];
                  }).flat().filter(Boolean);
                })()}
              </>
            ) : (
              <Typography
                sx={{
                  padding: "10px 17px",
                  textAlign: "center",
                  color: theme.secondary,
                  fontStyle: "italic",
                }}
              >
                {vehicle.modules && vehicle.modules.length > 0
                  ? `${vehicle.modules.length} modules found but not displaying properly`
                  : t("No modules available")}
              </Typography>
            )}
          </React.Fragment>
        ))
      )}
    </>
  );
}

export default function SpellPilot(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellPilot {...props} />
    </ThemeProvider>
  );
}