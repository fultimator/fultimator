import { createId } from "./rolls";
import type {
  Attribute,
  CheckDieResult,
  CheckIntent,
  CheckMessage,
  CheckModifier,
  CheckResult,
} from "../types";

const ATTRIBUTE_DIE: Record<Attribute, number> = {
  dex: 8,
  ins: 8,
  mig: 8,
  wlp: 8,
};

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function prepareCheck(params: {
  primary: Attribute;
  secondary: Attribute;
  modifiers?: CheckModifier[];
  critThreshold?: number;
  additionalData?: Record<string, unknown>;
}): CheckIntent {
  return {
    id: createId(),
    primary: params.primary,
    secondary: params.secondary,
    modifiers: params.modifiers ?? [],
    critThreshold: params.critThreshold ?? 6,
    additionalData: params.additionalData ?? {},
  };
}

export function rollCheck(intent: CheckIntent): {
  primaryDie: number;
  secondaryDie: number;
} {
  return {
    primaryDie: rollDie(ATTRIBUTE_DIE[intent.primary]),
    secondaryDie: rollDie(ATTRIBUTE_DIE[intent.secondary]),
  };
}

export function processCheck(
  intent: CheckIntent,
  rolls: { primaryDie: number; secondaryDie: number },
  speaker?: string,
): CheckResult {
  const modifierTotal = intent.modifiers.reduce((sum, m) => sum + m.value, 0);
  const highRoll = Math.max(rolls.primaryDie, rolls.secondaryDie);
  const lowRoll = Math.min(rolls.primaryDie, rolls.secondaryDie);

  const primary: CheckDieResult = {
    attribute: intent.primary,
    die: ATTRIBUTE_DIE[intent.primary],
    result: rolls.primaryDie,
  };
  const secondary: CheckDieResult = {
    attribute: intent.secondary,
    die: ATTRIBUTE_DIE[intent.secondary],
    result: rolls.secondaryDie,
  };

  return {
    intent,
    speaker,
    primary,
    secondary,
    highRoll,
    modifierTotal,
    result: highRoll + lowRoll + modifierTotal,
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
