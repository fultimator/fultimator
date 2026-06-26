import type {
  NpcPersisted,
  NpcArmor,
  NpcAttack,
  NpcWeaponAttack,
  NpcSpell,
  NpcAction,
  NpcSpecial,
  NpcRareGear,
  NpcNotes,
  NpcTags,
} from "../forms/schema/actorSchemas/npc";
export type {
  NpcArmor,
  NpcAttack,
  NpcWeaponAttack,
  NpcSpell,
  NpcAction,
  NpcSpecial,
  NpcRareGear,
  NpcNotes,
  NpcTags,
};

export type NpcAttributes = NpcPersisted["attributes"];
export type NpcExtra = NpcPersisted["extra"];
export type NpcFeature = NonNullable<
  NonNullable<NpcPersisted["features"]>["init"]
>;
export type NpcFeatures = NpcPersisted["features"];
export type NpcAffinities = NpcPersisted["affinities"];
export type NpcImmunities = NpcPersisted["immunities"];
export type NpcResourcePool = NpcPersisted["resources"] extends {
  hp: infer T;
}
  ? T
  : never;
export type NpcResources = NpcPersisted["resources"];
export type NpcDerivedStat = NpcPersisted["derived"] extends { def: infer T }
  ? T
  : never;
export type NpcDerived = NpcPersisted["derived"];
export type TypeNpc = NpcPersisted;
