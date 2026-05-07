import { createId } from "./rolls";
import type {
  Attribute,
  CheckDieResult,
  CheckIntent,
  CheckMessage,
  CheckModifier,
  CheckResult,
} from "../types";

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function prepareCheck(params: {
  primary: Attribute;
  secondary: Attribute;
  modifiers?: CheckModifier[];
  critThreshold?: number;
  difficulty?: number;
  additionalData?: Record<string, unknown>;
}): CheckIntent {
  return {
    id: createId(),
    primary: params.primary,
    secondary: params.secondary,
    modifiers: params.modifiers ?? [],
    critThreshold: params.critThreshold ?? 6,
    difficulty: params.difficulty,
    additionalData: params.additionalData ?? {},
  };
}

export function rollCheck(dieSizes: { primary: number; secondary: number }): {
  primaryDie: number;
  secondaryDie: number;
} {
  return {
    primaryDie: rollDie(dieSizes.primary),
    secondaryDie: rollDie(dieSizes.secondary),
  };
}

export function processCheck(
  intent: CheckIntent,
  rolls: { primaryDie: number; secondaryDie: number },
  dieSizes: { primary: number; secondary: number },
  speaker?: string,
): CheckResult {
  const modifierTotal = intent.modifiers.reduce((sum, m) => sum + m.value, 0);
  const highRoll = Math.max(rolls.primaryDie, rolls.secondaryDie);
  const lowRoll = Math.min(rolls.primaryDie, rolls.secondaryDie);

  const primary: CheckDieResult = {
    attribute: intent.primary,
    die: dieSizes.primary,
    result: rolls.primaryDie,
  };
  const secondary: CheckDieResult = {
    attribute: intent.secondary,
    die: dieSizes.secondary,
    result: rolls.secondaryDie,
  };

  const total = highRoll + lowRoll + modifierTotal;
  return {
    intent,
    speaker,
    primary,
    secondary,
    highRoll,
    modifierTotal,
    result: total,
    passed: intent.difficulty != null ? total >= intent.difficulty : undefined,
    critical:
      rolls.primaryDie === rolls.secondaryDie &&
      rolls.primaryDie >= Math.max(2, intent.critThreshold),
    fumble: rolls.primaryDie === 1 && rolls.secondaryDie === 1,
    additionalData: intent.additionalData,
  };
}

export function buildCheckMessage(check: CheckResult): CheckMessage {
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker: check.speaker,
    kind: "check",
    check,
  };
}
