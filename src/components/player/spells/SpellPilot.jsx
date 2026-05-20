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
import { availableFrames } from "../../../libs/pilotVehicleData";
import { Martial } from "../../icons";

function ThemedSpellPilot({
  pilot,
  isEditMode,
  onEdit,
  onModuleChange,
  onVehicleChange,
}) {
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
    const frame = availableFrames.find(
      (f) => f.name === (vehicle.frame || "pilot_frame_exoskeleton"),
    );

    return frame ? frame.limits : { weapon: 2, armor: 1, support: -1 };
  };

  const getModuleTypeForLimits = (module) => {
    if (module.type === "pilot_module_armor") return "armor";
    if (module.type === "pilot_module_weapon") return "weapon";
    if (module.type === "pilot_module_support") return "support";
    return "custom";
  };

  const getEquippedCount = (vehicle, moduleType) => {
    const s = vehicle.slots ?? {};
    if (moduleType === "armor") {
      return s.armor ? 1 : 0;
    }
    if (moduleType === "weapon") {
      const weaponKeys = new Set([s.main, s.off].filter(Boolean));
      return weaponKeys.size;
    }
    if (moduleType === "support") {
      return (s.support ?? []).reduce((count, key) => {
        const mod = (vehicle.modules || []).find(
          (m) => (m.key ?? m.name) === key,
        );
        return count + (mod?.isComplex ? 2 : 1);
      }, 0);
    }
    return 0;
  };

  const canEquipModule = (vehicle, moduleIndex) => {
    const module = vehicle.modules[moduleIndex];
    const moduleKey = module.key ?? module.name;
    const frameLimits = getFrameLimits(vehicle);
    const maxEnabledModules = vehicle.maxEnabledModules || 3;
    const s = vehicle.slots ?? {};

    const frameType = getModuleTypeForLimits(module);
    const slotsNeeded = frameType === "support" && module.isComplex ? 2 : 1;

    const isCurrentlyEquipped =
      s.main === moduleKey ||
      s.off === moduleKey ||
      s.armor === moduleKey ||
      (s.support ?? []).includes(moduleKey);

    // Count total slots used by other modules
    const totalUsedSlots = vehicle.modules.reduce((count, m, idx) => {
      if (idx === moduleIndex) return count;
      const mk = m.key ?? m.name;
      const mEquipped =
        s.main === mk ||
        s.off === mk ||
        s.armor === mk ||
        (s.support ?? []).includes(mk);
      if (!mEquipped) return count;
      const mType = getModuleTypeForLimits(m);
      return count + (mType === "support" && m.isComplex ? 2 : 1);
    }, 0);

    if (
      !isCurrentlyEquipped &&
      totalUsedSlots + slotsNeeded > maxEnabledModules
    ) {
      return false;
    }

    if (frameLimits[frameType] === -1) return true;

    if (frameType === "weapon") {
      const hasBothHandsWeapon = s.main && s.main === s.off;
      if (hasBothHandsWeapon && !isCurrentlyEquipped) return false;

      if (!isCurrentlyEquipped) {
        const mainOccupied = Boolean(s.main);
        const offOccupied = Boolean(s.off);

        if (module.isShield) {
          if (!offOccupied) return true;
          const offMod = (vehicle.modules || []).find(
            (m) => (m.key ?? m.name) === s.off,
          );
          return !!offMod?.isShield && !mainOccupied;
        }

        return !mainOccupied || !offOccupied;
      }

      // Already equipped - check slot validity
      const proposedSlot =
        s.main === moduleKey && s.off === moduleKey
          ? "both"
          : s.main === moduleKey
            ? "main"
            : s.off === moduleKey
              ? "off"
              : null;
      if (!proposedSlot) return false;
      if (proposedSlot === "both") {
        const otherWeaponEquipped = (vehicle.modules || []).some((m, idx) => {
          if (idx === moduleIndex) return false;
          const mk = m.key ?? m.name;
          return (
            getModuleTypeForLimits(m) === "weapon" &&
            (s.main === mk || s.off === mk)
          );
        });
        return !otherWeaponEquipped;
      }
      return true;
    }

    const currentlyEquippedSlots = vehicle.modules
      .filter((m, idx) => {
        if (idx === moduleIndex) return false;
        const mk = m.key ?? m.name;
        const mEquipped =
          s.main === mk ||
          s.off === mk ||
          s.armor === mk ||
          (s.support ?? []).includes(mk);
        return mEquipped && getModuleTypeForLimits(m) === frameType;
      })
      .reduce((count, m) => {
        return (
          count +
          (getModuleTypeForLimits(m) === "support" && m.isComplex ? 2 : 1)
        );
      }, 0);

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
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          size="grow"
        >
          <Button
            onClick={onEdit}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("pilot_settings_button")}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size={6}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size={6}
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                  size={6}
                >
                  <div>
                    <Typography
                      style={{ flexGrow: 1, marginRight: "5px" }}
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {vehicle.customName || t("Vehicle")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontSize: "0.75em" }}
                    >
                      {(() => {
                        const frame = availableFrames.find(
                          (f) =>
                            f.name ===
                            (vehicle.frame || "pilot_frame_exoskeleton"),
                        );
                        if (!frame) return "";

                        const getPassengersText = (passengers) => {
                          switch (passengers) {
                            case 0:
                              return t("None");
                            case 1:
                              return t("pilot_passengers_up_1");
                            case 2:
                              return t("pilot_passengers_up_2");
                            case 3:
                              return t("pilot_passengers_up_3");
                            default:
                              return t("None");
                          }
                        };

                        const getDistanceText = (distance) => {
                          return distance === 1
                            ? t("pilot_distance_no_mod")
                            : `×${distance}`;
                        };

                        const passengers = frame.passengers;
                        const distance = frame.distance;

                        // Calculate total equipped modules
                        const equippedWeapons = getEquippedCount(
                          vehicle,
                          "weapon",
                        );
                        const equippedArmor = getEquippedCount(
                          vehicle,
                          "armor",
                        );
                        const equippedSupport = getEquippedCount(
                          vehicle,
                          "support",
                        );
                        const total =
                          equippedWeapons + equippedArmor + equippedSupport;

                        // Use maxEnabledModules from vehicle data, or calculate it if not present
                        const maxDisplay = vehicle.maxEnabledModules || 3;
                        const isOverLimit = total > maxDisplay;

                        return (
                          <span
                            style={{
                              color: isOverLimit ? theme.error : "inherit",
                            }}
                          >
                            {`${t(vehicle.frame || "pilot_frame_exoskeleton")} | ${t("pilot_passengers")}: ${getPassengersText(passengers)} | ${t("pilot_distance")}: ${getDistanceText(distance)} | ${t("pilot_max_enabled_modules")}: ${total}/${maxDisplay}`}
                          </span>
                        );
                      })()}
                    </Typography>
                  </div>
                </Grid>
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                  size={5}
                >
                  <Typography style={{ flexGrow: 1, marginRight: "5px" }}>
                    {(() => {
                      const vSlots = vehicle.slots ?? {};
                      const equippedModules = (vehicle.modules || []).filter(
                        (m) => {
                          const mk = m.key ?? m.name;
                          return (
                            vSlots.main === mk ||
                            vSlots.off === mk ||
                            vSlots.armor === mk ||
                            (vSlots.support ?? []).includes(mk)
                          );
                        },
                      );
                      // Deduplicate (cumbersome weapons appear in both main and off)
                      const seen = new Set();
                      const dedupedModules = equippedModules.filter((m) => {
                        const mk = m.key ?? m.name;
                        if (seen.has(mk)) return false;
                        seen.add(mk);
                        return true;
                      });
                      if (dedupedModules.length === 0)
                        return t("No modules equipped");
                      return dedupedModules
                        .map((m) => {
                          const moduleName =
                            m.name === "pilot_custom_armor" ||
                            m.name === "pilot_custom_weapon" ||
                            m.name === "pilot_custom_support"
                              ? m.customName
                              : t(m.name);
                          const mk = m.key ?? m.name;
                          let slotInfo = "";
                          if (m.type === "pilot_module_weapon") {
                            const handText =
                              vSlots.main === mk && vSlots.off === mk
                                ? "M+O"
                                : vSlots.main === mk
                                  ? "M"
                                  : "O";
                            slotInfo = `[${handText}]`;
                          } else if (
                            m.type === "pilot_module_support" &&
                            m.isComplex
                          ) {
                            slotInfo = "(2 slots)";
                          } else {
                            slotInfo = "(1 slot)";
                          }
                          return `${moduleName} ${slotInfo}`;
                        })
                        .join(", ");
                    })()}
                  </Typography>
                </Grid>
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                  size={1}
                >
                  {isEditMode && (
                    <Button
                      variant={vehicle.enabled ? "contained" : "outlined"}
                      color={vehicle.enabled ? "success" : "primary"}
                      size="small"
                      onClick={() =>
                        onVehicleChange &&
                        onVehicleChange(i, "enabled", !vehicle.enabled)
                      }
                      sx={{ minWidth: 60 }}
                    >
                      {vehicle.enabled ? "Active" : "Enable"}
                    </Button>
                  )}
                </Grid>
              </Grid>
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
                    <Grid size={4}>
                      <Typography variant="h3">{t("pilot_module")}</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="h3">{t("Description")}</Typography>
                    </Grid>
                    <Grid size={2}>
                      <Typography variant="h3">{t("Status")}</Typography>
                    </Grid>
                  </Grid>
                </div>
                {/* Group modules by module type */}
                {(() => {
                  const modulesByType = vehicle.modules.reduce(
                    (acc, module, originalIndex) => {
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
                    },
                    {},
                  );

                  const typeOrder = ["armor", "weapon", "support", "custom"];

                  return typeOrder
                    .map((moduleType) => {
                      if (
                        !modulesByType[moduleType] ||
                        modulesByType[moduleType].length === 0
                      )
                        return null;

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
                        custom: "Custom Modules",
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
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "inherit", fontWeight: "bold" }}
                          >
                            {t(typeHeaders[moduleType])}
                          </Typography>
                        </div>,
                        // Type modules
                        ...modulesByType[moduleType].map(
                          (module, moduleIndex) => {
                            const mKey = module.key ?? module.name;
                            const vs = vehicle.slots ?? {};
                            const isEquipped =
                              vs.main === mKey ||
                              vs.off === mKey ||
                              vs.armor === mKey ||
                              (vs.support ?? []).includes(mKey);
                            const moduleSlot =
                              vs.main === mKey && vs.off === mKey
                                ? "both"
                                : vs.main === mKey
                                  ? "main"
                                  : vs.off === mKey
                                    ? "off"
                                    : vs.armor === mKey
                                      ? "armor"
                                      : (vs.support ?? []).includes(mKey)
                                        ? "support"
                                        : null;
                            return (
                              <div
                                key={`${moduleType}-${moduleIndex}`}
                                style={{
                                  padding: "3px 17px",
                                  borderBottom: `1px solid ${theme.secondary}`,
                                  backgroundColor: isEquipped
                                    ? theme.ternary + "20"
                                    : "transparent",
                                  borderLeft: isEquipped
                                    ? `4px solid ${theme.primary}`
                                    : "none",
                                }}
                              >
                                <Grid container>
                                  <Grid size={4}>
                                    <Typography
                                      sx={{
                                        fontWeight: isEquipped
                                          ? "bold"
                                          : "normal",
                                        fontSize: "1em",
                                      }}
                                    >
                                      {module.name === "pilot_custom_armor" ||
                                      module.name === "pilot_custom_weapon" ||
                                      module.name === "pilot_custom_support"
                                        ? module.customName
                                        : t(module.name)}
                                      {module.martial && <Martial />}
                                      {module.cumbersome && " ⚠"}
                                    </Typography>
                                  </Grid>
                                  <Grid size={6}>
                                    {module.type === "pilot_module_weapon" ? (
                                      <div>
                                        <Typography
                                          sx={{
                                            fontSize: "0.9em",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {t("Accuracy")}: [
                                          {
                                            attributes[
                                              module.accuracy?.attr1 || "might"
                                            ].shortcaps
                                          }{" "}
                                          +{" "}
                                          {
                                            attributes[
                                              module.accuracy?.attr2 ||
                                                "dexterity"
                                            ].shortcaps
                                          }
                                          ]{" "}
                                          {(module.accuracy?.value ?? 0) >= 0
                                            ? `+${module.accuracy?.value ?? 0}`
                                            : (module.accuracy?.value ?? 0)}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: "0.9em",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {t("Damage")}: [HR +{" "}
                                          {module.damage?.value ?? 0}]
                                        </Typography>
                                        <div
                                          style={{
                                            fontSize: "0.95em",
                                            marginTop: "4px",
                                          }}
                                        >
                                          <ReactMarkdown
                                            components={components}
                                          >
                                            {module.name ===
                                            "pilot_custom_weapon"
                                              ? module.description
                                              : t(module.description)}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    ) : module.type === "pilot_module_armor" ? (
                                      <div>
                                        <Typography
                                          sx={{
                                            fontSize: "0.9em",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          Defense:{" "}
                                          {module.martial
                                            ? module.def || 0
                                            : module.def && module.def > 0
                                              ? `${t("DEX die")} + ${module.def}`
                                              : t("DEX die")}
                                        </Typography>
                                        <Typography
                                          sx={{
                                            fontSize: "0.9em",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          M. Defense:{" "}
                                          {module.martial
                                            ? module.mdef || 0
                                            : module.mdef && module.mdef > 0
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
                                          {module.name ===
                                            "pilot_custom_armor" ||
                                          module.name ===
                                            "pilot_custom_weapon" ||
                                          module.name === "pilot_custom_support"
                                            ? module.description
                                            : t(module.description)}
                                        </ReactMarkdown>
                                      </div>
                                    )}
                                  </Grid>
                                  <Grid size={2}>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        gap: "8px",
                                      }}
                                    >
                                      {isEditMode && (
                                        <>
                                          {/* Hand toggle for equipped weapons */}
                                          {isEquipped &&
                                            module.type ===
                                              "pilot_module_weapon" && (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                {module.isShield ? (
                                                  <ToggleButtonGroup
                                                    value={moduleSlot || "off"}
                                                    exclusive
                                                    onChange={(e, newValue) => {
                                                      if (
                                                        newValue !== null &&
                                                        onModuleChange
                                                      ) {
                                                        onModuleChange(
                                                          i,
                                                          module.originalIndex,
                                                          "equippedSlot",
                                                          newValue,
                                                        );
                                                      }
                                                    }}
                                                    size="small"
                                                  >
                                                    <ToggleButton
                                                      value="main"
                                                      disabled={
                                                        !vehicle.modules.some(
                                                          (m) => {
                                                            const mk =
                                                              m.key ?? m.name;
                                                            return (
                                                              m.isShield &&
                                                              vs.off === mk &&
                                                              mk !== mKey
                                                            );
                                                          },
                                                        )
                                                      }
                                                      sx={{
                                                        minWidth: 30,
                                                        fontSize: "0.7rem",
                                                        px: 1,
                                                      }}
                                                    >
                                                      M
                                                    </ToggleButton>
                                                    <ToggleButton
                                                      value="off"
                                                      sx={{
                                                        minWidth: 30,
                                                        fontSize: "0.7rem",
                                                        px: 1,
                                                      }}
                                                    >
                                                      O
                                                    </ToggleButton>
                                                  </ToggleButtonGroup>
                                                ) : module.cumbersome ? (
                                                  <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled
                                                    sx={{
                                                      minWidth: 60,
                                                      fontSize: "0.75rem",
                                                      px: 1,
                                                    }}
                                                  >
                                                    M+O
                                                  </Button>
                                                ) : (
                                                  <ToggleButtonGroup
                                                    value={moduleSlot || "main"}
                                                    exclusive
                                                    onChange={(e, newValue) => {
                                                      if (
                                                        newValue !== null &&
                                                        onModuleChange
                                                      ) {
                                                        onModuleChange(
                                                          i,
                                                          module.originalIndex,
                                                          "equippedSlot",
                                                          newValue,
                                                        );
                                                      }
                                                    }}
                                                    size="small"
                                                  >
                                                    <ToggleButton
                                                      value="main"
                                                      sx={{
                                                        minWidth: 30,
                                                        fontSize: "0.7rem",
                                                        px: 1,
                                                      }}
                                                    >
                                                      M
                                                    </ToggleButton>
                                                    <ToggleButton
                                                      value="off"
                                                      disabled={vehicle.modules.some(
                                                        (m) => {
                                                          const mk2 =
                                                            m.key ?? m.name;
                                                          return (
                                                            m.isShield &&
                                                            vs.off === mk2 &&
                                                            mk2 !== mKey
                                                          );
                                                        },
                                                      )}
                                                      sx={{
                                                        minWidth: 30,
                                                        fontSize: "0.7rem",
                                                        px: 1,
                                                      }}
                                                    >
                                                      O
                                                    </ToggleButton>
                                                  </ToggleButtonGroup>
                                                )}
                                              </div>
                                            )}
                                          <Button
                                            variant={
                                              isEquipped
                                                ? "contained"
                                                : "outlined"
                                            }
                                            color={
                                              isEquipped ? "success" : "primary"
                                            }
                                            size="small"
                                            disabled={
                                              !isEquipped &&
                                              !canEquipModule(
                                                vehicle,
                                                module.originalIndex,
                                              )
                                            }
                                            onClick={() =>
                                              onModuleChange &&
                                              onModuleChange(
                                                i,
                                                module.originalIndex,
                                                "equipped",
                                                !isEquipped,
                                              )
                                            }
                                            sx={{ minWidth: 60 }}
                                          >
                                            {isEquipped ? "Equipped" : "Equip"}
                                          </Button>
                                        </>
                                      )}
                                      {!isEditMode && (
                                        <Typography
                                          sx={{
                                            color: isEquipped
                                              ? "success.main"
                                              : "text.disabled",
                                            fontWeight: isEquipped
                                              ? "bold"
                                              : "normal",
                                            fontSize: "0.85em",
                                          }}
                                        >
                                          {isEquipped ? "Active" : "Inactive"}
                                        </Typography>
                                      )}
                                    </div>
                                  </Grid>
                                </Grid>
                              </div>
                            );
                          },
                        ),
                      ];
                    })
                    .flat()
                    .filter(Boolean);
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
