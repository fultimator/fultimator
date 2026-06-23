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
  "item",
  "consumable",
  "note",
  "effect",
] as const satisfies readonly CompendiumItemType[];

export type QuickCreateTabKey = (typeof QUICK_CREATE_TAB_KEYS)[number];

export const VIEWER_TYPE_TO_TAB_KEY = {
  attacks: "npc-attack",
  spells: "npc-spell",
  special: "npc-special",
  actions: "npc-action",
  "player-spells": "player-spell",
  qualities: "quality",
  heroics: "heroic",
  classes: "class",
  mnemospheres: "mnemosphere",
  hoplospheres: "hoplosphere",
  weapons: "weapon",
  "custom-weapons": "custom-weapon",
  armor: "armor",
  shields: "shield",
  accessories: "accessory",
  optionals: "optional",
  items: "item",
  consumables: "consumable",
  notes: "note",
  effects: "effect",
} as const;
