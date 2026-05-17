// Resolves ActorBonuses from actor.effects[].
// Use getActorBonuses(actor) as the entry point; it falls back to zero for old docs.

import {
  zeroActorBonuses,
  oneActorMultipliers,
  type AccuracyBonuses,
  type ActorBonuses,
  type ActorMultipliers,
  type DamageBonuses,
  type ResourceDelta,
} from "../types/Bonuses";

export function getActorBonuses(actor: { bonuses?: ActorBonuses }): ActorBonuses {
  return actor.bonuses ?? zeroActorBonuses();
}

export function getActorMultipliers(actor: { multipliers?: ActorMultipliers }): ActorMultipliers {
  return actor.multipliers ?? oneActorMultipliers();
}

interface EffectRecord {
  effectType: string;
  disabled?: boolean;
  priority?: number;
  payload: Record<string, unknown>;
}

function isActive(e: EffectRecord): boolean {
  return e.disabled !== true;
}

function byPriority(a: EffectRecord, b: EffectRecord): number {
  return (a.priority ?? 0) - (b.priority ?? 0);
}

function numericTarget(payload: Record<string, unknown>): { target: string; value: number } | null {
  const target = payload.target;
  const value = payload.value;
  if (typeof target !== "string" || typeof value !== "number") return null;
  return { target, value };
}

function resourceValue(payload: Record<string, unknown>): { resource: string; value: number } | null {
  const resource = payload.resource;
  const value = payload.value;
  if (typeof resource !== "string" || typeof value !== "number") return null;
  return { resource, value };
}

function addToAccuracy(acc: AccuracyBonuses, target: string, value: number): void {
  if (target in acc) {
    (acc as unknown as Record<string, number>)[target] += value;
  }
}

function addToDamage(dmg: DamageBonuses, target: string, value: number): void {
  if (target in dmg) {
    (dmg as unknown as Record<string, number>)[target] += value;
  }
}

function addToResource(delta: ResourceDelta, resource: string, value: number): void {
  if (resource === "hp" || resource === "mp" || resource === "ip") {
    delta[resource] += value;
  }
}

export function computeBonuses(effects: EffectRecord[]): ActorBonuses {
  const out = zeroActorBonuses();
  const sorted = effects.filter(isActive).slice().sort(byPriority);

  for (const effect of sorted) {
    const p = effect.payload;
    switch (effect.effectType) {
      case "accuracy-bonus": {
        const parsed = numericTarget(p);
        if (parsed) addToAccuracy(out.accuracy, parsed.target, parsed.value);
        break;
      }
      case "outgoing-damage-bonus": {
        const parsed = numericTarget(p);
        if (parsed) addToDamage(out.damage, parsed.target, parsed.value);
        break;
      }
      case "incoming-damage-bonus": {
        const parsed = numericTarget(p);
        if (parsed) addToDamage(out.incomingDamage, parsed.target, parsed.value);
        break;
      }
      case "incoming-recovery-bonus": {
        const parsed = resourceValue(p);
        if (parsed) addToResource(out.incomingRecovery, parsed.resource, parsed.value);
        break;
      }
      case "incoming-loss-bonus": {
        const parsed = resourceValue(p);
        if (parsed) addToResource(out.incomingLoss, parsed.resource, parsed.value);
        break;
      }
      case "outgoing-recovery-bonus": {
        const parsed = resourceValue(p);
        if (parsed) addToResource(out.outgoingRecovery, parsed.resource, parsed.value);
        break;
      }
    }
  }

  return out;
}

export function totalIncomingDamageBonus(
  effects: EffectRecord[],
  opts: { category?: string; element?: string; species?: string } = {},
): number {
  const bonuses = computeBonuses(effects);
  const dmg = bonuses.incomingDamage as unknown as Record<string, number>;
  return (
    (dmg.all ?? 0) +
    (opts.category ? (dmg[opts.category] ?? 0) : 0) +
    (opts.element  ? (dmg[opts.element]  ?? 0) : 0) +
    (opts.species  ? (dmg[opts.species]  ?? 0) : 0)
  );
}

export function totalOutgoingDamageBonus(
  effects: EffectRecord[],
  opts: { category?: string; element?: string; species?: string } = {},
): number {
  const bonuses = computeBonuses(effects);
  const dmg = bonuses.damage as unknown as Record<string, number>;
  return (
    (dmg.all ?? 0) +
    (opts.category ? (dmg[opts.category] ?? 0) : 0) +
    (opts.element  ? (dmg[opts.element]  ?? 0) : 0) +
    (opts.species  ? (dmg[opts.species]  ?? 0) : 0)
  );
}

export function totalAccuracyBonus(
  effects: EffectRecord[],
  opts: { rollType?: string; category?: string } = {},
): number {
  const bonuses = computeBonuses(effects);
  const acc = bonuses.accuracy as unknown as Record<string, number>;
  return (
    (acc.all ?? 0) +
    (opts.rollType ? (acc[opts.rollType] ?? 0) : 0) +
    (opts.category ? (acc[opts.category] ?? 0) : 0)
  );
}
