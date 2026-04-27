export type PackType = "compendium" | "supplement";

export interface PackTheme {
  id: string;
  name: string;
  description: string | null;
  baseTheme: string;
  styleProfile: string;
  isDarkMode: boolean;
  customization: Record<string, unknown>;
  addedAt: number;
}

export type CompendiumItemType =
  | "npc-attack"
  | "npc-spell"
  | "npc-special"
  | "npc-action"
  | "weapon"
  | "armor"
  | "shield"
  | "custom-weapon"
  | "accessory"
  | "player-spell"
  | "quality"
  | "class"
  | "heroic"
  | "optional";

export interface CompendiumItem {
  id: string; // crypto.randomUUID() — stable across edits
  type: CompendiumItemType;
  data: Record<string, unknown>; // narrowly typed at usage sites
  addedAt: number; // Unix ms timestamp
}

export interface CompendiumPack {
  id: string; // "personal" for singleton; UUID for others
  name: string;
  description?: string;
  author?: string;
  type?: PackType;
  version?: string; // from manifest on import; editable in-app
  active?: boolean; // absent or true = visible in viewer; false = hidden
  isPersonal: boolean; // cannot be deleted
  locked?: boolean; // when true, destructive actions are hidden
  fultimatorMinVersion?: string; // minimum Fultimator version required
  homepageUrl?: string; // URL to pack's homepage or repository
  createdAt: number;
  updatedAt: number;
  items: CompendiumItem[];
  themes?: PackTheme[];
}
