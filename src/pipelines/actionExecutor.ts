import type { Behavior, AfterEffect, AppliedEffect } from "../types/Effects";
import type { ExprBindings } from "./exprResolver";
import type { RuntimeActor } from "../types/RuntimeActor";
import type {
  ResourceDelta,
  ResourceMultiplier,
  DamageBonuses,
} from "../types/Bonuses";
import type { Elements } from "../types/Misc";
import {
  createActionContext,
  emitDamageEvent,
  emitExpenditureEvent,
  emitLossEvent,
  emitRecoveryEvent,
  type ActionContext,
  type ResourceKind,
} from "./actionContext";
import {
  resolveDamage,
  buildDamageContext,
  type DamageElement,
} from "./damagePipeline";
import { resolveResource, buildResourceContext } from "./resourcePipeline";
import {
  resolveAfterEffects,
  type AfterEffectContext,
  type PrimaryOutcomeResult,
  type RuntimeActorSnapshot,
} from "./afterEffectPipeline";
import type { CooldownDuration } from "../types/Effects";

// Caller-assembled snapshot of a combatant's pipeline-relevant data.
// The executor never reads stores directly.
export interface ActorPipelineData {
  runtime: RuntimeActor;
  currentIp?: number;
  maxHp: number;
  maxMp: number;
  maxIp?: number;
  affinities: Record<string, string>;
  incomingDamageBonuses: DamageBonuses;
  incomingLossBonuses: ResourceDelta;
  incomingLossMultipliers: ResourceMultiplier;
  incomingRecoveryBonuses: ResourceDelta;
  incomingRecoveryMultipliers: ResourceMultiplier;
  outgoingRecoveryBonuses?: ResourceDelta;
  outgoingRecoveryMultipliers?: ResourceMultiplier;
}

function toSnapshot(data: ActorPipelineData): RuntimeActorSnapshot {
  return {
    combatId: data.runtime.combatId,
    currentHp: data.runtime.currentHp,
    currentMp: data.runtime.currentMp,
    currentIp: data.currentIp,
    maxHp: data.maxHp,
    maxMp: data.maxMp,
    maxIp: data.maxIp,
    affinities: data.affinities,
    temporaryAffinities: data.runtime.temporaryAffinities,
    isGuarding: data.runtime.isGuarding,
    incomingDamageBonuses: data.incomingDamageBonuses,
    incomingLossBonuses: data.incomingLossBonuses,
    incomingLossMultipliers: data.incomingLossMultipliers,
    incomingRecoveryBonuses: data.incomingRecoveryBonuses,
    incomingRecoveryMultipliers: data.incomingRecoveryMultipliers,
    outgoingRecoveryBonuses: data.outgoingRecoveryBonuses,
    outgoingRecoveryMultipliers: data.outgoingRecoveryMultipliers,
  };
}

export interface CostSpec {
  resource: "hp" | "mp" | "ip" | "fp";
  amount: number;
}

export interface CostResult {
  paid: boolean;
  deficit: number;
}

// Records the cost expenditure into the event log. Does not mutate runtime state.
export function executeActionCost(
  ctx: ActionContext,
  cost: CostSpec,
  actorData: ActorPipelineData,
): CostResult {
  if (cost.resource === "fp") {
    // FP is always manual - record the event but never gate execution
    emitExpenditureEvent(ctx, "fp", cost.amount);
    return { paid: true, deficit: 0 };
  }

  const current =
    cost.resource === "hp"
      ? actorData.runtime.currentHp
      : cost.resource === "mp"
        ? actorData.runtime.currentMp
        : (actorData.currentIp ?? 0);

  if (current < cost.amount) {
    return { paid: false, deficit: cost.amount - current };
  }

  emitExpenditureEvent(ctx, cost.resource, cost.amount);
  return { paid: true, deficit: 0 };
}

export type PrimaryOutcomeSpec =
  | {
      kind: "damage";
      baseDamage: number;
      damageType: DamageElement;
      targetIds: string[];
    }
  | {
      kind: "resource-loss";
      resource: ResourceKind;
      amount: number;
      targetIds: string[];
      voluntary?: boolean;
    }
  | {
      kind: "resource-recovery";
      resource: ResourceKind;
      amount: number;
      targetIds: string[];
    }
  | { kind: "none" };

export interface PrimaryOutcomeOutcome {
  perTarget: Map<string, PrimaryOutcomeResult>;
  lastResolved: PrimaryOutcomeResult;
}

export function executePrimaryOutcome(
  ctx: ActionContext,
  spec: PrimaryOutcomeSpec,
  actors: Record<string, ActorPipelineData>,
): PrimaryOutcomeOutcome {
  const perTarget = new Map<string, PrimaryOutcomeResult>();
  let lastResolved: PrimaryOutcomeResult = {
    kind: "none",
    resolvedAmount: 0,
    resource: null,
  };

  if (spec.kind === "none") {
    ctx.primaryOutcome = lastResolved;
    return { perTarget, lastResolved };
  }

  for (const targetId of spec.targetIds) {
    const targetData = actors[targetId];
    if (!targetData) continue;

    let result: PrimaryOutcomeResult;

    if (spec.kind === "damage") {
      const dmgCtx = buildDamageContext({
        baseDamage: spec.baseDamage,
        damageType: spec.damageType,
        npcAffinities: targetData.affinities,
        temporaryAffinities: targetData.runtime.temporaryAffinities,
        isGuarding: targetData.runtime.isGuarding,
        incomingDamageBonuses: targetData.incomingDamageBonuses,
      });
      const dmgResult = resolveDamage(dmgCtx);
      emitDamageEvent(
        ctx,
        Math.abs(dmgResult.finalDamage),
        spec.damageType as Elements,
      );
      result = {
        kind: "damage",
        resolvedAmount: Math.abs(dmgResult.finalDamage),
        resource: "hp",
      };
    } else if (spec.kind === "resource-loss") {
      const rCtx = buildResourceContext({
        resource: spec.resource,
        amount: spec.amount,
        direction: "loss",
        voluntary: spec.voluntary ?? false,
        currentValue:
          spec.resource === "hp"
            ? targetData.runtime.currentHp
            : spec.resource === "mp"
              ? targetData.runtime.currentMp
              : (targetData.currentIp ?? 0),
        maxValue:
          spec.resource === "hp"
            ? targetData.maxHp
            : spec.resource === "mp"
              ? targetData.maxMp
              : (targetData.maxIp ?? 0),
        incomingLossBonuses: targetData.incomingLossBonuses,
        incomingLossMultipliers: targetData.incomingLossMultipliers,
        incomingRecoveryBonuses: targetData.incomingRecoveryBonuses,
        incomingRecoveryMultipliers: targetData.incomingRecoveryMultipliers,
      });
      const rResult = resolveResource(rCtx);
      if (spec.voluntary) {
        emitExpenditureEvent(ctx, spec.resource, rResult.resolvedAmount);
      } else {
        emitLossEvent(ctx, spec.resource, rResult.resolvedAmount);
      }
      result = {
        kind: "resource-loss",
        resolvedAmount: rResult.resolvedAmount,
        resource: spec.resource,
      };
    } else {
      const rCtx = buildResourceContext({
        resource: spec.resource,
        amount: spec.amount,
        direction: "recovery",
        voluntary: false,
        currentValue:
          spec.resource === "hp"
            ? targetData.runtime.currentHp
            : spec.resource === "mp"
              ? targetData.runtime.currentMp
              : (targetData.currentIp ?? 0),
        maxValue:
          spec.resource === "hp"
            ? targetData.maxHp
            : spec.resource === "mp"
              ? targetData.maxMp
              : (targetData.maxIp ?? 0),
        incomingLossBonuses: targetData.incomingLossBonuses,
        incomingLossMultipliers: targetData.incomingLossMultipliers,
        incomingRecoveryBonuses: targetData.incomingRecoveryBonuses,
        incomingRecoveryMultipliers: targetData.incomingRecoveryMultipliers,
        outgoingRecoveryBonuses: actors[ctx.actorId]?.outgoingRecoveryBonuses,
        outgoingRecoveryMultipliers:
          actors[ctx.actorId]?.outgoingRecoveryMultipliers,
      });
      const rResult = resolveResource(rCtx);
      emitRecoveryEvent(ctx, spec.resource, rResult.resolvedAmount);
      result = {
        kind: "resource-recovery",
        resolvedAmount: rResult.resolvedAmount,
        resource: spec.resource,
      };
    }

    perTarget.set(targetId, result);
    lastResolved = result;
  }

  ctx.primaryOutcome = lastResolved;
  return { perTarget, lastResolved };
}

export function executeAfterEffects(
  ctx: ActionContext,
  afterEffects: AfterEffect[],
  targetIds: string[],
  actors: Record<string, ActorPipelineData>,
  coverTargetId?: string,
  exprBindings?: ExprBindings,
) {
  if (!afterEffects.length) return;

  const snapshots: Record<string, RuntimeActorSnapshot> = {};
  for (const [id, data] of Object.entries(actors)) {
    snapshots[id] = toSnapshot(data);
  }

  const aeCtx: AfterEffectContext = {
    afterEffects,
    primaryOutcome: ctx.primaryOutcome ?? {
      kind: "none",
      resolvedAmount: 0,
      resource: null,
    },
    selfId: ctx.actorId,
    targetIds,
    coverTargetId,
    actors: snapshots,
    exprBindings,
  };

  return resolveAfterEffects(aeCtx);
}

// Deduplication: same-origin recasts replace the previous effect;
// identical changes fingerprints don't stack regardless of name.
export function applyEffectToRuntime(
  runtime: RuntimeActor,
  effect: AppliedEffect,
): void {
  runtime.appliedEffects = runtime.appliedEffects.filter((existing) => {
    if (effect.origin && existing.origin === effect.origin) return false;
    if (existing.changesFingerprint === effect.changesFingerprint) return false;
    return true;
  });
  runtime.appliedEffects.push(effect);
}

export function buildChangesFingerprint(
  changes: AppliedEffect["changes"],
): string {
  if (!changes?.length) return "[]";
  const sorted = [...changes].sort((a, b) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0,
  );
  return JSON.stringify(sorted);
}

export function activateCooldown(
  runtime: RuntimeActor,
  fuid: string,
  duration: CooldownDuration,
): void {
  runtime.cooldowns[fuid] = duration;
}

export function clearTurnCooldowns(runtime: RuntimeActor): void {
  for (const [fuid, duration] of Object.entries(runtime.cooldowns)) {
    if (duration === "until-next-turn") delete runtime.cooldowns[fuid];
  }
}

export function clearRoundCooldowns(runtime: RuntimeActor): void {
  for (const [fuid, duration] of Object.entries(runtime.cooldowns)) {
    if (duration === "until-next-round") delete runtime.cooldowns[fuid];
  }
}

export function isCoolingDown(runtime: RuntimeActor, fuid: string): boolean {
  return fuid in runtime.cooldowns;
}

export interface ExecuteActionOpts {
  actorId: string;
  resolvedBy: "pc" | "npc";
  sl: number;
  behavior: Behavior;
  cost?: CostSpec;
  primaryOutcome?: PrimaryOutcomeSpec;
  targetIds?: string[];
  coverTargetId?: string;
  actors: Record<string, ActorPipelineData>;
  preRollValues?: Record<string, number>;
  exprBindings?: ExprBindings;
}

export interface ExecuteActionResult {
  ctx: ActionContext;
  costResult?: CostResult;
  primaryOutcomes?: PrimaryOutcomeOutcome;
  afterEffectsResult?: ReturnType<typeof executeAfterEffects>;
  aborted: boolean;
  abortReason?: "cost-insufficient";
}

export function executeAction(opts: ExecuteActionOpts): ExecuteActionResult {
  const ctx = createActionContext({
    actorId: opts.actorId,
    resolvedBy: opts.resolvedBy,
    sl: opts.sl,
    preRollValues: opts.preRollValues,
  });

  let costResult: CostResult | undefined;
  if (opts.cost) {
    const actorData = opts.actors[opts.actorId];
    if (!actorData) {
      return { ctx, aborted: true, abortReason: "cost-insufficient" };
    }
    costResult = executeActionCost(ctx, opts.cost, actorData);
    if (!costResult.paid) {
      return {
        ctx,
        costResult,
        aborted: true,
        abortReason: "cost-insufficient",
      };
    }
  }

  let primaryOutcomes: PrimaryOutcomeOutcome | undefined;
  if (opts.primaryOutcome) {
    primaryOutcomes = executePrimaryOutcome(
      ctx,
      opts.primaryOutcome,
      opts.actors,
    );
  }

  let afterEffectsResult: ReturnType<typeof executeAfterEffects> | undefined;
  const afterEffects = opts.behavior.afterEffects;
  if (afterEffects?.length) {
    afterEffectsResult = executeAfterEffects(
      ctx,
      afterEffects,
      opts.targetIds ?? [],
      opts.actors,
      opts.coverTargetId,
      opts.exprBindings,
    );
  }

  return {
    ctx,
    costResult,
    primaryOutcomes,
    afterEffectsResult,
    aborted: false,
  };
}
