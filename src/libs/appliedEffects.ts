import type {
  AppliesEffect,
  AppliedEffect,
  EffectChange,
  EffectPredicate,
} from "../types/Effects";

function fingerprintChanges(changes: EffectChange[] | undefined): string {
  if (!changes || changes.length === 0) return "";
  return changes
    .map((c) => `${c.key}:${c.mode}:${c.value}:${c.priority ?? ""}`)
    .join("|");
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ae_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export interface MaterializeOptions {
  origin?: string;
  sourceCombatId?: string;
}

export function materializeAppliedEffect(
  applies: AppliesEffect,
  opts: MaterializeOptions = {},
): AppliedEffect {
  return {
    id: newId(),
    origin: opts.origin,
    sourceCombatId: opts.sourceCombatId,
    label: applies.label || undefined,
    changesFingerprint: fingerprintChanges(applies.changes),
    changes: applies.changes,
    grants: applies.grants,
    duration: applies.duration,
    predicate: applies.predicate,
  };
}

export function isSameAppliedEffect(
  a: AppliedEffect,
  b: AppliedEffect,
): boolean {
  return (
    (a.origin ?? "") === (b.origin ?? "") &&
    a.changesFingerprint === b.changesFingerprint
  );
}

export interface AppliedEffectContext {
  inCrisis?: boolean;
}

function predicatePasses(
  predicate: EffectPredicate | undefined,
  ctx: AppliedEffectContext,
): boolean {
  const ci = predicate?.crisisInteraction ?? "none";
  if (ci === "active" && !ctx.inCrisis) return false;
  if (ci === "inactive" && ctx.inCrisis) return false;
  return true;
}

export function isAppliedEffectActive(
  effect: AppliedEffect,
  ctx: AppliedEffectContext = {},
): boolean {
  return predicatePasses(effect.predicate, ctx);
}

export type SweepEvent =
  | "start-of-turn"
  | "end-of-turn"
  | "end-of-round"
  | "end-of-scene"
  | "rest";

export interface SweepContext {
  event: SweepEvent;
  activeCombatId?: string;
  selfCombatId: string;
}

export function isAppliedEffectExpired(
  effect: AppliedEffect,
  ctx: SweepContext,
): boolean {
  const duration = effect.duration;
  if (!duration || duration.event === "none") return false;

  if (duration.event === "rest") return ctx.event === "rest";

  // Rest and end-of-scene clear anything not permanent.
  if (ctx.event === "rest") return true;
  if (duration.event === "end-of-scene") return ctx.event === "end-of-scene";
  if (ctx.event === "end-of-scene") return true;

  if (duration.event !== ctx.event) return false;

  if (duration.event === "end-of-round") return true;

  // Turn events expire only on the tracked actor's turn.
  const trackedCombatId =
    duration.tracking === "source"
      ? (effect.sourceCombatId ?? ctx.selfCombatId)
      : ctx.selfCombatId;
  return ctx.activeCombatId === trackedCombatId;
}
