import type { Accuracy, Damage, Attributes, Elements } from "./Misc";
import type { ItemEffect } from "./Effects";

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
  itemType: "weapon";
  category: string;
  name: string;
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
  effects?: ItemEffect[];
}

export interface CustomWeapon {
  itemType: "customWeapon";
  name: string;
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
  effects?: ItemEffect[];
}

export interface NpcAttack {
  itemType?: "attack";
  name: string;
  range: "melee" | "ranged";
  accuracy: Accuracy;
  damage: Damage;
  special: string[];
  extraDamage?: boolean;
  effects?: ItemEffect[];
}

export interface NpcWeaponAttack {
  itemType?: "weaponAttack";
  name: string;
  range: "melee" | "ranged";
  accuracy: Accuracy;
  damage: Damage;
  special: string[];
  extraDamage?: boolean;
  effects?: ItemEffect[];
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
  itemType?: "armor";
  category?: "Armor" | string;
  name: string;
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
  effects?: ItemEffect[];
}

export interface EquipmentShield extends Omit<EquipmentArmor, "itemType"> {
  itemType?: "shield";
  category?: "Shield" | string;
}

export interface EquipmentAccessory {
  itemType?: "accessory";
  category?: "Accessory" | string;
  name: string;
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
  effects?: ItemEffect[];
}

export type NpcArmor = EquipmentArmor;
