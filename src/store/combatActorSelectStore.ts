import { create } from "zustand";

interface CombatActorSelectState {
  enabled: boolean;
  npcList: unknown[];
  playerList: unknown[];
  loadingNpcs: boolean;
  loadingPlayers: boolean;
  handleSelectNPC: ((npc: unknown) => void) | null;
  handleSelectPC: ((pc: unknown) => void) | null;
  setPanelData: (data: {
    npcList: unknown[];
    playerList: unknown[];
    loadingNpcs: boolean;
    loadingPlayers: boolean;
    handleSelectNPC: (npc: unknown) => void;
    handleSelectPC: (pc: unknown) => void;
  }) => void;
  clearPanelData: () => void;
}

export const useCombatActorSelectStore = create<CombatActorSelectState>(
  (set) => ({
    enabled: false,
    npcList: [],
    playerList: [],
    loadingNpcs: false,
    loadingPlayers: false,
    handleSelectNPC: null,
    handleSelectPC: null,
    setPanelData: ({
      npcList,
      playerList,
      loadingNpcs,
      loadingPlayers,
      handleSelectNPC,
      handleSelectPC,
    }) =>
      set({
        enabled: true,
        npcList,
        playerList,
        loadingNpcs,
        loadingPlayers,
        handleSelectNPC,
        handleSelectPC,
      }),
    clearPanelData: () =>
      set({
        enabled: false,
        npcList: [],
        playerList: [],
        loadingNpcs: false,
        loadingPlayers: false,
        handleSelectNPC: null,
        handleSelectPC: null,
      }),
  }),
);
