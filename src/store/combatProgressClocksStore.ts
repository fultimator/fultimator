import { create } from "zustand";

interface CombatProgressClocksState {
  enabled: boolean;
  encounterClocks: unknown[];
  actorClockEntries: unknown[];
  onUpdateEncounterClock: ((index: number, newState: boolean[]) => void) | null;
  onUpdateActorClock:
    | ((entry: {
        actorKind: "npc" | "pc";
        actorCombatId: string;
        noteIndex: number;
        clockIndex: number;
        newState: boolean[];
      }) => void)
    | null;
  emitLog: ((entry: unknown) => void) | null;
  setPanelData: (data: {
    encounterClocks: unknown[];
    actorClockEntries: unknown[];
    onUpdateEncounterClock: (index: number, newState: boolean[]) => void;
    onUpdateActorClock: (entry: {
      actorKind: "npc" | "pc";
      actorCombatId: string;
      noteIndex: number;
      clockIndex: number;
      newState: boolean[];
    }) => void;
    emitLog: (entry: unknown) => void;
  }) => void;
  clearPanelData: () => void;
}

export const useCombatProgressClocksStore = create<CombatProgressClocksState>(
  (set) => ({
    enabled: false,
    encounterClocks: [],
    actorClockEntries: [],
    onUpdateEncounterClock: null,
    onUpdateActorClock: null,
    emitLog: null,
    setPanelData: (data) => set({ enabled: true, ...data }),
    clearPanelData: () =>
      set({
        enabled: false,
        encounterClocks: [],
        actorClockEntries: [],
        onUpdateEncounterClock: null,
        onUpdateActorClock: null,
        emitLog: null,
      }),
  }),
);
