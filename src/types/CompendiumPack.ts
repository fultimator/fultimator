export type CompendiumItemType =
  | "npc-attack"
  | "npc-spell"
  | "npc-special"
  | "npc-action"
  | "weapon"
  | "armor"
  | "shield"
  | "player-spell"
  | "quality"
  | "class"
  | "heroic";

export interface CompendiumItem {
  id: string;                          // crypto.randomUUID() — stable across edits
  type: CompendiumItemType;
  data: Record<string, unknown>;       // narrowly typed at usage sites
  addedAt: number;                     // Unix ms timestamp
}

export interface CompendiumPack {
  id: string;                          // "personal" for singleton; UUID for others
  name: string;
  description?: string;
  author?: string;
  isPersonal: boolean;                 // cannot be deleted
  locked?: boolean;                    // when true, destructive actions are hidden
  createdAt: number;
  updatedAt: number;
  items: CompendiumItem[];
}
