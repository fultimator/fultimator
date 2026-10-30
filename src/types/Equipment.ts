import type { Accuracy, Damage, Attributes, Elements } from "./Misc";
import type { Behavior } from "./Effects";
import type { Meta } from "../forms/schema/meta";

export type SlotTier = "alpha" | "beta" | "gamma" | "delta";

export interface CustomWeaponCustomization {
  name: string;
  effect: string;
  martial: boolean;
  customCost: number;
}

export interface WeaponModifiers {
  damage?: number;
  accuracy?: number;
  def?: number;
  mdef?: number;
}

export interface WeaponRare {
  accuracyBonus?: boolean;
  damageBonus?: boolean;
}

export interface CustomWeaponRare extends WeaponRare {
  overrideDamageType?: boolean;
  overrideAccuracyAttributes?: boolean;
  overrideDamageTypeValue?: Elements;
  overrideAccuracyAttr1?: Attributes;
  overrideAccuracyAttr2?: Attributes;
}

export interface Weapon {
  id?: string;
  fuid?: string;
  itemType: "weapon";
  name: string;
  description?: string;
  book?: string;
  category: string;
  range: "melee" | "ranged";
  hands: 1 | 2;
  martial: boolean;
  accuracy: Accuracy;
  damage: Damage;
  modifiers?: WeaponModifiers;
  rare?: WeaponRare;
  quality?: string;
  cost?: number;
  special?: string[];
  meta?: Meta;
}

export interface CustomWeapon {
  id?: string;
  fuid?: string;
  itemType: "customWeapon";
  name: string;
  description?: string;
  book?: string;
  category: string;
  range: "melee" | "ranged";
  hands: 1 | 2;
  martial: boolean;
  accuracy: Accuracy;
  damage: Damage;
  modifiers?: WeaponModifiers;
  rare?: CustomWeaponRare;
  customizations: CustomWeaponCustomization[];
  quality?: string;
  qualityName?: string;
  qualityCost?: number;
  cost?: number;
  slots?: SlotTier;
  slotted?: string[];
  secondName?: string;
  secondCategory?: string;
  secondRange?: "melee" | "ranged";
  secondAccuracy?: Accuracy;
  secondDamage?: Damage;
  secondModifiers?: WeaponModifiers;
  secondCustomizations?: CustomWeaponCustomization[];
  meta?: Meta;
}

export interface NpcAttack {
  id?: string;
  fuid?: string;
  itemType?: "attack";
  name: string;
  description?: string;
  range: "melee" | "ranged";
  accuracy: Accuracy;
  damage: Damage;
  effect?: string;
  extraDamage?: boolean;
  behaviors?: Behavior[];
}

export interface NpcWeaponAttack {
  id?: string;
  fuid?: string;
  itemType?: "weaponAttack";
  name: string;
  description?: string;
  range: "melee" | "ranged";
  accuracy: Accuracy;
  damage: Damage;
  effect?: string;
  extraDamage?: boolean;
  behaviors?: Behavior[];
}

export interface DefensiveModifiers {
  def?: number;
  mdef?: number;
  init?: number;
  magic?: number;
  // Canonical nested precision key.
  accuracy?: number;
  /** @deprecated Use modifiers.accuracy. */
  prec?: number;
  damageMelee?: number;
  damageRanged?: number;
}

export interface EquipmentArmor {
  id?: string;
  fuid?: string;
  itemType?: "armor";
  name: string;
  description?: string;
  book?: string;
  category?: "Armor" | string;
  quality?: string;
  selectedQuality?: string;
  qualityCost?: number;
  /** @deprecated Legacy display-price alias. Use cost. */
  value?: number;
  // Canonical persisted price field.
  cost?: number;
  // Canonical proficiency flag.
  martial?: boolean;
  /** @deprecated Legacy alias. Use martial. */
  isMartial?: boolean;
  def: number;
  mdef: number;
  init: number;
  /** @deprecated Legacy bonus-era field. Canonical effective value is def. */
  defbonus?: number;
  /** @deprecated Legacy bonus-era field. Canonical effective value is mdef. */
  mdefbonus?: number;
  rework?: boolean;
  modifiers?: DefensiveModifiers;
  defModifier?: number;
  mDefModifier?: number;
  initModifier?: number;
  magicModifier?: number;
  precModifier?: number;
  damageMeleeModifier?: number;
  damageRangedModifier?: number;
  isEquipped?: boolean;
  slots?: SlotTier;
  slotted?: string[];
}

export interface EquipmentShield extends Omit<EquipmentArmor, "itemType"> {
  itemType?: "shield";
  category?: "Shield" | string;
}

export interface EquipmentAccessory {
  id?: string;
  fuid?: string;
  itemType?: "accessory";
  name: string;
  description?: string;
  book?: string;
  category?: "Accessory" | string;
  quality?: string;
  selectedQuality?: string;
  qualityCost?: number;
  /** @deprecated Legacy display-price alias. Use cost. */
  value?: number;
  // Canonical persisted price field.
  cost?: number;
  modifiers?: DefensiveModifiers;
  defModifier?: number;
  mDefModifier?: number;
  initModifier?: number;
  magicModifier?: number;
  precModifier?: number;
  damageMeleeModifier?: number;
  damageRangedModifier?: number;
  isEquipped?: boolean;
}

export type NpcArmor = EquipmentArmor;
