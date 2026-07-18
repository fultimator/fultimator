import {
  zeroActorBonuses,
  oneActorMultipliers,
  type ActorBonuses,
  type ActorMultipliers,
} from "../types/Bonuses";
import type {
  Behavior,
  EffectChange,
  EffectMode,
  GrantData,
} from "../types/Effects";
import { type Affinities, type Elements } from "../types/Misc";
import { combineAffinities } from "../pipelines/damagePipeline";
import type {
  Accessories,
  Armor,
  CustomWeapons,
  Shields,
  SlotRef,
  TypePlayer,
  Weapons,
} from "../types/Players";
import type { TypeNpc } from "../types/Npcs";

type Actor = TypePlayer | TypeNpc;
type PlayerEquipmentItem =
  | Weapons
  | CustomWeapons
  | Shields
  | Armor
  | Accessories;
type SlottedEquipmentItem = (Weapons | CustomWeapons) & { slotted?: string[] };

export interface ResolveContext {
  inCrisis?: boolean;
}

export interface ResolvedEffects {
  bonuses: ActorBonuses;
  multipliers: ActorMultipliers;
  grants: GrantData[];
  affinityGrants: Partial<Record<Elements, Affinities>>;
}

export function resolveActorEffects(
  actor: Actor,
  ctx: ResolveContext = {},
): ResolvedEffects {
  const bonuses = clone(actor.bonuses ?? zeroActorBonuses());
  const multipliers = clone(actor.multipliers ?? oneActorMultipliers());
  const grants: GrantData[] = [];
  const baseAffinities = (actor.affinities ?? {}) as Partial<
    Record<Elements, Affinities>
  >;
  const affinityGrants: Partial<Record<Elements, Affinities>> = {};

  const passiveBehaviors = collectPassiveBehaviors(actor, ctx);
  const changes = passiveBehaviors.flatMap((b) => b.changes ?? []);
  const sorted = changes.slice().sort(byPriority);

  const overlay = { bonuses, multipliers };
  for (const change of sorted) {
    if (change.key.startsWith("affinities.")) {
      applyAffinityChange(affinityGrants, baseAffinities, change);
    } else {
      applyChange(overlay, change);
    }
  }

  for (const beh of passiveBehaviors) {
    if (beh.grants) grants.push(...beh.grants);
  }

  return { bonuses, multipliers, grants, affinityGrants };
}

function collectPassiveBehaviors(
  actor: Actor,
  ctx: ResolveContext,
): Behavior[] {
  const out: Behavior[] = [];

  for (const e of actor.effects ?? []) {
    if (e.disabled === true) continue;
    for (const beh of e.behaviors ?? []) {
      if ((beh.trigger?.kind ?? "passive") !== "passive") continue;
      if (!isActive(beh, ctx)) continue;
      out.push(beh);
    }
  }

  for (const item of walkItems(actor)) {
    for (const beh of itemBehaviors(item)) {
      if (beh.transfer !== true) continue;
      if ((beh.trigger?.kind ?? "passive") !== "passive") continue;
      if (!isActive(beh, ctx)) continue;
      out.push(beh);
    }
  }

  return out;
}

type ItemWithEffects = {
  behaviors?: Behavior[];
};

function itemBehaviors(item: ItemWithEffects): Behavior[] {
  return item.behaviors ?? [];
}

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

function isSpellEnabledForTransfer(spell: SubItemContainer): boolean {
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
  if (aKey && bKey && aKey === bKey) return true;
  return false;
}

function activeVehicle(vehicles: SubItemContainer[]): SubItemContainer | null {
  if (vehicles.length === 0) return null;
  return vehicles.find((v) => v.enabled === true) ?? vehicles[0];
}

function isNestedSpellItemActive(
  spell: SubItemContainer,
  key: string,
  item: SubItemContainer,
  _itemIndex: number,
): boolean {
  if (key === "magiseeds") {
    const current = spell.currentMagiseed;
    if (typeof current === "string" && current) {
      const itemKey = getStableKey(item);
      return itemKey === current;
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

function* walkSpellSubItems(
  spell: SubItemContainer,
): Generator<ItemWithEffects> {
  if (!isSpellEnabledForTransfer(spell)) return;

  const arrays = [
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
  ];
  for (const key of arrays) {
    const arr = spell[key];
    if (!Array.isArray(arr)) continue;
    for (let index = 0; index < arr.length; index++) {
      const sub = arr[index] as SubItemContainer;
      if (isNestedSpellItemActive(spell, key, sub, index)) {
        yield sub as ItemWithEffects;
      }
    }
  }
  const rawVehicles = Array.isArray(spell["vehicles"])
    ? (spell["vehicles"] as SubItemContainer[])
    : Array.isArray(spell["currentVehicles"])
      ? (spell["currentVehicles"] as SubItemContainer[])
      : [];
  const vehicle = activeVehicle(rawVehicles);
  if (vehicle) {
    yield vehicle as ItemWithEffects;
    const modules = vehicle["modules"];
    if (Array.isArray(modules))
      for (const mod of modules) yield mod as ItemWithEffects;
  }
}

function* walkItems(actor: Actor): Generator<ItemWithEffects> {
  if (isPlayer(actor)) {
    for (const klass of actor.classes ?? []) {
      if (Array.isArray(klass.skills)) for (const s of klass.skills) yield s;
      if (Array.isArray(klass.heroic)) for (const h of klass.heroic) yield h;
      for (const sp of klass.spells ?? []) {
        const spell = sp as unknown as SubItemContainer;
        if (!isSpellEnabledForTransfer(spell)) continue;
        if (isEnabledWhenPresent(spell)) yield sp;
        yield* walkSpellSubItems(spell);
      }
    }

    for (const eq of actor.equipment ?? []) {
      const equippedItems = equippedPlayerItems(actor, eq);
      for (const item of equippedItems) {
        yield item as ItemWithEffects;
        if (!isWeaponItem(item) || !item.slotted?.length) continue;
        for (const sphereId of item.slotted) {
          const hoplo = (eq.hoplospheres ?? []).find((h) => h.id === sphereId);
          if (hoplo) {
            yield hoplo;
            continue;
          }

          const mnemo = (eq.mnemospheres ?? []).find((m) => m.id === sphereId);
          if (!mnemo) continue;
          if (Array.isArray(mnemo.skills))
            for (const s of mnemo.skills) yield s;
          if (Array.isArray(mnemo.heroic))
            for (const h of mnemo.heroic) yield h;
          if (Array.isArray(mnemo.spells)) {
            for (const sp of mnemo.spells) {
              const spell = sp as unknown as SubItemContainer;
              if (!isSpellEnabledForTransfer(spell)) continue;
              if (isEnabledWhenPresent(spell)) yield sp;
              yield* walkSpellSubItems(spell);
            }
          }
        }
      }
    }
  } else {
    for (const a of actor.attacks ?? []) yield a;
    for (const a of actor.weaponattacks ?? []) yield a;
    for (const s of actor.spells ?? []) yield s;
    for (const s of actor.special ?? []) yield s;
    for (const a of actor.actions ?? []) yield a;
    for (const r of actor.raregear ?? []) yield r;
  }
}

function isPlayer(actor: Actor): actor is TypePlayer {
  return (actor as TypePlayer).classes !== undefined;
}

function equippedPlayerItems(
  player: TypePlayer,
  eq: TypePlayer["equipment"][number],
): PlayerEquipmentItem[] {
  const out: PlayerEquipmentItem[] = [];
  const seen = new Set<PlayerEquipmentItem>();

  const push = (item: PlayerEquipmentItem | undefined) => {
    if (!item || seen.has(item)) return;
    seen.add(item);
    out.push(item);
  };

  if (player.equippedSlots) {
    push(resolveSlotItem(eq, player.equippedSlots.mainHand));
    push(resolveSlotItem(eq, player.equippedSlots.offHand));
    push(resolveSlotItem(eq, player.equippedSlots.armor));
    push(resolveSlotItem(eq, player.equippedSlots.accessory));
    return out;
  }

  for (const item of eq.weapons ?? []) if (item?.isEquipped) push(item);
  for (const item of eq.customWeapons ?? []) if (item?.isEquipped) push(item);
  for (const item of eq.shields ?? []) if (item?.isEquipped) push(item);
  for (const item of eq.armor ?? []) if (item?.isEquipped) push(item);
  for (const item of eq.accessories ?? []) if (item?.isEquipped) push(item);
  return out;
}

function resolveSlotItem(
  eq: TypePlayer["equipment"][number],
  ref: SlotRef | null | undefined,
): PlayerEquipmentItem | undefined {
  if (!ref) return undefined;
  const collection = eq[ref.source] as PlayerEquipmentItem[] | undefined;
  if (!collection) return undefined;
  if (ref.index !== undefined) return collection[ref.index];
  return collection.find((item) => item.name === ref.name);
}

function isWeaponItem(item: PlayerEquipmentItem): item is SlottedEquipmentItem {
  return item.itemType === "weapon" || item.itemType === "customWeapon";
}

function isActive(
  e: { disabled?: boolean; predicate?: { crisisInteraction?: string } },
  ctx: ResolveContext,
): boolean {
  if (e.disabled === true) return false;
  const ci = e.predicate?.crisisInteraction ?? "none";
  if (ci === "active" && !ctx.inCrisis) return false;
  if (ci === "inactive" && ctx.inCrisis) return false;
  return true;
}

function byPriority(a: EffectChange, b: EffectChange): number {
  return (a.priority ?? 0) - (b.priority ?? 0);
}

function applyAffinityChange(
  grants: Partial<Record<Elements, Affinities>>,
  baseAffinities: Partial<Record<Elements, Affinities>>,
  change: EffectChange,
): void {
  const element = change.key.split(".")[1] as Elements;
  const incoming = change.value as Affinities;

  if (change.mode === 0) {
    grants[element] = incoming;
  } else {
    const existing = grants[element] ?? baseAffinities[element] ?? null;
    grants[element] = existing
      ? combineAffinities(existing, incoming)
      : incoming;
  }
}

function applyChange(
  root: { bonuses: ActorBonuses; multipliers: ActorMultipliers },
  change: EffectChange,
): void {
  const num = Number(change.value);
  if (!Number.isFinite(num)) return;

  const segments = change.key.split(".");
  if (segments.length < 2) return;

  const target = resolveContainer(root, segments);
  if (target === null) return;

  const lastKey = segments[segments.length - 1];
  const current = target[lastKey];
  if (typeof current !== "number") return;

  target[lastKey] = applyMode(current, change.mode, num);
}

function resolveContainer(
  root: { bonuses: ActorBonuses; multipliers: ActorMultipliers },
  segments: string[],
): Record<string, number> | null {
  const head = segments[0];
  let node: unknown;
  if (head === "bonuses") node = root.bonuses;
  else if (head === "multipliers") node = root.multipliers;
  else return null;

  for (let i = 1; i < segments.length - 1; i++) {
    if (node === null || typeof node !== "object") return null;
    node = (node as Record<string, unknown>)[segments[i]];
  }
  if (node === null || typeof node !== "object") return null;
  return node as Record<string, number>;
}

function applyMode(current: number, mode: EffectMode, value: number): number {
  switch (mode) {
    case 0:
      return value; // override
    case 1:
      return current * value; // multiply
    case 2:
      return current + value; // add
    case 3:
      return Math.min(current, value); // downgrade
    case 4:
      return Math.max(current, value); // upgrade
    case 5:
      return current; // custom (no-op until handler added)
    default:
      return current;
  }
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
