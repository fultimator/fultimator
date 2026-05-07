import { DICE_OPTIONS } from "../constants";
import type { DieSides, RollMessage, RollResult, TextMessage } from "../types";
import type { PendingDice } from "../chatStore";

export const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const buildTextMessage = (
  text: string,
  speaker: string,
): TextMessage => ({
  id: createId(),
  createdAt: Date.now(),
  speaker,
  kind: "text",
  text,
});

export const buildRollMessage = (
  pendingDice: PendingDice,
  pendingD100: number,
  modifier: number,
  speaker: string,
): RollMessage => {
  const results: RollResult[] = DICE_OPTIONS.flatMap((sides) => {
    const count = pendingDice[sides] ?? 0;
    return Array.from({ length: count }, () => ({
      sides,
      value: Math.floor(Math.random() * sides) + 1,
    }));
  });
  for (let i = 0; i < pendingD100; i += 1) {
    results.push({ sides: 100, value: Math.floor(Math.random() * 100) + 1 });
  }
  const total = results.reduce((sum, r) => sum + r.value, 0) + modifier;
  return {
    id: createId(),
    createdAt: Date.now(),
    speaker,
    kind: "generic",
    roll: { counts: pendingDice, results, modifier, total },
  };
};
