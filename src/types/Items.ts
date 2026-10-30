import type {
  ActorType,
  ActorByType,
  AnyActor,
  TypePlayer,
  TypeNpc,
  Spells,
  MnemosphereSpell,
  NpcSpell,
  NpcAttack,
  NpcWeaponAttack,
  NpcArmor,
  NpcAction,
  NpcSpecial,
  NpcRareGear,
  NpcNotes,
  NpcTags,
} from "./Actors";

import type {
  Weapons,
  CustomWeapons,
  Armor,
  Shields,
  Accessories,
  PlayerItems,
  PlayerConsumables,
  PlayerNotes,
} from "./Players";

import type { Weapon as ZodWeapon } from "../forms/schema/itemSchemas/weapon";
import type { CustomWeapon as ZodCustomWeapon } from "../forms/schema/itemSchemas/customWeapon";
import type { Quality as ZodQuality } from "../forms/schema/itemSchemas/quality";
import type { Heroic as ZodHeroic } from "../forms/schema/itemSchemas/heroic";
import type {
  NpcAttack as EquipmentNpcAttack,
  NpcWeaponAttack as EquipmentNpcWeaponAttack,
} from "./Equipment";

type Weapon = ZodWeapon;
type CustomWeapon = ZodCustomWeapon;
type Quality = ZodQuality;
type Heroic = ZodHeroic;

export type { ActorType, AnyActor };

export type ItemType = "weapon" | "customWeapon";

export interface ItemByType {
  weapon: Weapon;
  customWeapon: CustomWeapon;
}

export type AnyItem = ItemByType[ItemType];

export type EntityType = ActorType | ItemType;

export interface EntityByType extends ActorByType, ItemByType {}

export type AnyEntity = EntityByType[EntityType];

export type {
  TypePlayer,
  TypeNpc,
  Weapon,
  CustomWeapon,
  Quality,
  Heroic,
  Spells,
  MnemosphereSpell,
  NpcSpell,
  NpcAttack,
  NpcWeaponAttack,
  NpcArmor,
  NpcAction,
  NpcSpecial,
  NpcRareGear,
  NpcNotes,
  NpcTags,
  EquipmentNpcAttack,
  EquipmentNpcWeaponAttack,
  Weapons,
  CustomWeapons,
  Armor,
  Shields,
  Accessories,
  PlayerItems,
  PlayerConsumables,
  PlayerNotes,
};
