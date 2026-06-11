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
  const dmg = (bonuses.damage ?? zeroDamageBonuses()) as unknown as Record<string, number>;
  let total = dmg.all ?? 0;
  if (ctx.range) total += dmg[ctx.range] ?? 0;
  if (ctx.category) total += dmg[ctx.category] ?? 0;
  if (ctx.damageType && ctx.damageType !== "untyped") total += dmg[ctx.damageType] ?? 0;
  return total;
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
