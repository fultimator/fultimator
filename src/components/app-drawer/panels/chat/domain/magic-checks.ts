import { createId } from "./rolls";
import type { SpellOption } from "./speakers";
import type {
  Attribute,
  CheckDieResult,
  CheckModifier,
  MagicCheckIntent,
  MagicCheckMessage,
  MagicCheckResult,
} from "../types";

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function prepareMagicCheck(
  spell: SpellOption,
  extraModifiers: CheckModifier[] = [],
  options?: { damageOutgoingBonus?: number },
): MagicCheckIntent {
  const modifiers: CheckModifier[] = [...extraModifiers];
  if (spell.accuracyBonus && spell.accuracyBonus !== 0) {
    modifiers.push({ label: "Accuracy Bonus", value: spell.accuracyBonus });
  }
  return {
    id: createId(),
    primary: (spell.attr1 ?? "ins") as Attribute,
    secondary: (spell.attr2 ?? "wlp") as Attribute,
    modifiers,
    critThreshold: 6,
    spellName: spell.name,
    spellType: spell.spellType,
    description: spell.description,
    baseDamage: spell.baseDamage ?? 0,
    damageOutgoingBonus: options?.damageOutgoingBonus ?? 0,
    damageType: spell.damageType ?? "physical",
    defense: spell.accuracyDefense ?? "mdef",
    hrZero: spell.damageHrZero ?? false,
    extraTags: spell.extraTags,
  };
}

export function rollMagicCheck(dieSizes: {
  primary: number;
  secondary: number;
}): { primaryDie: number; secondaryDie: number } {
  return {
    primaryDie: rollDie(dieSizes.primary),
    secondaryDie: rollDie(dieSizes.secondary),
  };
}

export function processMagicCheck(
  intent: MagicCheckIntent,
  rolls: { primaryDie: number; secondaryDie: number },
  dieSizes: { primary: number; secondary: number },
  speaker?: string,
): MagicCheckResult {
  const modifierTotal = intent.modifiers.reduce((sum, m) => sum + m.value, 0);
  const rawHighRoll = Math.max(rolls.primaryDie, rolls.secondaryDie);
  const highRoll = rawHighRoll;
  const damageHighRoll = intent.hrZero ? 0 : rawHighRoll;
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
  const damage = damageHighRoll + intent.baseDamage + (intent.damageOutgoingBonus ?? 0);
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
    damageHighRoll,
    modifierTotal,
    accuracyTotal,
    damage,
    critical,
    fumble,
  };
}

export function buildMagicCheckMessage(
  result: MagicCheckResult,
): MagicCheckMessage {
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker: result.speaker,
    kind: "magic",
    check: result,
  };
}
