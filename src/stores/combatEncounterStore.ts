import { create } from "zustand";
import {
  createRuntimeActor,
  type RuntimeActor,
  type RuntimeActorSource,
} from "../types/RuntimeActor";

type ActorDoc = Record<string, unknown>;

export interface TargetRef {
  combatId: string;
  name: string;
  source: "npc" | "pc";
}

interface CombatEncounterState {
  encounterId: string | null;
  selectedNPCs: ActorDoc[];
  selectedPCs: ActorDoc[];
  runtimeActors: Record<string, RuntimeActor>;
  activeActorName: string | null;
  targets: TargetRef[];
  interactionMode: "select" | "target";
  setActors: (encounterId: string, npcs: ActorDoc[], pcs: ActorDoc[]) => void;
  setActiveActorName: (name: string | null) => void;
  clearActors: () => void;
  setTarget: (ref: TargetRef) => void;
  toggleTarget: (ref: TargetRef) => void;
  clearTargets: () => void;
  setInteractionMode: (mode: "select" | "target") => void;
  // runtime actor mutations
  applyHpDamage: (combatId: string, amount: number) => boolean;
  revertHpDamage: (combatId: string, amount: number) => boolean;
  updateRuntimeActor: (
    combatId: string,
    updater: (actor: RuntimeActor) => RuntimeActor,
  ) => void;
  getRuntimeActor: (combatId: string) => RuntimeActor | undefined;
}

function buildRuntimeActors(
  npcs: ActorDoc[],
  pcs: ActorDoc[],
): Record<string, RuntimeActor> {
  const result: Record<string, RuntimeActor> = {};

  for (const npc of npcs) {
    const combatId = npc.combatId as string;
    const combatStats = npc.combatStats as Record<string, unknown> | undefined;
    result[combatId] = createRuntimeActor(
      combatId,
      "npc" as RuntimeActorSource,
      (combatStats?.currentHp as number) ?? 0,
      (combatStats?.currentMp as number) ?? 0,
    );
  }

  for (const pc of pcs) {
    const combatId = pc.combatId as string;
    const combatStats = pc.combatStats as Record<string, unknown> | undefined;
    result[combatId] = createRuntimeActor(
      combatId,
      "pc" as RuntimeActorSource,
      (combatStats?.currentHp as number) ?? 0,
      (combatStats?.currentMp as number) ?? 0,
    );
  }

  return result;
}

export const useCombatEncounterStore = create<CombatEncounterState>(
  (set, get) => ({
    encounterId: null,
    selectedNPCs: [],
    selectedPCs: [],
    runtimeActors: {},
    activeActorName: null,
    targets: [],
    interactionMode: "select",

    setActors: (encounterId, npcs, pcs) =>
      set((state) => {
        const fresh = buildRuntimeActors(npcs, pcs);
        const merged: Record<string, RuntimeActor> = {};
        for (const [id, actor] of Object.entries(fresh)) {
          merged[id] = state.runtimeActors[id] ?? actor;
        }
        return {
          encounterId,
          selectedNPCs: npcs,
          selectedPCs: pcs,
          runtimeActors: merged,
        };
      }),

    setActiveActorName: (name) => set({ activeActorName: name }),

    clearActors: () =>
      set({
        encounterId: null,
        selectedNPCs: [],
        selectedPCs: [],
        runtimeActors: {},
        activeActorName: null,
        targets: [],
        interactionMode: "select",
      }),

    setTarget: (ref) => set({ targets: [ref] }),

    toggleTarget: (ref) =>
      set((state) => {
        const exists = state.targets.some((t) => t.combatId === ref.combatId);
        return {
          targets: exists
            ? state.targets.filter((t) => t.combatId !== ref.combatId)
            : [...state.targets, ref],
        };
      }),

    clearTargets: () => set({ targets: [] }),

    setInteractionMode: (mode) => set({ interactionMode: mode }),

    applyHpDamage: (combatId, amount) => {
      let applied = false;
      set((state) => {
        const key = String(combatId);
        const actor = state.runtimeActors[key];
        let foundInDocs = false;

        const patchDocHp = (doc: ActorDoc): ActorDoc => {
          const stats =
            (doc.combatStats as Record<string, unknown> | undefined) ?? {};
          const currentHp = Number(stats.currentHp ?? 0);
          foundInDocs = true;
          return {
            ...doc,
            combatStats: {
              ...stats,
              currentHp: Math.max(0, currentHp - amount),
            },
          };
        };

        const nextSelectedNPCs = state.selectedNPCs.map((npc) =>
          String(npc.combatId ?? "") === key ? patchDocHp(npc) : npc,
        );
        const nextSelectedPCs = state.selectedPCs.map((pc) =>
          String(pc.combatId ?? "") === key ? patchDocHp(pc) : pc,
        );

        if (!actor && !foundInDocs) return state;
        applied = true;

        return {
          runtimeActors: {
            ...state.runtimeActors,
            ...(actor
              ? {
                  [key]: {
                    ...actor,
                    currentHp: Math.max(0, actor.currentHp - amount),
                  },
                }
              : {}),
          },
          selectedNPCs: nextSelectedNPCs,
          selectedPCs: nextSelectedPCs,
        };
      });
      return applied;
    },

    revertHpDamage: (combatId, amount) => {
      let reverted = false;
      set((state) => {
        const key = String(combatId);
        const actor = state.runtimeActors[key];
        let foundInDocs = false;

        const patchDocHp = (doc: ActorDoc): ActorDoc => {
          const stats =
            (doc.combatStats as Record<string, unknown> | undefined) ?? {};
          const currentHp = Number(stats.currentHp ?? 0);
          foundInDocs = true;
          return {
            ...doc,
            combatStats: {
              ...stats,
              currentHp: currentHp + amount,
            },
          };
        };

        const nextSelectedNPCs = state.selectedNPCs.map((npc) =>
          String(npc.combatId ?? "") === key ? patchDocHp(npc) : npc,
        );
        const nextSelectedPCs = state.selectedPCs.map((pc) =>
          String(pc.combatId ?? "") === key ? patchDocHp(pc) : pc,
        );

        if (!actor && !foundInDocs) return state;
        reverted = true;

        return {
          runtimeActors: {
            ...state.runtimeActors,
            ...(actor
              ? {
                  [key]: {
                    ...actor,
                    currentHp: actor.currentHp + amount,
                  },
                }
              : {}),
          },
          selectedNPCs: nextSelectedNPCs,
          selectedPCs: nextSelectedPCs,
        };
      });
      return reverted;
    },

    updateRuntimeActor: (combatId, updater) =>
      set((state) => {
        const actor = state.runtimeActors[combatId];
        if (!actor) return state;
        return {
          runtimeActors: {
            ...state.runtimeActors,
            [combatId]: updater(actor),
          },
        };
      }),

    getRuntimeActor: (combatId) => get().runtimeActors[combatId],
  }),
);
