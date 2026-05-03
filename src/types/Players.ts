import { Affinities } from "./Misc";

export type SlotTier = "alpha" | "beta" | "gamma" | "delta";

export interface Hoplosphere {
  id: string;
  name: string;
  description: string;
  coagEffects?: Record<string, string>;
  socketable: "all" | "weapon";
  requiredSlots: 1 | 2;
  cost: number;
  // changes: HoplosphereChange[] — deferred until effects system designed
}

export interface MnemosphereSkill {
  name: string;
  specialSkill?: string;
  maxLvl: number;
  currentLvl: number;
}

export interface MnemosphereHeroic {
  name: string;
  specialSkill?: string;
}

export interface MnemosphereSpell {
  name: string;
  class: string;
  duration: string;
  isOffensive: boolean;
  mpCostTarget: number;
  maxTargets: number;
  targetDescription: string;
  attr1: string;
  attr2: string;
  effect1: string;
  effect2: string;
  effect3: string;
  effect4: string;
  effect5: string;
  effect6: string;
  spellType?: string;
}

export interface Mnemosphere {
  id: string;
  class: string;
  lvl: number;
  skills: MnemosphereSkill[];
  heroic: MnemosphereHeroic[];
  spells: MnemosphereSpell[];
}

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
}

export interface PlayerAttributes {
  might: number;
  insight: number;
  will: number;
  dexterity: number;
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

export interface PlayerStatuses {
  slow: boolean;
  dazed: boolean;
  enraged: boolean;
  weak: boolean;
  shaken: boolean;
  poisoned: boolean;
}

export interface PlayerImmunities {
  slow: boolean;
  dazed: boolean;
  weak: boolean;
  shaken: boolean;
  enraged: boolean;
  poisoned: boolean;
}

export interface PlayerAffinities {
  physical: Affinities;
  wind: Affinities;
  bolt: Affinities;
  dark: Affinities;
  earth: Affinities;
  fire: Affinities;
  ice: Affinities;
  light: Affinities;
  poison: Affinities;
}

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
  name: string;
  description: string;
  currentLvl: number;
  maxLvl: number;
  specialSkill?: string;
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
  name: string;
  quote: string;
  description: string;
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
  name: string;
  type: string;
  equippedSlot: string | null;
  enabled: boolean;
  equipped: boolean;
  isShield?: boolean;
  cumbersome?: boolean;
  def?: number;
  mdef?: number;
  damage?: number;
  prec?: number;
  range?: string;
  damageType?: string;
  att1?: string;
  att2?: string;
  customName?: string;
  description?: string;
  isComplex?: boolean;
}

export interface Vehicle {
  customName: string;
  enabled: boolean;
  modules: VehicleModule[];
}

export interface Spells {
  name: string;
  class: string;
  duration: string;
  isOffensive: boolean;
  mpCostTarget: number;
  maxTargets: number;
  targetDescription: string;
  attr1: string;
  attr2: string;
  effect1: string;
  effect2: string;
  effect3: string;
  effect4: string;
  effect5: string;
  effect6: string;
  spellType?: string;
  vehicles?: Vehicle[];
  currentVehicles?: Vehicle[];
}

export interface PlayerClass {
  name: string;
  lvl: number;
  benefits: Benefits;
  skills: Skills[];
  heroic: HeroicSkills[];
  spells: Spells[];
}

export interface Weapons {
  name: string;
  quality: string;
  value: number;
  isRanged: boolean;
  isTwoHand: boolean;
  isMartial: boolean;
  isExtraPrec: boolean;
  isExtraDmg: boolean;
  isCustom: boolean;
  attr1: string;
  attr2: string;
  prec: number;
  dmg: number;
  isEquipped: boolean;
}

export interface CustomWeaponCustomization {
  name: string;
  effect: string;
  martial: boolean;
  customCost: number;
}

export interface CustomWeaponAccuracyCheck {
  att1: string;
  att2: string;
}

export interface CustomWeapons {
  name: string;
  category: string;
  range: string;
  accuracyCheck: CustomWeaponAccuracyCheck;
  type: string;
  customizations: CustomWeaponCustomization[];
  selectedQuality?: string;
  quality: string;
  qualityCost: number;
  cost?: number;
  hands?: number;
  martial?: boolean;
  isEquipped?: boolean;
  rareAccuracyBonus?: boolean;
  rareDamageBonus?: boolean;
  overrideAccuracyAttributes?: boolean;

  // Primary weapon modifiers (standard format)
  damageModifier?: number;
  precModifier?: number;
  defModifier?: number;
  mDefModifier?: number;
  overrideDamageType?: boolean;
  customDamageType?: string;

  // Secondary weapon data (for transforming weapons)
  secondWeaponName?: string;
  secondSelectedCategory?: string;
  secondSelectedRange?: string;
  secondSelectedAccuracyCheck?: CustomWeaponAccuracyCheck;
  secondSelectedType?: string;
  secondCurrentCustomizations?: CustomWeaponCustomization[];
  secondSelectedQuality?: string;
  secondQuality?: string;
  secondQualityCost?: number;

  // Secondary weapon modifiers
  secondDamageModifier?: number;
  secondPrecModifier?: number;
  secondDefModifier?: number;
  secondMDefModifier?: number;
  secondOverrideDamageType?: boolean;
  secondCustomDamageType?: string;

  // Data type identifier
  dataType?: string;

  // Technospheres
  slots?: SlotTier;
  slotted?: string[];
}

export interface Shields {
  name: string;
  quality: string;
  value: number;
  isMartial: boolean;
  def: number;
  mdef: number;
  init: number;
  isEquipped: boolean;
}

export interface Accessories {
  name: string;
  quality: string;
  value: number;
  isEquipped: boolean;
}

export interface Armor {
  name: string;
  quality: string;
  value: number;
  isMartial: boolean;
  def: number;
  mdef: number;
  init: number;
  isEquipped: boolean;

  // Technospheres
  slots?: SlotTier;
  slotted?: string[];
}

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
  name: string;
  description: string;
  value: number;
  quantity: number;
}

export interface PlayerConsumables {
  name: string;
  description: string;
  ipCost: number;
}

export interface PlayerNotes {
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
}

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
