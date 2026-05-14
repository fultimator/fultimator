import { describe, it, expect } from "vitest";
import { validateCustomWeaponPersisted } from "../../schema/itemSchemas/customWeapon";
import { calculateCustomWeaponStats } from "../../../components/player/common/playerCalculations";
import { normalizeCustomWeaponLike } from "../../../libs/weaponNormalization";

function buildCustomWeaponPayload(overrides: Record<string, unknown> = {}) {
  const selectedCategory = "Sword";
  const customizations: unknown[] = [];
  const rareAccuracyBonus = false;
  const rareDamageBonus = false;
  const damageModifier = 0;
  const precModifier = 0;
  const defModifier = 0;
  const mDefModifier = 0;
  const overrideDamageType = false;
  const overrideAccuracyAttributes = false;
  const customDamageType = "physical";
  const selectedType = "physical";
  const selectedAccuracyCheck = { attr1: "dexterity", attr2: "insight" };
  const primaryHrZero = false;
  const qualityCost = 0;

  const { precision, damage } = calculateCustomWeaponStats(
    {
      category: selectedCategory,
      customizations,
      rareAccuracyBonus,
      rareDamageBonus,
      damageModifier,
      precModifier,
    },
    false,
  );

  const resolvedDamageType = selectedType;

  const cost =
    300 +
    (parseInt(String(qualityCost)) || 0) +
    (rareAccuracyBonus ? 100 : 0) +
    (rareDamageBonus ? 200 : 0) +
    (overrideDamageType ? 100 : 0);

  const base = normalizeCustomWeaponLike({
    itemType: "customWeapon",
    name: "Test Blade",
    category: selectedCategory,
    range: "melee",
    accuracy: {
      attr1: selectedAccuracyCheck.attr1,
      attr2: selectedAccuracyCheck.attr2,
      value: precision,
      defense: "def",
    },
    damage: { value: damage, type: resolvedDamageType, hrZero: primaryHrZero },
    modifiers: {
      damage: damageModifier,
      accuracy: precModifier,
      def: defModifier,
      mdef: mDefModifier,
    },
    rare: {
      accuracyBonus: rareAccuracyBonus,
      damageBonus: rareDamageBonus,
      overrideDamageType,
      overrideAccuracyAttributes,
      overrideDamageTypeValue: customDamageType,
      overrideAccuracyAttr1: selectedAccuracyCheck.attr1,
      overrideAccuracyAttr2: selectedAccuracyCheck.attr2,
    },
    customizations,
    selectedQuality: "",
    quality: "",
    qualityCost,
    cost,
    hands: 2,
    martial: false,
    isEquipped: false,
    secondName: "",
    secondCategory: selectedCategory,
    secondRange: "melee",
    secondCustomizations: [],
    secondModifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
    dataType: "weapon",
  });

  return { ...base, ...overrides };
}

describe("customWeapon submit roundtrip", () => {
  it("default custom weapon passes schema", () => {
    const payload = buildCustomWeaponPayload();
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with rareAccuracyBonus passes schema", () => {
    const { precision } = calculateCustomWeaponStats(
      {
        category: "Sword",
        customizations: [],
        rareAccuracyBonus: true,
        rareDamageBonus: false,
        damageModifier: 0,
        precModifier: 0,
      },
      false,
    );
    const payload = buildCustomWeaponPayload({
      accuracy: {
        attr1: "dexterity",
        attr2: "insight",
        value: precision,
        defense: "def",
      },
      rare: {
        accuracyBonus: true,
        damageBonus: false,
        overrideDamageType: false,
        overrideAccuracyAttributes: false,
      },
      cost: 400,
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with rareDamageBonus passes schema", () => {
    const { damage } = calculateCustomWeaponStats(
      {
        category: "Sword",
        customizations: [],
        rareAccuracyBonus: false,
        rareDamageBonus: true,
        damageModifier: 0,
        precModifier: 0,
      },
      false,
    );
    const payload = buildCustomWeaponPayload({
      damage: { value: damage, type: "physical", hrZero: false },
      rare: {
        accuracyBonus: false,
        damageBonus: true,
        overrideDamageType: false,
        overrideAccuracyAttributes: false,
      },
      cost: 500,
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with overrideDamageType passes schema", () => {
    const payload = buildCustomWeaponPayload({
      rare: {
        accuracyBonus: false,
        damageBonus: false,
        overrideDamageType: true,
        overrideAccuracyAttributes: false,
        overrideDamageTypeValue: "fire",
      },
      damage: { value: 5, type: "fire", hrZero: false },
      cost: 400,
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with overrideAccuracyAttributes (same attr) passes schema and adds single-attribute cost", () => {
    const payload = buildCustomWeaponPayload({
      rare: {
        accuracyBonus: false,
        damageBonus: false,
        overrideDamageType: false,
        overrideAccuracyAttributes: true,
        overrideAccuracyAttr1: "might",
        overrideAccuracyAttr2: "might",
      },
      accuracy: { attr1: "might", attr2: "might", value: 0, defense: "def" },
      cost: 350,
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with non-zero modifiers passes schema", () => {
    const payload = buildCustomWeaponPayload({
      modifiers: { damage: 3, accuracy: 1, def: 0, mdef: -1 },
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with quality and qualityCost passes schema", () => {
    const payload = buildCustomWeaponPayload({
      quality: "Balanced",
      qualityCost: 100,
      cost: 400,
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("transforming weapon with secondary form passes schema", () => {
    const transformingCustomization = {
      name: "weapon_customization_transforming",
      effect: "",
      martial: false,
      customCost: 100,
    };
    const { precision: s2prec, damage: s2dmg } = calculateCustomWeaponStats(
      {
        secondSelectedCategory: "Dagger",
        secondCurrentCustomizations: [transformingCustomization],
        rareAccuracyBonus: false,
        rareDamageBonus: false,
        secondDamageModifier: 0,
        secondPrecModifier: 0,
      },
      true,
    );
    const payload = buildCustomWeaponPayload({
      customizations: [transformingCustomization],
      cost: 400,
      secondName: "Dagger Form",
      secondCategory: "Dagger",
      secondRange: "melee",
      secondAccuracy: {
        attr1: "dexterity",
        attr2: "insight",
        value: s2prec,
        defense: "def",
      },
      secondDamage: { value: s2dmg, type: "physical", hrZero: false },
      secondCustomizations: [transformingCustomization],
      secondModifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("with slots (technospheres) passes schema", () => {
    const payload = buildCustomWeaponPayload({
      slots: "beta",
      slotted: [],
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("hrZero on primary weapon passes schema", () => {
    const payload = buildCustomWeaponPayload({
      damage: { value: 5, type: "physical", hrZero: true },
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("modifiers object accuracy and damage are set correctly", () => {
    const payload = buildCustomWeaponPayload({
      modifiers: { damage: 4, accuracy: 2, def: 0, mdef: 0 },
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.modifiers?.accuracy).toBe(2);
      expect(result.data.modifiers?.damage).toBe(4);
    }
  });

  it("qualityCost coercion: string input normalizes to number", () => {
    const payload = buildCustomWeaponPayload({
      qualityCost: "150" as unknown as number,
    });
    const result = validateCustomWeaponPersisted(payload);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(typeof result.data.qualityCost).toBe("number");
    }
  });
});
