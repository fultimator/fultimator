import type { ResourceDelta, ResourceMultiplier } from "../types/Bonuses";

export type ResourceKind = "hp" | "mp" | "ip";
export type ResourceDirection = "loss" | "recovery";

export interface ResourceStep {
  label: string;
  value: number;
}

export interface ResourceContext {
  resource: ResourceKind;
  amount: number;
  direction: ResourceDirection;
  voluntary: boolean;
  currentValue: number;
  maxValue: number;
  incomingLossBonuses: ResourceDelta;
  incomingLossMultipliers: ResourceMultiplier;
  incomingRecoveryBonuses: ResourceDelta;
  incomingRecoveryMultipliers: ResourceMultiplier;
  outgoingRecoveryBonuses?: ResourceDelta;
  outgoingRecoveryMultipliers?: ResourceMultiplier;
}

export interface ResourceResult {
  resolvedAmount: number;
  attemptedAmount: number;
  bonusesApplied: { label: string; value: number }[];
  breakdown: ResourceStep[];
}

export function resolveResource(ctx: ResourceContext): ResourceResult {
  const breakdown: ResourceStep[] = [];
  const bonusesApplied: { label: string; value: number }[] = [];
  const r = ctx.resource;

  breakdown.push({ label: "base", value: ctx.amount });

  let amount = ctx.amount;

  if (ctx.direction === "loss") {
    // Flat bonuses first (add/subtract), then multipliers
    const flatBonus = ctx.incomingLossBonuses[r];
    if (flatBonus !== 0) {
      amount += flatBonus;
      bonusesApplied.push({ label: `incomingLoss.${r} bonus`, value: flatBonus });
      breakdown.push({ label: `loss bonus`, value: flatBonus });
    }

    amount = Math.max(0, amount);

    const multiplier = ctx.incomingLossMultipliers[r];
    if (multiplier !== 1) {
      const before = amount;
      amount = Math.max(0, Math.floor(amount * multiplier));
      bonusesApplied.push({ label: `incomingLoss.${r} ×${multiplier}`, value: amount - before });
      breakdown.push({ label: `loss ×${multiplier}`, value: amount });
    }

    // Clamp to available resource
    const attemptedAmount = amount;
    const resolvedAmount = Math.min(amount, ctx.currentValue);
    if (resolvedAmount !== amount) {
      breakdown.push({ label: "clamped to available", value: resolvedAmount });
    }

    return { resolvedAmount, attemptedAmount, bonusesApplied, breakdown };
  } else {
    // Recovery: apply outgoing bonuses (from source), then incoming bonuses (on target)
    const outFlat = ctx.outgoingRecoveryBonuses?.[r] ?? 0;
    if (outFlat !== 0) {
      amount += outFlat;
      bonusesApplied.push({ label: `outgoingRecovery.${r} bonus`, value: outFlat });
      breakdown.push({ label: "outgoing recovery bonus", value: outFlat });
    }

    const outMult = ctx.outgoingRecoveryMultipliers?.[r] ?? 1;
    if (outMult !== 1) {
      const before = amount;
      amount = Math.max(0, Math.floor(amount * outMult));
      bonusesApplied.push({ label: `outgoingRecovery.${r} ×${outMult}`, value: amount - before });
      breakdown.push({ label: `outgoing ×${outMult}`, value: amount });
    }

    const inFlat = ctx.incomingRecoveryBonuses[r];
    if (inFlat !== 0) {
      amount += inFlat;
      bonusesApplied.push({ label: `incomingRecovery.${r} bonus`, value: inFlat });
      breakdown.push({ label: "incoming recovery bonus", value: inFlat });
    }

    amount = Math.max(0, amount);

    const inMult = ctx.incomingRecoveryMultipliers[r];
    if (inMult !== 1) {
      const before = amount;
      amount = Math.max(0, Math.floor(amount * inMult));
      bonusesApplied.push({ label: `incomingRecovery.${r} ×${inMult}`, value: amount - before });
      breakdown.push({ label: `incoming ×${inMult}`, value: amount });
    }

    // Clamp to headroom (can't recover more than max - current)
    const headroom = ctx.maxValue - ctx.currentValue;
    const attemptedAmount = amount;
    const resolvedAmount = Math.min(amount, Math.max(0, headroom));
    if (resolvedAmount !== amount) {
      breakdown.push({ label: "clamped to headroom", value: resolvedAmount });
    }

    return { resolvedAmount, attemptedAmount, bonusesApplied, breakdown };
  }
}

// Convenience builder - pass actor bonuses/multipliers from getActorBonuses/getActorMultipliers
export function buildResourceContext(opts: {
  resource: ResourceKind;
  amount: number;
  direction: ResourceDirection;
  voluntary: boolean;
  currentValue: number;
  maxValue: number;
  incomingLossBonuses: ResourceDelta;
  incomingLossMultipliers: ResourceMultiplier;
  incomingRecoveryBonuses: ResourceDelta;
  incomingRecoveryMultipliers: ResourceMultiplier;
  outgoingRecoveryBonuses?: ResourceDelta;
  outgoingRecoveryMultipliers?: ResourceMultiplier;
}): ResourceContext {
  return { ...opts };
}
