import { buildRollMessage } from "./rolls";
import {
  prepareCheck,
  rollCheck,
  processCheck,
  buildCheckMessage,
} from "./checks";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "./accuracy-checks";
import { resolveAttributeDie, resolveAttackOptions } from "./speakers";
import type { Attribute, ChatMessage, DieSides } from "../types";

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

const checkCommand: Command = {
  name: "check",
  aliases: ["c"],
  description: "Roll an attribute check",
  params: [
    {
      name: "attr1 attr2",
      description: "dex ins (valid: dex, ins, mig, wlp)",
      required: true,
    },
  ],
  execute(args, context) {
    if (!context.playerDoc) {
      return { error: "Switch to a character speaker to roll a check." };
    }
    const parts = args.trim().toLowerCase().split(/\s+/);
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return { error: "Usage: /check <attr1> <attr2>  e.g. /check dex ins" };
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
    const primary = a1 as Attribute;
    const secondary = a2 as Attribute;
    const dieSizes = {
      primary: resolveAttributeDie(context.playerDoc, primary),
      secondary: resolveAttributeDie(context.playerDoc, secondary),
    };
    const modifiers =
      modifier !== 0 ? [{ label: "Modifier", value: modifier }] : [];
    const intent = prepareCheck({ primary, secondary, modifiers, difficulty });
    const rolls = rollCheck(dieSizes);
    const result = processCheck(intent, rolls, dieSizes, context.speaker);
    return [buildCheckMessage(result)];
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
    const weaponArg =
      rawArg.startsWith('"') && rawArg.endsWith('"')
        ? rawArg.slice(1, -1)
        : rawArg || undefined;

    if (subAction.toLowerCase() === "attack" && weaponArg) {
      const options = resolveAttackOptions(context.playerDoc);
      const weapon = options.find((o) => o.name === weaponArg);
      if (!weapon) {
        return { error: `Unknown weapon "${weaponArg}".` };
      }
      const primary = weapon.attr1 ?? "dex";
      const secondary = weapon.attr2 ?? "ins";
      const dieSizes = {
        primary: resolveAttributeDie(context.playerDoc, primary as Attribute),
        secondary: resolveAttributeDie(
          context.playerDoc,
          secondary as Attribute,
        ),
      };
      const intent = prepareAccuracyCheck(weapon);
      const rolls = rollAccuracyCheck(dieSizes);
      const result = processAccuracyCheck(
        intent,
        rolls,
        dieSizes,
        context.speaker,
      );
      return [buildAccuracyCheckMessage(result)];
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
