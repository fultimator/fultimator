import { describe, expect, it } from "vitest";
import {
  accuracyModifiersFromEffects,
  isActorInCrisis,
} from "./effect-modifiers";
import type { TypeNpc } from "../../../../../types/Npcs";

function npc(currentHp: number): TypeNpc {
  return {
    lvl: 10,
    resources: {
      hp: { current: currentHp, bonus: 0 },
      mp: { current: 50, bonus: 0 },
    },
    attributes: {
      might: { base: 8 },
      insight: { base: 8 },
      will: { base: 8 },
      dexterity: { base: 8 },
    },
    effects: [
      {
        id: "crisis-aim",
        name: "Crisis Aim",
        behaviors: [
          {
            id: "crisis-aim-beh",
            name: "Crisis Aim",
            trigger: { kind: "passive" },
            predicate: { crisisInteraction: "active" },
            changes: [{ key: "bonuses.accuracy.all", mode: 2, value: "2" }],
          },
        ],
      },
    ],
  } as unknown as TypeNpc;
}

describe("accuracyModifiersFromEffects", () => {
  it("derives NPC crisis from current resources and calculated max HP", () => {
    expect(isActorInCrisis(npc(30))).toBe(true);
    expect(isActorInCrisis(npc(31))).toBe(false);
  });

  it("applies crisis-gated accuracy modifiers for NPCs in crisis", () => {
    expect(accuracyModifiersFromEffects(npc(30))).toEqual([
      { label: "All", value: 2 },
    ]);
    expect(accuracyModifiersFromEffects(npc(31))).toEqual([]);
  });

  it("allows callers to override derived crisis state", () => {
    expect(accuracyModifiersFromEffects(npc(31), { inCrisis: true })).toEqual([
      { label: "All", value: 2 },
    ]);
  });
});
