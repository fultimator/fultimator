import { useReducer, useEffect, useCallback } from "react";
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
import { Close, Delete, ExpandMore, Add } from "@mui/icons-material";
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
    const frameType = getModuleTypeForLimits(module);
    const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton", vehicle);
    
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
      if (getModuleTypeForLimits(m) === "support" && m.isComplex) {
        return count + 2;
      }
      return count + 1;
    }, 0);
    
    const slotsNeeded = (frameType === "support" && module.isComplex) ? 2 : 1;
    return currentlyEquippedSlots + slotsNeeded <= frameLimits[frameType];
  }, [getFrameLimits, getModuleTypeForLimits]);

  const getEquippedCount = useCallback((vehicle, moduleType) => {
    if (!vehicle.modules) return 0;
    return vehicle.modules.filter(m => 
      m.equipped && getModuleTypeForLimits(m) === moduleType
    ).reduce((count, module) => {
      if (getModuleTypeForLimits(module) === "support" && module.isComplex) {
        return count + 2;
      }
      return count + 1;
    }, 0);
  }, [getModuleTypeForLimits]);

  const getSlotUsageText = useCallback((vehicle, moduleType) => {
    const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton", vehicle);
    const equipped = getEquippedCount(vehicle, moduleType);
    const limit = frameLimits[moduleType];
    
    if (limit === -1) return `(${equipped}/∞)`;
    return `(${equipped}/${limit})`;
  }, [getFrameLimits, getEquippedCount]);

  const handleSave = useCallback(() => {
    onSave(pilot.index, {
      ...pilot,
      vehicles: state.currentVehicles,
      showInPlayerSheet: state.showInPlayerSheet,
    });
  }, [onSave, pilot, state.currentVehicles, state.showInPlayerSheet]);


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
        <Button onClick={onClose} variant="outlined">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}