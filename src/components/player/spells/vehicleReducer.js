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
  CLONE_MODULE: 'CLONE_MODULE',
};

const createDefaultModule = (moduleType) => {
  const baseModule = availableModules[moduleType][0];
  return { 
    ...baseModule, 
    enabled: false,
    equipped: false,
    equippedSlot: null,
    // Ensure all data fields are present from the base module
    ...baseModule
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

// Helper to displace a weapon module when another one takes its slot
const displaceWeaponFromSlot = (vehicle, moduleIndex, slot) => {
  vehicle.modules.forEach((m, idx) => {
    if (idx !== moduleIndex && m.equipped && m.type === "pilot_module_weapon") {
      const currentSlot = m.equippedSlot || (m.isShield ? "off" : "main");
      if (currentSlot === slot) {
        // Check if we can move it to the other hand
        const otherSlot = slot === "main" ? "off" : "main";
        const otherSlotOccupied = vehicle.modules.some((m2, idx2) => 
          idx2 !== idx && m2.equipped && m2.type === "pilot_module_weapon" && (m2.equippedSlot || (m2.isShield ? "off" : "main")) === otherSlot
        );

        if (!otherSlotOccupied && !m.isShield && !m.cumbersome) {
          m.equippedSlot = otherSlot;
        } else {
          // Can't move it, unequip
          m.equipped = false;
          m.enabled = false;
          m.equippedSlot = null;
        }
      }
    }
  });
};

// Helper to handle shield hand constraints
const ensureShieldConstraints = (vehicle) => {
  const offHandShield = vehicle.modules.find((m) => 
    m.equipped && m.isShield && (m.equippedSlot === "off" || !m.equippedSlot)
  );
  
  const mainHandShield = vehicle.modules.find((m) => 
    m.equipped && m.isShield && m.equippedSlot === "main"
  );

  // Rule: A shield can only be in main hand if another shield is in off hand
  if (mainHandShield && !offHandShield) {
    mainHandShield.equippedSlot = "off";
  }
};

export const vehicleReducer = (state, action) => {
  switch (action.type) {
    case VEHICLE_ACTIONS.SET_VEHICLES:
      if (action.payload.vehicles === state.currentVehicles) {
        return state;
      }
      return {
        ...state,
        currentVehicles: action.payload.vehicles || [],
      };

    case VEHICLE_ACTIONS.SET_SHOW_IN_PLAYER_SHEET:
      if (action.payload === state.showInPlayerSheet) {
        return state;
      }
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
      const updatedVehicles = state.currentVehicles.map((vehicle, index) => {
        if (index === action.payload.vehicleIndex) {
          return { ...vehicle, [action.payload.field]: action.payload.value };
        }
        if (action.payload.field === 'enabled' && action.payload.value === true) {
          return { ...vehicle, enabled: false };
        }
        return vehicle;
      });
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
            const currentModule = vehicle.modules[moduleIndex];
            vehicle.modules[moduleIndex] = {
              ...selectedModule,
              enabled: currentModule.enabled || false,
              equipped: currentModule.equipped || false,
              equippedSlot: currentModule.equippedSlot || null,
              customName:
                (selectedModule.name === "pilot_custom_armor" || selectedModule.name === "pilot_custom_weapon" || selectedModule.name === "pilot_custom_support")
                  ? currentModule.customName
                  : (selectedModule.customName || ""),
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
              const otherShieldOffHand = vehicle.modules.find((m, idx) => 
                idx !== moduleIndex && m.equipped && m.isShield && (m.equippedSlot === "off" || !m.equippedSlot)
              );
              
              module.equippedSlot = otherShieldOffHand ? "main" : "off";
              displaceWeaponFromSlot(vehicle, moduleIndex, module.equippedSlot);
            } else if (module.cumbersome) {
              module.equippedSlot = "both";
              // Cumbersome weapon displaces everything
              vehicle.modules.forEach((otherModule, otherIndex) => {
                if (otherIndex !== moduleIndex && otherModule.type === "pilot_module_weapon") {
                  otherModule.equipped = false;
                  otherModule.enabled = false;
                  otherModule.equippedSlot = null;
                }
              });
            } else {
              // Smart hand selection
              const mainHandOccupied = vehicle.modules.some((m, idx) => 
                idx !== moduleIndex && m.equipped && m.type === "pilot_module_weapon" && (m.equippedSlot === "main" || (!m.equippedSlot && !m.isShield))
              );
              module.equippedSlot = !mainHandOccupied ? "main" : "off";
              displaceWeaponFromSlot(vehicle, moduleIndex, module.equippedSlot);
            }
          } else if (module.type === "pilot_module_support") {
            module.equippedSlot = "support";
          }
        } else {
          module.equippedSlot = null;
        }
        
        module.equipped = value;
        module.enabled = value;
        ensureShieldConstraints(vehicle);
        vehicle.enabledModules = updateEnabledModulesList(vehicle, t);
      } else if (field === "equippedSlot") {
        const module = vehicle.modules[moduleIndex];
        
        // Shield main-hand validation
        if (module.isShield && value === "main") {
          const hasOffHandShield = vehicle.modules.some((m, idx) => 
            idx !== moduleIndex && m.equipped && m.isShield && m.equippedSlot === "off"
          );
          if (!hasOffHandShield) return state;
        }

        module.equippedSlot = value;
        
        // Smart hand swapping logic
        if (module.type === "pilot_module_weapon" && !module.cumbersome) {
          vehicle.modules.forEach((otherModule, otherIndex) => {
            if (otherIndex !== moduleIndex && otherModule.equipped && otherModule.type === "pilot_module_weapon" && otherModule.equippedSlot === value) {
              // Swap logic
              if (module.isShield && otherModule.isShield) {
                otherModule.equippedSlot = (value === "main" ? "off" : "main");
              } else if (!module.isShield && !otherModule.isShield && !otherModule.cumbersome) {
                otherModule.equippedSlot = (value === "main" ? "off" : "main");
              } else {
                // Displace
                displaceWeaponFromSlot(vehicle, moduleIndex, value);
              }
            }
          });
        }
        
        ensureShieldConstraints(vehicle);
        if (value === "both") module.takesTwoHands = true;
      } else if (field === "cumbersome") {
        const module = vehicle.modules[moduleIndex];
        module.cumbersome = value;
        
        if (value && module.equipped) {
          module.equippedSlot = "both";
          vehicle.modules.forEach((otherModule, otherIndex) => {
            if (otherIndex !== moduleIndex && otherModule.type === "pilot_module_weapon") {
              otherModule.equipped = false;
              otherModule.enabled = false;
              otherModule.equippedSlot = null;
            }
          });
        } else if (!value && module.equipped && module.equippedSlot === "both") {
          module.equippedSlot = "main";
        }
      } else if (field === "isShield") {
        const module = vehicle.modules[moduleIndex];
        module.isShield = value;
        
        if (module.equipped) {
          if (value) {
            // Module just became a shield
            const otherShieldOffHand = vehicle.modules.find((m, idx) => 
              idx !== moduleIndex && m.equipped && m.isShield && (m.equippedSlot === "off" || !m.equippedSlot)
            );
            
            module.equippedSlot = otherShieldOffHand ? "main" : "off";
            displaceWeaponFromSlot(vehicle, moduleIndex, module.equippedSlot);
          }
          ensureShieldConstraints(vehicle);
        }
      } else {
        vehicle.modules[moduleIndex][field] = value;
      }

      return {
        ...state,
        currentVehicles: vehiclesWithUpdatedModule,
      };
    }

    case VEHICLE_ACTIONS.CLONE_MODULE: {
      const { vehicleIndex, moduleIndex, t } = action.payload;
      const vehiclesWithClonedModule = [...state.currentVehicles];
      const vehicle = vehiclesWithClonedModule[vehicleIndex];
      const module = vehicle.modules[moduleIndex];
      
      const isCurrentlyCustom = (module.name === "pilot_custom_armor" || module.name === "pilot_custom_weapon" || module.name === "pilot_custom_support");

      let customName = (module.type === "pilot_module_armor" || module.type === "pilot_module_weapon" || module.type === "pilot_module_support")
        ? isCurrentlyCustom
          ? module.customName
          : t(module.name)
        : "";

      let customDescription = isCurrentlyCustom ? module.description : t(module.description);

      let newName = "";
      if (module.type === "pilot_module_armor") newName = "pilot_custom_armor";
      else if (module.type === "pilot_module_weapon") newName = "pilot_custom_weapon";
      else if (module.type === "pilot_module_support") newName = "pilot_custom_support";

      vehicle.modules[moduleIndex] = {
        ...module,
        name: newName,
        customName: customName,
        description: customDescription,
      };

      return {
        ...state,
        currentVehicles: vehiclesWithClonedModule,
      };
    }

    default:
      return state;
  }
};

export const createInitialState = (initialData) => {
  // Extract vehicles from multiple possible locations
  const vehicles =
    initialData?.vehicles ||
    initialData?.currentVehicles ||
    initialData?.spell?.vehicles ||
    initialData?.pilot?.vehicles ||
    [];

  return {
    currentVehicles: Array.isArray(vehicles) ? vehicles.map(vehicle => ({
      ...vehicle,
      maxEnabledModules: vehicle.maxEnabledModules ?? 3,
    })) : [],
    showInPlayerSheet: initialData ? !!initialData.showInPlayerSheet : true,
  };
};
