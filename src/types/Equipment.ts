import type { Accuracy, Damage, Attributes, Elements } from "./Misc";

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
}

export interface NpcAttack {
  itemType?: "attack";
  name: string;
  range: "melee" | "ranged";
  accuracy: Accuracy;
  damage: Damage;
  special: string[];
  extraDamage?: boolean;
}

export interface NpcWeaponAttack {
  itemType?: "weaponAttack";
  name: string;
  range: "melee" | "ranged";
  accuracy: Accuracy;
  damage: Damage;
  special: string[];
  extraDamage?: boolean;
}
