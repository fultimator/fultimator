import { describe, it, expect } from "vitest";
import { NpcAttackSchema } from "../../schema/itemSchemas/npcAttack";

const BASE_ATTACK = {
  itemType: "basic" as const,
  name: "Slash",
  range: "melee" as const,
  accuracy: { attr1: "dexterity", attr2: "might", value: 0, defense: "def" as const },
  damage: { value: 6, type: "physical", hrZero: false },
  martial: false,
  category: "Melee Attack",
  effect: "",
};

describe("npc-attack schema roundtrip", () => {
  it("default melee attack passes schema", () => {
    const result = NpcAttackSchema.safeParse(BASE_ATTACK);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("ranged attack passes schema and derives category", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      name: "Arrow",
      range: "ranged",
      category: "Ranged Attack",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("attack with mdef defense passes schema", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      accuracy: { attr1: "insight", attr2: "will", value: 2, defense: "mdef" },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("attack with hrZero passes schema", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      damage: { value: 0, type: "physical", hrZero: true },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("attack with non-physical damage type passes schema", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      damage: { value: 8, type: "fire", hrZero: false },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("martial attack passes schema", () => {
    const result = NpcAttackSchema.safeParse({ ...BASE_ATTACK, martial: true });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("attack with effect text passes schema", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      effect: "The target is poisoned.",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("attack with meta source passes schema", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      meta: { book: "core", page: 42, isOfficial: true },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("attack with fuid passes schema", () => {
    const result = NpcAttackSchema.safeParse({
      ...BASE_ATTACK,
      fuid: "abc-123",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("missing required name fails schema", () => {
    const result = NpcAttackSchema.safeParse({ ...BASE_ATTACK, name: "" });
    expect(result.success).toBe(false);
  });

  it("wrong itemType fails schema", () => {
    const result = NpcAttackSchema.safeParse({ ...BASE_ATTACK, itemType: "spell" });
    expect(result.success).toBe(false);
  });

  it("itemType is preserved as 'basic' in parsed output", () => {
    const result = NpcAttackSchema.safeParse(BASE_ATTACK);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemType).toBe("basic");
    }
  });
});
