import type { Affinities } from "../types/Misc";
import { Affinities as Aff } from "../types/Misc";
import type { DamageBonuses } from "../types/Bonuses";

export type DamageElement =
  | "physical"
  | "air"
  | "bolt"
  | "dark"
  | "earth"
  | "fire"
  | "ice"
  | "light"
  | "poison"
  | "untyped";

export type AffinityResult = "vu" | "rs" | "ab" | "im" | "no" | null;
export type DamageMultiplier = 2 | 1 | 0.5 | 0 | -1;

export interface DamageStep {
  label: string;
  value: number;
}

export interface DamageContext {
  baseDamage: number;
  damageType: DamageElement;
  damageTypeLock: DamageElement | null;
  nativeAffinity: Affinities | null;
  temporaryAffinity: Affinities | null;
  affinityLocks: Set<DamageElement>;
  isGuarding: boolean;
  ignoreVulnerability: boolean;
  ignoreResistance: boolean;
  ignoreImmunity: boolean;
  ignoreAbsorption: boolean;
  incomingDamageBonuses: DamageBonuses;
  outgoingDamageBonuses: DamageBonuses;
  attackRange: "melee" | "ranged" | "spell" | null;
  attackCategory: string | null;
  targetSpecies: string | null;
}

export interface DamageResult {
  finalDamage: number;
  effectiveAffinity: AffinityResult;
  multiplier: DamageMultiplier;
  breakdown: DamageStep[];
  isHealing: boolean;
  isNoEffect: boolean;
  isUntyped: boolean;
}

// Priority: AB > IM > (VU+RS = none) > RS > VU > none
export function combineAffinities(a: Affinities, b: Affinities): Affinities {
  if (a === Aff.Absorpbtion || b === Aff.Absorpbtion) return Aff.Absorpbtion;
  if (a === Aff.Immunity || b === Aff.Immunity) return Aff.Immunity;
  if (
    (a === Aff.Vulnerability && b === Aff.Resistance) ||
    (a === Aff.Resistance && b === Aff.Vulnerability)
  )
    return Aff.None;
  return b;
}

function resolveEffectiveAffinity(ctx: DamageContext): Affinities | null {
  const { nativeAffinity, temporaryAffinity } = ctx;
  if (nativeAffinity == null && temporaryAffinity == null) return null;
  if (nativeAffinity == null) return temporaryAffinity;
  if (temporaryAffinity == null) return nativeAffinity;
  return combineAffinities(nativeAffinity, temporaryAffinity);
}

function incomingBonusForElement(
  bonuses: DamageBonuses,
  element: DamageElement,
): number {
  const b = bonuses as unknown as Record<string, number>;
  return (b.all ?? 0) + (element !== "untyped" ? (b[element] ?? 0) : 0);
}

function outgoingBonusFor(ctx: DamageContext): number {
  const b = ctx.outgoingDamageBonuses as unknown as Record<string, number>;
  let total = b.all ?? 0;
  if (ctx.attackRange) total += b[ctx.attackRange] ?? 0;
  if (ctx.attackCategory) total += b[ctx.attackCategory] ?? 0;
  if (ctx.damageType !== "untyped") total += b[ctx.damageType] ?? 0;
  if (ctx.targetSpecies) total += b[ctx.targetSpecies] ?? 0;
  return total;
}

export function resolveDamage(ctx: DamageContext): DamageResult {
  const breakdown: DamageStep[] = [];
  const isUntyped = ctx.damageType === "untyped";

  // Step 1: base + outgoing bonus (attacker) + incoming bonus (target), flat before affinity
  const outBonus = outgoingBonusFor(ctx);
  const inBonus = incomingBonusForElement(ctx.incomingDamageBonuses, ctx.damageType);
  const bonus = outBonus + inBonus;
  const boosted = ctx.baseDamage + bonus;
  breakdown.push({ label: "base", value: ctx.baseDamage });
  if (outBonus !== 0) breakdown.push({ label: "outgoing bonus", value: outBonus });
  if (inBonus !== 0) breakdown.push({ label: "incoming bonus", value: inBonus });

  // Step 2: untyped damage bypasses all affinity resolution
  if (isUntyped) {
    const guardReduced = ctx.isGuarding
      ? Math.max(0, Math.floor(boosted * 0.5))
      : boosted;
    if (ctx.isGuarding)
      breakdown.push({ label: "guarding (÷2)", value: guardReduced });
    return {
      finalDamage: guardReduced,
      effectiveAffinity: null,
      multiplier: ctx.isGuarding ? 0.5 : 1,
      breakdown,
      isHealing: false,
      isNoEffect: guardReduced <= 0,
      isUntyped: true,
    };
  }

  // Step 3: affinity resolution
  const effective = resolveEffectiveAffinity(ctx);
  let multiplier: DamageMultiplier = 1;
  const affinityResult: AffinityResult = (effective as AffinityResult) ?? null;

  if (effective != null && effective !== Aff.None) {
    if (effective === Aff.Absorpbtion && !ctx.ignoreAbsorption) {
      multiplier = -1;
    } else if (effective === Aff.Immunity && !ctx.ignoreImmunity) {
      multiplier = 0;
    } else if (effective === Aff.Vulnerability && !ctx.ignoreVulnerability) {
      // Guard cancels vulnerability - guarding NPC takes normal, not double
      multiplier = ctx.isGuarding ? 1 : 2;
    } else if (effective === Aff.Resistance && !ctx.ignoreResistance) {
      multiplier = 0.5;
    }
  }

  // Step 4: guard halving (only when no affinity applied, or affinity was suppressed by ignore flags)
  let afterAffinity: number;
  if (multiplier === -1) {
    // absorption: negate boosted value
    afterAffinity = -boosted;
    breakdown.push({ label: "absorbed (×−1)", value: afterAffinity });
  } else if (multiplier === 0) {
    afterAffinity = 0;
    breakdown.push({ label: "immune (×0)", value: 0 });
  } else if (multiplier === 2) {
    afterAffinity = boosted * 2;
    breakdown.push({ label: "vulnerable (×2)", value: afterAffinity });
  } else if (multiplier === 0.5) {
    afterAffinity = Math.max(0, Math.floor(boosted * 0.5));
    breakdown.push({ label: "resistant (÷2)", value: afterAffinity });
  } else {
    // multiplier === 1 (no affinity, or vu suppressed, or rs suppressed)
    if (ctx.isGuarding) {
      afterAffinity = Math.max(0, Math.floor(boosted * 0.5));
      multiplier = 0.5;
      breakdown.push({ label: "guarding (÷2)", value: afterAffinity });
    } else {
      afterAffinity = boosted;
    }
  }

  const finalDamage = afterAffinity;

  return {
    finalDamage,
    effectiveAffinity: affinityResult,
    multiplier,
    breakdown,
    isHealing: finalDamage < 0,
    isNoEffect: finalDamage === 0,
    isUntyped: false,
  };
}

// Convenience builder from the NPC actor document shape
export function buildDamageContext(opts: {
  baseDamage: number;
  damageType: DamageElement;
  npcAffinities: Record<string, string>;
  temporaryAffinities?: Partial<Record<string, Affinities>>;
  affinityGrants?: Partial<Record<string, Affinities>>;
  affinityLocks?: string[];
  isGuarding?: boolean;
  ignoreResistance?: boolean;
  ignoreImmunity?: boolean;
  ignoreVulnerability?: boolean;
  ignoreAbsorption?: boolean;
  incomingDamageBonuses?: DamageBonuses;
  outgoingDamageBonuses?: DamageBonuses;
  attackRange?: "melee" | "ranged" | "spell" | null;
  attackCategory?: string | null;
  targetSpecies?: string | null;
}): DamageContext {
  const element = opts.damageType;
  const raw = opts.npcAffinities[element] as Affinities | undefined;
  const native: Affinities | null = raw ?? null;

  const runtimeTemp =
    (opts.temporaryAffinities?.[element] as Affinities | undefined) ?? null;
  const granted =
    (opts.affinityGrants?.[element] as Affinities | undefined) ?? null;
  const allTemporary =
    runtimeTemp && granted
      ? combineAffinities(runtimeTemp, granted)
      : runtimeTemp ?? granted;
  const temp = allTemporary;

  return {
    baseDamage: opts.baseDamage,
    damageType: element,
    damageTypeLock: null,
    nativeAffinity: native,
    temporaryAffinity: temp,
    affinityLocks: new Set(opts.affinityLocks ?? []) as Set<DamageElement>,
    isGuarding: opts.isGuarding ?? false,
    ignoreVulnerability: opts.ignoreVulnerability ?? false,
    ignoreResistance: opts.ignoreResistance ?? false,
    ignoreImmunity: opts.ignoreImmunity ?? false,
    ignoreAbsorption: opts.ignoreAbsorption ?? false,
    incomingDamageBonuses: opts.incomingDamageBonuses ?? ({} as DamageBonuses),
    outgoingDamageBonuses: opts.outgoingDamageBonuses ?? ({} as DamageBonuses),
    attackRange: opts.attackRange ?? null,
    attackCategory: opts.attackCategory ?? null,
    targetSpecies: opts.targetSpecies ?? null,
  };
}
