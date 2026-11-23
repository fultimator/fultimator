import type {
  TypeNpc,
  NpcSpell,
  NpcAttack,
  NpcWeaponAttack,
  NpcArmor,
  NpcAction,
  NpcSpecial,
  NpcRareGear,
  NpcNotes,
  NpcTags,
} from "./Npcs";

import type { TypePlayer, Spells, MnemosphereSpell } from "./Players";

export type ActorType = "player" | "npc";

export interface ActorByType {
  player: TypePlayer;
  npc: TypeNpc;
}

export type AnyActor = ActorByType[ActorType];

export type {
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
};
