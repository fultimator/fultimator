import type {
  ActionTrigger,
  Behavior,
  CooldownDuration,
} from "../types/Effects";
import type { RuntimeActor } from "../types/RuntimeActor";

export interface TriggerMatch {
  combatId: string;
  actorName: string;
  source: "npc" | "pc";
  itemName: string;
  fuid?: string;
  behaviorId?: string;
  trigger: ActionTrigger;
  behavior: Behavior;
  description?: string;
}

type ItemWithBehaviors = {
  name: string;
  fuid?: string;
  behaviors?: Behavior[];
  effect?: string;
  description?: string;
};
type ActorDoc = Record<string, unknown>;

function itemsFromActor(
  doc: ActorDoc,
  source: "npc" | "pc",
): ItemWithBehaviors[] {
  const items: ItemWithBehaviors[] = [];
  if (source === "npc") {
    for (const key of [
      "attacks",
      "weaponattacks",
      "spells",
      "special",
      "actions",
      "raregear",
    ] as const) {
      const arr = doc[key];
      if (Array.isArray(arr)) items.push(...(arr as ItemWithBehaviors[]));
    }
  } else {
    const classes = doc.classes as ActorDoc[] | undefined;
    for (const klass of classes ?? []) {
      for (const key of ["skills", "heroic", "spells"] as const) {
        const arr = klass[key];
        if (Array.isArray(arr)) items.push(...(arr as ItemWithBehaviors[]));
      }
    }
  }
  return items;
}

function matchesTrigger(
  trigger: ActionTrigger,
  kind: ActionTrigger["kind"],
  opts: {
    guardVariant?: "cover" | "no-cover";
    triggerAction?: "guard" | "attack" | "spell" | "equipment";
    reactiveEvent?: "ally-targeted";
    onHitCondition?: {
      singleTarget?: boolean;
      targetHasStatusEffects?: boolean;
    };
  },
): boolean {
  if (trigger.kind !== kind) return false;

  if (kind === "chat-action") {
    const t = trigger as Extract<ActionTrigger, { kind: "chat-action" }>;
    if (opts.triggerAction && t.action !== opts.triggerAction) return false;
    if (opts.guardVariant && t.condition?.guardVariant !== opts.guardVariant)
      return false;
  }

  if (kind === "reactive") {
    const t = trigger as Extract<ActionTrigger, { kind: "reactive" }>;
    if (opts.reactiveEvent && t.event !== opts.reactiveEvent) return false;
  }

  if (kind === "on-hit") {
    const t = trigger as Extract<ActionTrigger, { kind: "on-hit" }>;
    if (
      opts.onHitCondition?.singleTarget !== undefined &&
      t.condition?.singleTarget !== opts.onHitCondition.singleTarget
    )
      return false;
  }

  return true;
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
    onHitCondition?: {
      singleTarget?: boolean;
      targetHasStatusEffects?: boolean;
    };
  } = {},
): TriggerMatch[] {
  const matches: TriggerMatch[] = [];

  for (const { doc, runtime } of allActors) {
    if (opts.excludeCombatId && runtime.combatId === opts.excludeCombatId)
      continue;

    const source = runtime.source;
    const actorName = (doc.name as string) ?? "";
    const items = itemsFromActor(doc, source);

    for (const item of items) {
      if (item.fuid && runtime.cooldowns[item.fuid]) continue;

      // New schema: iterate behaviors[]
      for (const beh of item.behaviors ?? []) {
        if (!beh.trigger) continue;
        if (!matchesTrigger(beh.trigger, kind, opts)) continue;
        matches.push({
          combatId: runtime.combatId,
          actorName,
          source,
          itemName: item.name,
          fuid: item.fuid,
          behaviorId: beh.id,
          trigger: beh.trigger,
          behavior: beh,
          description: item.effect ?? item.description,
        });
      }
    }
  }

  return matches;
}

export function cooldownLabel(duration: CooldownDuration): string {
  return duration === "until-next-turn"
    ? "until next turn"
    : "until next round";
}
