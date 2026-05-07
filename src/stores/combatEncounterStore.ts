import { create } from "zustand";

type ActorDoc = Record<string, unknown>;

interface CombatEncounterState {
  encounterId: string | null;
  selectedNPCs: ActorDoc[];
  selectedPCs: ActorDoc[];
  activeActorName: string | null;
  setActors: (encounterId: string, npcs: ActorDoc[], pcs: ActorDoc[]) => void;
  setActiveActorName: (name: string | null) => void;
  clearActors: () => void;
}

export const useCombatEncounterStore = create<CombatEncounterState>((set) => ({
  encounterId: null,
  selectedNPCs: [],
  selectedPCs: [],
  activeActorName: null,
  setActors: (encounterId, npcs, pcs) =>
    set({ encounterId, selectedNPCs: npcs, selectedPCs: pcs }),
  setActiveActorName: (name) => set({ activeActorName: name }),
  clearActors: () =>
    set({
      encounterId: null,
      selectedNPCs: [],
      selectedPCs: [],
      activeActorName: null,
    }),
}));
