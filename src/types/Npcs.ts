import { Affinities, ResourceCost, Accuracy, Damage } from "./Misc";
import type {
  NpcAttack as EquipmentNpcAttack,
  NpcWeaponAttack as EquipmentNpcWeaponAttack,
  NpcArmor as EquipmentNpcArmor,
} from "./Equipment";

export interface NpcAttributes {
  might: number;
  insight: number;
  will: number;
  dexterity: number;
}

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
  hp?: number;
  mp?: number;
  magic?: boolean;
  def?: number;
  mDef?: number;
  defOverride?: boolean;
  mDefOverride?: boolean;
  extrainit?: number;
  statusImmunity?: number;
}

export interface NpcAffinities {
  physical?: Affinities;
  air?: Affinities;
  bolt?: Affinities;
  dark?: Affinities;
  earth?: Affinities;
  fire?: Affinities;
  ice?: Affinities;
  light?: Affinities;
  poison?: Affinities;
}

export interface NpcImmunities {
  slow: boolean;
  dazed: boolean;
  weak: boolean;
  shaken: boolean;
  enraged: boolean;
  poisoned: boolean;
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
  sheild?: NpcArmor;
  shield?: NpcArmor;
  raregear?: NpcRareGear[];
  label?: string;
  notes?: NpcNotes[];
  tags?: NpcTags[];
  schemaVersion?: number;
  createdBy?: string;
  language?: string;
  published?: boolean;
}
