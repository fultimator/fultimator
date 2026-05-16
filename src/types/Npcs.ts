import {
  ResourceCost,
  Accuracy,
  Damage,
  ActorAttributes,
  ActorAffinities,
  ActorImmunities,
  ActorStatuses,
} from "./Misc";
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
  name: string;
  accuracy: Accuracy;
  isOffensive: boolean;
  damage: Damage;
  cost: ResourceCost;
  maxTargets: number;
  targetDescription: string;
  duration: string;
  range: "melee" | "ranged";
  effect: string;
  description: string;
  special: string[];
  itemType: "spell";
  spellType: string;
}

export interface NpcAction {
  name: string;
  effect: string;
  spCost?: number;
}

export interface NpcSpecial {
  name: string;
  effect: string;
  spCost?: number;
}

export interface NpcRareGear {
  name: string;
  effect: string;
}

export interface NpcExtra {
  init?: boolean;
  precision?: boolean;
  magic?: boolean;
  statusImmunity?: number;
}

export type NpcAffinities = ActorAffinities;

export type NpcImmunities = ActorImmunities;

export interface NpcResourcePool {
  current: number;
  bonus: number;
}

export interface NpcResources {
  hp: NpcResourcePool;
  mp: NpcResourcePool;
}

export interface NpcDerivedStat {
  bonus: number;
  override?: number;
}

export interface NpcDerived {
  def: NpcDerivedStat;
  mdef: NpcDerivedStat;
  init: { bonus: number };
}

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
}
