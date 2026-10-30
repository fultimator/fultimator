import { describe, it, expect } from "vitest";
import { HoplosphereSchema } from "../../schema/itemSchemas/hoplosphere";

const BASE_HOPLOSPHERE = {
  name: "Iron Shell",
  description: "A basic defensive sphere.",
  requiredSlots: 1 as const,
  socketable: "all" as const,
  cost: 200,
  coagEffects: {},
};

describe("hoplosphere schema roundtrip", () => {
  it("minimal hoplosphere passes schema", () => {
    const result = HoplosphereSchema.safeParse(BASE_HOPLOSPHERE);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("two-slot hoplosphere passes schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      requiredSlots: 2,
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("weapon-only socketable passes schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      socketable: "weapon",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("hoplosphere with coagulation effects passes schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      coagEffects: { "2": "Gain +1 DEF", "4": "Gain +2 DEF" },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.coagEffects["2"]).toBe("Gain +1 DEF");
    }
  });

  it("hoplosphere with fuid passes schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      fuid: "hop-001",
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("hoplosphere with meta source passes schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      meta: { book: "homebrew", isOfficial: false },
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("zero cost passes schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      cost: 0,
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("negative cost fails schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      cost: -1,
    });
    expect(result.success).toBe(false);
  });

  it("missing name fails schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("invalid requiredSlots value fails schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      requiredSlots: 3,
    });
    expect(result.success).toBe(false);
  });

  it("invalid socketable value fails schema", () => {
    const result = HoplosphereSchema.safeParse({
      ...BASE_HOPLOSPHERE,
      socketable: "armor",
    });
    expect(result.success).toBe(false);
  });

  it("coagEffects defaults to empty object when omitted", () => {
    const { coagEffects: _omit, ...withoutCoag } = BASE_HOPLOSPHERE;
    const result = HoplosphereSchema.safeParse(withoutCoag);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.coagEffects).toEqual({});
    }
  });
});
