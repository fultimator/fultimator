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
  name?: string;
  customName?: string;
  key?: string;
  id?: string;
  _packItemId?: string;
  fuid?: string;
  behaviors?: Behavior[];
  effect?: string;
  description?: string;
};
type ActorDoc = Record<string, unknown>;
type BehaviorContainer = ItemWithBehaviors & Record<string, unknown>;
type SubItemContainer = Record<string, unknown>;

function hasOwnEnabled(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    Object.prototype.hasOwnProperty.call(value, "enabled")
  );
}

function isEnabledWhenPresent(value: unknown): boolean {
  if (!hasOwnEnabled(value)) return true;
  return (value as { enabled?: unknown }).enabled === true;
}

function isSpellEnabledForBehavior(spell: SubItemContainer): boolean {
  if (spell.spellType === "pilot-vehicle") return true;
  return isEnabledWhenPresent(spell);
}

function getStableKey(value: Record<string, unknown>): string | undefined {
  const keys = [
    value.id,
    value.key,
    value.fuid,
    value._packItemId,
    value.name,
    value.customName,
  ];
  return keys.find((key): key is string => typeof key === "string" && !!key);
}

function matchesStableKey(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const aKey = getStableKey(a);
  const bKey = getStableKey(b);
  return !!aKey && !!bKey && aKey === bKey;
}

function itemDisplayName(item: ItemWithBehaviors): string {
  return (
    item.customName ||
    item.name ||
    item.key ||
    item.fuid ||
    item.id ||
    item._packItemId ||
    "Unnamed"
  );
}

function vehicleSlotKeys(vehicle: SubItemContainer): Set<string> {
  const out = new Set<string>();
  const slots = vehicle.slots;
  if (!slots || typeof slots !== "object") return out;

  for (const key of ["main", "off", "armor", "support"]) {
    const value = (slots as Record<string, unknown>)[key];
    if (typeof value === "string" && value) out.add(value);
    else if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string" && entry) out.add(entry);
      }
    }
  }

  return out;
}

function isVehicleModuleEquipped(
  vehicle: SubItemContainer,
  module: SubItemContainer,
): boolean {
  if (module.equipped === true || module.enabled === true) return true;
  const key = getStableKey(module);
  return !!key && vehicleSlotKeys(vehicle).has(key);
}

function isNestedSpellItemActive(
  spell: SubItemContainer,
  key: string,
  item: SubItemContainer,
): boolean {
  if (key === "magiseeds") {
    const current = spell.currentMagiseed;
    if (typeof current === "string" && current) {
      return getStableKey(item) === current;
    }
    if (current && typeof current === "object") {
      return matchesStableKey(item, current as Record<string, unknown>);
    }
    return isEnabledWhenPresent(item);
  }

  if (key === "therioforms" || key === "symbols") {
    return isEnabledWhenPresent(item);
  }

  return true;
}

function* walkSpellBehaviorItems(
  spell: SubItemContainer,
): Generator<BehaviorContainer> {
  if (!isSpellEnabledForBehavior(spell)) return;
  if (isEnabledWhenPresent(spell)) yield spell as BehaviorContainer;

  for (const key of [
    "gifts",
    "dances",
    "tones",
    "keys",
    "symbols",
    "therioforms",
    "magiseeds",
    "invocations",
    "effects",
    "targets",
  ]) {
    const arr = spell[key];
    if (!Array.isArray(arr)) continue;
    for (const sub of arr) {
      if (!sub || typeof sub !== "object") continue;
      const subItem = sub as SubItemContainer;
      if (isNestedSpellItemActive(spell, key, subItem)) {
        yield subItem as BehaviorContainer;
      }
    }
  }

  const vehicles = Array.isArray(spell.vehicles)
    ? spell.vehicles
    : spell.currentVehicles;
  if (!Array.isArray(vehicles)) return;
  for (const vehicle of vehicles) {
    if (!vehicle || typeof vehicle !== "object") continue;
    const vehicleRecord = vehicle as SubItemContainer;
    if (vehicleRecord.enabled !== true) continue;
    yield vehicleRecord as BehaviorContainer;

    const modules = vehicleRecord.modules;
    if (!Array.isArray(modules)) continue;
    for (const mod of modules) {
      if (!mod || typeof mod !== "object") continue;
      const moduleRecord = mod as SubItemContainer;
      if (isVehicleModuleEquipped(vehicleRecord, moduleRecord)) {
        yield moduleRecord as BehaviorContainer;
      }
    }
  }
}

function resolveSlotItem(
  equipment: ActorDoc,
  ref: Record<string, unknown> | null | undefined,
): BehaviorContainer | undefined {
  if (!ref) return undefined;
  const source = typeof ref.source === "string" ? ref.source : undefined;
  if (!source) return undefined;
  const collection = equipment[source];
  if (!Array.isArray(collection)) return undefined;

  if (typeof ref.index === "number") {
    const byIndex = collection[ref.index];
    if (byIndex && typeof byIndex === "object") {
      return byIndex as BehaviorContainer;
    }
  }

  const name = typeof ref.name === "string" ? ref.name : undefined;
  if (!name) return undefined;
  return collection.find(
    (item): item is BehaviorContainer =>
      !!item &&
      typeof item === "object" &&
      (item as Record<string, unknown>).name === name,
  );
}

function equippedPlayerItems(
  doc: ActorDoc,
  equipment: ActorDoc,
): BehaviorContainer[] {
  const out: BehaviorContainer[] = [];
  const seen = new Set<BehaviorContainer>();
  const push = (item: BehaviorContainer | undefined) => {
    if (!item || seen.has(item)) return;
    seen.add(item);
    out.push(item);
  };

  const slots =
    doc.equippedSlots && typeof doc.equippedSlots === "object"
      ? (doc.equippedSlots as Record<string, unknown>)
      : null;
  if (slots) {
    push(resolveSlotItem(equipment, slots.mainHand as Record<string, unknown>));
    push(resolveSlotItem(equipment, slots.offHand as Record<string, unknown>));
    push(resolveSlotItem(equipment, slots.armor as Record<string, unknown>));
    push(
      resolveSlotItem(equipment, slots.accessory as Record<string, unknown>),
    );
    return out;
  }

  for (const key of [
    "weapons",
    "customWeapons",
    "shields",
    "armor",
    "accessories",
  ]) {
    const arr = equipment[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (
        item &&
        typeof item === "object" &&
        (item as Record<string, unknown>).isEquipped === true
      ) {
        push(item as BehaviorContainer);
      }
    }
  }

  return out;
}

function isWeaponItem(item: BehaviorContainer): boolean {
  return item.itemType === "weapon" || item.itemType === "customWeapon";
}

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
      for (const key of ["skills", "heroic"] as const) {
        const arr = klass[key];
        if (Array.isArray(arr)) items.push(...(arr as ItemWithBehaviors[]));
      }
      const spells = klass.spells;
      if (Array.isArray(spells)) {
        for (const spell of spells) {
          if (spell && typeof spell === "object") {
            items.push(...walkSpellBehaviorItems(spell as SubItemContainer));
          }
        }
      }
    }

    const equipmentSets = Array.isArray(doc.equipment) ? doc.equipment : [];
    for (const eq of equipmentSets) {
      if (!eq || typeof eq !== "object") continue;
      const equipment = eq as ActorDoc;
      for (const item of equippedPlayerItems(doc, equipment)) {
        items.push(item);
        if (!isWeaponItem(item) || !Array.isArray(item.slotted)) continue;
        for (const sphereId of item.slotted) {
          if (typeof sphereId !== "string" || !sphereId) continue;
          const hoplo = Array.isArray(equipment.hoplospheres)
            ? equipment.hoplospheres.find(
                (sphere) =>
                  sphere &&
                  typeof sphere === "object" &&
                  (sphere as Record<string, unknown>).id === sphereId,
              )
            : undefined;
          if (hoplo && typeof hoplo === "object") {
            items.push(hoplo as BehaviorContainer);
            continue;
          }

          const mnemo = Array.isArray(equipment.mnemospheres)
            ? equipment.mnemospheres.find(
                (sphere) =>
                  sphere &&
                  typeof sphere === "object" &&
                  (sphere as Record<string, unknown>).id === sphereId,
              )
            : undefined;
          if (!mnemo || typeof mnemo !== "object") continue;
          const mnemoRecord = mnemo as ActorDoc;
          for (const key of ["skills", "heroic"] as const) {
            const arr = mnemoRecord[key];
            if (Array.isArray(arr)) items.push(...(arr as ItemWithBehaviors[]));
          }
          const spells = mnemoRecord.spells;
          if (Array.isArray(spells)) {
            for (const spell of spells) {
              if (spell && typeof spell === "object") {
                items.push(
                  ...walkSpellBehaviorItems(spell as SubItemContainer),
                );
              }
            }
          }
        }
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
          itemName: itemDisplayName(item),
          fuid: item.fuid,
          behaviorId: beh.id,
          trigger: beh.trigger,
          behavior: beh,
          description: item.effect ?? item.description,
        });
      }
    }

    // Scan actor.effects[].behavior and actor.effects[].behaviors[]
    const actorEffects = Array.isArray(doc.effects) ? doc.effects : [];
    for (const effect of actorEffects) {
      if (!effect || typeof effect !== "object") continue;
      const e = effect as Record<string, unknown>;
      if (e.disabled === true) continue;
      const effectId = typeof e.id === "string" ? e.id : undefined;
      if (effectId && runtime.cooldowns[effectId]) continue;
      const effectName = typeof e.name === "string" ? e.name : "Effect";

      const allBehs: Behavior[] = Array.isArray(e.behaviors)
        ? (e.behaviors as Behavior[])
        : [];

      for (const beh of allBehs) {
        if (!beh?.trigger) continue;
        if (!matchesTrigger(beh.trigger, kind, opts)) continue;
        matches.push({
          combatId: runtime.combatId,
          actorName,
          source,
          itemName: effectName,
          fuid: effectId,
          behaviorId: beh.id,
          trigger: beh.trigger,
          behavior: beh,
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
