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
import type {
  Attribute,
  AttackOverrides,
  ChatMessage,
  DieSides,
} from "../types";

export type CommandContext = {
  speaker: string;
  playerDoc: Record<string, unknown> | null;
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
  const modifiers =
    (params.modifier ?? 0) !== 0
      ? [{ label: "Modifier", value: params.modifier ?? 0 }]
      : [];
  const intent = prepareCheck({
    primary: params.primary,
    secondary: params.secondary,
    modifiers,
    difficulty: params.difficulty,
    additionalData: params.additionalData,
  });
  const rolls = rollCheck(dieSizes);
  const result = processCheck(intent, rolls, dieSizes, context.speaker);
  const kind =
    params.forceKind ?? (params.difficulty != null ? "attribute" : "open");
  return [
    kind === "attribute"
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
      description: "open dex ins  or  attribute dex ins [modifier] [difficulty]",
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
      const intent = prepareAccuracyCheck(
        effectiveWeapon,
        appliedAccuracyDelta !== 0
          ? [{ label: "Situational Bonus", value: appliedAccuracyDelta }]
          : [],
        {
          damageSituationalBonus: appliedDamageDelta,
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
      return [buildAccuracyCheckMessage(result)];
    }

    if (subAction.toLowerCase() === "spell" && weaponArg) {
      const options = resolveSpellOptions(context.playerDoc);
      const spell = options.find((o) => {
        const unquoted = o.spellType ? `${o.name} ${o.spellType}` : o.name;
        return unquoted === weaponArg;
      });
      if (!spell) {
        return { error: `Unknown spell "${weaponArg}".` };
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
          } as import("../types").ChatMessage,
        ];
      }
      const primary = spell.attr1 ?? "ins";
      const secondary = spell.attr2 ?? "wlp";
      const dieSizes = {
        primary: resolveAttributeDie(context.playerDoc, primary as Attribute),
        secondary: resolveAttributeDie(
          context.playerDoc,
          secondary as Attribute,
        ),
      };
      const intent = prepareMagicCheck(spell);
      const rolls = rollMagicCheck(dieSizes);
      const result = processMagicCheck(
        intent,
        rolls,
        dieSizes,
        context.speaker,
      );
      return [buildMagicCheckMessage(result)];
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
  | { ok: true; messages: ChatMessage[] }
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
  return { ok: true, messages: result };
}
