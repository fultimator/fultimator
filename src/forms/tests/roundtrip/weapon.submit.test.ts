import { describe, it, expect } from "vitest";
import { validateWeaponPersisted } from "../../schema/itemSchemas/weapon";
import {
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
  getWeaponAttr1,
  getWeaponAttr2,
  getWeaponRange,
  getWeaponType,
  normalizeWeaponLike,
} from "../../../libs/weaponNormalization";

const BASE_IRON_SWORD = {
  name: "Iron Sword",
  category: "Sword",
  martial: false,
  hands: 1 as const,
  cost: 100,
  accuracy: { attr1: "dexterity", attr2: "might", value: 0, defense: "def" },
  damage: { value: 0, type: "physical" },
  range: "melee",
};

function buildWeaponPayload(overrides: Record<string, unknown> = {}) {
  const base = BASE_IRON_SWORD;
  const type = getWeaponType(base) ?? "physical";
  const att1 = getWeaponAttr1(base) ?? "dexterity";
  const att2 = getWeaponAttr2(base) ?? "might";
  const hands: 1 | 2 = 1;
  const rework = false;
  const damageBonus = false;
  const damageReworkBonus = false;
  const precBonus = false;
  const qualityCost = 0;
  const precModifier = 0;
  const damageModifier = 0;
  const defModifier = 0;
  const mDefModifier = 0;

  const cost = calcWeaponCost({
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
  });
  const damage = calcWeaponDamage({
    base,
    hands,
    rework,
    damageBonus,
    damageReworkBonus,
    damageModifier,
    cost,
  });
  const prec = calcWeaponPrec({ base, rework, precBonus, precModifier });

  return normalizeWeaponLike({
    base,
    name: "Iron Sword",
    category: "Sword",
    range: getWeaponRange(base),
    type,
    hands,
    att1,
    att2,
    martial: false,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality: "",
    qualityCost,
    totalBonus: 0,
    selectedQuality: "",
    cost,
    damage: { value: damage, type, hrZero: false },
    prec,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
    isEquipped: false,
    ...overrides,
  });
}

describe("weapon submit roundtrip", () => {
  it("default base weapon passes schema", () => {
    const payload = buildWeaponPayload();
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("two-handed weapon passes schema", () => {
    const base = { ...BASE_IRON_SWORD, hands: 2 as const };
    const cost = calcWeaponCost({
      base,
      type: "physical",
      att1: "dexterity",
      att2: "might",
      rework: false,
      damageBonus: false,
      precBonus: false,
      qualityCost: 0,
    });
    const damage = calcWeaponDamage({
      base,
      hands: 2,
      rework: false,
      damageBonus: false,
      damageReworkBonus: false,
      damageModifier: 0,
      cost,
    });
    const prec = calcWeaponPrec({
      base,
      rework: false,
      precBonus: false,
      precModifier: 0,
    });
    const payload = normalizeWeaponLike({
      base,
      name: "Great Sword",
      category: "Sword",
      range: "melee",
      type: "physical",
      hands: 2,
      att1: "dexterity",
      att2: "might",
      martial: false,
      damageBonus: false,
      damageReworkBonus: false,
      precBonus: false,
      rework: false,
      quality: "",
      qualityCost: 0,
      totalBonus: 0,
      selectedQuality: "",
      cost,
      damage: { value: damage, type: "physical", hrZero: false },
      prec,
      precModifier: 0,
      damageModifier: 0,
      defModifier: 0,
      mDefModifier: 0,
      isEquipped: false,
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("rework weapon with damageReworkBonus passes schema", () => {
    const payload = buildWeaponPayload({
      rework: true,
      damageReworkBonus: true,
      totalBonus: 2,
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("weapon with quality and qualityCost passes schema", () => {
    const payload = buildWeaponPayload({
      quality: "Serrated",
      qualityCost: 200,
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("weapon with precBonus and damageBonus passes schema", () => {
    const payload = buildWeaponPayload({ precBonus: true, damageBonus: true });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("weapon with non-zero modifiers passes schema", () => {
    const payload = buildWeaponPayload({
      precModifier: 2,
      damageModifier: -1,
      defModifier: 1,
      mDefModifier: 1,
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("weapon with hrZero passes schema", () => {
    const payload = buildWeaponPayload({
      damage: { value: 6, type: "physical", hrZero: true },
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("weapon with elemental damage type passes schema", () => {
    const payload = buildWeaponPayload({
      type: "fire",
      damage: { value: 6, type: "fire", hrZero: false },
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("modifiers object is present in normalized output", () => {
    const payload = buildWeaponPayload({ precModifier: 3, damageModifier: 2 });
    const result = validateWeaponPersisted(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.modifiers?.accuracy).toBe(3);
      expect(result.data.modifiers?.damage).toBe(2);
    }
  });

  it("qualityCost coercion: string input normalizes to number", () => {
    const payload = buildWeaponPayload({
      qualityCost: "200" as unknown as number,
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(typeof result.data.qualityCost).toBe("number");
    }
  });

  it("missing optional fields do not fail validation", () => {
    const payload = buildWeaponPayload({
      quality: undefined,
      selectedQuality: undefined,
    });
    const result = validateWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });
});
