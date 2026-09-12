import { z } from "zod";
import {
  PlayerSpellNonStaticBaseSchema,
  WeaponModuleAccuracySchema,
  WeaponModuleDamageSchema,
} from "./shared";

const VehicleSlotsSchema = z.object({
  main: z.string().nullable().default(null),
  off: z.string().nullable().default(null),
  armor: z.string().nullable().default(null),
  support: z.array(z.string()).default([]),
});

const VehicleModuleBaseSchema = z.object({
  fuid: z.string().optional(),
  key: z.string(),
  customName: z.string().default(""),
  cost: z.number().int().default(500),
});

export const VehicleModuleArmorSchema = VehicleModuleBaseSchema.extend({
  type: z.literal("pilot_module_armor"),
  category: z.literal("Armor"),
  def: z.number().int(),
  mdef: z.number().int(),
  martial: z.boolean(),
  description: z.string().optional(),
});

export const VehicleModuleWeaponSchema = VehicleModuleBaseSchema.extend({
  type: z.literal("pilot_module_weapon"),
  category: z.string(),
  range: z.string(),
  cumbersome: z.boolean().default(false),
  isShield: z.boolean().default(false),
  takesTwoHands: z.boolean().default(false),
  quality: z.string().default(""),
  qualityCost: z.number().int().default(0),
  accuracy: WeaponModuleAccuracySchema,
  damage: WeaponModuleDamageSchema,
});

export const VehicleModuleSupportSchema = VehicleModuleBaseSchema.extend({
  type: z.literal("pilot_module_support"),
  cost: z.number().int().default(1000),
  description: z.string().optional(),
  isComplex: z.boolean().default(false),
});

export const VehicleModuleSchema = z.discriminatedUnion("type", [
  VehicleModuleArmorSchema,
  VehicleModuleWeaponSchema,
  VehicleModuleSupportSchema,
]);

export const VehicleSchema = z.object({
  key: z.string().optional(),
  customName: z.string().default(""),
  frame: z.string(),
  description: z.string().default(""),
  enabled: z.boolean().default(false),
  maxEnabledModules: z.number().int().default(3),
  slots: VehicleSlotsSchema.default({
    main: null,
    off: null,
    armor: null,
    support: [],
  }),
  modules: z.array(VehicleModuleSchema).default([]),
});

export const PlayerSpellPilotVehicleSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("pilot-vehicle"),
    showInPlayerSheet: z.boolean().default(true),
    vehicles: z.array(VehicleSchema).default([]),
  });
