import type { ActionTrigger, ActionBehavior, CooldownDuration } from "../types/Effects";
import type { RuntimeActor } from "../types/RuntimeActor";

export interface TriggerMatch {
  combatId: string;
  actorName: string;
  source: "npc" | "pc";
  itemName: string;
  fuid?: string;
  trigger: ActionTrigger;
  behavior: ActionBehavior;
}

type ItemWithBehavior = { name: string; fuid?: string; behavior?: ActionBehavior };
type ActorDoc = Record<string, unknown>;

function itemsFromActor(doc: ActorDoc, source: "npc" | "pc"): ItemWithBehavior[] {
  const items: ItemWithBehavior[] = [];
  if (source === "npc") {
    for (const key of ["attacks", "weaponattacks", "spells", "special", "actions", "raregear"] as const) {
      const arr = doc[key];
      if (Array.isArray(arr)) items.push(...(arr as ItemWithBehavior[]));
    }
  } else {
    const classes = doc.classes as ActorDoc[] | undefined;
    for (const klass of classes ?? []) {
      for (const key of ["skills", "heroic", "spells"] as const) {
        const arr = klass[key];
        if (Array.isArray(arr)) items.push(...(arr as ItemWithBehavior[]));
      }
    }
  }
  return items;
}

// Find all combatants with a matching trigger kind, excluding cooled-down items.
export function scanForTrigger(
  kind: ActionTrigger["kind"],
  allActors: { doc: ActorDoc; runtime: RuntimeActor }[],
  opts: {
    excludeCombatId?: string;
    guardVariant?: "cover" | "no-cover";
    triggerAction?: "guard" | "attack" | "spell" | "equipment";
    reactiveEvent?: "ally-targeted";
    onHitCondition?: { singleTarget?: boolean; targetHasStatusEffects?: boolean };
  } = {},
): TriggerMatch[] {
  const matches: TriggerMatch[] = [];

  for (const { doc, runtime } of allActors) {
    if (opts.excludeCombatId && runtime.combatId === opts.excludeCombatId) continue;

    const source = runtime.source;
    const actorName = (doc.name as string) ?? "";
    const items = itemsFromActor(doc, source);

    for (const item of items) {
      const trigger = item.behavior?.trigger;
      if (!trigger || trigger.kind !== kind) continue;
      if (item.fuid && runtime.cooldowns[item.fuid]) continue;

      if (kind === "chat-action") {
        const t = trigger as Extract<ActionTrigger, { kind: "chat-action" }>;
        if (opts.triggerAction && t.action !== opts.triggerAction) continue;
        if (opts.guardVariant && t.condition?.guardVariant !== opts.guardVariant) continue;
      }

      if (kind === "reactive") {
        const t = trigger as Extract<ActionTrigger, { kind: "reactive" }>;
        if (opts.reactiveEvent && t.event !== opts.reactiveEvent) continue;
      }

      if (kind === "on-hit") {
        const t = trigger as Extract<ActionTrigger, { kind: "on-hit" }>;
        if (opts.onHitCondition) {
          if (opts.onHitCondition.singleTarget !== undefined &&
              t.condition?.singleTarget !== opts.onHitCondition.singleTarget) continue;
        }
      }

      matches.push({
        combatId: runtime.combatId,
        actorName,
        source,
        itemName: item.name,
        fuid: item.fuid,
        trigger,
        behavior: item.behavior!,
      });
    }
  }

  return matches;
}

export function cooldownLabel(duration: CooldownDuration): string {
  return duration === "until-next-turn" ? "until next turn" : "until next round";
}
