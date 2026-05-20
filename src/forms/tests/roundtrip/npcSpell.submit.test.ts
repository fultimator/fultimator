import { describe, it, expect } from "vitest";
import { NpcSpellSchema } from "../../schema/itemSchemas/npcSpell";

const BASE_SPELL = {
  itemType: "spell" as const,
  name: "Blizzard",
  isOffensive: true,
  damage: { value: 8, type: "ice", hrZero: false },
  cost: { resource: "mp" as const, amount: 20, perTarget: false },
  range: "ranged" as const,
  accuracy: {
    attr1: "insight",
    attr2: "will",
    value: 0,
    defense: "mdef" as const,
  },
  effect: "",
};

describe("npc-spell schema roundtrip", () => {
  it("basic offensive spell passes schema", () => {
    const result = NpcSpellSchema.safeParse(BASE_SPELL);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("non-offensive support spell passes schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      name: "Regen",
      isOffensive: false,
      damage: { value: 0, type: "physical", hrZero: false },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("spell with perTarget cost passes schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      cost: { resource: "mp", amount: 10, perTarget: true },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("spell with maxTargets passes schema", () => {
    const result = NpcSpellSchema.safeParse({ ...BASE_SPELL, maxTargets: 3 });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("spell with duration and targetDescription passes schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      duration: "Scene",
      targetDescription: "One creature",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("spell with hrZero damage passes schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      damage: { value: 0, type: "ice", hrZero: true },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("spell with meta source passes schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      meta: { book: "core", page: 100, isOfficial: true },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("melee range spell passes schema", () => {
    const result = NpcSpellSchema.safeParse({ ...BASE_SPELL, range: "melee" });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("missing name fails schema", () => {
    const result = NpcSpellSchema.safeParse({ ...BASE_SPELL, name: "" });
    expect(result.success).toBe(false);
  });

  it("wrong itemType fails schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      itemType: "basic",
    });
    expect(result.success).toBe(false);
  });

  it("itemType is preserved as 'spell' in parsed output", () => {
    const result = NpcSpellSchema.safeParse(BASE_SPELL);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemType).toBe("spell");
    }
  });

  it("negative MP cost fails schema", () => {
    const result = NpcSpellSchema.safeParse({
      ...BASE_SPELL,
      cost: { resource: "mp", amount: -5, perTarget: false },
    });
    expect(result.success).toBe(false);
  });
});
