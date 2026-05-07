import { buildRollMessage } from "./rolls";
import type { ChatMessage, DieSides } from "../types";

export type CommandContext = {
  speaker: string;
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
      description: "e.g. 2d6+1d8+2",
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

const COMMANDS: Command[] = [rollCommand];

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
