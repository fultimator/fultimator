import { resolveActorEffects } from "../../../../../libs/actorEffectsResolver";
import { calcHP } from "../../../../../libs/npcs";
import type { TypePlayer } from "../../../../../types/Players";
import type { TypeNpc } from "../../../../../types/Npcs";
import type { AppliedEffect } from "../../../../../types/Effects";
import { zeroDamageBonuses } from "../../../../../types/Bonuses";
import type { CheckModifier } from "../types";

type Actor = TypePlayer | TypeNpc;

export interface AccuracyContext {
  range?: "melee" | "ranged" | string;
  category?: string;
  checkType?: "magic";
  inCrisis?: boolean;
  appliedEffects?: AppliedEffect[];
}

export interface OutgoingDamageContext {
  range?: "melee" | "ranged" | "spell";
  category?: string;
  damageType?: string;
  inCrisis?: boolean;
  appliedEffects?: AppliedEffect[];
}

export interface CheckContext {
  kind?: "open" | "attribute" | "opposed";
  inCrisis?: boolean;
  appliedEffects?: AppliedEffect[];
}

export function checkModifiersFromEffects(
  actor: Actor,
  ctx: CheckContext = {},
): CheckModifier[] {
  const { bonuses } = resolveActorEffects(actor, {
    inCrisis: ctx.inCrisis ?? isActorInCrisis(actor),
    appliedEffects: ctx.appliedEffects,
  });
  const acc = bonuses.accuracy as unknown as Record<string, number>;
  const out: CheckModifier[] = [];

  push(out, "All Checks", acc.all);
  if (ctx.kind === "open") push(out, "Open", acc.open);
  if (ctx.kind === "opposed") push(out, "Opposed", acc.opposed);

  return out;
}

function accuracyKeysForContext(ctx: AccuracyContext): Set<string> {
  const keys = new Set<string>([
    "bonuses.accuracy.all",
    "bonuses.accuracy.accuracyCheck",
  ]);
  if (ctx.range === "melee") keys.add("bonuses.accuracy.melee");
  if (ctx.range === "ranged") keys.add("bonuses.accuracy.ranged");
  if (ctx.checkType === "magic") keys.add("bonuses.accuracy.magic");
  if (ctx.category) keys.add(`bonuses.accuracy.${ctx.category}`);
  return keys;
}

export function accuracyBonusFromEffects(
  actor: Actor,
  ctx: AccuracyContext = {},
): number {
  const { bonuses } = resolveActorEffects(actor, {
    inCrisis: ctx.inCrisis ?? isActorInCrisis(actor),
    appliedEffects: ctx.appliedEffects,
  });
  const acc = bonuses.accuracy as unknown as Record<string, number>;
  let total = acc.all ?? 0;
  total += acc.accuracyCheck ?? 0;
  if (ctx.range === "melee") total += acc.melee ?? 0;
  if (ctx.range === "ranged") total += acc.ranged ?? 0;
  if (ctx.checkType === "magic") total += acc.magic ?? 0;
  if (ctx.category) total += acc[ctx.category] ?? 0;
  return total;
}

export function accuracyModifiersFromEffects(
  actor: Actor,
  ctx: AccuracyContext = {},
): CheckModifier[] {
  const inCrisis = ctx.inCrisis ?? isActorInCrisis(actor);
  const keys = accuracyKeysForContext(ctx);
  const total = accuracyBonusFromEffects(actor, { ...ctx, inCrisis });
  return namedEffectRows(actor, keys, inCrisis, total);
}

export function outgoingDamageBonusFromEffects(
  actor: Actor,
  ctx: OutgoingDamageContext = {},
): number {
  const { bonuses } = resolveActorEffects(actor, {
    inCrisis: ctx.inCrisis ?? isActorInCrisis(actor),
    appliedEffects: ctx.appliedEffects,
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

function namedEffectRows(
  actor: Actor,
  keys: Set<string>,
  inCrisis: boolean,
  total: number,
): CheckModifier[] {
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

  const attributed = rows.reduce((sum, r) => sum + r.value, 0);
  const remainder = total - attributed;
  if (remainder !== 0) rows.push({ label: "Effect Bonus", value: remainder });

  return rows;
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
  const total = outgoingDamageBonusFromEffects(actor, { ...ctx, inCrisis });
  return namedEffectRows(actor, keys, inCrisis, total);
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
