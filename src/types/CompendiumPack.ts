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
  | "mnemosphere"
  | "hoplosphere"
  | "optional";

export interface CompendiumItem {
  id: string; // crypto.randomUUID() — stable across edits
  type: CompendiumItemType;
  data: Record<string, unknown> & { fuid?: string }; // narrowly typed at usage sites
  addedAt: number; // Unix ms timestamp
}

export interface CompendiumPack {
  id: string; // "personal" for singleton; UUID for others
  fuid?: string; // canonical external identifier (slug), unique across installed packs
  name: string;
  description?: string;
  author?: string;
  aliases?: string[]; // previous fuids that should still resolve to this pack
  type?: PackType;
  version?: string; // from manifest on import; editable in-app
  active?: boolean; // absent or true = visible in viewer; false = hidden
  isPersonal: boolean; // cannot be deleted
  locked?: boolean; // when true, destructive actions are hidden
  fultimatorMinVersion?: string; // minimum Fultimator version required
  homepageUrl?: string; // URL to pack's homepage or repository
  requiresManual?: string[]; // user-managed hard dependencies
  requiresAuto?: string[]; // system-derived hard dependencies from cross-pack refs
  requires?: string[]; // hard dependencies (canonical pack fuids)
  optional?: string[]; // soft dependencies (canonical pack fuids)
  createdAt: number;
  updatedAt: number;
  items: CompendiumItem[];
  themes?: PackTheme[];
}
