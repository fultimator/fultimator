import { z } from "zod";

const AffinityValueSchema = z.enum(["vu", "rs", "im", "ab"]);

const NpcAffinitiesSchema = z.object({
  physical: AffinityValueSchema.optional(),
  air: AffinityValueSchema.optional(),
  bolt: AffinityValueSchema.optional(),
  dark: AffinityValueSchema.optional(),
  earth: AffinityValueSchema.optional(),
  fire: AffinityValueSchema.optional(),
  ice: AffinityValueSchema.optional(),
  light: AffinityValueSchema.optional(),
  poison: AffinityValueSchema.optional(),
});

const NpcAttributeValueSchema = z.object({
  base: z.number().int().min(6).max(12),
});

const NpcAttributesSchema = z.object({
  dexterity: NpcAttributeValueSchema,
  insight: NpcAttributeValueSchema,
  might: NpcAttributeValueSchema,
  will: NpcAttributeValueSchema,
});

const NpcImmunitiesSchema = z.object({
  slow: z.boolean().default(false),
  dazed: z.boolean().default(false),
  weak: z.boolean().default(false),
  shaken: z.boolean().default(false),
  enraged: z.boolean().default(false),
  poisoned: z.boolean().default(false),
});

const NpcExtraSchema = z.object({
  statusImmunity: z.number().int().min(0).max(3).optional(),
});

const NpcFeatureSchema = z.object({
  enabled: z.boolean(),
});

const NpcFeaturesSchema = z.object({
  init: NpcFeatureSchema.optional(),
  precision: NpcFeatureSchema.optional(),
  magic: NpcFeatureSchema.optional(),
});

const NpcResourcePoolSchema = z.object({
  current: z.number(),
  bonus: z.number(),
});

const NpcResourcesSchema = z.object({
  hp: NpcResourcePoolSchema,
  mp: NpcResourcePoolSchema,
});

const NpcDerivedStatSchema = z.object({
  bonus: z.number(),
  override: z.number().optional(),
});

const NpcDerivedSchema = z.object({
  def: NpcDerivedStatSchema,
  mdef: NpcDerivedStatSchema,
  init: z.object({ bonus: z.number() }),
});

const NpcArmorSchema = z
  .object({
    name: z.string(),
    def: z.number().optional(),
    mdef: z.number().optional(),
    init: z.number().optional(),
    martial: z.boolean().optional(),
    cost: z.number().optional(),
    category: z.string().optional(),
    fuid: z.string().optional(),
    armor: z.boolean().optional(),
  })
  .passthrough();

const AccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().optional(),
  defense: z.string().optional(),
});

const DamageSchema = z.object({
  value: z.number().optional(),
  type: z.string().optional(),
  hrZero: z.boolean().optional(),
});

const NpcAttackSchema = z
  .object({
    name: z.string(),
    range: z.enum(["melee", "ranged"]).optional(),
    accuracy: AccuracySchema.optional(),
    damage: DamageSchema.optional(),
    special: z.array(z.string()).optional(),
    extraDamage: z.boolean().optional(),
    itemType: z.string().optional(),
  })
  .passthrough();

const NpcWeaponAttackSchema = NpcAttackSchema;

const ResourceCostSchema = z.object({
  resource: z.string().optional(),
  amount: z.number().optional(),
  perTarget: z.boolean().optional(),
});

const NpcSpellSchema = z
  .object({
    name: z.string(),
    accuracy: AccuracySchema.optional(),
    isOffensive: z.boolean().optional(),
    damage: DamageSchema.optional(),
    cost: ResourceCostSchema.optional(),
    maxTargets: z.number().optional(),
    targetDescription: z.string().optional(),
    duration: z.string().optional(),
    range: z.enum(["melee", "ranged"]).optional(),
    effect: z.string().optional(),
    description: z.string().optional(),
    special: z.array(z.string()).optional(),
    itemType: z.string().optional(),
    spellType: z.string().optional(),
  })
  .passthrough();

const NpcActionSchema = z.object({
  name: z.string(),
  effect: z.string().optional(),
  spCost: z.number().optional(),
});

const NpcSpecialSchema = NpcActionSchema;

const NpcRareGearSchema = z.object({
  name: z.string(),
  effect: z.string().optional(),
});

const NpcNotesSchema = z.object({
  name: z.string(),
  effect: z.string().optional(),
});

const NpcTagsSchema = z.object({
  name: z.string(),
});

export const NpcPersistedSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  lvl: z.number().int().min(1).max(60),
  imgurl: z.string().optional(),
  traits: z.string().optional(),
  description: z.string().optional(),
  species: z.string().default("Beast"),
  rank: z.string().optional(),
  sizes: z.string().optional(),
  phases: z.number().optional(),
  villain: z.string().optional(),
  companionlvl: z.number().optional(),
  companionpclvl: z.number().optional(),
  multipart: z.string().optional(),
  attributes: NpcAttributesSchema,
  affinities: NpcAffinitiesSchema.default({}),
  immunities: NpcImmunitiesSchema.default({
    slow: false,
    dazed: false,
    weak: false,
    shaken: false,
    enraged: false,
    poisoned: false,
  }),
  extra: NpcExtraSchema.optional(),
  armor: NpcArmorSchema.optional(),
  shield: NpcArmorSchema.optional(),
  attacks: z.array(NpcAttackSchema).default([]),
  weaponattacks: z.array(NpcWeaponAttackSchema).default([]),
  spells: z.array(NpcSpellSchema).default([]),
  special: z.array(NpcSpecialSchema).default([]),
  actions: z.array(NpcActionSchema).default([]),
  notes: z.array(NpcNotesSchema).default([]),
  raregear: z.array(NpcRareGearSchema).default([]),
  label: z.string().optional(),
  tags: z.array(NpcTagsSchema).optional(),
  schemaVersion: z.number().optional(),
  createdBy: z.string().optional(),
  language: z.string().optional(),
  published: z.boolean().optional(),
  resources: NpcResourcesSchema.optional(),
  derived: NpcDerivedSchema.optional(),
  features: NpcFeaturesSchema.optional(),
});

export type NpcPersisted = z.infer<typeof NpcPersistedSchema>;

export const validateNpcPersisted = (data: unknown) =>
  NpcPersistedSchema.safeParse(data);
