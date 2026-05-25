import { z } from "zod";
import {
  WeaponPersistedSchema,
  type WeaponPersisted,
} from "../itemSchemas/weapon";
import {
  CustomWeaponPersistedSchema,
  type CustomWeaponPersisted,
} from "../itemSchemas/customWeapon";
import {
  ShieldPersistedSchema,
  type ShieldPersisted,
} from "../itemSchemas/shield";
import {
  AccessoryPersistedSchema,
  type AccessoryPersisted,
} from "../itemSchemas/accessory";
import {
  ArmorPersistedSchema,
  type ArmorPersisted,
} from "../itemSchemas/armor";
import { HoplosphereSchema } from "../itemSchemas/hoplosphere";
import { MnemosphereSchema } from "../itemSchemas/mnemosphere";
import { PassiveSchema } from "../shared/behaviorSchemas";
import {
  PlayerSkillSchema,
  HeroicSkillSchema,
  ClassBenefitsSchema,
  PlayerClassSchema,
} from "../itemSchemas/class";
import { ItemSchema } from "../itemSchemas/item";
import { ConsumableSchema } from "../itemSchemas/consumable";
import { NoteSchema } from "../itemSchemas/note";

const PlayerStatusesSchema = z.object({
  slow: z.boolean().default(false),
  dazed: z.boolean().default(false),
  weak: z.boolean().default(false),
  shaken: z.boolean().default(false),
  enraged: z.boolean().default(false),
  poisoned: z.boolean().default(false),
});

const PlayerImmunitiesSchema = PlayerStatusesSchema;

const AffinityValueSchema = z.enum(["vu", "rs", "im", "ab", "no"]);
const PlayerAffinitiesSchema = z.object({
  physical: AffinityValueSchema.default("no"),
  air: AffinityValueSchema.default("no"),
  bolt: AffinityValueSchema.default("no"),
  dark: AffinityValueSchema.default("no"),
  earth: AffinityValueSchema.default("no"),
  fire: AffinityValueSchema.default("no"),
  ice: AffinityValueSchema.default("no"),
  light: AffinityValueSchema.default("no"),
  poison: AffinityValueSchema.default("no"),
});

const ActorAttributeValueSchema = z.object({
  base: z.number().int(),
});

const PlayerAttributesSchema = z.object({
  might: ActorAttributeValueSchema,
  insight: ActorAttributeValueSchema,
  willpower: ActorAttributeValueSchema,
  dexterity: ActorAttributeValueSchema,
});

const StatValuesSchema = z.object({
  base: z.number().int(),
  current: z.number().int(),
});

const PlayerStatsSchema = z.object({
  hp: StatValuesSchema,
  mp: StatValuesSchema,
  ip: StatValuesSchema,
});

const BondSchema = z.object({
  name: z.string(),
  admiration: z.boolean().default(false),
  loyality: z.boolean().default(false),
  affection: z.boolean().default(false),
  inferiority: z.boolean().default(false),
  mistrust: z.boolean().default(false),
  hatred: z.boolean().default(false),
});

const PlayerInfoSchema = z.object({
  pronouns: z.string().default(""),
  identity: z.string().default(""),
  theme: z.string().default(""),
  origin: z.string().default(""),
  bonds: z.array(BondSchema).default([]),
  description: z.string().default(""),
  fabulapoints: z.number().int().default(0),
  exp: z.number().int().default(0),
  zenit: z.number().int().default(0),
  imgurl: z.string().default(""),
});

const PlayerModifiersSchema = z.object({
  hp: z.number().default(0),
  mp: z.number().default(0),
  ip: z.number().default(0),
  def: z.number().default(0),
  mdef: z.number().default(0),
  init: z.number().default(0),
  meleePrec: z.number().default(0),
  rangedPrec: z.number().default(0),
  magicPrec: z.number().default(0),
});

const MartialsSchema = z.object({
  armor: z.boolean().default(false),
  shields: z.boolean().default(false),
  melee: z.boolean().default(false),
  ranged: z.boolean().default(false),
});

const RitualsSchema = z.object({
  ritualism: z.boolean().default(false),
  arcanism: z.boolean().default(false),
  chimerism: z.boolean().default(false),
  elementalism: z.boolean().default(false),
  entropism: z.boolean().default(false),
  spiritism: z.boolean().default(false),
});

const SlotRefSchema = z.object({
  source: z.enum([
    "weapons",
    "customWeapons",
    "shields",
    "armor",
    "accessories",
  ]),
  name: z.string(),
  index: z.number().int().optional(),
});

const EquippedSlotsSchema = z.object({
  mainHand: SlotRefSchema.nullable().optional(),
  offHand: SlotRefSchema.nullable().optional(),
  armor: SlotRefSchema.nullable().optional(),
  accessory: SlotRefSchema.nullable().optional(),
});

const VehicleModuleRefSchema = z.object({
  vehicleName: z.string(),
  moduleName: z.string(),
});

const VehicleSlotsSchema = z.object({
  mainHand: VehicleModuleRefSchema.nullable().optional(),
  offHand: VehicleModuleRefSchema.nullable().optional(),
  armor: VehicleModuleRefSchema.nullable().optional(),
  accessory: VehicleModuleRefSchema.nullable().optional(),
  support: z.array(VehicleModuleRefSchema.nullable()).optional(),
});

const PlayerSettingsSchema = z.object({
  defaultView: z.enum(["compact", "normal"]).optional(),
  advancement: z.boolean().optional(),
  automaticClassLevel: z.boolean().optional(),
  autoEquipUnarmed: z.boolean().optional(),
  defaultUnarmedStrikeRef: SlotRefSchema.optional(),
  optionalRules: z
    .object({
      quirks: z.boolean().optional(),
      campActivities: z.boolean().optional(),
      zeroPower: z.boolean().optional(),
      technospheres: z.boolean().optional(),
      technospheresVariant: z.string().optional(),
      innateClasses: z.array(z.string()).optional(),
    })
    .optional(),
  specialSkillOverrides: z.record(z.string(), z.literal(true)).optional(),
});

const ActorResourcePoolSchema = z.object({
  current: z.number(),
  bonus: z.number(),
});

const ActorResourcesSchema = z.object({
  hp: ActorResourcePoolSchema,
  mp: ActorResourcePoolSchema,
});

const ActorDerivedStatSchema = z.object({
  bonus: z.number(),
  override: z.number().optional(),
});

const ActorDerivedSchema = z.object({
  def: ActorDerivedStatSchema,
  mdef: ActorDerivedStatSchema,
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

const ActorBonusesSchema = z.object({
  incomingRecovery: ResourceDeltaSchema,
  incomingLoss: ResourceDeltaSchema,
  outgoingRecovery: ResourceDeltaSchema,
  accuracy: AccuracyBonusesSchema,
  damage: DamageBonusesSchema,
  incomingDamage: DamageBonusesSchema,
});

const ActorMultipliersSchema = z.object({
  incomingRecovery: ResourceMultiplierSchema,
  incomingLoss: ResourceMultiplierSchema,
  outgoingRecovery: ResourceMultiplierSchema,
});

const ActorEffectSchema = PassiveSchema.omit({ transfer: true }).extend({
  origin: z.string().optional(),
});

const PlayerEquipmentSchema = z.object({
  weapons: z.array(WeaponPersistedSchema).default([]),
  customWeapons: z.array(CustomWeaponPersistedSchema).default([]),
  shields: z.array(ShieldPersistedSchema).default([]),
  accessories: z.array(AccessoryPersistedSchema).default([]),
  armor: z.array(ArmorPersistedSchema).default([]),
  mnemospheres: z.array(MnemosphereSchema).optional(),
  hoplospheres: z.array(HoplosphereSchema).optional(),
  mnemoReceptacle: z.array(z.string()).optional(),
});

export const PlayerPersistedSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  lvl: z.number().int().min(1).max(60),
  info: PlayerInfoSchema,
  attributes: PlayerAttributesSchema,
  stats: PlayerStatsSchema,
  statuses: PlayerStatusesSchema,
  immunities: PlayerImmunitiesSchema,
  affinities: PlayerAffinitiesSchema,
  classes: z.array(PlayerClassSchema).default([]),
  equipment: z.array(PlayerEquipmentSchema).default([]),
  martials: MartialsSchema,
  rituals: RitualsSchema,
  items: z.array(ItemSchema).default([]),
  consumables: z.array(ConsumableSchema).default([]),
  notes: z.array(NoteSchema).default([]),
  modifiers: PlayerModifiersSchema,
  equippedSlots: EquippedSlotsSchema.optional(),
  vehicleSlots: VehicleSlotsSchema.optional(),
  settings: PlayerSettingsSchema.optional(),
  schemaVersion: z.number().optional(),
  resources: ActorResourcesSchema.optional(),
  derived: ActorDerivedSchema.optional(),
  bonuses: ActorBonusesSchema.optional(),
  multipliers: ActorMultipliersSchema.optional(),
  effects: z.array(ActorEffectSchema).optional(),
});

export type Weapon = WeaponPersisted;
export type CustomWeapon = CustomWeaponPersisted;
export type Shield = ShieldPersisted;
export type Accessory = AccessoryPersisted;
export type Armor = ArmorPersisted;

export type PlayerPersisted = z.infer<typeof PlayerPersistedSchema>;
export type Bond = z.infer<typeof BondSchema>;
export type PlayerInfo = z.infer<typeof PlayerInfoSchema>;
export type PlayerAttributes = z.infer<typeof PlayerAttributesSchema>;
export type StatValues = z.infer<typeof StatValuesSchema>;
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;
export type Benefits = z.infer<typeof ClassBenefitsSchema>;
export type Skills = z.infer<typeof PlayerSkillSchema>;
export type HeroicSkills = z.infer<typeof HeroicSkillSchema>;
export type PlayerClass = z.infer<typeof PlayerClassSchema>;
export type PlayerModifiers = z.infer<typeof PlayerModifiersSchema>;
export type Martials = z.infer<typeof MartialsSchema>;
export type Rituals = z.infer<typeof RitualsSchema>;
export type PlayerItems = z.infer<typeof ItemSchema>;
export type PlayerConsumables = z.infer<typeof ConsumableSchema>;
export type PlayerNotes = z.infer<typeof NoteSchema>;
export type PlayerEquipment = z.infer<typeof PlayerEquipmentSchema>;
export type SlotRef = z.infer<typeof SlotRefSchema>;
export type EquippedSlots = z.infer<typeof EquippedSlotsSchema>;
export type VehicleModuleRef = z.infer<typeof VehicleModuleRefSchema>;
export type VehicleSlots = z.infer<typeof VehicleSlotsSchema>;
export type PlayerSettings = z.infer<typeof PlayerSettingsSchema>;

export const validatePlayerPersisted = (data: unknown) =>
  PlayerPersistedSchema.safeParse(data);
