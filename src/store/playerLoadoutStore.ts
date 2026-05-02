import { create } from "zustand";
import { TypePlayer, Vehicle } from "../types/Players";
import {
  equipItemToSlot,
  clearSlotAction,
  selectModuleForSlot,
  disableModuleForSlot,
  toggleSupportModuleAction,
  toggleActiveVehicle,
  saveVehiclesAction,
  swapTransformingWeaponForm,
  type PickerCandidate,
} from "../components/player/equipment/slots/loadoutActions";
import { getPilotSpellInfo } from "../components/player/equipment/slots/loadoutSelectors";

// Types

type SetPlayerFn = (
  updaterOrValue: TypePlayer | ((prev: TypePlayer) => TypePlayer),
) => void;

interface LoadoutStore {
  /** The active setPlayer dispatcher. Call `init(setPlayer)` from a useEffect. */
  _setPlayer: SetPlayerFn | null;

  /**
   * Register the setPlayer function for the currently edited player.
   * Call this once from a useEffect in the top-level loadout consumer:
   *   useEffect(() => store.init(setPlayer), [setPlayer]);
   */
  init: (setPlayer: SetPlayerFn) => void;

  // Item equip / unequip
  equipItem: (slot: string, candidate: PickerCandidate) => void;
  clearSlot: (slot: string) => void;

  // Vehicle module management
  selectModule: (slot: string, moduleIndex: number) => void;
  disableModule: (slot: string) => void;
  toggleSupportModule: (moduleIndex: number) => void;

  // Vehicle enter / exit
  toggleVehicle: () => void;
  saveVehicles: (updatedPilot: {
    vehicles: Vehicle[];
    showInPlayerSheet?: boolean;
  }) => void;

  // Transforming weapon
  swapForm: (slot: string) => void;
}

// Store

/**
 * Player-loadout Zustand store.
 *
 * All mutation actions use React's functional-updater pattern so they always
 * operate on the latest player state  -  no stale-closure risk.
 *
 * Usage in a component:
 *   const store = useLoadoutStore();
 *   useEffect(() => store.init(setPlayer), [setPlayer]);
 *   // then: store.equipItem(slot, candidate), store.toggleVehicle(), …
 */
export const useLoadoutStore = create<LoadoutStore>((set, get) => ({
  _setPlayer: null,

  init: (setPlayer) => {
    if (get()._setPlayer !== setPlayer) {
      set({ _setPlayer: setPlayer });
    }
  },

  // Item equip / unequip

  equipItem: (slot, candidate) => {
    get()._setPlayer?.((player) => equipItemToSlot(player, slot, candidate));
  },

  clearSlot: (slot) => {
    get()._setPlayer?.((player) => clearSlotAction(player, slot));
  },

  // Vehicle module management

  selectModule: (slot, moduleIndex) => {
    get()._setPlayer?.((player) => {
      const pilotInfo = getPilotSpellInfo(player);
      if (!pilotInfo) return player;
      return selectModuleForSlot(player, pilotInfo, slot, moduleIndex);
    });
  },

  disableModule: (slot) => {
    get()._setPlayer?.((player) => {
      const pilotInfo = getPilotSpellInfo(player);
      if (!pilotInfo) return player;
      return disableModuleForSlot(player, pilotInfo, slot);
    });
  },

  toggleSupportModule: (moduleIndex) => {
    get()._setPlayer?.((player) => {
      const pilotInfo = getPilotSpellInfo(player);
      if (!pilotInfo) return player;
      return toggleSupportModuleAction(player, pilotInfo, moduleIndex);
    });
  },

  // Vehicle enter / exit

  toggleVehicle: () => {
    get()._setPlayer?.((player) => {
      const pilotInfo = getPilotSpellInfo(player);
      if (!pilotInfo) return player;
      return toggleActiveVehicle(player, pilotInfo);
    });
  },

  saveVehicles: (updatedPilot) => {
    get()._setPlayer?.((player) => {
      const pilotInfo = getPilotSpellInfo(player);
      if (!pilotInfo) return player;
      return saveVehiclesAction(player, pilotInfo, updatedPilot);
    });
  },

  // Transforming weapon

  swapForm: (slot) => {
    get()._setPlayer?.((player) => swapTransformingWeaponForm(player, slot));
  },
}));
