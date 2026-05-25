import { create } from "zustand";
import {
  createRuntimeActor,
  type RuntimeActor,
  type RuntimeActorSource,
} from "../types/RuntimeActor";
import {
  buildDamageContext,
  resolveDamage,
  type DamageElement,
} from "../pipelines/damagePipeline";
import { getActorBonuses } from "../libs/actorBonuses";
import { devLog } from "../utils/devLog";

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
  actorDocsById: Record<string, ActorDoc>;
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
  applyHpDamage: (
    combatId: string,
    amount: number,
    damageType?: string,
  ) => boolean;
  revertHpDamage: (
    combatId: string,
    amount: number,
    damageType?: string,
  ) => boolean;
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
    actorDocsById: {},
    runtimeActors: {},
    activeActorName: null,
    targets: [],
    interactionMode: "select",

    setActors: (encounterId, npcs, pcs) =>
      set((state) => {
        const incomingCount = npcs.length + pcs.length;
        const fresh = buildRuntimeActors(npcs, pcs);
        const merged: Record<string, RuntimeActor> =
          incomingCount > 0 ? {} : { ...state.runtimeActors };
        if (incomingCount > 0) {
          for (const [id, actor] of Object.entries(fresh)) {
            merged[id] = state.runtimeActors[id] ?? actor;
          }
        }

        const nextActorDocsById: Record<string, ActorDoc> =
          incomingCount > 0 ? {} : { ...state.actorDocsById };
        for (const actor of [...npcs, ...pcs]) {
          const key = String(actor.combatId ?? "");
          if (!key) continue;
          nextActorDocsById[key] = actor;
        }

        return {
          encounterId,
          selectedNPCs: npcs,
          selectedPCs: pcs,
          actorDocsById: nextActorDocsById,
          runtimeActors: merged,
        };
      }),

    setActiveActorName: (name) => set({ activeActorName: name }),

    clearActors: () =>
      set((state) => {
        devLog("[combatEncounterStore] clearActors", {
          encounterId: state.encounterId,
          prevNPCs: state.selectedNPCs.length,
          prevPCs: state.selectedPCs.length,
          prevRuntime: Object.keys(state.runtimeActors).length,
        });
        return {
          encounterId: null,
          selectedNPCs: [],
          selectedPCs: [],
          actorDocsById: {},
          runtimeActors: {},
          activeActorName: null,
          targets: [],
          interactionMode: "select",
        };
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

    applyHpDamage: (combatId, amount, damageType) => {
      let applied = false;
      set((state) => {
        const key = String(combatId);
        const actor = state.runtimeActors[key];
        let foundInDocs = false;
        const targetDoc =
          state.selectedNPCs.find((n) => String(n.combatId ?? "") === key) ??
          state.selectedPCs.find((p) => String(p.combatId ?? "") === key) ??
          state.actorDocsById[key] ??
          null;

        const resolveMaxHp = (doc: ActorDoc | null): number => {
          if (!doc) return Number.POSITIVE_INFINITY;
          const stats =
            (doc.stats as Record<string, unknown> | undefined) ?? {};
          const hp = (stats.hp as Record<string, unknown> | undefined) ?? {};
          const max = Number(hp.max);
          return Number.isFinite(max) && max > 0
            ? max
            : Number.POSITIVE_INFINITY;
        };

        const resolveAppliedAmount = (doc: ActorDoc | null): number => {
          const baseAmount = Math.max(0, Number(amount) || 0);
          if (!doc || !damageType || damageType === "untyped")
            return baseAmount;
          const normalized = String(damageType).toLowerCase();
          const allowed: DamageElement[] = [
            "physical",
            "air",
            "bolt",
            "dark",
            "earth",
            "fire",
            "ice",
            "light",
            "poison",
          ];
          if (!allowed.includes(normalized as DamageElement)) return baseAmount;

          try {
            const dmgCtx = buildDamageContext({
              baseDamage: baseAmount,
              damageType: normalized as DamageElement,
              npcAffinities:
                (doc.affinities as Record<string, string> | undefined) ?? {},
              temporaryAffinities: actor?.temporaryAffinities,
              isGuarding: false,
              incomingDamageBonuses: getActorBonuses(doc).incomingDamage,
            });
            const resolved = resolveDamage(dmgCtx).finalDamage;
            return Math.max(0, Number(resolved) || 0);
          } catch {
            return baseAmount;
          }
        };

        const appliedAmount = resolveAppliedAmount(targetDoc);
        const maxHp = resolveMaxHp(targetDoc);

        devLog("[combatEncounterStore] applyHpDamage input", {
          combatId: key,
          amount,
          damageType,
          hasRuntimeActor: Boolean(actor),
          hasTargetDoc: Boolean(targetDoc),
          selectedNPCCount: state.selectedNPCs.length,
          selectedPCCount: state.selectedPCs.length,
          appliedAmount,
          maxHp,
          runtimeHp: actor?.currentHp,
        });

        const patchDocHp = (doc: ActorDoc): ActorDoc => {
          const stats =
            (doc.combatStats as Record<string, unknown> | undefined) ?? {};
          const currentHp = Number(stats.currentHp ?? 0);
          foundInDocs = true;
          return {
            ...doc,
            combatStats: {
              ...stats,
              currentHp: Math.min(
                maxHp,
                Math.max(0, currentHp - appliedAmount),
              ),
            },
          };
        };

        const nextSelectedNPCs = state.selectedNPCs.map((npc) =>
          String(npc.combatId ?? "") === key ? patchDocHp(npc) : npc,
        );
        const nextSelectedPCs = state.selectedPCs.map((pc) =>
          String(pc.combatId ?? "") === key ? patchDocHp(pc) : pc,
        );
        const nextActorDocsById = {
          ...state.actorDocsById,
          ...(targetDoc ? { [key]: patchDocHp(targetDoc) } : {}),
        };

        if (!actor && !foundInDocs) return state;
        applied = true;

        if (!appliedAmount || appliedAmount <= 0) {
          devLog("[combatEncounterStore] applyHpDamage no-op amount", {
            combatId: key,
            amount,
            damageType,
            appliedAmount,
          });
        }

        return {
          runtimeActors: {
            ...state.runtimeActors,
            ...(actor
              ? {
                  [key]: {
                    ...actor,
                    currentHp: Math.min(
                      maxHp,
                      Math.max(0, actor.currentHp - appliedAmount),
                    ),
                  },
                }
              : {}),
          },
          selectedNPCs: nextSelectedNPCs,
          selectedPCs: nextSelectedPCs,
          actorDocsById: nextActorDocsById,
        };
      });
      devLog("[combatEncounterStore] applyHpDamage result", {
        combatId: String(combatId),
        applied,
      });
      return applied;
    },

    revertHpDamage: (combatId, amount, damageType) => {
      let reverted = false;
      set((state) => {
        const key = String(combatId);
        const actor = state.runtimeActors[key];
        let foundInDocs = false;
        const targetDoc =
          state.selectedNPCs.find((n) => String(n.combatId ?? "") === key) ??
          state.selectedPCs.find((p) => String(p.combatId ?? "") === key) ??
          state.actorDocsById[key] ??
          null;

        const resolveMaxHp = (doc: ActorDoc | null): number => {
          if (!doc) return Number.POSITIVE_INFINITY;
          const stats =
            (doc.stats as Record<string, unknown> | undefined) ?? {};
          const hp = (stats.hp as Record<string, unknown> | undefined) ?? {};
          const max = Number(hp.max);
          return Number.isFinite(max) && max > 0
            ? max
            : Number.POSITIVE_INFINITY;
        };

        const resolveAppliedAmount = (doc: ActorDoc | null): number => {
          const baseAmount = Math.max(0, Number(amount) || 0);
          if (!doc || !damageType || damageType === "untyped")
            return baseAmount;
          const normalized = String(damageType).toLowerCase();
          const allowed: DamageElement[] = [
            "physical",
            "air",
            "bolt",
            "dark",
            "earth",
            "fire",
            "ice",
            "light",
            "poison",
          ];
          if (!allowed.includes(normalized as DamageElement)) return baseAmount;
          try {
            const dmgCtx = buildDamageContext({
              baseDamage: baseAmount,
              damageType: normalized as DamageElement,
              npcAffinities:
                (doc.affinities as Record<string, string> | undefined) ?? {},
              temporaryAffinities: actor?.temporaryAffinities,
              isGuarding: false,
              incomingDamageBonuses: getActorBonuses(doc).incomingDamage,
            });
            const resolved = resolveDamage(dmgCtx).finalDamage;
            return Math.max(0, Number(resolved) || 0);
          } catch {
            return baseAmount;
          }
        };
        const appliedAmount = resolveAppliedAmount(targetDoc);
        const maxHp = resolveMaxHp(targetDoc);

        devLog("[combatEncounterStore] revertHpDamage input", {
          combatId: key,
          amount,
          damageType,
          hasRuntimeActor: Boolean(actor),
          hasTargetDoc: Boolean(targetDoc),
          selectedNPCCount: state.selectedNPCs.length,
          selectedPCCount: state.selectedPCs.length,
          appliedAmount,
          maxHp,
          runtimeHp: actor?.currentHp,
        });

        const patchDocHp = (doc: ActorDoc): ActorDoc => {
          const stats =
            (doc.combatStats as Record<string, unknown> | undefined) ?? {};
          const currentHp = Number(stats.currentHp ?? 0);
          foundInDocs = true;
          return {
            ...doc,
            combatStats: {
              ...stats,
              currentHp: Math.min(
                maxHp,
                Math.max(0, currentHp + appliedAmount),
              ),
            },
          };
        };

        const nextSelectedNPCs = state.selectedNPCs.map((npc) =>
          String(npc.combatId ?? "") === key ? patchDocHp(npc) : npc,
        );
        const nextSelectedPCs = state.selectedPCs.map((pc) =>
          String(pc.combatId ?? "") === key ? patchDocHp(pc) : pc,
        );
        const nextActorDocsById = {
          ...state.actorDocsById,
          ...(targetDoc ? { [key]: patchDocHp(targetDoc) } : {}),
        };

        if (!actor && !foundInDocs) return state;
        reverted = true;

        return {
          runtimeActors: {
            ...state.runtimeActors,
            ...(actor
              ? {
                  [key]: {
                    ...actor,
                    currentHp: Math.min(
                      maxHp,
                      Math.max(0, actor.currentHp + appliedAmount),
                    ),
                  },
                }
              : {}),
          },
          selectedNPCs: nextSelectedNPCs,
          selectedPCs: nextSelectedPCs,
          actorDocsById: nextActorDocsById,
        };
      });
      devLog("[combatEncounterStore] revertHpDamage result", {
        combatId: String(combatId),
        reverted,
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
