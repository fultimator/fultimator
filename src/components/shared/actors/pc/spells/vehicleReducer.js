import { availableModules } from "/src/libs/pilotVehicleData";

export const VEHICLE_ACTIONS = {
  SET_VEHICLES: "SET_VEHICLES",
  SET_SHOW_IN_PLAYER_SHEET: "SET_SHOW_IN_PLAYER_SHEET",
  ADD_VEHICLE: "ADD_VEHICLE",
  DELETE_VEHICLE: "DELETE_VEHICLE",
  UPDATE_VEHICLE: "UPDATE_VEHICLE",
  ADD_MODULE: "ADD_MODULE",
  DELETE_MODULE: "DELETE_MODULE",
  UPDATE_MODULE: "UPDATE_MODULE",
  CLONE_MODULE: "CLONE_MODULE",
};

const createDefaultModule = (moduleType) => {
  const baseModule = availableModules[moduleType][0];
  return {
    ...baseModule,
    key: baseModule.key ?? baseModule.name,
  };
};

export const getModuleTypeForLimits = (module) => {
  if (module.type === "pilot_module_armor") return "armor";
  if (module.type === "pilot_module_weapon") return "weapon";
  if (module.type === "pilot_module_support") return "support";
  return "custom";
};

const defaultSlots = () => ({
  main: null,
  off: null,
  armor: null,
  support: [],
});

// Remove a module key from all slots.
const removeFromSlots = (slots, moduleKey) => {
  const s = { ...(slots ?? defaultSlots()) };
  if (s.main === moduleKey) s.main = null;
  if (s.off === moduleKey) s.off = null;
  if (s.armor === moduleKey) s.armor = null;
  s.support = (s.support ?? []).filter((k) => k !== moduleKey);
  return s;
};

// Place a module key into a specific slot, clearing it from other slots first.
// newSlot: "main" | "off" | "both" | "armor" | "support" | null
const applySlot = (slots, moduleKey, newSlot) => {
  let s = removeFromSlots(slots, moduleKey);
  if (newSlot === "main") s.main = moduleKey;
  else if (newSlot === "off") s.off = moduleKey;
  else if (newSlot === "both") {
    s.main = moduleKey;
    s.off = moduleKey;
  } else if (newSlot === "armor") s.armor = moduleKey;
  else if (newSlot === "support") s.support = [...(s.support ?? []), moduleKey];
  // null = already removed above
  return s;
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
            slots: defaultSlots(),
            maxEnabledModules: 3,
          },
        ],
      };

    case VEHICLE_ACTIONS.DELETE_VEHICLE:
      return {
        ...state,
        currentVehicles: state.currentVehicles.filter(
          (_, i) => i !== action.payload.index,
        ),
      };

    case VEHICLE_ACTIONS.UPDATE_VEHICLE: {
      const updatedVehicles = state.currentVehicles.map((vehicle, index) => {
        if (index === action.payload.vehicleIndex) {
          return { ...vehicle, [action.payload.field]: action.payload.value };
        }
        if (
          action.payload.field === "enabled" &&
          action.payload.value === true
        ) {
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
            const deletedModule = vehicle.modules[action.payload.moduleIndex];
            const moduleKey = deletedModule?.key ?? deletedModule?.name;
            const updatedSlots = moduleKey
              ? removeFromSlots(vehicle.slots, moduleKey)
              : (vehicle.slots ?? defaultSlots());
            return {
              ...vehicle,
              modules: vehicle.modules.filter(
                (_, moduleIndex) => moduleIndex !== action.payload.moduleIndex,
              ),
              slots: updatedSlots,
            };
          }
          return vehicle;
        }),
      };
    }

    case VEHICLE_ACTIONS.UPDATE_MODULE: {
      const { vehicleIndex, moduleIndex, field, value } = action.payload;
      const vehiclesWithUpdatedModule = [...state.currentVehicles];
      const vehicle = { ...vehiclesWithUpdatedModule[vehicleIndex] };
      vehicle.modules = [...(vehicle.modules || [])];
      vehicle.slots = { ...(vehicle.slots ?? defaultSlots()) };
      vehiclesWithUpdatedModule[vehicleIndex] = vehicle;

      if (field === "name") {
        // Find the module in available modules
        for (const moduleType of Object.values(availableModules)) {
          const selectedModule = moduleType.find((m) => m.name === value);
          if (selectedModule) {
            const currentModule = vehicle.modules[moduleIndex];
            vehicle.modules[moduleIndex] = {
              ...selectedModule,
              key: selectedModule.key ?? selectedModule.name,
              customName:
                selectedModule.name === "pilot_custom_armor" ||
                selectedModule.name === "pilot_custom_weapon" ||
                selectedModule.name === "pilot_custom_support"
                  ? currentModule.customName
                  : selectedModule.customName || "",
            };
            break;
          }
        }
      } else if (field === "enabled") {
        // No-op: slot state is now on vehicle.slots, not module.enabled
      } else if (field === "equipped") {
        const module = vehicle.modules[moduleIndex];
        const moduleKey = module.key ?? module.name;

        if (value) {
          let newSlot = null;
          if (module.type === "pilot_module_armor") {
            newSlot = "armor";
          } else if (module.type === "pilot_module_support") {
            newSlot = "support";
          } else if (module.type === "pilot_module_weapon") {
            const s = vehicle.slots;
            if (module.cumbersome) {
              // Cumbersome takes both hands - displace all other weapons
              vehicle.slots = { ...s, main: null, off: null };
              newSlot = "both";
            } else if (module.isShield) {
              // Shield prefers off hand, can go main if another shield is in off
              if (!s.off) newSlot = "off";
              else if (!s.main) newSlot = "main";
              else newSlot = null; // no room
            } else {
              // Regular weapon - prefer main, then off
              if (!s.main) newSlot = "main";
              else if (!s.off) newSlot = "off";
              else newSlot = null; // no room
            }
          }

          if (newSlot !== null) {
            vehicle.slots = applySlot(vehicle.slots, moduleKey, newSlot);
          }
        } else {
          // Unequip: remove from all slots
          vehicle.slots = removeFromSlots(vehicle.slots, moduleKey);
        }
      } else if (field === "equippedSlot") {
        const module = vehicle.modules[moduleIndex];
        const moduleKey = module.key ?? module.name;
        const s = vehicle.slots;

        // Shield main-hand validation: only allowed if another shield is in off
        if (module.isShield && value === "main") {
          const hasOffHandShield = vehicle.modules.some((m, idx) => {
            if (idx === moduleIndex) return false;
            const mk = m.key ?? m.name;
            return m.isShield && s.off === mk;
          });
          if (!hasOffHandShield) return state;
        }

        // Smart hand swapping: if another equipped weapon is in the target slot, swap it
        if (module.type === "pilot_module_weapon" && !module.cumbersome) {
          const targetHand = value; // "main" or "off"
          if (targetHand === "main" || targetHand === "off") {
            const currentInSlot = targetHand === "main" ? s.main : s.off;
            if (currentInSlot && currentInSlot !== moduleKey) {
              // Determine the current slot of the module being moved
              const currentModuleSlot =
                s.main === moduleKey
                  ? "main"
                  : s.off === moduleKey
                    ? "off"
                    : null;
              const otherHand = targetHand === "main" ? "off" : "main";
              const otherSlotOccupied =
                (otherHand === "main" ? s.main : s.off) !== null &&
                (otherHand === "main" ? s.main : s.off) !== moduleKey;

              // Can swap if: the displaced module is not cumbersome and the other hand is free or holds our module
              const displacedModule = vehicle.modules.find(
                (m) => (m.key ?? m.name) === currentInSlot,
              );
              if (
                !displacedModule?.cumbersome &&
                (!otherSlotOccupied || currentModuleSlot === otherHand)
              ) {
                // Swap: put displaced module in the other hand
                vehicle.slots = { ...vehicle.slots };
                if (otherHand === "main") vehicle.slots.main = currentInSlot;
                else vehicle.slots.off = currentInSlot;
              }
            }
          }
        }

        vehicle.slots = applySlot(vehicle.slots, moduleKey, value);
      } else if (field === "cumbersome") {
        vehicle.modules[moduleIndex] = {
          ...vehicle.modules[moduleIndex],
          cumbersome: value,
        };
        const module = vehicle.modules[moduleIndex];
        const moduleKey = module.key ?? module.name;
        const s = vehicle.slots;
        const isEquipped = s.main === moduleKey || s.off === moduleKey;

        if (value && isEquipped) {
          // Becoming cumbersome while equipped: take both hands, displace others
          vehicle.slots = { ...s, main: null, off: null };
          vehicle.slots = applySlot(vehicle.slots, moduleKey, "both");
        } else if (
          !value &&
          isEquipped &&
          s.main === moduleKey &&
          s.off === moduleKey
        ) {
          // Was cumbersome (both), now not: move to just main
          vehicle.slots = { ...s, off: null };
        }
      } else if (field === "isShield") {
        vehicle.modules[moduleIndex] = {
          ...vehicle.modules[moduleIndex],
          isShield: value,
        };
        const module = vehicle.modules[moduleIndex];
        const moduleKey = module.key ?? module.name;
        const s = vehicle.slots;
        const isEquipped = s.main === moduleKey || s.off === moduleKey;

        if (isEquipped && value) {
          // Just became a shield - prefer off hand
          const otherShieldInOff = vehicle.modules.some(
            (m, idx) =>
              idx !== moduleIndex && m.isShield && s.off === (m.key ?? m.name),
          );
          const targetSlot = otherShieldInOff ? "main" : "off";
          vehicle.slots = applySlot(s, moduleKey, targetSlot);
        }
      } else if (typeof field === "string" && field.includes(".")) {
        const [root, child] = field.split(".");
        const module = { ...vehicle.modules[moduleIndex] };
        if (!module[root] || typeof module[root] !== "object") {
          module[root] = {};
        }
        module[root] = { ...module[root], [child]: value };
        vehicle.modules[moduleIndex] = module;
      } else {
        vehicle.modules[moduleIndex] = {
          ...vehicle.modules[moduleIndex],
          [field]: value,
        };
      }

      return {
        ...state,
        currentVehicles: vehiclesWithUpdatedModule,
      };
    }

    case VEHICLE_ACTIONS.CLONE_MODULE: {
      const { vehicleIndex, moduleIndex, t } = action.payload;
      const vehiclesWithClonedModule = [...state.currentVehicles];
      const vehicle = { ...vehiclesWithClonedModule[vehicleIndex] };
      vehicle.modules = [...(vehicle.modules || [])];
      const module = vehicle.modules[moduleIndex];

      const moduleName = module.name ?? module.key;
      const isCurrentlyCustom =
        moduleName === "pilot_custom_armor" ||
        moduleName === "pilot_custom_weapon" ||
        moduleName === "pilot_custom_support";

      let customName =
        module.type === "pilot_module_armor" ||
        module.type === "pilot_module_weapon" ||
        module.type === "pilot_module_support"
          ? isCurrentlyCustom
            ? module.customName
            : t(moduleName)
          : "";

      let customDescription = isCurrentlyCustom
        ? module.description
        : t(module.description);

      let newName = "";
      if (module.type === "pilot_module_armor") newName = "pilot_custom_armor";
      else if (module.type === "pilot_module_weapon")
        newName = "pilot_custom_weapon";
      else if (module.type === "pilot_module_support")
        newName = "pilot_custom_support";

      // Clone does not carry slot state (key/equipped info removed)
      const { key: _key, ...moduleWithoutKey } = module;
      vehicle.modules[moduleIndex] = {
        ...moduleWithoutKey,
        name: newName,
        customName: customName,
        description: customDescription,
      };

      vehiclesWithClonedModule[vehicleIndex] = vehicle;
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
    currentVehicles: Array.isArray(vehicles)
      ? vehicles.map((vehicle) => ({
          ...vehicle,
          maxEnabledModules: vehicle.maxEnabledModules ?? 3,
        }))
      : [],
    showInPlayerSheet: initialData ? !!initialData.showInPlayerSheet : true,
  };
};
