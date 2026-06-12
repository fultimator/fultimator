import {
  ResourceCost,
  Accuracy,
  Damage,
  ActorAttributeValue,
  ActorAffinities,
  ActorImmunities,
  ActorStatuses,
  ActorResources,
  ActorDerived,
} from "./Misc";
import type { ActorBonuses, ActorMultipliers } from "./Bonuses";
import type { Behavior, ActorEffect } from "./Effects";
import type { Hoplosphere } from "../forms/schema/itemSchemas/hoplosphere";
import type { Mnemosphere } from "../forms/schema/itemSchemas/mnemosphere";
import type { PlayerPersisted as PlayerPersistedSchemaType } from "../forms/schema/actorSchemas/pc";
import type {
  SlotRef as CanonicalSlotRef,
  EquippedSlots as CanonicalEquippedSlots,
  VehicleModuleRef as CanonicalVehicleModuleRef,
  VehicleSlots as CanonicalVehicleSlots,
} from "../forms/schema/actorSchemas/pc";
import type {
  Weapon as EquipmentWeapon,
  CustomWeapon as EquipmentCustomWeapon,
  CustomWeaponCustomization,
  SlotTier,
  EquipmentShield,
  EquipmentAccessory,
  EquipmentArmor,
} from "./Equipment";

export type { SlotTier, CustomWeaponCustomization };

export type { Hoplosphere } from "../forms/schema/itemSchemas/hoplosphere";
export type { Mnemosphere } from "../forms/schema/itemSchemas/mnemosphere";
export type {
  Skill as MnemosphereSkill,
  HeroicSkill as MnemosphereHeroic,
} from "../forms/schema/itemSchemas/class";
export type { PlayerSpell as MnemosphereSpell } from "../forms/schema/itemSchemas/spells";

export interface Bonds {
  name: string;
  admiration: boolean;
  loyality: boolean;
  affection: boolean;
  inferiority: boolean;
  mistrust: boolean;
  hatred: boolean;
}

export interface PlayerInfo {
  pronouns: string;
  identity: string;
  theme: string;
  origin: string;
  bonds: Bonds[];
  description: string;
  fabulapoints: number;
  exp: number;
  zenit: number;
  imgurl: string;
  mnemoLevelsSpent?: number;
}

export interface PlayerAttributes {
  might: ActorAttributeValue;
  insight: ActorAttributeValue;
  willpower: ActorAttributeValue;
  dexterity: ActorAttributeValue;
}

export interface StatValues {
  base: number;
  current: number;
}

export interface PlayerStats {
  hp: StatValues;
  mp: StatValues;
  ip: StatValues;
}

export type PlayerStatuses = ActorStatuses;

export type PlayerImmunities = ActorImmunities;

export type PlayerAffinities = ActorAffinities;

export interface OtherBenefits {
  description: string;
}

export interface Benefits {
  hpplus: number;
  mpplus: number;
  ipplus: number;
  other: OtherBenefits[];
}

export interface Skills {
  fuid?: string;
  name: string;
  description: string;
  currentLvl: number;
  maxLvl: number;
  specialSkill?: string;
  behaviors?: Behavior[];
}

export interface PlayerModifiers {
  hp: number;
  mp: number;
  ip: number;
  def: number;
  mdef: number;
  init: number;
  meleePrec: number;
  rangedPrec: number;
  magicPrec: number;
}

export interface HeroicSkills {
  fuid?: string;
  name: string;
  quote: string;
  description: string;
  book?: string;
  behaviors?: Behavior[];
}

export interface PlayerSettings {
  defaultView?: "compact" | "normal";
  advancement?: boolean;
  automaticClassLevel?: boolean;
  autoEquipUnarmed?: boolean;
  defaultUnarmedStrikeRef?: SlotRef;
  optionalRules?: {
    quirks?: boolean;
    campActivities?: boolean;
    zeroPower?: boolean;
    technospheres?: boolean;
    technospheresVariant?: string;
    innateClasses?: string[];
  };
  specialSkillOverrides?: Record<string, true>;
}

export interface VehicleModule {
  fuid?: string;
  name: string;
  key?: string;
  type: string;
  equippedSlot: string | null;
  enabled: boolean;
  equipped: boolean;
  isShield?: boolean;
  cumbersome?: boolean;
  def?: number;
  mdef?: number;
  damage?: Damage;
  accuracy?: Accuracy;
  range?: string;
  customName?: string;
  description?: string;
  isComplex?: boolean;
}

export interface Vehicle {
  frame?: string;
  customName: string;
  enabled: boolean;
  maxEnabledModules?: number;
  slots?: {
    main: string | null;
    off: string | null;
    armor: string | null;
    support: string[];
  };
  modules: VehicleModule[];
}

export interface Spells {
  fuid?: string;
  name: string;
  book?: string;
  class: string;
  duration: string;
  isOffensive: boolean;
  cost: ResourceCost;
  maxTargets: number;
  targetDescription: string;
  accuracy: Accuracy;
  effect1: string;
  effect2: string;
  effect3: string;
  effect4: string;
  effect5: string;
  effect6: string;
  description: string;
  special: string[];
  range: "melee" | "ranged";
  itemType: "spell";
  damage?: Damage;
  spellType?: string;
  vehicles?: Vehicle[];
  currentVehicles?: Vehicle[];
  behaviors?: Behavior[];
}

export interface PlayerClass {
  fuid?: string;
  name: string;
  lvl: number;
  benefits: Benefits;
  skills: Skills[];
  heroic: HeroicSkills[];
  spells: Spells[];
}

export type Weapons = EquipmentWeapon & {
  quality?: string;
  value?: number;
  isTwoHand?: boolean;
  isCustom?: boolean;
  isEquipped?: boolean;
};

export type CustomWeapons = EquipmentCustomWeapon & {
  selectedQuality?: string;
  isEquipped?: boolean;
  // Data type identifier
  dataType?: string;
};

export type Shields = EquipmentShield;

export type Accessories = EquipmentAccessory;

export type Armor = EquipmentArmor;

export interface PlayerEquipment {
  weapons: Weapons[];
  customWeapons: CustomWeapons[];
  shields: Shields[];
  accessories: Accessories[];
  armor: Armor[];
  mnemospheres?: Mnemosphere[];
  hoplospheres?: Hoplosphere[];
  mnemoReceptacle?: string[];
}

export type AnyEquipmentItem =
  | Weapons
  | CustomWeapons
  | Armor
  | Shields
  | Accessories;

export interface Martials {
  armor: boolean;
  shields: boolean;
  melee: boolean;
  ranged: boolean;
}

export interface Rituals {
  ritualism: boolean;
  arcanism: boolean;
  chimerism: boolean;
  elementalism: boolean;
  entropism: boolean;
  spiritism: boolean;
}

export interface PlayerItems {
  fuid?: string;
  name: string;
  description: string;
  value: number;
  quantity: number;
}

export interface PlayerConsumables {
  fuid?: string;
  name: string;
  description: string;
  ipCost: number;
}

export interface PlayerNotes {
  fuid?: string;
  name: string;
  description: string;
}

export interface TypePlayer {
  id: string;
  uid: string;
  name: string;
  lvl: number;
  info: PlayerInfo;
  attributes: PlayerAttributes;
  stats: PlayerStats;
  statuses: PlayerStatuses;
  immunities: PlayerImmunities;
  affinities: PlayerAffinities;
  classes: PlayerClass[];
  equipment: PlayerEquipment[];
  martials: Martials;
  rituals: Rituals;
  items: PlayerItems[];
  consumables: PlayerConsumables[];
  notes: PlayerNotes[];
  modifiers: PlayerModifiers;
  equippedSlots?: EquippedSlots;
  vehicleSlots?: VehicleSlots;
  settings?: PlayerSettings;
  schemaVersion?: number;
  resources?: ActorResources;
  derived?: ActorDerived;
  bonuses?: ActorBonuses;
  multipliers?: ActorMultipliers;
  effects?: ActorEffect[];
}

// Canonical schema-derived player type
export type PlayerCanonical = PlayerPersistedSchemaType;

export type EquipmentSource =
  | "weapons"
  | "customWeapons"
  | "shields"
  | "armor"
  | "accessories";

/** Points to a player inventory item by its array name + item display name.
 *  `index` disambiguates when two items share the same name. */
export interface SlotRef {
  source: EquipmentSource;
  name: string;
  index?: number;
}

/** Named equipment slots on the player's body. */
export interface EquippedSlots {
  mainHand?: SlotRef | null;
  offHand?: SlotRef | null;
  armor?: SlotRef | null;
  accessory?: SlotRef | null;
}

/** Points to a module by the vehicle's customName and the module's name field. */
export interface VehicleModuleRef {
  vehicleName: string;
  moduleName: string;
}

/**
 * Cached slot state derived from the active vehicle's modules.
 * Re-derived whenever a module's enabled/equipped state changes.
 * mainHand/offHand/armor override the matching player slot when non-null.
 * accessory are always available.
 * support are vehicle-only (never override player slots).
 */
export interface VehicleSlots {
  mainHand?: VehicleModuleRef | null;
  offHand?: VehicleModuleRef | null;
  armor?: VehicleModuleRef | null;
  accessory?: VehicleModuleRef | null;
  support?: (VehicleModuleRef | null)[];
}

export type CanonicalSlotRefType = CanonicalSlotRef;
export type CanonicalEquippedSlotsType = CanonicalEquippedSlots;
export type CanonicalVehicleModuleRefType = CanonicalVehicleModuleRef;
export type CanonicalVehicleSlotsType = CanonicalVehicleSlots;
