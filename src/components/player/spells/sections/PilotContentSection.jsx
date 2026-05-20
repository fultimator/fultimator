import { useCallback, useMemo, useState } from "react";
import {
  Grid,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add,
  ExpandMore,
  Delete,
  ErrorOutlined,
  Search,
  ContentCopy,
} from "@mui/icons-material";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import VehicleModule from "../VehicleModule";
import {
  availableFrames,
  availableModules,
} from "../../../../libs/pilotVehicleData";
import CustomTextarea from "../../../common/CustomTextarea";
import ReactMarkdown from "react-markdown";

/**
 * PilotContentSection - Content tab for Pilot spell
 * Manages vehicles/modules directly from shared UnifiedSpellModal form state.
 */
export default function PilotContentSection({ formState, setFormState, t }) {
  const vehicles = useMemo(
    () => formState?.vehicles || formState?.currentVehicles || [],
    [formState?.vehicles, formState?.currentVehicles],
  );

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    type: null, // "vehicle" | "module"
    vehicleIndex: null,
    moduleIndex: null,
    name: "",
  });

  const [compendiumState, setCompendiumState] = useState({
    vehiclesOpen: false,
    modulesOpen: false,
    moduleType: null, // "armor" | "weapon" | "support"
    vehicleIndexForModule: null,
  });

  const updateVehicles = useCallback(
    (updater) => {
      setFormState((prev) => {
        const current = prev?.vehicles || prev?.currentVehicles || [];
        const nextVehicles =
          typeof updater === "function" ? updater(current) : updater;
        return {
          ...prev,
          vehicles: nextVehicles,
        };
      });
    },
    [setFormState],
  );

  const getFrameLimits = useCallback((frameName) => {
    const frame = availableFrames.find((f) => f.name === frameName);
    return frame ? frame.limits : { weapon: 2, armor: 1, support: -1 };
  }, []);

  const getModuleTypeForLimits = useCallback((module) => {
    if (module.type === "pilot_module_armor") return "armor";
    if (module.type === "pilot_module_weapon") return "weapon";
    if (module.type === "pilot_module_support") return "support";
    return "custom";
  }, []);

  const getEquippedCount = useCallback((vehicle, moduleType) => {
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
  }, []);

  const getSlotUsageText = useCallback(
    (vehicle, moduleType) => {
      const frameLimits = getFrameLimits(
        vehicle.frame || "pilot_frame_exoskeleton",
      );
      const equipped = getEquippedCount(vehicle, moduleType);
      const limit = frameLimits[moduleType];
      if (limit === -1) return `(${equipped}/∞)`;
      return `(${equipped}/${limit})`;
    },
    [getFrameLimits, getEquippedCount],
  );

  const isSlotUsageOverLimit = useCallback(
    (vehicle, moduleType) => {
      const frameLimits = getFrameLimits(
        vehicle.frame || "pilot_frame_exoskeleton",
      );
      const equipped = getEquippedCount(vehicle, moduleType);
      const limit = frameLimits[moduleType];
      return limit !== -1 && equipped > limit;
    },
    [getFrameLimits, getEquippedCount],
  );

  const canEquipModule = useCallback(
    (vehicle, moduleIndex) => {
      const module = vehicle.modules[moduleIndex];
      const moduleKey = module.key ?? module.name;
      const maxEnabledModules = vehicle.maxEnabledModules || 3;
      const s = vehicle.slots ?? {};

      const frameType = getModuleTypeForLimits(module);
      const slotsNeeded = frameType === "support" && module.isComplex ? 2 : 1;

      // Derive whether this module is currently equipped from vehicle.slots
      const isCurrentlyEquipped =
        s.main === moduleKey ||
        s.off === moduleKey ||
        s.armor === moduleKey ||
        (s.support ?? []).includes(moduleKey);

      // Count total slots used by other modules
      const totalUsedSlots = (vehicle.modules || []).reduce((count, m, idx) => {
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

      const frameLimits = getFrameLimits(
        vehicle.frame || "pilot_frame_exoskeleton",
      );
      if (frameType === "custom") return true;
      if (frameLimits[frameType] === -1) return true;

      if (frameType === "weapon") {
        // A cumbersome (both-hands) weapon is already in main and off
        const hasBothHandsWeapon = s.main && s.main === s.off;
        if (hasBothHandsWeapon && !isCurrentlyEquipped) return false;

        if (!isCurrentlyEquipped) {
          const mainOccupied = Boolean(s.main);
          const offOccupied = Boolean(s.off);

          if (module.isShield) {
            if (!offOccupied) return true;
            // Can go to main if another shield is in off
            const offModKey = s.off;
            const offMod = (vehicle.modules || []).find(
              (m) => (m.key ?? m.name) === offModKey,
            );
            return !!offMod?.isShield && !mainOccupied;
          }

          return !mainOccupied || !offOccupied;
        }

        // Already equipped - check if current slot is valid
        const proposedSlot =
          s.main === moduleKey && s.off === moduleKey
            ? "both"
            : s.main === moduleKey
              ? "main"
              : s.off === moduleKey
                ? "off"
                : null;
        if (proposedSlot === "both") {
          // Only valid if no other weapons
          const otherWeapons = (vehicle.modules || []).filter(
            (m, idx) =>
              idx !== moduleIndex && getModuleTypeForLimits(m) === "weapon",
          );
          const otherEquipped = otherWeapons.some((m) => {
            const mk = m.key ?? m.name;
            return s.main === mk || s.off === mk;
          });
          return !otherEquipped;
        }
        if (!proposedSlot) return false;
        // Check the proposed slot isn't taken by another module
        const slotKey = proposedSlot === "main" ? s.main : s.off;
        return slotKey === moduleKey;
      }

      const currentlyEquippedSlots = (vehicle.modules || [])
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
          return count + (frameType === "support" && m.isComplex ? 2 : 1);
        }, 0);

      return currentlyEquippedSlots + slotsNeeded <= frameLimits[frameType];
    },
    [getFrameLimits, getModuleTypeForLimits],
  );

  // Memoize ReactMarkdown components to prevent recreation on every render
  const markdownComponents = useMemo(
    () => ({
      p: ({ _node, ...props }) => (
        <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem" }} {...props} />
      ),
      strong: ({ _node, ...props }) => (
        <strong style={{ fontWeight: "bold" }} {...props} />
      ),
    }),
    [],
  );

  // Memoize passenger/distance text generators
  const getPassengersText = useCallback(
    (passengers) => {
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
    },
    [t],
  );

  const getDistanceText = useCallback(
    (distance) =>
      distance === 1 ? t("pilot_distance_no_mod") : `x${distance}`,
    [t],
  );

  const isAnyVehicleIllegal = useMemo(() => {
    return vehicles.some((vehicle) => {
      const frameLimits = getFrameLimits(
        vehicle.frame || "pilot_frame_exoskeleton",
      );
      const s = vehicle.slots ?? {};
      const totalSlots =
        getEquippedCount(vehicle, "armor") +
        getEquippedCount(vehicle, "weapon") +
        getEquippedCount(vehicle, "support");
      if (totalSlots > (vehicle.maxEnabledModules || 3)) return true;

      return ["armor", "weapon", "support"].some((cat) => {
        const used = getEquippedCount(vehicle, cat);
        const limit = frameLimits[cat];
        return limit !== -1 && used > limit;
      });
    });
  }, [vehicles, getFrameLimits, getEquippedCount]);

  const handleAddVehicle = useCallback(() => {
    updateVehicles((current) => [
      ...current,
      {
        description: "",
        customName: "",
        frame: "pilot_frame_exoskeleton",
        modules: [],
        slots: { main: null, off: null, armor: null, support: [] },
        maxEnabledModules: 3,
        enabled: current.length === 0,
      },
    ]);
  }, [updateVehicles]);

  const handleVehicleChange = useCallback(
    (vehicleIndex, field, value) => {
      updateVehicles((current) => {
        const updated = [...current];

        if (field === "enabled" && value === true) {
          for (let i = 0; i < updated.length; i++) {
            updated[i] = { ...updated[i], enabled: i === vehicleIndex };
          }
          return updated;
        }

        updated[vehicleIndex] = {
          ...updated[vehicleIndex],
          [field]: value,
        };
        return updated;
      });
    },
    [updateVehicles],
  );

  const handleDeleteVehicleClick = useCallback(
    (index) => {
      const vehicle = vehicles[index];
      setDeleteConfirmation({
        open: true,
        type: "vehicle",
        vehicleIndex: index,
        moduleIndex: null,
        name: vehicle?.customName || vehicle?.name || `Vehicle ${index + 1}`,
      });
    },
    [vehicles],
  );

  const handleConfirmDeleteVehicle = useCallback(() => {
    updateVehicles((current) =>
      current.filter((_, i) => i !== deleteConfirmation.vehicleIndex),
    );
    setDeleteConfirmation({
      open: false,
      type: null,
      vehicleIndex: null,
      moduleIndex: null,
      name: "",
    });
  }, [deleteConfirmation.vehicleIndex, updateVehicles]);

  const handleCloneVehicle = useCallback(
    (vehicleIndex) => {
      updateVehicles((current) => {
        const sourceVehicle = current[vehicleIndex];
        if (!sourceVehicle) return current;

        const clonedVehicle =
          typeof structuredClone === "function"
            ? structuredClone(sourceVehicle)
            : JSON.parse(JSON.stringify(sourceVehicle));

        const updated = [...current];
        updated.splice(vehicleIndex + 1, 0, clonedVehicle);
        return updated;
      });
    },
    [updateVehicles],
  );

  const handleAddModule = useCallback(
    (vehicleIndex, moduleType) => {
      updateVehicles((current) => {
        const updated = [...current];
        const vehicle = { ...updated[vehicleIndex] };
        const baseModule = availableModules[moduleType]?.[0] || {};

        vehicle.modules = [...(vehicle.modules || []), { ...baseModule }];

        updated[vehicleIndex] = vehicle;
        return updated;
      });
    },
    [updateVehicles],
  );

  const handleModuleChange = useCallback(
    (vehicleIndex, moduleIndex, field, value) => {
      updateVehicles((current) => {
        const updated = [...current];
        const vehicle = { ...updated[vehicleIndex] };
        const modules = [...(vehicle.modules || [])];
        const currentModule = modules[moduleIndex] || {};

        const removeFromSlots = (slots, moduleKey) => {
          const s = {
            ...(slots ?? { main: null, off: null, armor: null, support: [] }),
          };
          if (s.main === moduleKey) s.main = null;
          if (s.off === moduleKey) s.off = null;
          if (s.armor === moduleKey) s.armor = null;
          s.support = (s.support ?? []).filter((k) => k !== moduleKey);
          return s;
        };

        const applySlot = (slots, moduleKey, newSlot) => {
          let s = removeFromSlots(slots, moduleKey);
          if (newSlot === "main") s.main = moduleKey;
          else if (newSlot === "off") s.off = moduleKey;
          else if (newSlot === "both") {
            s.main = moduleKey;
            s.off = moduleKey;
          } else if (newSlot === "armor") s.armor = moduleKey;
          else if (newSlot === "support")
            s.support = [...(s.support ?? []), moduleKey];
          return s;
        };

        if (field === "name") {
          const selected = Object.values(availableModules)
            .flat()
            .find((m) => m.name === value);

          if (selected) {
            modules[moduleIndex] = {
              ...selected,
              customName:
                selected.name === "pilot_custom_armor" ||
                selected.name === "pilot_custom_weapon" ||
                selected.name === "pilot_custom_support"
                  ? currentModule.customName || ""
                  : "",
            };
          }
        } else if (field === "enabled") {
          // No-op: slot state is on vehicle.slots
        } else if (field === "equipped") {
          const moduleKey = currentModule.key ?? currentModule.name;
          let vehicleSlots = {
            ...(vehicle.slots ?? {
              main: null,
              off: null,
              armor: null,
              support: [],
            }),
          };

          if (value) {
            let newSlot = null;
            if (currentModule.type === "pilot_module_armor") {
              newSlot = "armor";
            } else if (currentModule.type === "pilot_module_support") {
              newSlot = "support";
            } else if (currentModule.type === "pilot_module_weapon") {
              const s = vehicleSlots;
              if (currentModule.cumbersome) {
                // Displace all other weapons
                vehicleSlots = { ...s, main: null, off: null };
                newSlot = "both";
              } else if (currentModule.isShield) {
                if (!s.off) newSlot = "off";
                else if (!s.main) newSlot = "main";
                else newSlot = null; // no room
              } else {
                if (!s.main) newSlot = "main";
                else if (!s.off) newSlot = "off";
                else newSlot = null; // no room
              }
            }

            // Keep state unchanged when equip was requested but no valid slot is available.
            if (
              currentModule.type === "pilot_module_weapon" &&
              newSlot === null
            ) {
              return current;
            }

            if (newSlot !== null) {
              vehicleSlots = applySlot(vehicleSlots, moduleKey, newSlot);
            }
          } else {
            vehicleSlots = removeFromSlots(vehicleSlots, moduleKey);
          }

          vehicle.slots = vehicleSlots;
        } else if (field === "equippedSlot") {
          const moduleKey = currentModule.key ?? currentModule.name;
          let vehicleSlots = {
            ...(vehicle.slots ?? {
              main: null,
              off: null,
              armor: null,
              support: [],
            }),
          };
          const s = vehicleSlots;

          if (currentModule.type === "pilot_module_weapon") {
            // Cumbersome weapons always take both hands
            if (currentModule.cumbersome && value !== "both") {
              return current;
            }

            const moduleCurrentSlot =
              s.main === moduleKey && s.off === moduleKey
                ? "both"
                : s.main === moduleKey
                  ? "main"
                  : s.off === moduleKey
                    ? "off"
                    : null;

            // Not equipped - just record the slot intent (no-op, slot state drives display)
            if (!moduleCurrentSlot) {
              // Module not currently equipped; nothing to update in slots
              modules[moduleIndex] = { ...currentModule };
              vehicle.modules = modules;
              updated[vehicleIndex] = vehicle;
              return updated;
            }

            if (value === "both") {
              // Only valid if no other weapon is equipped
              const otherEquipped = (modules || []).some((m, idx) => {
                if (idx === moduleIndex) return false;
                const mk = m.key ?? m.name;
                return (
                  m.type === "pilot_module_weapon" &&
                  (s.main === mk || s.off === mk)
                );
              });
              if (otherEquipped) return current;
            } else {
              const requestedHand = value; // "main" or "off"
              const currentInSlot = requestedHand === "main" ? s.main : s.off;

              if (currentInSlot && currentInSlot !== moduleKey) {
                // Conflict: check if we can swap
                const oppositeHand = requestedHand === "main" ? "off" : "main";
                const oppositeSlotKey =
                  oppositeHand === "main" ? s.main : s.off;
                const conflictMod = modules.find(
                  (m) => (m.key ?? m.name) === currentInSlot,
                );
                const canSwap =
                  !conflictMod?.cumbersome &&
                  moduleCurrentSlot === oppositeHand &&
                  !oppositeSlotKey; // opposite hand must be free after swap

                if (
                  !canSwap &&
                  !(!oppositeSlotKey || oppositeSlotKey === moduleKey)
                )
                  return current;

                if (canSwap) {
                  // Swap: move conflicting module to the opposite hand
                  vehicleSlots = { ...vehicleSlots };
                  if (oppositeHand === "main")
                    vehicleSlots.main = currentInSlot;
                  else vehicleSlots.off = currentInSlot;
                }
              }

              // Shield main-hand validation
              if (currentModule.isShield && value === "main") {
                const hasOffHandShield = (modules || []).some((m, idx) => {
                  if (idx === moduleIndex) return false;
                  const mk = m.key ?? m.name;
                  return m.isShield && vehicleSlots.off === mk;
                });
                if (!hasOffHandShield) return current;
              }
            }

            vehicle.slots = applySlot(vehicleSlots, moduleKey, value);
          } else {
            // Non-weapon equippedSlot changes are no-ops in the new schema
          }
        } else {
          modules[moduleIndex] = {
            ...currentModule,
            [field]: value,
          };
        }

        vehicle.modules = modules;
        updated[vehicleIndex] = vehicle;
        return updated;
      });
    },
    [updateVehicles],
  );

  const handleDeleteModuleClick = useCallback(
    (vehicleIndex, moduleIndex) => {
      const module = vehicles[vehicleIndex]?.modules?.[moduleIndex];
      setDeleteConfirmation({
        open: true,
        type: "module",
        vehicleIndex,
        moduleIndex,
        name: module?.customName || module?.name || `Module ${moduleIndex + 1}`,
      });
    },
    [vehicles],
  );

  const handleConfirmDeleteModule = useCallback(() => {
    updateVehicles((current) => {
      const updated = [...current];
      const vehicle = { ...updated[deleteConfirmation.vehicleIndex] };
      vehicle.modules = (vehicle.modules || []).filter(
        (_, i) => i !== deleteConfirmation.moduleIndex,
      );
      updated[deleteConfirmation.vehicleIndex] = vehicle;
      return updated;
    });
    setDeleteConfirmation({
      open: false,
      type: null,
      vehicleIndex: null,
      moduleIndex: null,
      name: "",
    });
  }, [
    deleteConfirmation.vehicleIndex,
    deleteConfirmation.moduleIndex,
    updateVehicles,
  ]);

  const handleCloneModule = useCallback(
    (vehicleIndex, moduleIndex) => {
      updateVehicles((current) => {
        const updated = [...current];
        const vehicle = { ...updated[vehicleIndex] };
        const modules = [...(vehicle.modules || [])];
        modules.splice(moduleIndex + 1, 0, { ...modules[moduleIndex] });
        vehicle.modules = modules;
        updated[vehicleIndex] = vehicle;
        return updated;
      });
    },
    [updateVehicles],
  );

  const handleCompendiumVehicleImport = useCallback(() => {
    handleAddVehicle();
    setCompendiumState((prev) => ({ ...prev, vehiclesOpen: false }));
  }, [handleAddVehicle]);

  const handleCompendiumModuleImport = useCallback(
    (item) => {
      const { vehicleIndexForModule, moduleType } = compendiumState;
      if (vehicleIndexForModule === null || !moduleType) return;

      updateVehicles((current) => {
        const updated = [...current];
        const vehicle = { ...updated[vehicleIndexForModule] };

        vehicle.modules = [
          ...(vehicle.modules || []),
          {
            name: item.name,
            type: item.type || `pilot_module_${moduleType}`,
            cost: item.cost || 0,
            customName: "",
            ...item,
          },
        ];

        updated[vehicleIndexForModule] = vehicle;
        return updated;
      });

      setCompendiumState((prev) => ({
        ...prev,
        modulesOpen: false,
        moduleType: null,
        vehicleIndexForModule: null,
      }));
    },
    [compendiumState, updateVehicles],
  );

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title={t("Browse Compendium")}>
            <IconButton
              size="small"
              onClick={() =>
                setCompendiumState((prev) => ({ ...prev, vehiclesOpen: true }))
              }
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddVehicle}
          >
            {t("pilot_vehicles_add")}
          </Button>
        </Box>
      </Grid>
      {Array.isArray(vehicles) && vehicles.length > 0 ? (
        vehicles.map((vehicle, vehicleIndex) => (
          <Grid key={vehicleIndex} size={12}>
            <Accordion defaultExpanded={vehicleIndex === 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  {vehicle.customName ||
                    vehicle.name ||
                    `${t("pilot_vehicle")} ${vehicleIndex + 1}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 8,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("pilot_vehicles_name")}
                      value={vehicle.customName || ""}
                      onChange={(e) =>
                        handleVehicleChange(
                          vehicleIndex,
                          "customName",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <Button
                        onClick={() => handleDeleteVehicleClick(vehicleIndex)}
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        sx={{ flexShrink: 0 }}
                      >
                        {t("pilot_vehicles_remove")}
                      </Button>
                      <Button
                        onClick={() => handleCloneVehicle(vehicleIndex)}
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        sx={{ flexShrink: 0 }}
                      >
                        {t("Clone to Custom")}
                      </Button>
                      <Button
                        onClick={() =>
                          handleVehicleChange(
                            vehicleIndex,
                            "enabled",
                            !vehicle.enabled,
                          )
                        }
                        variant={vehicle.enabled ? "contained" : "outlined"}
                        color={vehicle.enabled ? "success" : "primary"}
                        sx={{ flexGrow: 1 }}
                      >
                        {vehicle.enabled ? t("Active") : t("Enable")}
                      </Button>
                    </Box>
                  </Grid>

                  <Grid size={12}>
                    <CustomTextarea
                      label={t("pilot_vehicles_description")}
                      value={vehicle.description || ""}
                      onChange={(e) =>
                        handleVehicleChange(
                          vehicleIndex,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="h6">
                      {t("pilot_vehicles_frame")}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <FormControl fullWidth>
                          <InputLabel>{t("pilot_frame_type")}</InputLabel>
                          <Select
                            value={vehicle.frame || "pilot_frame_exoskeleton"}
                            onChange={(e) =>
                              handleVehicleChange(
                                vehicleIndex,
                                "frame",
                                e.target.value,
                              )
                            }
                          >
                            {availableFrames.map((frame) => (
                              <MenuItem key={frame.name} value={frame.name}>
                                {t(frame.name)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        {(() => {
                          const currentFrame = availableFrames.find(
                            (f) =>
                              f.name ===
                              (vehicle.frame || "pilot_frame_exoskeleton"),
                          );
                          if (!currentFrame) return null;

                          return (
                            <div>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary", mb: 1 }}
                              >
                                <strong>{t("pilot_passengers")}:</strong>{" "}
                                {getPassengersText(currentFrame.passengers)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary", mb: 2 }}
                              >
                                <strong>{t("pilot_distance")}:</strong>{" "}
                                {getDistanceText(currentFrame.distance)}
                              </Typography>
                              <div
                                style={{
                                  color: "var(--mui-palette-text-secondary)",
                                }}
                              >
                                <ReactMarkdown components={markdownComponents}>
                                  {t(currentFrame.description)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          );
                        })()}
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        {(() => {
                          const totalSlots =
                            getEquippedCount(vehicle, "armor") +
                            getEquippedCount(vehicle, "weapon") +
                            getEquippedCount(vehicle, "support");
                          const maxLimit = vehicle.maxEnabledModules || 3;
                          const isOverTotal = totalSlots > maxLimit;

                          return (
                            <TextField
                              fullWidth
                              label={t("pilot_max_enabled_modules")}
                              type="number"
                              slotProps={{ htmlInput: { min: 3 } }}
                              value={vehicle.maxEnabledModules || 3}
                              error={isOverTotal}
                              helperText={
                                isOverTotal
                                  ? `${t("Total slots used")}: ${totalSlots} / ${maxLimit}`
                                  : ""
                              }
                              onChange={(e) =>
                                handleVehicleChange(
                                  vehicleIndex,
                                  "maxEnabledModules",
                                  parseInt(e.target.value, 10),
                                )
                              }
                            />
                          );
                        })()}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t("pilot_modules")}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 1, mb: 1, fontWeight: "bold" }}
                    >
                      {t("pilot_module_add")}
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
                    >
                      {["armor", "weapon", "support"].map((moduleType) => (
                        <Box
                          key={moduleType}
                          sx={{ display: "flex", gap: 0.5 }}
                        >
                          <Tooltip title={t("Browse Compendium")}>
                            <IconButton
                              size="small"
                              onClick={() =>
                                setCompendiumState((prev) => ({
                                  ...prev,
                                  modulesOpen: true,
                                  moduleType,
                                  vehicleIndexForModule: vehicleIndex,
                                }))
                              }
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                              }}
                            >
                              <Search fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            color={
                              isSlotUsageOverLimit(vehicle, moduleType)
                                ? "error"
                                : "primary"
                            }
                            onClick={() =>
                              handleAddModule(vehicleIndex, moduleType)
                            }
                          >
                            {t(`pilot_module_${moduleType}`)}{" "}
                            {getSlotUsageText(vehicle, moduleType)}
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Grid>

                  {(vehicle.modules || []).map((module, moduleIndex) => (
                    <Grid key={moduleIndex} size={12}>
                      <VehicleModule
                        module={module}
                        moduleIndex={moduleIndex}
                        vehicleIndex={vehicleIndex}
                        canEquip={canEquipModule(vehicle, moduleIndex)}
                        onModuleChange={handleModuleChange}
                        onDeleteModule={handleDeleteModuleClick}
                        onCloneModule={handleCloneModule}
                        vehicle={vehicle}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))
      ) : (
        <Grid size={12}>
          <Typography
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            {t("No vehicles added")}
          </Typography>
        </Grid>
      )}
      <Grid
        size={{
          xs: 12,
          sm: 12,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={formState?.showInPlayerSheet !== false}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  showInPlayerSheet: e.target.checked,
                }))
              }
            />
          }
          label={t("Show in Character Sheet")}
        />
      </Grid>
      {isAnyVehicleIllegal && (
        <Grid size={12}>
          <Typography
            color="error"
            variant="caption"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ErrorOutlined sx={{ fontSize: 16, mr: 0.5 }} />
            {t("Illegal module configuration detected")}
          </Typography>
        </Grid>
      )}
      <DeleteConfirmationDialog
        open={deleteConfirmation.open}
        onClose={() =>
          setDeleteConfirmation({
            open: false,
            type: null,
            vehicleIndex: null,
            moduleIndex: null,
            name: "",
          })
        }
        onConfirm={
          deleteConfirmation.type === "vehicle"
            ? handleConfirmDeleteVehicle
            : handleConfirmDeleteModule
        }
        title={t("Delete")}
        message={`${t("Are you sure you want to delete")} "${deleteConfirmation.name}"?`}
        itemPreview={deleteConfirmation.name}
      />
      <CompendiumViewerModal
        open={compendiumState.vehiclesOpen}
        onClose={() =>
          setCompendiumState((prev) => ({ ...prev, vehiclesOpen: false }))
        }
        onAddItem={handleCompendiumVehicleImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Pilot"
      />
      <CompendiumViewerModal
        open={compendiumState.modulesOpen}
        onClose={() =>
          setCompendiumState((prev) => ({
            ...prev,
            modulesOpen: false,
            moduleType: null,
            vehicleIndexForModule: null,
          }))
        }
        onAddItem={handleCompendiumModuleImport}
        initialType="player-spells"
        restrictToTypes={["player-spells"]}
        initialSpellClass="Pilot"
        initialModuleTypeFilter={compendiumState.moduleType || ""}
      />
    </Grid>
  );
}
