import { useReducer, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close, Delete, ExpandMore, Add, ErrorOutline } from "@mui/icons-material";
import CustomTextarea from "../../common/CustomTextarea";
import ReactMarkdown from "react-markdown";
import { availableFrames } from "../../../libs/pilotVehicleData";
import VehicleModule from "./VehicleModule";
import {
  vehicleReducer,
  createInitialState,
  VEHICLE_ACTIONS,
} from "./vehicleReducer";


export default function SpellPilotVehiclesModal({
  open,
  onClose,
  onSave,
  pilot,
}) {
  const { t } = useTranslate();
  const [state, dispatch] = useReducer(vehicleReducer, pilot, createInitialState);

  useEffect(() => {
    if (pilot) {
      dispatch({
        type: VEHICLE_ACTIONS.SET_VEHICLES,
        payload: { vehicles: pilot.vehicles },
      });
      dispatch({
        type: VEHICLE_ACTIONS.SET_SHOW_IN_PLAYER_SHEET,
        payload: !!pilot.showInPlayerSheet,
      });
    }
  }, [pilot]);

  const handleAddVehicle = useCallback(() => {
    dispatch({ type: VEHICLE_ACTIONS.ADD_VEHICLE });
  }, []);

  const handleVehicleChange = useCallback((index, field, value) => {
    dispatch({
      type: VEHICLE_ACTIONS.UPDATE_VEHICLE,
      payload: { vehicleIndex: index, field, value },
    });
  }, []);

  const handleDeleteVehicle = useCallback((index) => {
    dispatch({
      type: VEHICLE_ACTIONS.DELETE_VEHICLE,
      payload: { index },
    });
  }, []);

  const handleAddModule = useCallback((vehicleIndex, moduleType) => {
    dispatch({
      type: VEHICLE_ACTIONS.ADD_MODULE,
      payload: { vehicleIndex, moduleType },
    });
  }, []);

  const handleModuleChange = useCallback((vehicleIndex, moduleIndex, field, value) => {
    dispatch({
      type: VEHICLE_ACTIONS.UPDATE_MODULE,
      payload: { vehicleIndex, moduleIndex, field, value, t },
    });
  }, [t]);

  const handleDeleteModule = useCallback((vehicleIndex, moduleIndex) => {
    dispatch({
      type: VEHICLE_ACTIONS.DELETE_MODULE,
      payload: { vehicleIndex, moduleIndex },
    });
  }, []);

  const handleCloneModule = useCallback((vehicleIndex, moduleIndex) => {
    dispatch({
      type: VEHICLE_ACTIONS.CLONE_MODULE,
      payload: { vehicleIndex, moduleIndex, t },
    });
  }, [t]);

  const handleShowInPlayerSheetChange = useCallback((e) => {
    dispatch({
      type: VEHICLE_ACTIONS.SET_SHOW_IN_PLAYER_SHEET,
      payload: e.target.checked,
    });
  }, []);

  const getFrameLimits = useCallback((frameName) => {
    const frame = availableFrames.find(f => f.name === frameName);
    
    return frame ? frame.limits : { weapon: 2, armor: 1, support: -1 };
  }, []);

  const getModuleTypeForLimits = useCallback((module) => {
    if (module.type === "pilot_module_armor") return "armor";
    if (module.type === "pilot_module_weapon") return "weapon";
    if (module.type === "pilot_module_support") return "support";
    return "custom";
  }, []);

  const canEquipModule = useCallback((vehicle, moduleIndex) => {
    const module = vehicle.modules[moduleIndex];
    const maxEnabledModules = vehicle.maxEnabledModules || 3; // Default to 3 if not set

    // Determine slot cost using isComplex from pilotVehicleData
    const frameType = getModuleTypeForLimits(module);
    const slotsNeeded = (frameType === "support" && module.isComplex) ? 2 : 1;

    // Count total slots used, excluding this module if it is already equipped.
    const totalUsedSlots = vehicle.modules.reduce((count, m, idx) => {
      if (!m.equipped || idx === moduleIndex) return count;
      const mType = getModuleTypeForLimits(m);
      return count + ((mType === "support" && m.isComplex) ? 2 : 1);
    }, 0);

    // Block equip when slots needed would push over the limit
    if (!module.equipped && totalUsedSlots + slotsNeeded > maxEnabledModules) {
      return false;
    }

    const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");

    if (frameType === "custom") return true;
    if (frameLimits[frameType] === -1) return true;

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

      // For unequipped modules
      if (!module.equipped) {
        const mainOccupied = equippedWeapons.some(m => (m.equippedSlot || (m.isShield ? "off" : "main")) === "main");
        const offOccupied = equippedWeapons.some(m => (m.equippedSlot || (m.isShield ? "off" : "main")) === "off");

        if (module.isShield) {
          // Shield can be equipped if off hand is free or if off hand is taken by another shield (so it goes to main)
          if (!offOccupied) return true;
          
          const offHandShield = equippedWeapons.find(m => m.isShield && (m.equippedSlot === "off" || !m.equippedSlot));
          return !!offHandShield && !mainOccupied;
        }

        // Regular weapon needs either hand free
        return !mainOccupied || !offOccupied;
      }
      
      // For already equipped modules being re-evaluated
      const proposedSlot = module.equippedSlot || (module.isShield ? "off" : "main");
      
      if (proposedSlot === "both") {
        return equippedWeapons.length === 0;
      }

      const occupiedSlots = equippedWeapons.map(m => 
        m.equippedSlot || (m.isShield ? "off" : "main")
      );
      
      return !occupiedSlots.includes(proposedSlot);
    }
    
    const currentlyEquippedSlots = vehicle.modules.filter((m, idx) => 
      idx !== moduleIndex && 
      m.equipped && 
      getModuleTypeForLimits(m) === frameType
    ).reduce((count, m) => {
      return count + ((getModuleTypeForLimits(m) === "support" && m.isComplex) ? 2 : 1);
    }, 0);
    
    return currentlyEquippedSlots + slotsNeeded <= frameLimits[frameType];
  }, [getFrameLimits, getModuleTypeForLimits]);

  const getEquippedCount = useCallback((vehicle, moduleType) => {
    if (!vehicle.modules) return 0;
    return vehicle.modules.filter(m => 
      m.equipped && getModuleTypeForLimits(m) === moduleType
    ).reduce((count, module) => {
      return count + ((getModuleTypeForLimits(module) === "support" && module.isComplex) ? 2 : 1);
    }, 0);
  }, [getModuleTypeForLimits]);

  const getSlotUsageText = useCallback((vehicle, moduleType) => {
    const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton", vehicle);
    const equipped = getEquippedCount(vehicle, moduleType);
    const limit = frameLimits[moduleType];
    
    if (limit === -1) return `(${equipped}/∞)`;
    return `(${equipped}/${limit})`;
  }, [getFrameLimits, getEquippedCount]);

  const isSlotUsageOverLimit = useCallback((vehicle, moduleType) => {
    const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton", vehicle);
    const equipped = getEquippedCount(vehicle, moduleType);
    const limit = frameLimits[moduleType];
    
    return limit !== -1 && equipped > limit;
  }, [getFrameLimits, getEquippedCount]);

  const isAnyVehicleIllegal = useMemo(() => {
    return state.currentVehicles.some((vehicle) => {
      const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");
      
      // Total slots used must not exceed maxEnabledModules
      const totalSlots = (vehicle.modules || []).reduce((count, m) => {
        if (!m.equipped) return count;
        const mType = getModuleTypeForLimits(m);
        return count + ((mType === "support" && m.isComplex) ? 2 : 1);
      }, 0);
      const maxLimit = vehicle.maxEnabledModules || 3;
      if (totalSlots > maxLimit) return true;

      // Category slots used must not exceed frame limits
      const categories = ["armor", "weapon", "support"];
      for (const cat of categories) {
        const equipped = getEquippedCount(vehicle, cat);
        const limit = frameLimits[cat];
        if (limit !== -1 && equipped > limit) return true;
      }
      
      return false;
    });
  }, [state.currentVehicles, getFrameLimits, getModuleTypeForLimits, getEquippedCount]);

  const handleSave = useCallback(() => {
    if (isAnyVehicleIllegal) return;
    onSave(pilot.index, {
      ...pilot,
      vehicles: state.currentVehicles,
      showInPlayerSheet: state.showInPlayerSheet,
    });
  }, [onSave, pilot, state.currentVehicles, state.showInPlayerSheet, isAnyVehicleIllegal]);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "90%", maxWidth: "xl" } }}
    >
      <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
        {t("pilot_vehicles_edit")}
      </DialogTitle>
      <Button
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </Button>
      <DialogContent>
        <Grid container spacing={2}>
          {state.currentVehicles.map((vehicle, vehicleIndex) => (
            <Grid item xs={12} key={vehicleIndex}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h5">
                    {vehicle.customName || t("pilot_vehicle")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>

                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label={t("pilot_vehicles_name")}
                        value={vehicle.customName || ""}
                        onChange={(e) =>
                          handleVehicleChange(
                            vehicleIndex,
                            "customName",
                            e.target.value
                          )
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Button
                        onClick={() => handleDeleteVehicle(vehicleIndex)}
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                      >
                        {t("pilot_vehicles_remove")}
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <CustomTextarea
                        label={t("pilot_vehicles_description")}
                        value={vehicle.description || ""}
                        onChange={(e) =>
                          handleVehicleChange(
                            vehicleIndex,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </Grid>

                    {/* Frame Selection */}
                    <Grid item xs={12}>
                      <Typography variant="h6">{t("pilot_vehicles_frame")}</Typography>
                      <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
                          {(() => {
                            const currentFrame = availableFrames.find(f => f.name === (vehicle.frame || "pilot_frame_exoskeleton"));
                            if (!currentFrame) return null;
                            
                            const getPassengersText = (passengers) => {
                              switch(passengers) {
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
                            
                            return (
                              <div>
                                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                                  <strong>{t("pilot_passengers")}:</strong> {getPassengersText(currentFrame.passengers)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                                  <strong>{t("pilot_distance")}:</strong> {getDistanceText(currentFrame.distance)}
                                </Typography>
                                <div style={{ color: "var(--mui-palette-text-secondary)" }}>
                                  <ReactMarkdown
                                    components={{
                                      p: (props) => <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem" }} {...props} />,
                                      strong: (props) => <strong style={{ fontWeight: "bold" }} {...props} />,
                                    }}
                                  >
                                    {t(currentFrame.description)}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            );
                          })()}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {(() => {
                            const totalSlots = (vehicle.modules || []).reduce((count, m) => {
                              if (!m.equipped) return count;
                              const mType = getModuleTypeForLimits(m);
                              return count + ((mType === "support" && m.isComplex) ? 2 : 1);
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
                                helperText={isOverTotal ? `${t("Total slots used")}: ${totalSlots} / ${maxLimit}` : ""}
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

                    {/* Modules Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6">{t("pilot_modules")}</Typography>
                      
                      {/* Module Addition Buttons */}
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                        {t("pilot_module_add")}
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            color={isSlotUsageOverLimit(vehicle, "armor") ? "error" : "primary"}
                            onClick={() => handleAddModule(vehicleIndex, "armor")}
                          >
                            {t("pilot_module_armor")} {getSlotUsageText(vehicle, "armor")}
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            color={isSlotUsageOverLimit(vehicle, "weapon") ? "error" : "primary"}
                            onClick={() => handleAddModule(vehicleIndex, "weapon")}
                          >
                            {t("pilot_module_weapon")} {getSlotUsageText(vehicle, "weapon")}
                          </Button>
                        </Grid>
                        <Grid item>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            color={isSlotUsageOverLimit(vehicle, "support") ? "error" : "primary"}
                            onClick={() => handleAddModule(vehicleIndex, "support")}
                          >
                            {t("pilot_module_support")} {getSlotUsageText(vehicle, "support")}
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Module List */}
                    {vehicle.modules?.map((module, moduleIndex) => (
                      <Grid item xs={12} key={moduleIndex}>
                        <VehicleModule
                          module={module}
                          moduleIndex={moduleIndex}
                          vehicleIndex={vehicleIndex}
                          canEquip={canEquipModule(vehicle, moduleIndex)}
                          onModuleChange={handleModuleChange}
                          onDeleteModule={handleDeleteModule}
                          onCloneModule={handleCloneModule}
                          vehicle={vehicle}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button onClick={handleAddVehicle} variant="outlined" fullWidth>
              {t("pilot_vehicles_add")}
            </Button>
          </Grid>

          <Grid item xs={12} sm={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={state.showInPlayerSheet}
                  onChange={handleShowInPlayerSheetChange}
                />
              }
              label={t("Show in Character Sheet")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {isAnyVehicleIllegal && (
          <Typography color="error" variant="caption" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <ErrorOutline sx={{ fontSize: 16, mr: 0.5 }} />
            {t("Illegal module configuration detected")}
          </Typography>
        )}
        <Button onClick={onClose} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isAnyVehicleIllegal}
        >
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}