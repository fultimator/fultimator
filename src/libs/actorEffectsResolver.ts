import {
  zeroActorBonuses,
  oneActorMultipliers,
  type ActorBonuses,
  type ActorMultipliers,
} from "../types/Bonuses";
import type {
  ActorEffect,
  Passive,
  EffectChange,
  EffectMode,
  GrantData,
} from "../types/Effects";
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
}

export function resolveActorEffects(
  actor: Actor,
  ctx: ResolveContext = {},
): ResolvedEffects {
  const bonuses = clone(actor.bonuses ?? zeroActorBonuses());
  const multipliers = clone(actor.multipliers ?? oneActorMultipliers());
  const grants: GrantData[] = [];

  const effects = collectEffectiveEffects(actor, ctx);
  const changes = effects.flatMap((e) => e.changes ?? []);
  const sorted = changes.slice().sort(byPriority);

  const overlay = { bonuses, multipliers };
  for (const change of sorted) {
    applyChange(overlay, change);
  }

  for (const effect of effects) {
    if (effect.grants) grants.push(...effect.grants);
  }

  return { bonuses, multipliers, grants };
}

function collectEffectiveEffects(
  actor: Actor,
  ctx: ResolveContext,
): ActorEffect[] {
  const out: ActorEffect[] = [];

  for (const e of actor.effects ?? []) {
    if (isActive(e, ctx)) out.push(e);
  }

  for (const item of walkItems(actor)) {
    for (const e of itemPassives(item)) {
      if (e.transfer !== true) continue;
      if (!isActive(e, ctx)) continue;
      out.push(passiveAsActorEffect(e));
    }
  }

  return out;
}

type ItemWithEffects = {
  passives?: Passive[];
  behavior?: { effects?: Passive[] };
};

function itemPassives(item: ItemWithEffects): Passive[] {
  return [...(item.passives ?? []), ...(item.behavior?.effects ?? [])];
}

function* walkItems(actor: Actor): Generator<ItemWithEffects> {
  if (isPlayer(actor)) {
    for (const klass of actor.classes ?? []) {
      if (Array.isArray(klass.skills)) for (const s of klass.skills) yield s;
      if (Array.isArray(klass.heroic)) for (const h of klass.heroic) yield h;
      if (Array.isArray(klass.spells)) for (const sp of klass.spells) yield sp;
    }

    for (const eq of actor.equipment ?? []) {
      const equippedItems = equippedPlayerItems(actor, eq);
      for (const item of equippedItems) {
        yield item;
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
          if (Array.isArray(mnemo.spells))
            for (const sp of mnemo.spells) yield sp;
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

  for (const item of eq.weapons ?? []) if (item.isEquipped) push(item);
  for (const item of eq.customWeapons ?? []) if (item.isEquipped) push(item);
  for (const item of eq.shields ?? []) if (item.isEquipped) push(item);
  for (const item of eq.armor ?? []) if (item.isEquipped) push(item);
  for (const item of eq.accessories ?? []) if (item.isEquipped) push(item);
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

function passiveAsActorEffect(e: Passive): ActorEffect {
  return {
    id: e.id,
    name: e.name,
    disabled: e.disabled,
    changes: e.changes,
    grants: e.grants,
    duration: e.duration,
    predicate: e.predicate,
  };
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
