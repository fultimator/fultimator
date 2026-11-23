import { createId } from "./rolls";
import type {
  Attribute,
  AttributeCheckMessage,
  CheckDieResult,
  CheckIntent,
  CheckModifier,
  CheckResult,
  OpenCheckMessage,
  OpposedCheckMessage,
  OpposedCheckResult,
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

export function buildAttributeCheckMessage(
  check: CheckResult,
): AttributeCheckMessage {
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker: check.speaker,
    kind: "attribute",
    check,
  };
}

export function buildOpenCheckMessage(check: CheckResult): OpenCheckMessage {
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker: check.speaker,
    kind: "open",
    check,
  };
}

export function buildOpposedCheckMessage(
  check: OpposedCheckResult,
): OpposedCheckMessage {
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker: check.speaker,
    kind: "opposed",
    check,
  };
}

export function processOpposedCheck(
  intent: CheckIntent,
  rolls: { primaryDie: number; secondaryDie: number },
  dieSizes: { primary: number; secondary: number },
  speaker: string | undefined,
  opposedToId: string,
  opposedToResult: number,
  opposedToSpeaker: string | undefined,
  opposedToCritical?: boolean,
  opposedToFumble?: boolean,
): OpposedCheckResult {
  const base = processCheck(intent, rolls, dieSizes, speaker);
  return {
    ...base,
    opposedToId,
    opposedToResult,
    opposedToSpeaker,
    opposedToCritical,
    opposedToFumble,
  };
}

export function isOpposedTied(check: OpposedCheckResult): boolean {
  // Both crit or both fumble > must reroll
  if (check.critical && check.opposedToCritical) return true;
  if (check.fumble && check.opposedToFumble) return true;
  // Fumble always loses, critical always wins > not a tie
  if (
    check.fumble ||
    check.critical ||
    check.opposedToCritical ||
    check.opposedToFumble
  )
    return false;
  return check.result === check.opposedToResult;
}
