import { buildRollMessage } from "./rolls";
import {
  prepareCheck,
  rollCheck,
  processCheck,
  buildAttributeCheckMessage,
  buildOpenCheckMessage,
} from "./checks";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "./accuracy-checks";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "./magic-checks";
import {
  resolveAttributeDie,
  resolveAttackOptions,
  resolveSpellOptions,
} from "./speakers";
import {
  accuracyModifiersFromEffects,
  checkModifiersFromEffects,
  outgoingDamageBonusFromEffects,
  isActorInCrisis,
} from "./effect-modifiers";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
import type { TypePlayer } from "../../../../../types/Players";
import type { TypeNpc } from "../../../../../types/Npcs";
import type {
  Attribute,
  AttackOverrides,
  ChatMessage,
  DamagePipelineTarget,
  DieSides,
} from "../types";
import type { AppliedEffect, Behavior } from "../../../../../types/Effects";
import { materializeAppliedEffect } from "../../../../../libs/appliedEffects";

export interface ActiveBehaviorOutput {
  speaker: string;
  itemName: string;
  itemType: string;
  text: string;
}

function collectActiveBehaviorOutputs(
  behaviors: Behavior[] | undefined,
  speaker: string,
  itemName: string,
  itemType: string,
): ActiveBehaviorOutput[] {
  if (!behaviors) return [];
  const out: ActiveBehaviorOutput[] = [];
  for (const beh of behaviors) {
    if (beh.trigger && beh.trigger.kind !== "active") continue;
    const text = beh.chatOutput?.text?.trim();
    if (!text) continue;
    out.push({ speaker, itemName, itemType, text });
  }
  return out;
}

function rollerAppliedEffects(
  playerDoc: Record<string, unknown> | null,
): AppliedEffect[] {
  const combatId = playerDoc?.combatId as string | undefined;
  if (!combatId) return [];
  const runtime = useCombatEncounterStore.getState().getRuntimeActor(combatId);
  return runtime?.appliedEffects ?? [];
}

function applyBehaviorEffectsOnResolve(
  behaviors: Behavior[] | undefined,
  action: "attack" | "spell",
  playerDoc: Record<string, unknown> | null,
  targets: DamagePipelineTarget[] | undefined,
  itemName: string,
): void {
  if (!behaviors || behaviors.length === 0) return;
  const store = useCombatEncounterStore.getState();
  const selfCombatId = playerDoc?.combatId as string | undefined;
  const targetIds = (targets ?? []).map((t) => t.combatId).filter(Boolean);

  for (const beh of behaviors) {
    const applies = beh.appliesEffect;
    if (!applies) continue;
    const kind = beh.trigger?.kind ?? "passive";
    const matchesAction =
      (kind === "chat-action" &&
        (beh.trigger as { action?: string }).action === action) ||
      kind === "on-hit";
    if (!matchesAction) continue;

    let recipients: string[];
    if (applies.target === "self") {
      recipients = selfCombatId ? [selfCombatId] : [];
    } else if (applies.target === "single" || applies.target === "all") {
      recipients = targetIds;
    } else {
      recipients = []; // cover-target: needs cover context, unsupported here
    }

    for (const combatId of recipients) {
      store.applyEffectToActor(
        combatId,
        materializeAppliedEffect(applies, {
          origin: `${action}:${itemName}:${beh.id}`,
          sourceCombatId: selfCombatId,
        }),
      );
    }
  }
}

export type CommandContext = {
  speaker: string;
  playerDoc: Record<string, unknown> | null;
  targetsSnapshot?: DamagePipelineTarget[];
};

export type CommandParam = {
  name: string;
  description: string;
  required: boolean;
};

export type Command = {
  name: string;
  aliases: string[];
  description: string;
  params: CommandParam[];
  execute(
    args: string,
    context: CommandContext,
  ): ChatMessage[] | { error: string };
};

function parseDiceNotation(expr: string): {
  dice: Partial<Record<DieSides, number>>;
  d100: number;
  modifier: number;
} | null {
  // Strip all spaces so "2d6 + 1d8 + 2" works the same as "2d6+1d8+2"
  const trimmed = expr.replace(/\s+/g, "");
  if (!trimmed) return null;

  const tokens = trimmed.match(/[+-]?[^+-]+/g);
  if (!tokens) return null;

  const VALID_SIDES: (DieSides | 100)[] = [4, 6, 8, 10, 12, 20, 100];
  const dice: Partial<Record<DieSides, number>> = {};
  let d100 = 0;
  let modifier = 0;
  let hasAnyDie = false;

  for (const token of tokens) {
    const diceMatch = token.match(/^([+-]?)(\d*)d(\d+)$/i);
    if (diceMatch) {
      const sign = diceMatch[1] === "-" ? -1 : 1;
      const count = diceMatch[2] ? parseInt(diceMatch[2], 10) : 1;
      const sides = parseInt(diceMatch[3], 10);
      if (!VALID_SIDES.includes(sides as DieSides | 100)) return null;
      if (count === 0) continue; // skip zero-count dice silently
      if (sides === 100) {
        d100 += sign * count;
      } else {
        const s = sides as DieSides;
        dice[s] = (dice[s] ?? 0) + sign * count;
      }
      hasAnyDie = true;
    } else {
      const flatMatch = token.match(/^([+-]?\d+)$/);
      if (flatMatch) {
        modifier += parseInt(flatMatch[1], 10);
      } else {
        return null;
      }
    }
  }

  if (!hasAnyDie) return null;
  return { dice, d100: Math.max(0, d100), modifier };
}

const rollCommand: Command = {
  name: "roll",
  aliases: ["r"],
  description: "Roll dice using standard notation",
  params: [
    {
      name: "dice",
      description: "2d6+1d8+2",
      required: true,
    },
  ],
  execute(args, context) {
    if (!args.trim()) {
      return { error: "Usage: /roll <dice>  e.g. /roll 2d6+1d8+2" };
    }
    const parsed = parseDiceNotation(args);
    if (!parsed) {
      return {
        error: `"${args.trim()}" is not valid dice notation. Example: 2d6+1d8+2`,
      };
    }
    return [
      buildRollMessage(
        parsed.dice,
        parsed.d100,
        parsed.modifier,
        context.speaker,
      ),
    ];
  },
};

const VALID_ATTRIBUTES = new Set(["dex", "ins", "mig", "wlp"]);
const VALID_RANGE = new Set(["melee", "ranged"]);
const VALID_DEFENSE = new Set(["def", "mdef"]);

export function parseActionAttackArgs(rawArg: string): {
  weaponName?: string;
  overrides: AttackOverrides;
} {
  const trimmed = rawArg.trim();
  if (!trimmed) return { weaponName: undefined, overrides: {} };

  let weaponName = "";
  let rest = "";
  if (trimmed.startsWith('"')) {
    const endQuote = trimmed.indexOf('"', 1);
    if (endQuote !== -1) {
      weaponName = trimmed.slice(1, endQuote);
      rest = trimmed.slice(endQuote + 1).trim();
    } else {
      weaponName = trimmed.slice(1);
      rest = "";
    }
  } else {
    const spaceIdx = trimmed.indexOf(" ");
    if (spaceIdx === -1) {
      weaponName = trimmed;
      rest = "";
    } else {
      weaponName = trimmed.slice(0, spaceIdx);
      rest = trimmed.slice(spaceIdx + 1).trim();
    }
  }

  const overrides: AttackOverrides = {};
  if (!rest) return { weaponName, overrides };
  const tokens = rest.split(/\s+/);
  for (let i = 0; i < tokens.length; ) {
    const rawFlag = tokens[i];
    if (
      rawFlag?.toLowerCase() === "hr0" ||
      rawFlag?.toLowerCase() === "--hr0"
    ) {
      overrides.hrZero = true;
      i += 1;
      continue;
    }
    if (!rawFlag?.startsWith("--")) {
      i += 1;
      continue;
    }
    const flag = rawFlag.toLowerCase();
    const value = tokens[i + 1];
    if (!value || value.startsWith("--")) {
      i += 1;
      continue;
    }
    if (flag === "--attr1" && VALID_ATTRIBUTES.has(value.toLowerCase())) {
      overrides.attr1 = value.toLowerCase() as Attribute;
    } else if (
      flag === "--attr2" &&
      VALID_ATTRIBUTES.has(value.toLowerCase())
    ) {
      overrides.attr2 = value.toLowerCase() as Attribute;
    } else if (flag === "--acc") {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) overrides.accuracyDelta = n;
    } else if (flag === "--dmg") {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) overrides.damageDelta = n;
    } else if (flag === "--range" && VALID_RANGE.has(value.toLowerCase())) {
      overrides.range = value.toLowerCase() as "melee" | "ranged";
    } else if (flag === "--defense" && VALID_DEFENSE.has(value.toLowerCase())) {
      overrides.defense = value.toLowerCase() as "def" | "mdef";
    }
    i += 2;
  }
  return { weaponName, overrides };
}

export function parseActionSpellArgs(rawArg: string): {
  spellArg?: string;
  overrides: {
    attr1?: Attribute;
    attr2?: Attribute;
    accuracyDelta?: number;
    damageDelta?: number;
    hrZero?: boolean;
  };
} {
  const trimmed = rawArg.trim();
  if (!trimmed) return { overrides: {} };

  let spellArg = "";
  let rest = "";
  if (trimmed.startsWith('"')) {
    const endQuote = trimmed.indexOf('"', 1);
    if (endQuote !== -1) {
      spellArg = trimmed.slice(1, endQuote);
      rest = trimmed.slice(endQuote + 1).trim();
    } else {
      spellArg = trimmed.slice(1);
    }
  } else {
    const flagIdx = trimmed.indexOf(" --");
    const hr0Idx = trimmed.toLowerCase().indexOf(" hr0");
    const splitIdx = [flagIdx, hr0Idx]
      .filter((i) => i !== -1)
      .sort((a, b) => a - b)[0];
    if (splitIdx === undefined) {
      spellArg = trimmed;
    } else {
      spellArg = trimmed.slice(0, splitIdx).trim();
      rest = trimmed.slice(splitIdx + 1).trim();
    }
  }

  const overrides: {
    attr1?: Attribute;
    attr2?: Attribute;
    accuracyDelta?: number;
    damageDelta?: number;
    hrZero?: boolean;
  } = {};
  if (!rest) return { spellArg, overrides };
  const tokens = rest.split(/\s+/);
  for (let i = 0; i < tokens.length; ) {
    const rawFlag = tokens[i];
    if (
      rawFlag?.toLowerCase() === "hr0" ||
      rawFlag?.toLowerCase() === "--hr0"
    ) {
      overrides.hrZero = true;
      i += 1;
      continue;
    }
    if (!rawFlag?.startsWith("--")) {
      i += 1;
      continue;
    }
    const flag = rawFlag.toLowerCase();
    const value = tokens[i + 1];
    if (!value || value.startsWith("--")) {
      i += 1;
      continue;
    }
    if (flag === "--attr1" && VALID_ATTRIBUTES.has(value.toLowerCase())) {
      overrides.attr1 = value.toLowerCase() as Attribute;
    } else if (
      flag === "--attr2" &&
      VALID_ATTRIBUTES.has(value.toLowerCase())
    ) {
      overrides.attr2 = value.toLowerCase() as Attribute;
    } else if (flag === "--acc") {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) overrides.accuracyDelta = n;
    } else if (flag === "--dmg") {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) overrides.damageDelta = n;
    }
    i += 2;
  }
  return { spellArg, overrides };
}

function parseCheckArgs(args: string):
  | {
      primary: Attribute;
      secondary: Attribute;
      modifier: number;
      difficulty?: number;
    }
  | { error: string } {
  const parts = args.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return { error: "Usage: <attr1> <attr2> [modifier] [difficulty]" };
  }
  const [a1, a2, modPart] = parts;
  if (!VALID_ATTRIBUTES.has(a1)) {
    return { error: `Unknown attribute "${a1}". Valid: dex, ins, mig, wlp` };
  }
  if (!VALID_ATTRIBUTES.has(a2)) {
    return { error: `Unknown attribute "${a2}". Valid: dex, ins, mig, wlp` };
  }
  const modifier = modPart ? parseInt(modPart, 10) : 0;
  if (modPart && Number.isNaN(modifier)) {
    return {
      error: `Invalid modifier "${modPart}". Must be a number, e.g. +2 or -1`,
    };
  }
  const dlPart = parts[3];
  const difficulty = dlPart ? parseInt(dlPart, 10) : undefined;
  if (dlPart && (Number.isNaN(difficulty!) || difficulty! < 1)) {
    return {
      error: `Invalid difficulty "${dlPart}". Must be a positive number, e.g. 10`,
    };
  }
  return {
    primary: a1 as Attribute,
    secondary: a2 as Attribute,
    modifier,
    difficulty,
  };
}

function runCheckFromParams(
  context: CommandContext,
  params: {
    primary: Attribute;
    secondary: Attribute;
    modifier?: number;
    difficulty?: number;
    additionalData?: Record<string, unknown>;
    forceKind?: "attribute" | "open";
  },
): ChatMessage[] {
  const dieSizes = {
    primary: resolveAttributeDie(context.playerDoc, params.primary),
    secondary: resolveAttributeDie(context.playerDoc, params.secondary),
  };
  const checkKind =
    params.forceKind ?? (params.difficulty != null ? "attribute" : "open");
  const effectModifiers = context.playerDoc
    ? checkModifiersFromEffects(
        context.playerDoc as unknown as TypePlayer | TypeNpc,
        {
          kind: checkKind,
          appliedEffects: rollerAppliedEffects(context.playerDoc),
        },
      )
    : [];
  const situational =
    (params.modifier ?? 0) !== 0
      ? [{ label: "Modifier", value: params.modifier ?? 0 }]
      : [];
  const modifiers = [...effectModifiers, ...situational];
  const intent = prepareCheck({
    primary: params.primary,
    secondary: params.secondary,
    modifiers,
    difficulty: params.difficulty,
    additionalData: params.additionalData,
  });
  const rolls = rollCheck(dieSizes);
  const result = processCheck(intent, rolls, dieSizes, context.speaker);
  return [
    checkKind === "attribute"
      ? buildAttributeCheckMessage(result)
      : buildOpenCheckMessage(result),
  ];
}

const CHECK_KINDS = new Set(["open", "attribute", "opposed"]);

const checkCommand: Command = {
  name: "check",
  aliases: ["c"],
  description: "Roll an attribute check",
  params: [
    {
      name: "[open|attribute] attr1 attr2",
      description:
        "open dex ins  or  attribute dex ins [modifier] [difficulty]",
      required: true,
    },
  ],
  execute(args, context) {
    if (!context.playerDoc) {
      return { error: "Switch to a character speaker to roll a check." };
    }
    const trimmed = args.trim();
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";
    let forceKind: "open" | "attribute" | undefined;
    let rest = trimmed;
    if (CHECK_KINDS.has(firstWord)) {
      forceKind = firstWord === "attribute" ? "attribute" : "open";
      rest = trimmed.slice(firstWord.length).trim();
    }
    const parsed = parseCheckArgs(rest);
    if ("error" in parsed) {
      return {
        error:
          "Usage: /check [open|attribute] <attr1> <attr2> [modifier] [difficulty]  e.g. /check open dex ins",
      };
    }
    return runCheckFromParams(context, {
      primary: parsed.primary,
      secondary: parsed.secondary,
      modifier: parsed.modifier,
      difficulty: parsed.difficulty,
      forceKind,
    });
  },
};

export const ACTION_OPTIONS = [
  "Attack",
  "Equipment",
  "Guard",
  "Hinder",
  "Inventory",
  "Objective",
  "Spell",
  "Study",
  "Skill",
  "Other",
  "Check",
] as const;

export type ActionOption = (typeof ACTION_OPTIONS)[number];

const actionCommand: Command = {
  name: "action",
  aliases: ["a"],
  description: "Declare a combat action",
  params: [
    {
      name: "action",
      description: "attack, guard, spell, …",
      required: true,
    },
  ],
  execute(args, context) {
    const action = args.trim();
    if (!action) {
      return { error: "Usage: /action <action>  e.g. /action attack" };
    }

    const spaceIdx = action.indexOf(" ");
    const subAction = spaceIdx === -1 ? action : action.slice(0, spaceIdx);
    const rawArg = spaceIdx === -1 ? "" : action.slice(spaceIdx + 1).trim();
    const { weaponName: parsedWeaponName, overrides } =
      parseActionAttackArgs(rawArg);
    const weaponArg = parsedWeaponName || undefined;

    if (subAction.toLowerCase() === "attack" && weaponArg) {
      const options = resolveAttackOptions(context.playerDoc);
      const weapon = options.find((o) => o.name === weaponArg);
      if (!weapon) {
        return { error: `Unknown weapon "${weaponArg}".` };
      }
      const baseAccuracyBonus = weapon.accuracyBonus ?? 0;
      const requestedAccuracyDelta = overrides.accuracyDelta ?? 0;
      const clampedAccuracyBonus = Math.max(
        0,
        baseAccuracyBonus + requestedAccuracyDelta,
      );
      const appliedAccuracyDelta = clampedAccuracyBonus - baseAccuracyBonus;
      const baseDamage = weapon.baseDamage ?? 0;
      const requestedDamageDelta = overrides.damageDelta ?? 0;
      const clampedDamage = Math.max(0, baseDamage + requestedDamageDelta);
      const appliedDamageDelta = clampedDamage - baseDamage;
      const effectiveWeapon = {
        ...weapon,
        attr1: overrides.attr1 ?? weapon.attr1,
        attr2: overrides.attr2 ?? weapon.attr2,
        range: overrides.range ?? weapon.range,
        accuracyDefense: overrides.defense ?? weapon.accuracyDefense,
        accuracyBonus: baseAccuracyBonus,
        baseDamage,
      };
      const primary = effectiveWeapon.attr1 ?? "dex";
      const secondary = effectiveWeapon.attr2 ?? "ins";
      const dieSizes = {
        primary: resolveAttributeDie(context.playerDoc, primary as Attribute),
        secondary: resolveAttributeDie(
          context.playerDoc,
          secondary as Attribute,
        ),
      };
      const rollerApplied = rollerAppliedEffects(context.playerDoc);
      const effectModifiers = context.playerDoc
        ? accuracyModifiersFromEffects(
            context.playerDoc as unknown as TypePlayer | TypeNpc,
            {
              range: effectiveWeapon.range,
              category: effectiveWeapon.category,
              inCrisis: isActorInCrisis(
                context.playerDoc as unknown as TypePlayer | TypeNpc,
              ),
              appliedEffects: rollerApplied,
            },
          )
        : [];
      const weaponDamageOutgoing = context.playerDoc
        ? outgoingDamageBonusFromEffects(
            context.playerDoc as unknown as TypePlayer | TypeNpc,
            {
              range: effectiveWeapon.range as "melee" | "ranged" | undefined,
              category: effectiveWeapon.category,
              damageType: effectiveWeapon.damageType,
              appliedEffects: rollerApplied,
            },
          )
        : 0;
      const situational =
        appliedAccuracyDelta !== 0
          ? [{ label: "Situational Bonus", value: appliedAccuracyDelta }]
          : [];
      const intent = prepareAccuracyCheck(
        effectiveWeapon,
        [...effectModifiers, ...situational],
        {
          damageSituationalBonus: appliedDamageDelta,
          damageOutgoingBonus: weaponDamageOutgoing,
          hrZero: overrides.hrZero ?? effectiveWeapon.damageHrZero ?? false,
        },
      );
      const rolls = rollAccuracyCheck(dieSizes);
      const result = processAccuracyCheck(
        intent,
        rolls,
        dieSizes,
        context.speaker,
      );
      const targetsSnapshot =
        context.targetsSnapshot ?? useCombatEncounterStore.getState().targets;
      applyBehaviorEffectsOnResolve(
        weapon.behaviors,
        "attack",
        context.playerDoc,
        targetsSnapshot,
        weapon.name,
      );
      return [
        buildAccuracyCheckMessage({
          ...result,
          targetsSnapshot: [...targetsSnapshot],
        }),
      ];
    }

    if (subAction.toLowerCase() === "spell" && weaponArg) {
      const { spellArg, overrides: spellOverrides } =
        parseActionSpellArgs(rawArg);
      const effectiveArg = spellArg ?? weaponArg;
      const options = resolveSpellOptions(context.playerDoc);
      const spell = options.find((o) => {
        const unquoted = o.spellType ? `${o.name} ${o.spellType}` : o.name;
        return unquoted === effectiveArg;
      });
      if (!spell) {
        return { error: `Unknown spell "${effectiveArg}".` };
      }
      if (!spell.isOffensive) {
        return [
          {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            speaker: context.speaker,
            kind: "display",
            itemType: "spell",
            name: spell.name,
            tags: ["Spell", spell.spellType ?? "default", "Non-Offensive"],
            description: spell.description,
            effect: spell.effect,
          } as import("../types").ChatMessage,
        ];
      }
      const primary = (spellOverrides.attr1 ??
        spell.attr1 ??
        "ins") as Attribute;
      const secondary = (spellOverrides.attr2 ??
        spell.attr2 ??
        "wlp") as Attribute;
      const dieSizes = {
        primary: resolveAttributeDie(context.playerDoc, primary),
        secondary: resolveAttributeDie(context.playerDoc, secondary),
      };
      const rollerApplied = rollerAppliedEffects(context.playerDoc);
      const magicModifiers = context.playerDoc
        ? accuracyModifiersFromEffects(
            context.playerDoc as unknown as TypePlayer,
            { checkType: "magic", appliedEffects: rollerApplied },
          )
        : [];
      const spellDamageOutgoing = context.playerDoc
        ? outgoingDamageBonusFromEffects(
            context.playerDoc as unknown as TypePlayer,
            {
              range: "spell",
              damageType: spell.damageType,
              appliedEffects: rollerApplied,
            },
          )
        : 0;
      const intent = prepareMagicCheck(
        {
          ...spell,
          attr1: primary,
          attr2: secondary,
          accuracyBonus:
            (spell.accuracyBonus ?? 0) + (spellOverrides.accuracyDelta ?? 0),
          baseDamage:
            (spell.baseDamage ?? 0) + (spellOverrides.damageDelta ?? 0),
          damageHrZero: spellOverrides.hrZero ?? spell.damageHrZero,
        },
        magicModifiers,
        { damageOutgoingBonus: spellDamageOutgoing },
      );
      const rolls = rollMagicCheck(dieSizes);
      const result = processMagicCheck(
        intent,
        rolls,
        dieSizes,
        context.speaker,
      );
      const targetsSnapshot =
        context.targetsSnapshot ?? useCombatEncounterStore.getState().targets;
      applyBehaviorEffectsOnResolve(
        spell.behaviors,
        "spell",
        context.playerDoc,
        targetsSnapshot,
        spell.name,
      );
      return [
        buildMagicCheckMessage({
          ...result,
          targetsSnapshot: [...targetsSnapshot],
        }),
      ];
    }

    if (subAction.toLowerCase() === "hinder") {
      if (!context.playerDoc) {
        return { error: "Switch to a character speaker to roll a check." };
      }
      if (!rawArg) {
        return runCheckFromParams(context, {
          primary: "ins",
          secondary: "wlp",
          difficulty: 10,
          forceKind: "attribute",
          additionalData: {
            originAction: "hinder",
            fixedDifficulty: 10,
            usedDefaultAttributes: true,
          },
        });
      }
      const parsed = parseCheckArgs(rawArg);
      if ("error" in parsed) {
        return {
          error:
            "Usage: /action hinder [attr1 attr2 [modifier]]  e.g. /action hinder ins wlp +1",
        };
      }
      return runCheckFromParams(context, {
        primary: parsed.primary,
        secondary: parsed.secondary,
        modifier: parsed.modifier,
        difficulty: 10,
        forceKind: "attribute",
        additionalData: { originAction: "hinder", fixedDifficulty: 10 },
      });
    }

    if (subAction.toLowerCase() === "study") {
      if (!context.playerDoc) {
        return { error: "Switch to a character speaker to roll a check." };
      }
      if (!rawArg) {
        return runCheckFromParams(context, {
          primary: "ins",
          secondary: "ins",
          forceKind: "open",
          additionalData: { originAction: "study" },
        });
      }
      const parsed = parseCheckArgs(rawArg);
      if ("error" in parsed) {
        return {
          error:
            "Usage: /action study [attr1 attr2 [modifier]]  e.g. /action study ins wlp +1",
        };
      }
      return runCheckFromParams(context, {
        primary: parsed.primary,
        secondary: parsed.secondary,
        modifier: parsed.modifier,
        forceKind: "open",
        additionalData: { originAction: "study" },
      });
    }

    return [
      {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        speaker: context.speaker,
        kind: "action",
        action: subAction.toLowerCase(),
        ...(weaponArg ? { weapon: weaponArg } : {}),
      } as import("../types").ChatMessage,
    ];
  },
};

const COMMANDS: Command[] = [rollCommand, checkCommand, actionCommand];

const BY_NAME = new Map<string, Command>(
  COMMANDS.flatMap((cmd) =>
    [cmd.name, ...cmd.aliases].map((key) => [key, cmd] as [string, Command]),
  ),
);

export function matchCommands(prefix: string): Command[] {
  const lower = prefix.toLowerCase();
  return COMMANDS.filter((cmd) =>
    [cmd.name, ...cmd.aliases].some((k) => k.startsWith(lower)),
  );
}

// Returns the active command if the input matches "/<name> ..." with a space already typed.
export function getActiveCommand(input: string): Command | null {
  if (!input.startsWith("/")) return null;
  const spaceIdx = input.indexOf(" ");
  if (spaceIdx === -1) return null;
  const name = input.slice(1, spaceIdx).toLowerCase();
  return BY_NAME.get(name) ?? null;
}

export type CommandOutcome =
  | {
      ok: true;
      messages: ChatMessage[];
      activeBehaviorOutputs?: ActiveBehaviorOutput[];
    }
  | { ok: false; error: string };
export type CommandResult = CommandOutcome | null; // null = not a command

export function executeCommand(
  input: string,
  context: CommandContext,
): CommandResult {
  if (!input.startsWith("/")) return null;
  const spaceIdx = input.indexOf(" ");
  const rawName = spaceIdx === -1 ? input.slice(1) : input.slice(1, spaceIdx);
  const name = rawName.toLowerCase();
  const cmd = BY_NAME.get(name);
  if (!cmd) return { ok: false, error: `Unknown command: /${name}` };
  const args = spaceIdx === -1 ? "" : input.slice(spaceIdx + 1);
  const result = cmd.execute(args, context);
  if ("error" in result) return { ok: false, error: result.error };
  const activeBehaviorOutputs = [
    ...resolveActiveBehaviorOutputs(name, args, context),
    ...collectActorEffectBehaviorOutputs(context.playerDoc, context.speaker),
  ];
  return { ok: true, messages: result, activeBehaviorOutputs };
}

function resolveActiveBehaviorOutputs(
  cmdName: string,
  args: string,
  context: CommandContext,
): ActiveBehaviorOutput[] {
  if (cmdName !== "action" && cmdName !== "a") return [];
  if (!context.playerDoc) return [];

  const spaceIdx = args.indexOf(" ");
  const subAction = (
    spaceIdx === -1 ? args : args.slice(0, spaceIdx)
  ).toLowerCase();
  const rawArg = spaceIdx === -1 ? "" : args.slice(spaceIdx + 1).trim();

  if (subAction === "attack") {
    const { weaponName } = parseActionAttackArgs(rawArg);
    if (!weaponName) return [];
    const options = resolveAttackOptions(context.playerDoc);
    const weapon = options.find((o) => o.name === weaponName) as
      | ((typeof options)[number] & { behaviors?: Behavior[] })
      | undefined;
    if (!weapon) return [];
    return collectActiveBehaviorOutputs(
      weapon.behaviors,
      context.speaker,
      weapon.name,
      "weapon",
    );
  }

  if (subAction === "spell") {
    const { spellArg } = parseActionSpellArgs(rawArg);
    if (!spellArg) return [];
    const options = resolveSpellOptions(context.playerDoc);
    const spell = options.find((o) => {
      const unquoted = o.spellType ? `${o.name} ${o.spellType}` : o.name;
      return unquoted === spellArg;
    }) as ((typeof options)[number] & { behaviors?: Behavior[] }) | undefined;
    if (!spell) return [];
    return collectActiveBehaviorOutputs(
      spell.behaviors,
      context.speaker,
      spell.name,
      "spell",
    );
  }

  return [];
}

export function collectActorEffectBehaviorOutputs(
  playerDoc: Record<string, unknown> | null,
  speaker: string,
): ActiveBehaviorOutput[] {
  if (!playerDoc) return [];
  const effects = Array.isArray(playerDoc.effects) ? playerDoc.effects : [];
  const out: ActiveBehaviorOutput[] = [];
  for (const effect of effects) {
    if (!effect || typeof effect !== "object") continue;
    const e = effect as Record<string, unknown>;
    if (e.disabled === true) continue;
    const name = typeof e.name === "string" ? e.name : "Effect";
    const allBehs: Behavior[] = Array.isArray(e.behaviors)
      ? (e.behaviors as Behavior[])
      : [];
    for (const beh of allBehs) {
      if (beh.trigger && beh.trigger.kind !== "active") continue;
      const text = beh.chatOutput?.text?.trim();
      if (!text) continue;
      out.push({ speaker, itemName: name, itemType: "actor-effect", text });
    }
  }
  return out;
}
