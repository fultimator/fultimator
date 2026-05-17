import type { CompendiumItemType } from "../../types/CompendiumPack";

export const QUICK_CREATE_TAB_KEYS = [
  "npc-attack",
  "npc-spell",
  "npc-special",
  "npc-action",
  "player-spell",
  "quality",
  "heroic",
  "class",
  "mnemosphere",
  "hoplosphere",
  "weapon",
  "custom-weapon",
  "armor",
  "shield",
  "accessory",
  "optional",
] as const satisfies readonly CompendiumItemType[];

export type QuickCreateTabKey = (typeof QUICK_CREATE_TAB_KEYS)[number];
