import { describe, it, expect } from "vitest";
import { validateShieldPersisted } from "../../schema/itemSchemas/shield";

const BASE_BRONZE_SHIELD = {
  fuid: "bronze-shield",
  category: "Shield",
  name: "Bronze Shield",
  cost: 100,
  def: 2,
  mdef: 0,
  martial: false,
  init: 0,
};

function buildShieldPayload(overrides: Record<string, unknown> = {}) {
  const base = BASE_BRONZE_SHIELD;
  const qualityCost = 0;
  const cost = base.cost + qualityCost;

  return {
    itemType: "shield" as const,
    base,
    name: base.name,
    martial: base.martial,
    def: base.def,
    mdef: base.mdef,
    init: base.init,
    rework: false,
    quality: "",
    qualityCost,
    selectedQuality: "",
    cost,
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

describe("shield submit roundtrip", () => {
  it("default shield passes schema", () => {
    const payload = buildShieldPayload();
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("martial shield passes schema", () => {
    const payload = buildShieldPayload({ martial: true });
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("rework shield passes schema", () => {
    const payload = buildShieldPayload({ rework: true });
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("shield with quality and qualityCost passes schema", () => {
    const payload = buildShieldPayload({
      quality: "Antistatus",
      qualityCost: 500,
      selectedQuality: "Antistatus",
      cost: 600,
    });
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("shield with non-zero modifiers passes schema", () => {
    const payload = buildShieldPayload({
      defModifier: 1,
      mDefModifier: 1,
      initModifier: 2,
      magicModifier: -1,
      precModifier: 1,
      damageMeleeModifier: 2,
      damageRangedModifier: 2,
    });
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("qualityCost coercion: string input normalizes to number", () => {
    const payload = buildShieldPayload({
      qualityCost: "500" as unknown as number,
    });
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(typeof result.data.qualityCost).toBe("number");
    }
  });

  it("missing optional fields do not fail validation", () => {
    const payload = buildShieldPayload({
      quality: undefined,
      selectedQuality: undefined,
      cost: undefined,
    });
    const result = validateShieldPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});
