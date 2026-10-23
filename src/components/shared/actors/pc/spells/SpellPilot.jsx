import React from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
} from "@mui/material";
import {
  Edit,
  VisibilityOff,
  ExpandMore,
  DirectionsCar,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { availableFrames } from "/src/libs/pilotVehicleData";
import VehicleModule from "./VehicleModule";

function ThemedSpellPilot({
  pilot,
  isEditMode,
  onEdit,
  onModuleChange,
  onVehicleChange,
  player,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

  const showInPlayerSheet =
    pilot.showInPlayerSheet || pilot.showInPlayerSheet === undefined;

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
      if (!s.main && !s.off) return 0;
      if (s.main && s.main === s.off) return 2;
      return [s.main, s.off].filter(Boolean).length;
    }
    if (moduleType === "support") {
      return (s.support ?? []).reduce((count, key) => {
        const mod = (vehicle.modules || []).find(
          (m) => (m.key ?? m.name) === key,
        );
        if (!mod) return count;
        return count + (mod.isComplex ? 2 : 1);
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
      <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <DirectionsCar />
          </Icon>
          <Typography variant="h4">{t("pilot_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ node: _n, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t("pilot_details_1")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
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
          alignItems: "center",
        }}
      >
        <Grid container style={{ flexGrow: 1 }} sx={{ alignItems: "center" }}>
          <Grid
            style={{ display: "flex", alignItems: "center", minHeight: "40px" }}
            size={11}
          >
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
            >
              {t("pilot_vehicle")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minHeight: "40px",
            }}
            size={1}
          >
            {isEditMode && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {!showInPlayerSheet && (
                  <Tooltip title={t("pilot_vehicles_not_shown_tooltip")}>
                    <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={onEdit}
                  sx={{ p: "3px", color: theme.white }}
                >
                  <Edit sx={{ fontSize: "1.1rem" }} />
                </IconButton>
              </div>
            )}
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
        pilot.vehicles.map((vehicle, i) => {
          const frame = availableFrames.find(
            (f) => f.name === (vehicle.frame || "pilot_frame_exoskeleton"),
          );
          const getPassengersText = (p) => {
            if (p === 0) return t("None");
            if (p === 1) return t("pilot_passengers_up_1");
            if (p === 2) return t("pilot_passengers_up_2");
            if (p === 3) return t("pilot_passengers_up_3");
            return t("None");
          };
          const getDistanceText = (d) =>
            d === 1 ? t("pilot_distance_no_mod") : `×${d}`;

          const equippedWeapons = getEquippedCount(vehicle, "weapon");
          const equippedArmor = getEquippedCount(vehicle, "armor");
          const equippedSupport = getEquippedCount(vehicle, "support");
          const total = equippedWeapons + equippedArmor + equippedSupport;
          const maxDisplay = vehicle.maxEnabledModules || 3;
          const isOverLimit = total > maxDisplay;

          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  border: `1px solid ${theme.secondary}`,
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    minHeight: 44,
                    fontSize: "0.9rem",
                    background:
                      i % 2 === 0
                        ? `linear-gradient(to right, ${theme.ternary}, ${theme.mode === "dark" ? "#1f1f1f" : "#fff"})`
                        : "transparent",
                  }}
                >
                  {/* Label area */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      px: "10px",
                      py: "4px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: "Antonio",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        lineHeight: 1.3,
                      }}
                    >
                      {vehicle.customName || t("Vehicle")}
                    </Typography>
                    {frame && (
                      <Typography
                        variant="caption"
                        sx={{
                          ...bodyTextSx,
                          color: isOverLimit ? "error.main" : "text.secondary",
                        }}
                      >
                        {`${t(vehicle.frame || "pilot_frame_exoskeleton")} | ${t("pilot_passengers")}: ${getPassengersText(frame.passengers)} | ${t("pilot_distance")}: ${getDistanceText(frame.distance)} | ${t("pilot_max_enabled_modules")}: ${total}/${maxDisplay}`}
                      </Typography>
                    )}
                  </Box>
                  {/* Actions area */}
                  {isEditMode && (
                    <Box
                      sx={{
                        bgcolor: theme.primary,
                        display: "flex",
                        alignItems: "center",
                        px: "6px",
                        gap: 0.25,
                        flexShrink: 0,
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        onClick={() =>
                          onVehicleChange &&
                          onVehicleChange(i, "enabled", !vehicle.enabled)
                        }
                        style={{
                          minWidth: 72,
                          height: 32,
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          border: "none",
                          gap: 4,
                          color: theme.primary,
                          backgroundColor: theme.white,
                        }}
                      >
                        {vehicle.enabled ? (
                          <>
                            <RadioButtonChecked sx={{ fontSize: "1rem" }} />
                            {t("Active")}
                          </>
                        ) : (
                          <>
                            <RadioButtonUnchecked sx={{ fontSize: "1rem" }} />
                            {t("Enable")}
                          </>
                        )}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Vehicle Modules */}
              {vehicle.modules && vehicle.modules.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    p: 1,
                  }}
                >
                  {vehicle.modules.map((module, moduleIndex) => (
                    <VehicleModule
                      key={moduleIndex}
                      module={module}
                      moduleIndex={moduleIndex}
                      vehicleIndex={i}
                      vehicle={vehicle}
                      canEquip={canEquipModule(vehicle, moduleIndex)}
                      onModuleChange={isEditMode ? onModuleChange : null}
                      onDeleteModule={null}
                      onCloneModule={null}
                      player={player}
                    />
                  ))}
                </Box>
              ) : (
                <Typography
                  sx={{
                    padding: "10px 17px",
                    textAlign: "center",
                    color: theme.secondary,
                    fontStyle: "italic",
                  }}
                >
                  {t("No modules available")}
                </Typography>
              )}
            </React.Fragment>
          );
        })
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
