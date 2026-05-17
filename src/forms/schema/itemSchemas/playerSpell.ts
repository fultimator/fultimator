import { z } from "zod";

export const PlayerSpellTypeSchema = z.enum([
  "default",
  "gift",
  "dance",
  "therioform",
  "magichant",
  "symbol",
  "invocation",
  "arcanist",
  "arcanist-rework",
  "tinkerer-alchemy",
  "tinkerer-infusion",
  "cooking",
  "magiseed",
  "pilot-vehicle",
]);

export const PilotVehicleSubtypeSchema = z.enum([
  "frame",
  "armor",
  "weapon",
  "support",
]);

const AccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]),
});

const DamageSchema = z.object({
  value: z.number().int(),
  type: z.string(),
  hrZero: z.boolean(),
});

const WeaponModuleAccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]),
});

const WeaponModuleDamageSchema = z.object({
  value: z.number().int(),
  type: z.string(),
  hrZero: z.boolean(),
});

const CostSchema = z.object({
  resource: z.literal("mp"),
  amount: z.number().int().nonnegative(),
  perTarget: z.boolean(),
});

export const PlayerSpellDefaultSchema = z.object({
  class: z.string(),
  name: z.string().min(1),
  fuid: z.string().optional(),
  description: z.string(),
  isOffensive: z.boolean(),
  cost: CostSchema,
  maxTargets: z.number().int(),
  targetDescription: z.string(),
  duration: z.string(),
  accuracy: AccuracySchema,
  damage: DamageSchema,
  spellType: z.literal("default"),
});

const PlayerSpellNonStaticBaseSchema = z.looseObject({
  name: z.string().min(1),
  fuid: z.string().optional(),
  spellType: z.enum([
    "gift",
    "dance",
    "therioform",
    "magichant",
    "symbol",
    "invocation",
    "arcanist",
    "arcanist-rework",
    "tinkerer-alchemy",
    "tinkerer-infusion",
    "cooking",
    "magiseed",
    "pilot-vehicle",
  ]),
  effect: z.string(),
  description: z.string(),
  event: z.string(),
  genoclepsis: z.string().optional(),
  duration: z.string().optional(),
  wellspring: z.string().optional(),
  type: z.string().optional(),
  domain: z.string().optional(),
  domainDesc: z.string().optional(),
  merge: z.string().optional(),
  mergeDesc: z.string().optional(),
  dismiss: z.string().optional(),
  dismissDesc: z.string().optional(),
  pulse: z.string().optional(),
  pulseDesc: z.string().optional(),
  category: z.string().optional(),
  infusionRank: z.number().int().optional(),
});

export const PlayerSpellGiftSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("gift"),
});
export const PlayerSpellDanceSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("dance"),
});
export const PlayerSpellTherioformSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("therioform"),
  });
export const PlayerSpellSymbolSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("symbol"),
});
export const PlayerSpellInvocationSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("invocation"),
    wellspring: z.string().optional(),
    type: z.string().optional(),
  });
export const PlayerSpellArcanistSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("arcanist"),
});
export const PlayerSpellArcanistReworkSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("arcanist-rework"),
  });
export const PlayerSpellTinkererAlchemySchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("tinkerer-alchemy"),
    category: z.string().optional(),
  });
export const PlayerSpellTinkererInfusionSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("tinkerer-infusion"),
    infusionRank: z.number().int().optional(),
  });
export const PlayerSpellCookingSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("cooking"),
  cookbookEffects: z.array(
    z.object({
      id: z.number().int(),
      effect: z.string(),
      customChoices: z.record(z.unknown()),
    }),
  ),
});
export const PlayerSpellMagiseedSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("magiseed"),
  description: z.string(),
  rangeStart: z.number().int(),
  rangeEnd: z.number().int(),
  effects: z.record(z.unknown()),
});

export const PlayerSpellMagichantKeySchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("magichant"),
    magichantSubtype: z.literal("key"),
    status: z.string().optional(),
    attribute: z.string().optional(),
    recovery: z.string().optional(),
    type: z.string().optional(),
  });

export const PlayerSpellMagichantToneSchema =
  PlayerSpellNonStaticBaseSchema.extend({
    spellType: z.literal("magichant"),
    magichantSubtype: z.literal("tone"),
    type: z.string().optional(),
  });

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

export const PlayerSpellSubtypeSchemas = {
  default: PlayerSpellDefaultSchema,
  gift: PlayerSpellGiftSchema,
  dance: PlayerSpellDanceSchema,
  therioform: PlayerSpellTherioformSchema,
  "magichant-key": PlayerSpellMagichantKeySchema,
  magichant: PlayerSpellMagichantToneSchema,
  symbol: PlayerSpellSymbolSchema,
  invocation: PlayerSpellInvocationSchema,
  arcanist: PlayerSpellArcanistSchema,
  "arcanist-rework": PlayerSpellArcanistReworkSchema,
  "tinkerer-alchemy": PlayerSpellTinkererAlchemySchema,
  "tinkerer-infusion": PlayerSpellTinkererInfusionSchema,
  cooking: PlayerSpellCookingSchema,
  magiseed: PlayerSpellMagiseedSchema,
  "pilot-vehicle": PlayerSpellPilotVehicleSchema,
} as const;

export const PlayerSpellSchema = z.union(
  Object.values(PlayerSpellSubtypeSchemas) as [
    (typeof PlayerSpellSubtypeSchemas)[keyof typeof PlayerSpellSubtypeSchemas],
    ...(typeof PlayerSpellSubtypeSchemas)[keyof typeof PlayerSpellSubtypeSchemas][],
  ],
);

export type PlayerSpell = z.infer<typeof PlayerSpellSchema>;
