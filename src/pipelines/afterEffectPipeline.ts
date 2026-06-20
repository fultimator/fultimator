import type { AfterEffect, AfterEffectAmount } from "../types/Effects";
import { resolveExpr, isExprValue, type ExprBindings } from "./exprResolver";
import type { ResourceDelta, ResourceMultiplier } from "../types/Bonuses";
import {
  resolveDamage,
  buildDamageContext,
  type DamageElement,
} from "./damagePipeline";
import {
  resolveResource,
  type ResourceKind,
  type ResourceContext,
} from "./resourcePipeline";

export type AfterEffectTargetId = string; // combatId

export interface RuntimeActorSnapshot {
  combatId: string;
  currentHp: number;
  currentMp: number;
  currentIp?: number;
  maxHp: number;
  maxMp: number;
  maxIp?: number;
  affinities: Record<string, string>;
  temporaryAffinities?: Partial<
    Record<string, import("../types/Misc").Affinities>
  >;
  affinityGrants?: Partial<Record<string, import("../types/Misc").Affinities>>;
  isGuarding: boolean;
  incomingLossBonuses: ResourceDelta;
  incomingLossMultipliers: ResourceMultiplier;
  incomingRecoveryBonuses: ResourceDelta;
  incomingRecoveryMultipliers: ResourceMultiplier;
  incomingDamageBonuses: import("../types/Bonuses").DamageBonuses;
  outgoingRecoveryBonuses?: ResourceDelta;
  outgoingRecoveryMultipliers?: ResourceMultiplier;
}

export interface PrimaryOutcomeResult {
  kind: "damage" | "resource-loss" | "resource-recovery" | "none";
  resolvedAmount: number;
  resource: ResourceKind | null;
}

export interface AfterEffectResolved {
  afterEffect: AfterEffect;
  targetId: AfterEffectTargetId;
  resolvedAmount: number;
  direction: "loss" | "recovery";
  resource: ResourceKind;
  isHealing?: boolean;
}

export interface AfterEffectContext {
  afterEffects: AfterEffect[];
  primaryOutcome: PrimaryOutcomeResult;
  selfId: string;
  targetIds: string[];
  coverTargetId?: string;
  actors: Record<string, RuntimeActorSnapshot>;
  exprBindings?: ExprBindings;
}

export interface AfterEffectPipelineResult {
  resolved: AfterEffectResolved[];
}

function resolveAmount(
  amount: AfterEffectAmount,
  primary: PrimaryOutcomeResult,
  bindings: ExprBindings,
): number {
  if (typeof amount === "number") return amount;
  if (isExprValue(amount))
    return Math.max(0, Math.floor(resolveExpr(amount, bindings)));
  if (amount === "half-damage") {
    if (primary.kind !== "damage") return 0;
    return Math.max(0, Math.floor(primary.resolvedAmount * 0.5));
  }
  if (amount === "half-loss") {
    if (primary.kind !== "resource-loss") return 0;
    return Math.max(0, Math.floor(primary.resolvedAmount * 0.5));
  }
  return 0;
}

function resolveTargetIds(
  target: AfterEffect["target"],
  ctx: AfterEffectContext,
): string[] {
  switch (target) {
    case "self":
      return [ctx.selfId];
    case "targets":
      return ctx.targetIds;
    case "cover-target":
      return ctx.coverTargetId ? [ctx.coverTargetId] : [];
  }
}

export function resolveAfterEffects(
  ctx: AfterEffectContext,
): AfterEffectPipelineResult {
  const resolved: AfterEffectResolved[] = [];
  // Track the last resolved amount for derivedFrom chains
  let lastPrimary: PrimaryOutcomeResult = ctx.primaryOutcome;

  for (const ae of ctx.afterEffects) {
    const baseAmount = resolveAmount(
      ae.amount,
      lastPrimary,
      ctx.exprBindings ?? { sl: 0 },
    );
    const targetIds = resolveTargetIds(ae.target, ctx);
    const resource = ae.resource as ResourceKind;

    for (const targetId of targetIds) {
      const actor = ctx.actors[targetId];
      if (!actor) continue;

      if (ae.direction === "recovery") {
        const source = ctx.actors[ctx.selfId];
        const rCtx: ResourceContext = {
          resource,
          amount: baseAmount,
          direction: "recovery",
          voluntary: false,
          currentValue:
            resource === "hp"
              ? actor.currentHp
              : resource === "mp"
                ? actor.currentMp
                : (actor.currentIp ?? 0),
          maxValue:
            resource === "hp"
              ? actor.maxHp
              : resource === "mp"
                ? actor.maxMp
                : (actor.maxIp ?? 0),
          incomingLossBonuses: actor.incomingLossBonuses,
          incomingLossMultipliers: actor.incomingLossMultipliers,
          incomingRecoveryBonuses: actor.incomingRecoveryBonuses,
          incomingRecoveryMultipliers: actor.incomingRecoveryMultipliers,
          outgoingRecoveryBonuses: source?.outgoingRecoveryBonuses,
          outgoingRecoveryMultipliers: source?.outgoingRecoveryMultipliers,
        };
        const result = resolveResource(rCtx);
        resolved.push({
          afterEffect: ae,
          targetId,
          resolvedAmount: result.resolvedAmount,
          direction: "recovery",
          resource,
        });
        // Update lastPrimary so subsequent derivedFrom can chain
        lastPrimary = {
          kind: "resource-recovery",
          resolvedAmount: result.resolvedAmount,
          resource,
        };
      } else if (ae.direction === "loss") {
        // HP loss through damage pipeline (respects affinities);
        // MP/IP loss through resource pipeline (no affinity math)
        if (resource === "hp") {
          const dmgCtx = buildDamageContext({
            baseDamage: baseAmount,
            damageType: "untyped" as DamageElement,
            npcAffinities: actor.affinities,
            temporaryAffinities: actor.temporaryAffinities,
            affinityGrants: actor.affinityGrants,
            isGuarding: actor.isGuarding,
            incomingDamageBonuses: actor.incomingDamageBonuses,
          });
          const dmgResult = resolveDamage(dmgCtx);
          resolved.push({
            afterEffect: ae,
            targetId,
            resolvedAmount: Math.abs(dmgResult.finalDamage),
            direction: "loss",
            resource,
            isHealing: dmgResult.isHealing,
          });
          lastPrimary = {
            kind: "damage",
            resolvedAmount: Math.abs(dmgResult.finalDamage),
            resource: "hp",
          };
        } else {
          const rCtx: ResourceContext = {
            resource,
            amount: baseAmount,
            direction: "loss",
            voluntary: false,
            currentValue:
              resource === "mp" ? actor.currentMp : (actor.currentIp ?? 0),
            maxValue: resource === "mp" ? actor.maxMp : (actor.maxIp ?? 0),
            incomingLossBonuses: actor.incomingLossBonuses,
            incomingLossMultipliers: actor.incomingLossMultipliers,
            incomingRecoveryBonuses: actor.incomingRecoveryBonuses,
            incomingRecoveryMultipliers: actor.incomingRecoveryMultipliers,
          };
          const result = resolveResource(rCtx);
          resolved.push({
            afterEffect: ae,
            targetId,
            resolvedAmount: result.resolvedAmount,
            direction: "loss",
            resource,
          });
          lastPrimary = {
            kind: "resource-loss",
            resolvedAmount: result.resolvedAmount,
            resource,
          };
        }
      }
    }
  }

  return { resolved };
}
