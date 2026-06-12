import { z } from "zod";
import { BehaviorSchema, EffectChangeSchema, GrantDataSchema, EffectDurationSchema, EffectPredicateSchema } from "../shared/behaviorSchemas";

const AffinityValueSchema = z.enum(["vu", "rs", "im", "ab", "no"]);

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

const NpcStatusesSchema = z.object({
  slow: z.boolean(),
  dazed: z.boolean(),
  weak: z.boolean(),
  shaken: z.boolean(),
  enraged: z.boolean(),
  poisoned: z.boolean(),
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

const ResourceDeltaSchema = z.object({
  hp: z.number(),
  mp: z.number(),
  ip: z.number(),
});

const ResourceMultiplierSchema = z.object({
  hp: z.number(),
  mp: z.number(),
  ip: z.number(),
});

const AccuracyBonusesSchema = z.object({
  all: z.number(),
  accuracyCheck: z.number(),
  melee: z.number(),
  ranged: z.number(),
  magic: z.number(),
  opposed: z.number(),
  open: z.number(),
  arcane: z.number(),
  bow: z.number(),
  brawling: z.number(),
  dagger: z.number(),
  firearm: z.number(),
  flail: z.number(),
  heavy: z.number(),
  spear: z.number(),
  sword: z.number(),
  thrown: z.number(),
});

const DamageBonusesSchema = z.object({
  all: z.number(),
  melee: z.number(),
  ranged: z.number(),
  spell: z.number(),
  arcane: z.number(),
  bow: z.number(),
  brawling: z.number(),
  dagger: z.number(),
  firearm: z.number(),
  flail: z.number(),
  heavy: z.number(),
  spear: z.number(),
  sword: z.number(),
  thrown: z.number(),
  physical: z.number(),
  air: z.number(),
  bolt: z.number(),
  dark: z.number(),
  earth: z.number(),
  fire: z.number(),
  ice: z.number(),
  light: z.number(),
  poison: z.number(),
  beast: z.number(),
  construct: z.number(),
  demon: z.number(),
  elemental: z.number(),
  humanoid: z.number(),
  monster: z.number(),
  plant: z.number(),
  undead: z.number(),
});

const NpcBonusesSchema = z.object({
  incomingRecovery: ResourceDeltaSchema,
  incomingLoss: ResourceDeltaSchema,
  outgoingRecovery: ResourceDeltaSchema,
  accuracy: AccuracyBonusesSchema,
  damage: DamageBonusesSchema,
  incomingDamage: DamageBonusesSchema,
});

const NpcMultipliersSchema = z.object({
  incomingRecovery: ResourceMultiplierSchema,
  incomingLoss: ResourceMultiplierSchema,
  outgoingRecovery: ResourceMultiplierSchema,
});

const ActorEffectSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  disabled: z.boolean().optional(),
  origin: z.string().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export const NpcArmorSchema = z
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
  .loose();

export const NpcAccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().optional(),
  defense: z.string().optional(),
});

export const NpcDamageSchema = z.object({
  value: z.number().optional(),
  type: z.string().optional(),
  hrZero: z.boolean().optional(),
});

export const NpcAttackSchema = z
  .object({
    name: z.string(),
    range: z.enum(["melee", "ranged"]).optional(),
    accuracy: NpcAccuracySchema.optional(),
    damage: NpcDamageSchema.optional(),
    effect: z.string().optional(),
    special: z.array(z.string()).optional(),
    extraDamage: z.boolean().optional(),
    itemType: z.string().optional(),
    behaviors: z.array(BehaviorSchema).optional(),
  })
  .loose();

export const NpcWeaponAttackSchema = NpcAttackSchema;

export const NpcResourceCostSchema = z.object({
  resource: z.string().optional(),
  amount: z.number().optional(),
  perTarget: z.boolean().optional(),
});

export const NpcSpellSchema = z
  .object({
    name: z.string(),
    accuracy: NpcAccuracySchema.optional(),
    isOffensive: z.boolean().optional(),
    damage: NpcDamageSchema.optional(),
    cost: NpcResourceCostSchema.optional(),
    maxTargets: z.number().optional(),
    targetDescription: z.string().optional(),
    duration: z.string().optional(),
    range: z.enum(["melee", "ranged"]).optional(),
    effect: z.string().optional(),
    description: z.string().optional(),
    special: z.array(z.string()).optional(),
    itemType: z.string().optional(),
    spellType: z.string().optional(),
    behaviors: z.array(BehaviorSchema).optional(),
  })
  .loose();

export const NpcActionSchema = z.object({
  name: z.string(),
  effect: z.string().optional(),
  spCost: z.number().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export const NpcSpecialSchema = NpcActionSchema;

export const NpcRareGearSchema = z.object({
  name: z.string(),
  effect: z.string().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export const NpcNotesSchema = z.object({
  fuid: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  effect: z.string().optional(),
});

export const NpcTagsSchema = z.object({
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
  statuses: NpcStatusesSchema.optional(),
  resources: NpcResourcesSchema.optional(),
  derived: NpcDerivedSchema.optional(),
  features: NpcFeaturesSchema.optional(),
  bonuses: NpcBonusesSchema.optional(),
  multipliers: NpcMultipliersSchema.optional(),
  effects: z.array(ActorEffectSchema).optional(),
});

export type NpcPersisted = z.infer<typeof NpcPersistedSchema>;
export type NpcArmor = z.infer<typeof NpcArmorSchema>;
export type NpcAttack = z.infer<typeof NpcAttackSchema>;
export type NpcWeaponAttack = z.infer<typeof NpcWeaponAttackSchema>;
export type NpcSpell = z.infer<typeof NpcSpellSchema>;
export type NpcAction = z.infer<typeof NpcActionSchema>;
export type NpcSpecial = z.infer<typeof NpcSpecialSchema>;
export type NpcRareGear = z.infer<typeof NpcRareGearSchema>;
export type NpcNotes = z.infer<typeof NpcNotesSchema>;
export type NpcTags = z.infer<typeof NpcTagsSchema>;

export const validateNpcPersisted = (data: unknown) =>
  NpcPersistedSchema.safeParse(data);
