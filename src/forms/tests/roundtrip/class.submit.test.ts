import { describe, it, expect } from "vitest";
import { ClassSchema } from "../../schema/itemSchemas/class";

const BASE_CLASS = {
  name: "Wayfarer",
  book: "homebrew",
  benefits: {
    hpplus: 0,
    mpplus: 0,
    ipplus: 0,
    isCustomBenefit: false,
    martials: { armor: false, shields: false, melee: false, ranged: false },
    rituals: { ritualism: false },
    custom: [],
    spellClasses: [],
  },
  skills: [],
};

describe("class schema roundtrip", () => {
  it("minimal class passes schema", () => {
    const result = ClassSchema.safeParse(BASE_CLASS);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with HP/MP/IP bonuses passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      benefits: { ...BASE_CLASS.benefits, hpplus: 2, mpplus: 3, ipplus: 1 },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with martial benefits passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      benefits: {
        ...BASE_CLASS.benefits,
        martials: { armor: true, shields: true, melee: true, ranged: false },
      },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with ritual benefit passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      benefits: {
        ...BASE_CLASS.benefits,
        rituals: { ritualism: true },
      },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with spellClasses passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      benefits: {
        ...BASE_CLASS.benefits,
        spellClasses: ["Elementalist", "Entropist"],
      },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with skills array passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      skills: [
        {
          fuid: "sk-001",
          name: "Wanderer",
          maxLvl: 5,
          description: "Move fast.",
          specialSkill: "",
        },
        {
          name: "Pathfinder",
          maxLvl: 3,
          description: "Find paths.",
          specialSkill: "",
        },
      ],
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.skills).toHaveLength(2);
    }
  });

  it("class with custom benefit passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      benefits: {
        ...BASE_CLASS.benefits,
        isCustomBenefit: true,
        custom: [{ label: "+2 to Accuracy checks", value: true }],
      },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with meta source passes schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      meta: { book: "core", page: 55, isOfficial: true },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("class with fuid passes schema", () => {
    const result = ClassSchema.safeParse({ ...BASE_CLASS, fuid: "cls-001" });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("missing name fails schema", () => {
    const result = ClassSchema.safeParse({ ...BASE_CLASS, name: "" });
    expect(result.success).toBe(false);
  });

  it("skill maxLvl out of range fails schema", () => {
    const result = ClassSchema.safeParse({
      ...BASE_CLASS,
      skills: [{ name: "Bad", maxLvl: 11, description: "", specialSkill: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("skills default to empty array when omitted", () => {
    const { skills: _omit, ...withoutSkills } = BASE_CLASS;
    const result = ClassSchema.safeParse(withoutSkills);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual([]);
    }
  });
});
