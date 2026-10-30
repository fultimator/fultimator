import { describe, it, expect } from "vitest";
import { validateArmorPersisted } from "../../schema/itemSchemas/armor";

const BASE_COMBAT_TUNIC = {
  fuid: "combat-tunic",
  category: "Armor",
  name: "Combat Tunic",
  cost: 150,
  def: 1,
  mdef: 1,
  armor: true,
  martial: false,
  init: 0,
};

function buildArmorPayload(overrides: Record<string, unknown> = {}) {
  const base = BASE_COMBAT_TUNIC;
  const qualityCost = 0;
  const cost = base.cost + qualityCost;

  return {
    itemType: "armor" as const,
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
    isSlotsVariant: false,
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

describe("armor submit roundtrip", () => {
  it("default armor passes schema", () => {
    const payload = buildArmorPayload();
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("martial armor passes schema", () => {
    const payload = buildArmorPayload({ martial: true });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("rework armor passes schema", () => {
    const payload = buildArmorPayload({ rework: true });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("armor with quality and qualityCost passes schema", () => {
    const payload = buildArmorPayload({
      quality: "Antistatus",
      qualityCost: 500,
      selectedQuality: "Antistatus",
      cost: 650,
    });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("armor with slots variant passes schema", () => {
    const payload = buildArmorPayload({
      isSlotsVariant: true,
      slots: "beta",
      slotted: [],
    });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("armor with slotted spheres passes schema", () => {
    const payload = buildArmorPayload({
      isSlotsVariant: true,
      slots: "gamma",
      slotted: ["sphere-id-1", "sphere-id-2"],
    });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("armor with non-zero modifiers passes schema", () => {
    const payload = buildArmorPayload({
      defModifier: 2,
      mDefModifier: 1,
      initModifier: -1,
      magicModifier: 1,
      precModifier: 1,
      damageMeleeModifier: 2,
      damageRangedModifier: 2,
    });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("qualityCost coercion: string input normalizes to number", () => {
    const payload = buildArmorPayload({
      qualityCost: "500" as unknown as number,
    });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(typeof result.data.qualityCost).toBe("number");
    }
  });

  it("missing optional fields do not fail validation", () => {
    const payload = buildArmorPayload({
      quality: undefined,
      selectedQuality: undefined,
      cost: undefined,
    });
    const result = validateArmorPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});
