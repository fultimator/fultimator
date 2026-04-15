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
import { Add, ExpandMore, Delete, ErrorOutlined, Search, ContentCopy } from "@mui/icons-material";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import VehicleModule from "../VehicleModule";
import { availableFrames, availableModules } from "../../../../libs/pilotVehicleData";
import CustomTextarea from "../../../common/CustomTextarea";
import ReactMarkdown from "react-markdown";

/**
 * PilotContentSection - Content tab for Pilot spell
 * Manages vehicles/modules directly from shared UnifiedSpellModal form state.
 */
export default function PilotContentSection({ formState, setFormState, t }) {
  const vehicles = useMemo(
    () => formState?.vehicles || formState?.currentVehicles || [],
    [formState?.vehicles, formState?.currentVehicles]
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
        const nextVehicles = typeof updater === "function" ? updater(current) : updater;
        return {
          ...prev,
          vehicles: nextVehicles,
        };
      });
    },
    [setFormState]
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

  const getEquippedCount = useCallback(
    (vehicle, moduleType) => {
      if (!vehicle.modules) return 0;
      return vehicle.modules
        .filter((m) => m.equipped && getModuleTypeForLimits(m) === moduleType)
        .reduce((count, module) => {
          return count + (moduleType === "support" && module.isComplex ? 2 : 1);
        }, 0);
    },
    [getModuleTypeForLimits]
  );

  const getSlotUsageText = useCallback(
    (vehicle, moduleType) => {
      const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");
      const equipped = getEquippedCount(vehicle, moduleType);
      const limit = frameLimits[moduleType];
      if (limit === -1) return `(${equipped}/∞)`;
      return `(${equipped}/${limit})`;
    },
    [getFrameLimits, getEquippedCount]
  );

  const isSlotUsageOverLimit = useCallback(
    (vehicle, moduleType) => {
      const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");
      const equipped = getEquippedCount(vehicle, moduleType);
      const limit = frameLimits[moduleType];
      return limit !== -1 && equipped > limit;
    },
    [getFrameLimits, getEquippedCount]
  );

  const canEquipModule = useCallback(
    (vehicle, moduleIndex) => {
      const module = vehicle.modules[moduleIndex];
      const maxEnabledModules = vehicle.maxEnabledModules || 3;

      const frameType = getModuleTypeForLimits(module);
      const slotsNeeded = frameType === "support" && module.isComplex ? 2 : 1;

      const totalUsedSlots = (vehicle.modules || []).reduce((count, m, idx) => {
        if (!m.equipped || idx === moduleIndex) return count;
        const mType = getModuleTypeForLimits(m);
        return count + (mType === "support" && m.isComplex ? 2 : 1);
      }, 0);

      if (!module.equipped && totalUsedSlots + slotsNeeded > maxEnabledModules) {
        return false;
      }

      const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");
      if (frameType === "custom") return true;
      if (frameLimits[frameType] === -1) return true;

      if (frameType === "weapon") {
        const equippedWeapons = (vehicle.modules || []).filter(
          (m, idx) =>
            idx !== moduleIndex &&
            m.equipped &&
            getModuleTypeForLimits(m) === "weapon"
        );

        const hasBothHandsWeapon = equippedWeapons.some((m) => m.equippedSlot === "both");
        if (hasBothHandsWeapon) return false;

        if (!module.equipped) {
          const mainOccupied = equippedWeapons.some(
            (m) => (m.equippedSlot || (m.isShield ? "off" : "main")) === "main"
          );
          const offOccupied = equippedWeapons.some(
            (m) => (m.equippedSlot || (m.isShield ? "off" : "main")) === "off"
          );

          if (module.isShield) {
            if (!offOccupied) return true;
            const offHandShield = equippedWeapons.find(
              (m) => m.isShield && (m.equippedSlot === "off" || !m.equippedSlot)
            );
            return !!offHandShield && !mainOccupied;
          }

          return !mainOccupied || !offOccupied;
        }

        const proposedSlot = module.equippedSlot || (module.isShield ? "off" : "main");
        if (proposedSlot === "both") {
          return equippedWeapons.length === 0;
        }

        const occupiedSlots = equippedWeapons.map(
          (m) => m.equippedSlot || (m.isShield ? "off" : "main")
        );
        return !occupiedSlots.includes(proposedSlot);
      }

      const currentlyEquippedSlots = (vehicle.modules || [])
        .filter(
          (m, idx) =>
            idx !== moduleIndex &&
            m.equipped &&
            getModuleTypeForLimits(m) === frameType
        )
        .reduce((count, m) => {
          return count + (frameType === "support" && m.isComplex ? 2 : 1);
        }, 0);

      return currentlyEquippedSlots + slotsNeeded <= frameLimits[frameType];
    },
    [getFrameLimits, getModuleTypeForLimits]
  );

  // Memoize ReactMarkdown components to prevent recreation on every render
  const markdownComponents = useMemo(
    () => ({
      p: ({ _node, ...props }) => <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem" }} {...props} />,
      strong: ({ _node, ...props }) => <strong style={{ fontWeight: "bold" }} {...props} />,
    }),
    []
  );

  // Memoize passenger/distance text generators
  const getPassengersText = useCallback((passengers) => {
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
  }, [t]);

  const getDistanceText = useCallback(
    (distance) => (distance === 1 ? t("pilot_distance_no_mod") : `x${distance}`),
    [t]
  );

  const isAnyVehicleIllegal = useMemo(() => {
    return vehicles.some((vehicle) => {
      const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");
      const totalSlots = (vehicle.modules || []).reduce((count, m) => {
        if (!m.equipped) return count;
        const mType = getModuleTypeForLimits(m);
        return count + (mType === "support" && m.isComplex ? 2 : 1);
      }, 0);
      if (totalSlots > (vehicle.maxEnabledModules || 3)) return true;

      return ["armor", "weapon", "support"].some((cat) => {
        const used = getEquippedCount(vehicle, cat);
        const limit = frameLimits[cat];
        return limit !== -1 && used > limit;
      });
    });
  }, [vehicles, getFrameLimits, getModuleTypeForLimits, getEquippedCount]);

  const handleAddVehicle = useCallback(() => {
    updateVehicles((current) => [
      ...current,
      {
        description: "",
        customName: "",
        frame: "pilot_frame_exoskeleton",
        modules: [],
        enabledModules: [],
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
    [updateVehicles]
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
    [vehicles]
  );

  const handleConfirmDeleteVehicle = useCallback(() => {
    updateVehicles((current) =>
      current.filter((_, i) => i !== deleteConfirmation.vehicleIndex)
    );
    setDeleteConfirmation({ open: false, type: null, vehicleIndex: null, moduleIndex: null, name: "" });
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
    [updateVehicles]
  );

  const handleAddModule = useCallback(
    (vehicleIndex, moduleType) => {
      updateVehicles((current) => {
        const updated = [...current];
        const vehicle = { ...updated[vehicleIndex] };
        const baseModule = availableModules[moduleType]?.[0] || {};

        vehicle.modules = [
          ...(vehicle.modules || []),
          {
            ...baseModule,
            enabled: false,
            equipped: false,
            equippedSlot: null,
          },
        ];

        updated[vehicleIndex] = vehicle;
        return updated;
      });
    },
    [updateVehicles]
  );

  const handleModuleChange = useCallback(
    (vehicleIndex, moduleIndex, field, value) => {
      updateVehicles((current) => {
        const updated = [...current];
        const vehicle = { ...updated[vehicleIndex] };
        const modules = [...(vehicle.modules || [])];
        const currentModule = modules[moduleIndex] || {};

        if (field === "name") {
          const selected = Object.values(availableModules)
            .flat()
            .find((m) => m.name === value);

          if (selected) {
            modules[moduleIndex] = {
              ...selected,
              enabled: currentModule.enabled || false,
              equipped: currentModule.equipped || false,
              equippedSlot: currentModule.equippedSlot || null,
              customName:
                selected.name === "pilot_custom_armor" ||
                  selected.name === "pilot_custom_weapon" ||
                  selected.name === "pilot_custom_support"
                  ? currentModule.customName || ""
                  : "",
            };
          }
        } else if (field === "equipped") {
          const normalizeWeaponSlot = (mod) => {
            if (mod?.equippedSlot === "main" || mod?.equippedSlot === "off" || mod?.equippedSlot === "both") {
              return mod.equippedSlot;
            }
            return mod?.isShield ? "off" : "main";
          };

          const resolveWeaponEquipSlot = (allModules, modIndex, moduleToEquip) => {
            const equippedWeapons = (allModules || []).filter(
              (m, idx) => idx !== modIndex && m.equipped && m.type === "pilot_module_weapon"
            );

            if (moduleToEquip.cumbersome) return "both";

            const mainOccupied = equippedWeapons.some((m) => {
              const slot = normalizeWeaponSlot(m);
              return slot === "main" || slot === "both";
            });
            const offOccupied = equippedWeapons.some((m) => {
              const slot = normalizeWeaponSlot(m);
              return slot === "off" || slot === "both";
            });
            const offShieldExists = equippedWeapons.some((m) => {
              const slot = normalizeWeaponSlot(m);
              return m.isShield && (slot === "off" || slot === "both");
            });

            if (moduleToEquip.isShield) {
              if (!offOccupied) return "off";
              if (offShieldExists && !mainOccupied) return "main";
              return null;
            }

            if (!mainOccupied) return "main";
            if (!offOccupied) return "off";
            return null;
          };

          const resolvedSlot = (() => {
            if (!value) return null;
            if (currentModule.type === "pilot_module_armor") return "armor";
            if (currentModule.type === "pilot_module_support") return "support";
            if (currentModule.type === "pilot_module_weapon") {
              return resolveWeaponEquipSlot(modules, moduleIndex, currentModule);
            }
            return currentModule.equippedSlot || null;
          })();

          // Keep state unchanged when equip was requested but no valid slot is available.
          if (value && currentModule.type === "pilot_module_weapon" && !resolvedSlot) {
            return current;
          }

          modules[moduleIndex] = {
            ...currentModule,
            equipped: value,
            enabled: value,
            equippedSlot: resolvedSlot,
          };
        } else if (field === "equippedSlot") {
          // Enforce hand-slot validity so manual M/O toggles cannot create illegal states.
          if (currentModule.type !== "pilot_module_weapon") {
            modules[moduleIndex] = {
              ...currentModule,
              equippedSlot: value,
            };
          } else if (!currentModule.equipped) {
            modules[moduleIndex] = {
              ...currentModule,
              equippedSlot: value,
            };
          } else {
            const normalizeSlot = (mod) => {
              if (mod?.equippedSlot === "both") return "both";
              if (mod?.equippedSlot === "main") return "main";
              if (mod?.equippedSlot === "off") return "off";
              return mod?.isShield ? "off" : "main";
            };

            const otherEquippedWeapons = modules.filter(
              (m, idx) => idx !== moduleIndex && m.equipped && m.type === "pilot_module_weapon"
            );

            // Cumbersome weapons always take both hands.
            if (currentModule.cumbersome && value !== "both") {
              return current;
            }

            if (value === "both") {
              // Two-handed placement is only valid if no other weapon is equipped.
              if (otherEquippedWeapons.length > 0) return current;
            } else {
              const requestedHand = value === "main" ? "main" : "off";
              const conflictingWeapons = otherEquippedWeapons.filter((m) => {
                const slot = normalizeSlot(m);
                return slot === "both" || slot === requestedHand;
              });

              const conflictingBoth = conflictingWeapons.some((m) => normalizeSlot(m) === "both");
              const currentHand = normalizeSlot(currentModule);
              const oppositeHand = requestedHand === "main" ? "off" : "main";
              const canSwap =
                conflictingWeapons.length === 1 &&
                !conflictingBoth &&
                currentHand === oppositeHand &&
                !currentModule.cumbersome &&
                !conflictingWeapons[0]?.cumbersome;

              if (conflictingWeapons.length > 0 && !canSwap) return current;

              if (canSwap) {
                const swapTargetIndex = modules.findIndex(
                  (m, idx) => idx !== moduleIndex && m === conflictingWeapons[0]
                );
                if (swapTargetIndex >= 0) {
                  modules[swapTargetIndex] = {
                    ...modules[swapTargetIndex],
                    equippedSlot: oppositeHand,
                  };
                }
              }
            }

            if (currentModule.isShield && value === "main") {
              const projectedOtherWeapons = modules.filter(
                (m, idx) => idx !== moduleIndex && m.equipped && m.type === "pilot_module_weapon"
              );
              const hasOffHandShield = projectedOtherWeapons.some((m) => {
                const slot = normalizeSlot(m);
                return m.isShield && (slot === "off" || slot === "both");
              });
              if (!hasOffHandShield) return current;
            }

            modules[moduleIndex] = {
              ...currentModule,
              equippedSlot: value,
            };
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
    [updateVehicles]
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
    [vehicles]
  );

  const handleConfirmDeleteModule = useCallback(() => {
    updateVehicles((current) => {
      const updated = [...current];
      const vehicle = { ...updated[deleteConfirmation.vehicleIndex] };
      vehicle.modules = (vehicle.modules || []).filter(
        (_, i) => i !== deleteConfirmation.moduleIndex
      );
      updated[deleteConfirmation.vehicleIndex] = vehicle;
      return updated;
    });
    setDeleteConfirmation({ open: false, type: null, vehicleIndex: null, moduleIndex: null, name: "" });
  }, [deleteConfirmation.vehicleIndex, deleteConfirmation.moduleIndex, updateVehicles]);

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
    [updateVehicles]
  );

  const handleCompendiumVehicleImport = useCallback(
    () => {
      handleAddVehicle();
      setCompendiumState((prev) => ({ ...prev, vehiclesOpen: false }));
    },
    [handleAddVehicle]
  );

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
            enabled: false,
            equipped: false,
            equippedSlot: null,
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
    [compendiumState, updateVehicles]
  );

  return (
    <Grid container spacing={2}>
      <Grid  size={12}>
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title={t("Browse Compendium")}>
            <IconButton
              size="small"
              onClick={() => setCompendiumState((prev) => ({ ...prev, vehiclesOpen: true }))}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button size="small" variant="outlined" startIcon={<Add />} onClick={handleAddVehicle}>
            {t("pilot_vehicles_add")}
          </Button>
        </Box>
      </Grid>
      {Array.isArray(vehicles) && vehicles.length > 0 ? (
        vehicles.map((vehicle, vehicleIndex) => (
          <Grid  key={vehicleIndex} size={12}>
            <Accordion defaultExpanded={vehicleIndex === 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  {vehicle.customName || vehicle.name || `${t("pilot_vehicle")} ${vehicleIndex + 1}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 8
                    }}>
                    <TextField
                      fullWidth
                      label={t("pilot_vehicles_name")}
                      value={vehicle.customName || ""}
                      onChange={(e) =>
                        handleVehicleChange(vehicleIndex, "customName", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4
                    }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1
                      }}>
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
                          handleVehicleChange(vehicleIndex, "enabled", !vehicle.enabled)
                        }
                        variant={vehicle.enabled ? "contained" : "outlined"}
                        color={vehicle.enabled ? "success" : "primary"}
                        sx={{ flexGrow: 1 }}
                      >
                        {vehicle.enabled ? t("Active") : t("Enable")}
                      </Button>
                    </Box>
                  </Grid>

                  <Grid  size={12}>
                    <CustomTextarea
                      label={t("pilot_vehicles_description")}
                      value={vehicle.description || ""}
                      onChange={(e) =>
                        handleVehicleChange(vehicleIndex, "description", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid  size={12}>
                    <Typography variant="h6">{t("pilot_vehicles_frame")}</Typography>
                    <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <FormControl fullWidth>
                          <InputLabel>{t("pilot_frame_type")}</InputLabel>
                          <Select
                            value={vehicle.frame || "pilot_frame_exoskeleton"}
                            onChange={(e) =>
                              handleVehicleChange(vehicleIndex, "frame", e.target.value)
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
                          sm: 6
                        }}>
                        {(() => {
                          const currentFrame = availableFrames.find(
                            (f) => f.name === (vehicle.frame || "pilot_frame_exoskeleton")
                          );
                          if (!currentFrame) return null;

                          return (
                            <div>
                              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                <strong>{t("pilot_passengers")}:</strong> {getPassengersText(currentFrame.passengers)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                                <strong>{t("pilot_distance")}:</strong> {getDistanceText(currentFrame.distance)}
                              </Typography>
                              <div style={{ color: "var(--mui-palette-text-secondary)" }}>
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
                          sm: 6
                        }}>
                        {(() => {
                          const totalSlots = (vehicle.modules || []).reduce((count, m) => {
                            if (!m.equipped) return count;
                            const mType = getModuleTypeForLimits(m);
                            return count + (mType === "support" && m.isComplex ? 2 : 1);
                          }, 0);
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
                                  parseInt(e.target.value, 10)
                                )
                              }
                            />
                          );
                        })()}
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid  size={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t("pilot_modules")}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: "bold" }}>
                      {t("pilot_module_add")}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                      {["armor", "weapon", "support"].map((moduleType) => (
                        <Box key={moduleType} sx={{ display: "flex", gap: 0.5 }}>
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
                              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                            >
                              <Search fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            color={isSlotUsageOverLimit(vehicle, moduleType) ? "error" : "primary"}
                            onClick={() => handleAddModule(vehicleIndex, moduleType)}
                          >
                            {t(`pilot_module_${moduleType}`)} {getSlotUsageText(vehicle, moduleType)}
                          </Button>

                        </Box>
                      ))}
                    </Box>
                  </Grid>

                  {(vehicle.modules || []).map((module, moduleIndex) => (
                    <Grid  key={moduleIndex} size={12}>
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
        <Grid  size={12}>
          <Typography
            sx={{
              color: "text.secondary",
              fontStyle: "italic"
            }}>
            {t("No vehicles added")}
          </Typography>
        </Grid>
      )}
      <Grid
        size={{
          xs: 12,
          sm: 12
        }}>
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
        <Grid  size={12}>
          <Typography color="error" variant="caption" sx={{ display: "flex", alignItems: "center" }}>
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
        onClose={() => setCompendiumState((prev) => ({ ...prev, vehiclesOpen: false }))}
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
