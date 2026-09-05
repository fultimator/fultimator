import type { Elements } from "../types/Misc";
import type {
  AccuracyCheckResult,
  MagicCheckResult,
  CheckResult,
} from "../components/app-drawer/panels/chat/types";
import type { PrimaryOutcomeResult } from "./afterEffectPipeline";

export type ResourceKind = "hp" | "mp" | "ip";

// Typed event log - reactive triggers and conditional after effects read this
// instead of inspecting pipeline internals.
export type ResourceEvent =
  | { kind: "damage"; resource: "hp"; amount: number; damageType: Elements }
  | {
      kind: "loss";
      resource: "hp" | "mp" | "ip";
      amount: number;
      voluntary: false;
    }
  | { kind: "recovery"; resource: "hp" | "mp" | "ip"; amount: number }
  | {
      kind: "expenditure";
      resource: "hp" | "mp" | "ip" | "fp";
      amount: number;
      voluntary: true;
    };

export type CheckResult_Any =
  | AccuracyCheckResult
  | MagicCheckResult
  | CheckResult;

export interface WeaponRef {
  source: "weapons" | "customWeapons";
  name: string;
  index?: number;
}

export interface ActionContext {
  // actor identity
  actorId: string;
  resolvedBy: "pc" | "npc";
  sl: number;

  // prompt results (filled in by PROMPT phase - undefined until resolved)
  chosenAttribute?: string;
  chosenWeapon?: WeaponRef;
  chosenStatus?: string;
  chosenOption?: string;
  coverTarget?: string;

  // scalar values resolved from live actor data before any pipeline runs
  // keys: 'mightRoll', 'bonds.highest', 'target.statusEffects.count', etc.
  preRollValues: Record<string, number>;

  // check result (filled in by CHECK phase)
  checkResult?: CheckResult_Any;

  // pipeline results - appended as each phase completes
  events: ResourceEvent[];
  primaryOutcome?: PrimaryOutcomeResult;
}

export function createActionContext(opts: {
  actorId: string;
  resolvedBy: "pc" | "npc";
  sl: number;
  preRollValues?: Record<string, number>;
}): ActionContext {
  return {
    actorId: opts.actorId,
    resolvedBy: opts.resolvedBy,
    sl: opts.sl,
    preRollValues: opts.preRollValues ?? {},
    events: [],
  };
}

// Helpers for appending typed events
export function emitDamageEvent(
  ctx: ActionContext,
  amount: number,
  damageType: Elements,
): void {
  ctx.events.push({ kind: "damage", resource: "hp", amount, damageType });
}

export function emitLossEvent(
  ctx: ActionContext,
  resource: "hp" | "mp" | "ip",
  amount: number,
): void {
  ctx.events.push({ kind: "loss", resource, amount, voluntary: false });
}

export function emitRecoveryEvent(
  ctx: ActionContext,
  resource: "hp" | "mp" | "ip",
  amount: number,
): void {
  ctx.events.push({ kind: "recovery", resource, amount });
}

export function emitExpenditureEvent(
  ctx: ActionContext,
  resource: "hp" | "mp" | "ip" | "fp",
  amount: number,
): void {
  ctx.events.push({ kind: "expenditure", resource, amount, voluntary: true });
}
