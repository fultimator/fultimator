import { createId } from "./rolls";
import type { AttackOption } from "./speakers";
import type {
  AccuracyCheckIntent,
  AccuracyCheckMessage,
  AccuracyCheckResult,
  Attribute,
  CheckDieResult,
  CheckModifier,
} from "../types";

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function prepareAccuracyCheck(
  weapon: AttackOption,
  extraModifiers: CheckModifier[] = [],
): AccuracyCheckIntent {
  const modifiers: CheckModifier[] = [...extraModifiers];
  if (weapon.accuracyBonus && weapon.accuracyBonus !== 0) {
    modifiers.push({ label: "Accuracy Bonus", value: weapon.accuracyBonus });
  }
  return {
    id: createId(),
    primary: (weapon.attr1 ?? "dex") as Attribute,
    secondary: (weapon.attr2 ?? "ins") as Attribute,
    modifiers,
    critThreshold: 6,
    weaponName: weapon.name,
    baseDamage: weapon.baseDamage ?? 0,
    damageType: weapon.damageType ?? "physical",
  };
}

export function rollAccuracyCheck(dieSizes: {
  primary: number;
  secondary: number;
}): { primaryDie: number; secondaryDie: number } {
  return {
    primaryDie: rollDie(dieSizes.primary),
    secondaryDie: rollDie(dieSizes.secondary),
  };
}

export function processAccuracyCheck(
  intent: AccuracyCheckIntent,
  rolls: { primaryDie: number; secondaryDie: number },
  dieSizes: { primary: number; secondary: number },
  speaker?: string,
): AccuracyCheckResult {
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

  const accuracyTotal = highRoll + lowRoll + modifierTotal;
  const damage = highRoll + intent.baseDamage;
  const critical =
    rolls.primaryDie === rolls.secondaryDie &&
    rolls.primaryDie >= Math.max(2, intent.critThreshold);
  const fumble = rolls.primaryDie === 1 && rolls.secondaryDie === 1;

  return {
    intent,
    speaker,
    primary,
    secondary,
    highRoll,
    modifierTotal,
    accuracyTotal,
    damage,
    critical,
    fumble,
  };
}

export function buildAccuracyCheckMessage(
  result: AccuracyCheckResult,
): AccuracyCheckMessage {
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker: result.speaker,
    kind: "accuracy",
    check: result,
  };
}
