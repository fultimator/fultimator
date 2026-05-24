import { describe, it, expect } from "vitest";
import {
  WeaponSchema,
  WeaponPersistedSchema,
  validateWeapon,
  validateWeaponPersisted,
  normalizeWeapon,
} from "../../schema/itemSchemas/weapon";
import { ITEM_FIELD_PARITY } from "../../schema/fieldParity";
import {
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
  RESTRICTED_ONE_HANDED_CATEGORIES,
  normalizeWeaponLike,
} from "../../../libs/weaponNormalization";

function sortKeys(keys: readonly string[]): string[] {
  return [...keys].sort();
}

// Fixtures

const BASE_SWORD = {
  fuid: "iron-sword",
  name: "Iron Sword",
  category: "Sword",
  cost: 100,
  hands: 1,
  range: "melee",
  martial: false,
  accuracy: { attr1: "dexterity", attr2: "might", value: 0, defense: "def" },
  damage: { value: 0, type: "physical", hrZero: false },
};

const VALID_WEAPON = {
  itemType: "weapon",
  name: "Iron Sword",
  category: "Sword",
  range: "melee",
  hands: 1,
  martial: false,
  accuracy: { attr1: "dexterity", attr2: "might", value: 0, defense: "def" },
  damage: { value: 0, type: "physical", hrZero: false },
};

// WeaponSchema - valid payloads

describe("WeaponSchema - valid payloads", () => {
  it("accepts a minimal valid weapon", () => {
    const result = validateWeapon(VALID_WEAPON);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields when present", () => {
    const result = validateWeapon({
      ...VALID_WEAPON,
      cost: 100,
      quality: "Fine",
      special: ["two-handed"],
      modifiers: { damage: 2, accuracy: 0, def: 0, mdef: 0 },
      rare: { accuracyBonus: false, damageBonus: true },
    });
    expect(result.success).toBe(true);
  });

  it("accepts ranged hands:2 weapon", () => {
    const result = validateWeapon({
      ...VALID_WEAPON,
      range: "ranged",
      hands: 2,
      category: "Bow",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all damage element types", () => {
    const elements = [
      "physical",
      "air",
      "bolt",
      "dark",
      "earth",
      "fire",
      "ice",
      "light",
      "poison",
      "untyped",
    ];
    for (const type of elements) {
      const result = validateWeapon({
        ...VALID_WEAPON,
        damage: { value: 0, type, hrZero: false },
      });
      expect(result.success, `element '${type}' should be valid`).toBe(true);
    }
  });
});

// WeaponSchema - invalid payloads

describe("WeaponSchema - invalid payloads", () => {
  it("rejects missing itemType", () => {
    const { itemType: _, ...noItemType } = VALID_WEAPON;
    expect(validateWeapon(noItemType).success).toBe(false);
  });

  it("rejects wrong itemType", () => {
    expect(validateWeapon({ ...VALID_WEAPON, itemType: "spell" }).success).toBe(
      false,
    );
  });

  it("rejects empty name", () => {
    expect(validateWeapon({ ...VALID_WEAPON, name: "" }).success).toBe(false);
  });

  it("rejects invalid range", () => {
    expect(validateWeapon({ ...VALID_WEAPON, range: "thrown" }).success).toBe(
      false,
    );
  });

  it("rejects invalid hands value", () => {
    expect(validateWeapon({ ...VALID_WEAPON, hands: 3 }).success).toBe(false);
  });

  it("rejects unknown damage type", () => {
    expect(
      validateWeapon({
        ...VALID_WEAPON,
        damage: { value: 0, type: "arcane", hrZero: false },
      }).success,
    ).toBe(false);
  });

  it("rejects unknown accuracy attribute", () => {
    expect(
      validateWeapon({
        ...VALID_WEAPON,
        accuracy: {
          attr1: "charisma",
          attr2: "might",
          value: 0,
          defense: "def",
        },
      }).success,
    ).toBe(false);
  });
});

// normalizeWeapon - defaults

describe("normalizeWeapon - defaults", () => {
  it("applies default hrZero=false when omitted", () => {
    const weapon = normalizeWeapon({
      ...VALID_WEAPON,
      damage: { value: 0, type: "physical" },
    });
    expect(weapon.damage.hrZero).toBe(false);
  });

  it("applies default defense='def' when omitted", () => {
    const weapon = normalizeWeapon({
      ...VALID_WEAPON,
      accuracy: { attr1: "dexterity", attr2: "might", value: 0 },
    });
    expect(weapon.accuracy.defense).toBe("def");
  });

  it("applies default martial=false when omitted", () => {
    const { martial: _, ...noMartial } = VALID_WEAPON;
    const weapon = normalizeWeapon(noMartial);
    expect(weapon.martial).toBe(false);
  });
});

describe("weapon field parity", () => {
  it("keeps QuickCreate/Create/Edit key sets identical", () => {
    const { quickCreate, create, edit } = ITEM_FIELD_PARITY.weapon;
    expect(sortKeys(quickCreate)).toEqual(sortKeys(create));
    expect(sortKeys(quickCreate)).toEqual(sortKeys(edit));
  });

  it("keeps parity keys aligned with WeaponPersistedSchema", () => {
    const schemaKeys = sortKeys(Object.keys(WeaponPersistedSchema.shape));
    const parityKeys = sortKeys(ITEM_FIELD_PARITY.weapon.quickCreate);
    expect(parityKeys).toEqual(schemaKeys);
  });
});

// calcWeaponCost

describe("calcWeaponCost", () => {
  const base = { ...BASE_SWORD };
  const defaults = {
    base,
    type: "physical",
    att1: "dexterity",
    att2: "might",
    rework: false,
    damageBonus: false,
    precBonus: false,
    qualityCost: 0,
  };

  it("returns base cost for unmodified weapon", () => {
    expect(calcWeaponCost(defaults)).toBe(100);
  });

  it("adds 100 for non-physical damage type", () => {
    expect(calcWeaponCost({ ...defaults, type: "fire" })).toBe(200);
  });

  it("adds 50 when both attributes are the same and different from base", () => {
    expect(
      calcWeaponCost({ ...defaults, att1: "insight", att2: "insight" }),
    ).toBe(150);
  });

  it("adds 200 for damageBonus (no rework)", () => {
    expect(calcWeaponCost({ ...defaults, damageBonus: true })).toBe(300);
  });

  it("does not add damageBonus cost when rework is true", () => {
    expect(
      calcWeaponCost({ ...defaults, damageBonus: true, rework: true }),
    ).toBe(100);
  });

  it("adds qualityCost", () => {
    expect(calcWeaponCost({ ...defaults, qualityCost: 200 })).toBe(300);
  });
});

// calcWeaponDamage

describe("calcWeaponDamage", () => {
  const base = {
    ...BASE_SWORD,
    damage: { value: 6, type: "physical", hrZero: false },
  };
  const defaults = {
    base,
    hands: 1,
    rework: false,
    damageBonus: false,
    damageReworkBonus: false,
    damageModifier: 0,
    cost: 100,
  };

  it("returns base damage unmodified", () => {
    expect(calcWeaponDamage(defaults)).toBe(6);
  });

  it("adds +4 when upgrading 1-handed to 2-handed for unrestricted category", () => {
    expect(calcWeaponDamage({ ...defaults, hands: 2 })).toBe(10);
  });

  it("does NOT add +4 for restricted categories going 1→2 handed", () => {
    for (const category of RESTRICTED_ONE_HANDED_CATEGORIES) {
      const restrictedBase = { ...base, category };
      expect(
        calcWeaponDamage({ ...defaults, base: restrictedBase, hands: 2 }),
        `${category} should not gain +4`,
      ).toBe(6);
    }
  });

  it("subtracts 4 when downgrading 2-handed to 1-handed", () => {
    const twoHandBase = { ...base, hands: 2 };
    expect(calcWeaponDamage({ ...defaults, base: twoHandBase, hands: 1 })).toBe(
      2,
    );
  });

  it("adds +4 for damageBonus (no rework)", () => {
    expect(calcWeaponDamage({ ...defaults, damageBonus: true })).toBe(10);
  });

  it("applies damageModifier", () => {
    expect(calcWeaponDamage({ ...defaults, damageModifier: 3 })).toBe(9);
  });

  it("adds rework bonus based on cost/1000", () => {
    expect(
      calcWeaponDamage({
        ...defaults,
        rework: true,
        damageReworkBonus: true,
        cost: 2000,
      }),
    ).toBe(10);
  });
});

// calcWeaponPrec

describe("calcWeaponPrec", () => {
  const base0 = {
    ...BASE_SWORD,
    accuracy: { ...BASE_SWORD.accuracy, value: 0 },
  };
  const base1 = {
    ...BASE_SWORD,
    accuracy: { ...BASE_SWORD.accuracy, value: 1 },
  };

  it("returns base prec unmodified", () => {
    expect(
      calcWeaponPrec({
        base: base0,
        rework: false,
        precBonus: false,
        precModifier: 0,
      }),
    ).toBe(0);
  });

  it("sets prec to 1 when precBonus=true and base prec != 1 (no rework)", () => {
    expect(
      calcWeaponPrec({
        base: base0,
        rework: false,
        precBonus: true,
        precModifier: 0,
      }),
    ).toBe(1);
  });

  it("does not change prec to 1 when base prec is already 1 (no rework)", () => {
    expect(
      calcWeaponPrec({
        base: base1,
        rework: false,
        precBonus: true,
        precModifier: 0,
      }),
    ).toBe(1);
  });

  it("sets prec to 2 when rework=true, base prec=1, precBonus=true", () => {
    expect(
      calcWeaponPrec({
        base: base1,
        rework: true,
        precBonus: true,
        precModifier: 0,
      }),
    ).toBe(2);
  });

  it("sets prec to 1 when rework=true, base prec=0, precBonus=true", () => {
    expect(
      calcWeaponPrec({
        base: base0,
        rework: true,
        precBonus: true,
        precModifier: 0,
      }),
    ).toBe(1);
  });

  it("applies precModifier", () => {
    expect(
      calcWeaponPrec({
        base: base0,
        rework: false,
        precBonus: false,
        precModifier: 2,
      }),
    ).toBe(2);
  });
});

// Real shapes from the pre-refactor modal: flat att1/att2, damage as number,
// melee/ranged booleans. normalizeWeaponLike must map these to the nested schema.

const LEGACY_UNARMED: Record<string, unknown> = {
  base: {
    category: "Brawling",
    name: "Unarmed Strike",
    cost: 0,
    att1: "dexterity",
    att2: "might",
    prec: 0,
    damage: 0,
    type: "physical",
    hands: 1,
    melee: true,
    martial: false,
  },
  name: "Unarmed Strike",
  category: "Brawling",
  melee: true,
  ranged: false,
  type: "physical",
  hands: 1,
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
  cost: 0,
  damage: 0,
  prec: 0,
  damageModifier: 0,
  precModifier: 0,
  defModifier: 0,
  mDefModifier: 0,
  isEquipped: false,
};

const LEGACY_CROSSBOW: Record<string, unknown> = {
  base: {
    category: "Bow",
    name: "Crossbow",
    cost: 150,
    att1: "dexterity",
    att2: "insight",
    prec: 0,
    damage: 8,
    type: "physical",
    hands: 2,
    ranged: true,
    martial: false,
  },
  name: "Precise Crossbow",
  category: "Bow",
  melee: false,
  ranged: true,
  type: "physical",
  hands: 2,
  att1: "dexterity",
  att2: "insight",
  martial: false,
  damageBonus: false,
  damageReworkBonus: false,
  precBonus: true,
  rework: false,
  quality: "Masterwork",
  qualityCost: "200",
  totalBonus: 0,
  selectedQuality: "masterwork",
  cost: 450,
  damage: 8,
  prec: 1,
  damageModifier: 0,
  precModifier: 0,
  defModifier: 0,
  mDefModifier: 0,
  isEquipped: true,
};

const LEGACY_REWORK_SWORD: Record<string, unknown> = {
  base: {
    category: "Sword",
    name: "Iron Sword",
    cost: 100,
    att1: "dexterity",
    att2: "might",
    prec: 0,
    damage: 8,
    type: "physical",
    hands: 1,
    melee: true,
    martial: false,
  },
  name: "Rework Iron Sword",
  category: "Sword",
  melee: true,
  ranged: false,
  type: "fire",
  hands: 1,
  att1: "insight",
  att2: "insight",
  martial: true,
  damageBonus: false,
  damageReworkBonus: true,
  precBonus: false,
  rework: true,
  quality: "",
  qualityCost: 0,
  totalBonus: 0,
  selectedQuality: "",
  cost: 250,
  damage: 8,
  prec: 0,
  damageModifier: 2,
  precModifier: 0,
  defModifier: 1,
  mDefModifier: 0,
  isEquipped: false,
};

describe("legacy fixture compatibility", () => {
  it("normalizes and validates legacy unarmed strike", () => {
    const result = validateWeaponPersisted(normalizeWeaponLike(LEGACY_UNARMED));
    expect(result.success).toBe(true);
  });

  it("normalizes and validates legacy ranged weapon with precBonus and string qualityCost", () => {
    const result = validateWeaponPersisted(
      normalizeWeaponLike(LEGACY_CROSSBOW),
    );
    expect(result.success).toBe(true);
  });

  it("normalizes and validates legacy rework weapon with type change and modifiers", () => {
    const result = validateWeaponPersisted(
      normalizeWeaponLike(LEGACY_REWORK_SWORD),
    );
    expect(result.success).toBe(true);
  });

  it("legacy melee:true maps to range:'melee'", () => {
    const result = validateWeaponPersisted(normalizeWeaponLike(LEGACY_UNARMED));
    expect(result.success && result.data.range).toBe("melee");
  });

  it("legacy ranged:true maps to range:'ranged'", () => {
    const result = validateWeaponPersisted(
      normalizeWeaponLike(LEGACY_CROSSBOW),
    );
    expect(result.success && result.data.range).toBe("ranged");
  });

  it("legacy flat att1/att2 map to accuracy.attr1/attr2", () => {
    const result = validateWeaponPersisted(
      normalizeWeaponLike(LEGACY_CROSSBOW),
    );
    expect(result.success && result.data.accuracy.attr1).toBe("dexterity");
    expect(result.success && result.data.accuracy.attr2).toBe("insight");
  });

  it("legacy flat damage number maps to damage.value", () => {
    const result = validateWeaponPersisted(
      normalizeWeaponLike(LEGACY_CROSSBOW),
    );
    expect(result.success && result.data.damage.value).toBe(8);
  });

  it("legacy flat modifiers map to modifiers object", () => {
    const result = validateWeaponPersisted(
      normalizeWeaponLike(LEGACY_REWORK_SWORD),
    );
    expect(result.success && result.data.modifiers?.damage).toBe(2);
    expect(result.success && result.data.modifiers?.def).toBe(1);
  });
});
