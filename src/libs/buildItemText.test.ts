import { describe, it, expect } from "vitest";
import { buildItemText } from "./buildItemText";
import { calcMP } from "./npcs";

describe("buildItemText attribute formatting", () => {
  it("formats NPC attributes without [object Object]", () => {
    const npc = {
      name: "Goblin",
      lvl: 5,
      species: "Humanoid",
      attributes: {
        dexterity: { base: 8 },
        insight: { base: 6 },
        might: { base: 10 },
        willpower: { base: 8 },
      },
    };
    const text = buildItemText("npc", npc, "markdown");
    expect(text).toContain("**DEX** d8");
    expect(text).toContain("**INS** d6");
    expect(text).toContain("**MIG** d10");
    expect(text).toContain("**WLP** d8");
    expect(text).not.toContain("[object Object]");
  });

  it("formats Obsidian statblock attributes without [object Object]", () => {
    const npc = {
      name: "Goblin",
      lvl: 5,
      species: "Humanoid",
      attributes: {
        dexterity: { base: 8 },
        insight: { base: 6 },
        might: { base: 10 },
        willpower: { base: 8 },
      },
    };
    const text = buildItemText("npc", npc, "obsidian");
    expect(text).toContain("DEX: 8");
    expect(text).toContain("INS: 6");
    expect(text).toContain("MIG: 10");
    expect(text).toContain("WLP: 8");
    expect(text).not.toContain("[object Object]");
  });

  it("formats PC attributes without [object Object]", () => {
    const pc = {
      name: "Hero",
      attributes: {
        dexterity: { base: 8 },
        insight: { base: 10 },
        might: { base: 6 },
        willpower: { base: 8 },
      },
      info: {},
      stats: {
        hp: { base: 40, current: 40 },
        mp: { base: 30, current: 30 },
        ip: { base: 6, current: 6 },
      },
    };
    const text = buildItemText("pc", pc, "markdown");
    expect(text).toContain("**DEX** d8");
    expect(text).toContain("**INS** d10");
    expect(text).toContain("**MIG** d6");
    expect(text).toContain("**WLP** d8");
    expect(text).not.toContain("[object Object]");
  });
});

describe("calcMP backwards compatibility", () => {
  it("calculates MP with modern willpower { base }", () => {
    const npc = { lvl: 5, attributes: { willpower: { base: 10 } } };
    expect(calcMP(npc as never)).toBe(55); // 5 + 5 * 10
  });

  it("calculates MP with legacy will { base }", () => {
    const npc = { lvl: 5, attributes: { will: { base: 10 } } };
    expect(calcMP(npc as never)).toBe(55);
  });

  it("calculates MP with direct number attributes", () => {
    const npc = { lvl: 5, attributes: { will: 10 } };
    expect(calcMP(npc as never)).toBe(55);
  });
});
