import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema, WeaponModuleAccuracySchema, WeaponModuleDamageSchema } from "./shared";
import { PilotVehicleSubtypeSchema } from "./types";

const PlayerSpellPilotVehicleBaseSchema = PlayerSpellNonStaticBaseSchema.extend(
  {
    spellType: z.literal("pilot-vehicle"),
    pilotSubtype: PilotVehicleSubtypeSchema,
    customName: z.string(),
    enabled: z.boolean(),
    equipped: z.boolean(),
    equippedSlot: z.string().nullable(),
  },
);

export const PlayerSpellPilotVehicleFrameSchema =
  PlayerSpellPilotVehicleBaseSchema.extend({
    pilotSubtype: z.literal("frame"),
    frame: z.string(),
    passengers: z.number().int(),
    distance: z.number().int(),
    description: z.string(),
  });

export const PlayerSpellPilotVehicleArmorSchema =
  PlayerSpellPilotVehicleBaseSchema.extend({
    pilotSubtype: z.literal("armor"),
    name: z.literal("pilot_custom_armor"),
    type: z.literal("pilot_module_armor"),
    category: z.literal("Armor"),
    cost: z.number().int(),
    def: z.number().int(),
    mdef: z.number().int(),
    martial: z.boolean(),
    description: z.string().optional(),
  });

export const PlayerSpellPilotVehicleWeaponSchema =
  PlayerSpellPilotVehicleBaseSchema.extend({
    pilotSubtype: z.literal("weapon"),
    name: z.literal("pilot_custom_weapon"),
    type: z.literal("pilot_module_weapon"),
    category: z.string(),
    cost: z.number().int(),
    accuracy: WeaponModuleAccuracySchema,
    damage: WeaponModuleDamageSchema,
    range: z.string(),
    cumbersome: z.boolean(),
    quality: z.string(),
    qualityCost: z.number().int(),
    isShield: z.boolean(),
    equippedSlot: z.literal("main"),
  });

export const PlayerSpellPilotVehicleSupportSchema =
  PlayerSpellPilotVehicleBaseSchema.extend({
    pilotSubtype: z.literal("support"),
    name: z.literal("pilot_custom_support"),
    type: z.literal("pilot_module_support"),
    description: z.string(),
    isComplex: z.literal(true),
    cost: z.number().int(),
  });

export const PlayerSpellPilotVehicleSchema = z.union([
  PlayerSpellPilotVehicleFrameSchema,
  PlayerSpellPilotVehicleArmorSchema,
  PlayerSpellPilotVehicleWeaponSchema,
  PlayerSpellPilotVehicleSupportSchema,
]);
