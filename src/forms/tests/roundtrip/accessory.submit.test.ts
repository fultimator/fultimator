import { describe, it, expect } from "vitest";
import { validateAccessoryPersisted } from "../../schema/itemSchemas/accessory";

function buildAccessoryPayload(overrides: Record<string, unknown> = {}) {
  return {
    itemType: "accessory" as const,
    name: "Magic Ring",
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    cost: 0,
    defModifier: 0,
    mDefModifier: 0,
    initModifier: 0,
    magicModifier: 0,
    precModifier: 0,
    damageMeleeModifier: 0,
    damageRangedModifier: 0,
    isEquipped: false,
    ...overrides,
  };
}

describe("accessory submit roundtrip", () => {
  it("default accessory passes schema", () => {
    const payload = buildAccessoryPayload();
    const result = validateAccessoryPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("accessory with quality and qualityCost passes schema", () => {
    const payload = buildAccessoryPayload({
      quality: "Resistance",
      qualityCost: 700,
      selectedQuality: "Resistance",
      cost: 700,
    });
    const result = validateAccessoryPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("accessory with non-zero modifiers passes schema", () => {
    const payload = buildAccessoryPayload({
      defModifier: 1,
      mDefModifier: 2,
      initModifier: -1,
      magicModifier: 1,
      precModifier: 1,
      damageMeleeModifier: 2,
      damageRangedModifier: 2,
    });
    const result = validateAccessoryPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("qualityCost coercion: string input normalizes to number", () => {
    const payload = buildAccessoryPayload({
      qualityCost: "500" as unknown as number,
    });
    const result = validateAccessoryPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(typeof result.data.qualityCost).toBe("number");
    }
  });

  it("missing optional fields do not fail validation", () => {
    const payload = buildAccessoryPayload({
      quality: undefined,
      selectedQuality: undefined,
      cost: undefined,
    });
    const result = validateAccessoryPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("equipped accessory passes schema", () => {
    const payload = buildAccessoryPayload({ isEquipped: true });
    const result = validateAccessoryPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});
