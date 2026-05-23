import {
  ResourceCost,
  Accuracy,
  Damage,
  ActorAttributes,
  ActorAffinities,
  ActorImmunities,
  ActorStatuses,
  ActorResourcePool,
  ActorResources,
  ActorDerivedStat,
  ActorDerived,
} from "./Misc";
import type { ActorBonuses, ActorMultipliers } from "./Bonuses";
import type { ActorEffect, ActionBehavior } from "./Effects";
import type { Meta } from "../forms/schema/meta";
import type {
  NpcAttack as EquipmentNpcAttack,
  NpcWeaponAttack as EquipmentNpcWeaponAttack,
  NpcArmor as EquipmentNpcArmor,
} from "./Equipment";

export type NpcAttributes = ActorAttributes;

export type NpcArmor = EquipmentNpcArmor;

export type NpcAttack = EquipmentNpcAttack;

export type NpcWeaponAttack = EquipmentNpcWeaponAttack;

export interface NpcSpell {
  fuid?: string;
  name: string;
  description: string;
  book?: string;
  accuracy: Accuracy;
  isOffensive: boolean;
  damage: Damage;
  cost: ResourceCost;
  maxTargets: number;
  targetDescription: string;
  duration: string;
  range: "melee" | "ranged";
  effect: string;
  itemType: "spell";
  spellType: string;
  behavior?: ActionBehavior;
}

export interface NpcAction {
  fuid?: string;
  name: string;
  description?: string;
  book?: string;
  effect: string;
  spCost?: number;
  meta?: Meta;
  behavior?: ActionBehavior;
}

export interface NpcSpecial {
  fuid?: string;
  name: string;
  description?: string;
  book?: string;
  effect: string;
  spCost?: number;
  meta?: Meta;
  behavior?: ActionBehavior;
}

export interface NpcRareGear {
  fuid?: string;
  name: string;
  description?: string;
  book?: string;
  effect: string;
  behavior?: ActionBehavior;
}

export interface NpcExtra {
  statusImmunity?: number;
}

export interface NpcFeature {
  enabled: boolean;
}

export interface NpcFeatures {
  init?: NpcFeature;
  precision?: NpcFeature;
  magic?: NpcFeature;
}

export type NpcAffinities = ActorAffinities;

export type NpcImmunities = ActorImmunities;

export type NpcResourcePool = ActorResourcePool;
export type NpcResources = ActorResources;
export type NpcDerivedStat = ActorDerivedStat;
export type NpcDerived = ActorDerived;

export interface NpcNotes {
  name: string;
  effect: string;
}

export interface NpcTags {
  name: string;
}

export interface TypeNpc {
  id: string;
  uid: string;
  name: string;
  lvl: number;
  imgurl?: string;
  attacks: NpcAttack[];
  affinities: NpcAffinities;
  immunities: NpcImmunities;
  attributes: NpcAttributes;
  species: string;
  sizes?: string;
  traits?: string;
  actions?: NpcAction[];
  extra?: NpcExtra;
  rank?: string;
  phases?: number;
  villain?: string;
  companionlvl?: number;
  companionpclvl?: number;
  multipart?: string;
  spells?: NpcSpell[];
  special?: NpcSpecial[];
  weaponattacks?: NpcWeaponAttack[];
  description?: string;
  armor?: NpcArmor;
  shield?: NpcArmor;
  raregear?: NpcRareGear[];
  label?: string;
  notes?: NpcNotes[];
  tags?: NpcTags[];
  schemaVersion?: number;
  createdBy?: string;
  language?: string;
  published?: boolean;
  statuses?: ActorStatuses;
  resources?: NpcResources;
  derived?: NpcDerived;
  features?: NpcFeatures;
  bonuses?: ActorBonuses;
  multipliers?: ActorMultipliers;
  effects?: ActorEffect[];
}
