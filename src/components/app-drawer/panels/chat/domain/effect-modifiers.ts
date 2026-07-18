import { resolveActorEffects } from "../../../../../libs/actorEffectsResolver";
import { calcHP } from "../../../../../libs/npcs";
import type { TypePlayer } from "../../../../../types/Players";
import type { TypeNpc } from "../../../../../types/Npcs";
import { zeroDamageBonuses } from "../../../../../types/Bonuses";
import type { CheckModifier } from "../types";

type Actor = TypePlayer | TypeNpc;

export interface AccuracyContext {
  range?: "melee" | "ranged" | string;
  category?: string;
  checkType?: "magic";
  inCrisis?: boolean;
}

export interface OutgoingDamageContext {
  range?: "melee" | "ranged" | "spell";
  category?: string;
  damageType?: string;
  inCrisis?: boolean;
}

export function accuracyModifiersFromEffects(
  actor: Actor,
  ctx: AccuracyContext = {},
): CheckModifier[] {
  const { bonuses } = resolveActorEffects(actor, {
    inCrisis: ctx.inCrisis ?? isActorInCrisis(actor),
  });
  const acc = bonuses.accuracy as unknown as Record<string, number>;
  const out: CheckModifier[] = [];

  push(out, "All", acc.all);
  push(out, "Accuracy", acc.accuracyCheck);
  if (ctx.range === "melee") push(out, "Melee", acc.melee);
  if (ctx.range === "ranged") push(out, "Ranged", acc.ranged);
  if (ctx.checkType === "magic") push(out, "Magic", acc.magic);
  if (ctx.category) push(out, capitalize(ctx.category), acc[ctx.category]);

  return out;
}

export function outgoingDamageBonusFromEffects(
  actor: Actor,
  ctx: OutgoingDamageContext = {},
): number {
  const { bonuses } = resolveActorEffects(actor, {
    inCrisis: ctx.inCrisis ?? isActorInCrisis(actor),
  });
  const dmg = (bonuses.damage ?? zeroDamageBonuses()) as unknown as Record<
    string,
    number
  >;
  let total = dmg.all ?? 0;
  if (ctx.range) total += dmg[ctx.range] ?? 0;
  if (ctx.category) total += dmg[ctx.category] ?? 0;
  if (ctx.damageType && ctx.damageType !== "untyped")
    total += dmg[ctx.damageType] ?? 0;
  return total;
}

interface EffectLike {
  name?: string;
  disabled?: boolean;
  behaviors?: Array<{
    trigger?: { kind?: string };
    predicate?: { crisisInteraction?: string };
    changes?: Array<{ key?: string; mode?: number; value?: unknown }>;
  }>;
}

function damageKeysForContext(ctx: OutgoingDamageContext): Set<string> {
  const keys = new Set<string>(["bonuses.damage.all"]);
  if (ctx.range) keys.add(`bonuses.damage.${ctx.range}`);
  if (ctx.category) keys.add(`bonuses.damage.${ctx.category}`);
  if (ctx.damageType && ctx.damageType !== "untyped")
    keys.add(`bonuses.damage.${ctx.damageType}`);
  return keys;
}

export function outgoingDamageModifiersFromEffects(
  actor: Actor,
  ctx: OutgoingDamageContext = {},
): CheckModifier[] {
  const inCrisis = ctx.inCrisis ?? isActorInCrisis(actor);
  const keys = damageKeysForContext(ctx);
  const rows: CheckModifier[] = [];

  const effects =
    (actor as unknown as { effects?: EffectLike[] }).effects ?? [];
  for (const effect of effects) {
    if (!effect || effect.disabled === true) continue;
    let value = 0;
    for (const beh of effect.behaviors ?? []) {
      if ((beh.trigger?.kind ?? "passive") !== "passive") continue;
      const ci = beh.predicate?.crisisInteraction ?? "none";
      if (ci === "active" && !inCrisis) continue;
      if (ci === "inactive" && inCrisis) continue;
      for (const ch of beh.changes ?? []) {
        if (ch.mode !== 2 || !ch.key || !keys.has(ch.key)) continue;
        value += Number(ch.value) || 0;
      }
    }
    if (value !== 0) rows.push({ label: effect.name || "Effect", value });
  }

  const total = outgoingDamageBonusFromEffects(actor, { ...ctx, inCrisis });
  const attributed = rows.reduce((sum, r) => sum + r.value, 0);
  const remainder = total - attributed;
  if (remainder !== 0) rows.push({ label: "Effect Bonus", value: remainder });

  return rows;
}

function push(
  out: CheckModifier[],
  label: string,
  value: number | undefined,
): void {
  if (!value) return;
  out.push({ label, value });
}

export function isActorInCrisis(actor: Actor): boolean {
  if ("stats" in actor && actor.stats?.hp) {
    const hp = actor.stats.hp as { current?: number; max?: number };
    if (
      typeof hp.current === "number" &&
      typeof hp.max === "number" &&
      hp.max > 0
    ) {
      return hp.current <= hp.max / 2;
    }
  }
  if ("resources" in actor && actor.resources?.hp) {
    const current = actor.resources.hp.current;
    const max = calcHP(actor as TypeNpc);
    if (typeof current === "number" && max > 0) {
      return current <= max / 2;
    }
  }
  return false;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}
