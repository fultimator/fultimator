import { availableModules } from "../../../libs/pilotVehicleData";

export const VEHICLE_ACTIONS = {
  SET_VEHICLES: 'SET_VEHICLES',
  SET_SHOW_IN_PLAYER_SHEET: 'SET_SHOW_IN_PLAYER_SHEET',
  ADD_VEHICLE: 'ADD_VEHICLE',
  DELETE_VEHICLE: 'DELETE_VEHICLE',
  UPDATE_VEHICLE: 'UPDATE_VEHICLE',
  ADD_MODULE: 'ADD_MODULE',
  DELETE_MODULE: 'DELETE_MODULE',
  UPDATE_MODULE: 'UPDATE_MODULE',
};

const createDefaultModule = (moduleType) => {
  return { 
    ...availableModules[moduleType][0], 
    enabled: false,
    equipped: false,
    equippedSlot: null,
    cumbersome: availableModules[moduleType][0].cumbersome || false,
    att1: "might",
    att2: "dexterity",
    prec: 0,
    damage: 0,
    cost: 0
  };
};

export const getModuleTypeForLimits = (module) => {
  if (module.type === "pilot_module_armor") return "armor";
  if (module.type === "pilot_module_weapon") return "weapon";
  if (module.type === "pilot_module_support") return "support";
  return "custom";
};

const updateEnabledModulesList = (vehicle, t) => {
  const enabledModules = vehicle.modules
    ?.filter((m) => m.enabled || m.equipped)
    .map((m) => (m.name === "pilot_custom_armor" || m.name === "pilot_custom_weapon" || m.name === "pilot_custom_support") ? m.customName : t(m.name)) || [];
  return enabledModules;
};

export const vehicleReducer = (state, action) => {
  switch (action.type) {
    case VEHICLE_ACTIONS.SET_VEHICLES:
      return {
        ...state,
        currentVehicles: action.payload.vehicles || [],
      };

    case VEHICLE_ACTIONS.SET_SHOW_IN_PLAYER_SHEET:
      return {
        ...state,
        showInPlayerSheet: action.payload,
      };

    case VEHICLE_ACTIONS.ADD_VEHICLE:
      return {
        ...state,
        currentVehicles: [
          ...state.currentVehicles,
          {
            description: "",
            customName: "",
            frame: "pilot_frame_exoskeleton",
            modules: [],
            enabledModules: [],
            maxEnabledModules: 3,
          },
        ],
      };

    case VEHICLE_ACTIONS.DELETE_VEHICLE:
      return {
        ...state,
        currentVehicles: state.currentVehicles.filter((_, i) => i !== action.payload.index),
      };

    case VEHICLE_ACTIONS.UPDATE_VEHICLE: {
      const updatedVehicles = [...state.currentVehicles];
      updatedVehicles[action.payload.vehicleIndex][action.payload.field] = action.payload.value;
      return {
        ...state,
        currentVehicles: updatedVehicles,
      };
    }

    case VEHICLE_ACTIONS.ADD_MODULE: {
      const newModule = createDefaultModule(action.payload.moduleType);
      
      return {
        ...state,
        currentVehicles: state.currentVehicles.map((vehicle, index) => {
          if (index === action.payload.vehicleIndex) {
            return {
              ...vehicle,
              modules: [...(vehicle.modules || []), newModule],
            };
          }
          return vehicle;
        }),
      };
    }

    case VEHICLE_ACTIONS.DELETE_MODULE: {
      return {
        ...state,
        currentVehicles: state.currentVehicles.map((vehicle, index) => {
          if (index === action.payload.vehicleIndex) {
            return {
              ...vehicle,
              modules: vehicle.modules.filter((_, moduleIndex) => moduleIndex !== action.payload.moduleIndex),
            };
          }
          return vehicle;
        }),
      };
    }

    case VEHICLE_ACTIONS.UPDATE_MODULE: {
      const { vehicleIndex, moduleIndex, field, value, t } = action.payload;
      const vehiclesWithUpdatedModule = [...state.currentVehicles];
      const vehicle = vehiclesWithUpdatedModule[vehicleIndex];

      if (field === "name") {
        // Find the module in available modules
        for (const moduleType of Object.values(availableModules)) {
          const selectedModule = moduleType.find((m) => m.name === value);
          if (selectedModule) {
            vehicle.modules[moduleIndex] = {
              ...selectedModule,
              enabled: vehicle.modules[moduleIndex].enabled || false,
              equipped: vehicle.modules[moduleIndex].equipped || false,
              equippedSlot: vehicle.modules[moduleIndex].equippedSlot || null,
              takesTwoHands: vehicle.modules[moduleIndex].takesTwoHands || false,
              att1: selectedModule.att1 || "might",
              att2: selectedModule.att2 || "dexterity",
              prec: selectedModule.prec || 0,
              damage: selectedModule.damage || 0,
              cost: selectedModule.cost || 0,
              category: selectedModule.category || "",
              range: selectedModule.range || "Melee",
              damageType: selectedModule.damageType || "Physical",
              customName:
                (selectedModule.name === "pilot_custom_armor" || selectedModule.name === "pilot_custom_weapon" || selectedModule.name === "pilot_custom_support")
                  ? vehicle.modules[moduleIndex].customName
                  : "",
            };
            break;
          }
        }
      } else if (field === "enabled") {
        vehicle.modules[moduleIndex].enabled = value;
        vehicle.enabledModules = updateEnabledModulesList(vehicle, t);
      } else if (field === "equipped") {
        const module = vehicle.modules[moduleIndex];
        
        if (value) {
          // Equipping logic
          if (module.type === "pilot_module_armor") {
            module.equippedSlot = "armor";
          } else if (module.type === "pilot_module_weapon") {
            if (module.isShield) {
              module.equippedSlot = "off";
            } else {
              module.equippedSlot = module.cumbersome ? "both" : "main";
            }
          } else if (module.type === "pilot_module_support") {
            module.equippedSlot = "support";
          }
          
          // If weapon is cumbersome, disable other weapon modules
          if (module.cumbersome && module.type === "pilot_module_weapon") {
            vehicle.modules.forEach((otherModule, otherIndex) => {
              if (otherIndex !== moduleIndex && otherModule.type === "pilot_module_weapon") {
                otherModule.equipped = false;
                otherModule.enabled = false;
                otherModule.equippedSlot = null;
              }
            });
          }
        } else {
          module.equippedSlot = null;
        }
        
        module.equipped = value;
        module.enabled = value;
        vehicle.enabledModules = updateEnabledModulesList(vehicle, t);
      } else if (field === "equippedSlot") {
        const module = vehicle.modules[moduleIndex];
        module.equippedSlot = value;
        
        // Smart weapon hand swapping logic
        if (module.type === "pilot_module_weapon" && !module.isShield && !module.cumbersome) {
          vehicle.modules.forEach((otherModule, otherIndex) => {
            if (otherIndex !== moduleIndex && 
                otherModule.equipped && 
                otherModule.type === "pilot_module_weapon" &&
                !otherModule.isShield && 
                !otherModule.cumbersome) {
              
              if (value === "main" && otherModule.equippedSlot === "main") {
                otherModule.equippedSlot = "off";
              }
              else if (value === "off" && otherModule.equippedSlot === "off") {
                otherModule.equippedSlot = "main";
              }
            }
          });
        }
        
        if (value === "both") {
          module.takesTwoHands = true;
        }
      } else if (field === "cumbersome") {
        const module = vehicle.modules[moduleIndex];
        module.cumbersome = value;
        
        if (value) {
          if (module.equipped) {
            module.equippedSlot = "both";
            vehicle.modules.forEach((otherModule, otherIndex) => {
              if (otherIndex !== moduleIndex && otherModule.type === "pilot_module_weapon") {
                otherModule.equipped = false;
                otherModule.enabled = false;
                otherModule.equippedSlot = null;
              }
            });
          }
        } else {
          if (module.equipped && module.equippedSlot === "both") {
            module.equippedSlot = "main";
          }
        }
      } else if (field === "isShield") {
        const module = vehicle.modules[moduleIndex];
        module.isShield = value;
        
        if (value && module.equipped) {
          module.equippedSlot = "off";
        } else if (!value && module.equipped && module.equippedSlot === "off") {
          module.equippedSlot = "main";
        }
      } else {
        vehicle.modules[moduleIndex][field] = value;
      }

      return {
        ...state,
        currentVehicles: vehiclesWithUpdatedModule,
      };
    }

    default:
      return state;
  }
};

export const createInitialState = (pilot) => ({
  currentVehicles: pilot?.vehicles?.map(vehicle => ({
    ...vehicle,
    maxEnabledModules: vehicle.maxEnabledModules ?? 3,
  })) || [],
  showInPlayerSheet: pilot ? !!pilot.showInPlayerSheet : true,
});