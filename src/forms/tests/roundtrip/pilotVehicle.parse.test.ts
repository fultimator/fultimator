import { describe, it, expect } from "vitest";
import {
  PlayerSpellPilotVehicleSchema,
  VehicleSchema,
  VehicleModuleArmorSchema,
  VehicleModuleWeaponSchema,
  VehicleModuleSupportSchema,
} from "../../schema/itemSchemas/spells/pilotVehicle";

const ARMOR_MODULE = {
  type: "pilot_module_armor" as const,
  key: "pilot_module_standard_plating",
  customName: "",
  cost: 500,
  category: "Armor" as const,
  def: 11,
  mdef: 10,
  martial: true,
};

const WEAPON_MODULE = {
  type: "pilot_module_weapon" as const,
  key: "pilot_module_flamer",
  customName: "",
  cost: 500,
  category: "Firearm",
  range: "Melee",
  cumbersome: false,
  isShield: false,
  takesTwoHands: false,
  quality: "",
  qualityCost: 0,
  accuracy: { attr1: "dexterity", attr2: "insight", value: 0, defense: "def" as const },
  damage: { value: 10, type: "fire", hrZero: false },
};

const SUPPORT_MODULE = {
  type: "pilot_module_support" as const,
  key: "pilot_module_secondary_offensive",
  customName: "",
  cost: 0,
  isComplex: false,
};

const FULL_VEHICLE = {
  key: "my_vehicle",
  customName: "Magitek Armor",
  frame: "pilot_frame_mecha",
  description: "",
  enabled: true,
  maxEnabledModules: 3,
  slots: {
    main: "pilot_module_flamer",
    off: null,
    armor: "pilot_module_standard_plating",
    support: ["pilot_module_secondary_offensive"],
  },
  modules: [ARMOR_MODULE, WEAPON_MODULE, SUPPORT_MODULE],
};

describe("PlayerSpellPilotVehicleSchema roundtrip", () => {
  it("parses the full v11 example JSON", () => {
    const result = PlayerSpellPilotVehicleSchema.safeParse({
      name: "Pilot Spell",
      spellType: "pilot-vehicle",
      showInPlayerSheet: true,
      vehicles: [FULL_VEHICLE],
    });
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("vehicles[0].modules parses to the three expected module types", () => {
    const result = PlayerSpellPilotVehicleSchema.safeParse({
      spellType: "pilot-vehicle",
      vehicles: [FULL_VEHICLE],
      name: "Pilot Spell",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const modules = result.data.vehicles[0].modules;
    expect(modules).toHaveLength(3);
    expect(modules[0].type).toBe("pilot_module_armor");
    expect(modules[1].type).toBe("pilot_module_weapon");
    expect(modules[2].type).toBe("pilot_module_support");
  });

  it("vehicles[0].slots roundtrips correctly", () => {
    const result = PlayerSpellPilotVehicleSchema.safeParse({
      name: "Pilot Spell",
      spellType: "pilot-vehicle",
      vehicles: [FULL_VEHICLE],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const slots = result.data.vehicles[0].slots;
    expect(slots.main).toBe("pilot_module_flamer");
    expect(slots.off).toBeNull();
    expect(slots.armor).toBe("pilot_module_standard_plating");
    expect(slots.support).toEqual(["pilot_module_secondary_offensive"]);
  });

  it("default values fill in on a minimal vehicle", () => {
    const result = PlayerSpellPilotVehicleSchema.safeParse({
      name: "Pilot Spell",
      spellType: "pilot-vehicle",
      vehicles: [{ frame: "pilot_frame_exoskeleton" }],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const v = result.data.vehicles[0];
    expect(v.customName).toBe("");
    expect(v.description).toBe("");
    expect(v.enabled).toBe(false);
    expect(v.maxEnabledModules).toBe(3);
    expect(v.modules).toEqual([]);
    expect(v.slots).toEqual({ main: null, off: null, armor: null, support: [] });
  });

  it("empty vehicles array is valid", () => {
    const result = PlayerSpellPilotVehicleSchema.safeParse({
      name: "Pilot Spell",
      spellType: "pilot-vehicle",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.vehicles).toEqual([]);
    expect(result.data.showInPlayerSheet).toBe(true);
  });

  it("rejects wrong spellType", () => {
    const result = PlayerSpellPilotVehicleSchema.safeParse({
      spellType: "default",
      vehicles: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("VehicleModuleArmorSchema", () => {
  it("parses a valid armor module", () => {
    const result = VehicleModuleArmorSchema.safeParse(ARMOR_MODULE);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("rejects wrong type discriminant", () => {
    const result = VehicleModuleArmorSchema.safeParse({
      ...ARMOR_MODULE,
      type: "pilot_module_weapon",
    });
    expect(result.success).toBe(false);
  });
});

describe("VehicleModuleWeaponSchema", () => {
  it("parses a valid weapon module", () => {
    const result = VehicleModuleWeaponSchema.safeParse(WEAPON_MODULE);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("defaults cumbersome/isShield/takesTwoHands to false", () => {
    const { cumbersome: _c, isShield: _s, takesTwoHands: _t, ...minimal } = WEAPON_MODULE;
    const result = VehicleModuleWeaponSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.cumbersome).toBe(false);
    expect(result.data.isShield).toBe(false);
    expect(result.data.takesTwoHands).toBe(false);
  });
});

describe("VehicleModuleSupportSchema", () => {
  it("parses a valid support module", () => {
    const result = VehicleModuleSupportSchema.safeParse(SUPPORT_MODULE);
    expect(result.success, JSON.stringify(result)).toBe(true);
  });

  it("defaults isComplex to false", () => {
    const { isComplex: _ic, ...minimal } = SUPPORT_MODULE;
    const result = VehicleModuleSupportSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.isComplex).toBe(false);
  });
});

describe("VehicleSchema", () => {
  it("parses vehicle with optional fuid on modules", () => {
    const result = VehicleSchema.safeParse({
      ...FULL_VEHICLE,
      modules: [{ ...ARMOR_MODULE, fuid: "standard-plating" }],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.modules[0].fuid).toBe("standard-plating");
  });

  it("slots defaults to empty when omitted", () => {
    const { slots: _s, ...noSlots } = FULL_VEHICLE;
    const result = VehicleSchema.safeParse(noSlots);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.slots).toEqual({ main: null, off: null, armor: null, support: [] });
  });
});
