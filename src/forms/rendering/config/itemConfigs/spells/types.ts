export type PlayerSpellUiType =
  | "default"
  | "gift"
  | "dance"
  | "therioform"
  | "magichant-key"
  | "magichant"
  | "symbol"
  | "invocation"
  | "wellspring"
  | "arcanist"
  | "arcanist-rework"
  | "tinkerer-alchemy"
  | "tinkerer-infusion"
  | "tinkerer-magitech"
  | "cooking"
  | "magiseed"
  | "pilot-vehicle"
  | "gamble"
  | "deck";

export type PlayerSpellFormState = {
  spellType: PlayerSpellUiType;
  fuid: string | undefined;
  name: string;
  // default spell fields
  class: string;
  isOffensive: boolean;
  "cost.resource": "mp";
  "cost.amount": number;
  "cost.perTarget": boolean;
  maxTargets: number;
  targetDescription: string;
  duration: string;
  "accuracy.attr1": string;
  "accuracy.attr2": string;
  "accuracy.value": number;
  "accuracy.defense": "def" | "mdef";
  "damage.value": number;
  "damage.type": string;
  "damage.hrZero": boolean;
  description: string;
  showInPlayerSheet: boolean;
  // arcanist fields
  domain: string;
  domainDesc: string;
  merge: string;
  mergeDesc: string;
  dismiss: string;
  dismissDesc: string;
  pulse: string;
  pulseDesc: string;
  // tinkerer fields
  category: string;
  infusionRank: number | null;
  rank: number;
  spellName: string;
  // gift fields
  event: string;
  // therioform fields
  genoclepsis: string;
  // magichant-key fields (renamed from keyType/keyStatus/keyAttribute/keyRecovery)
  type: string;
  status: string;
  attribute: string;
  recovery: string;
  // magichant tone / dance / symbol / gift effect
  effect: string;
  // invocation fields (wellspring + type, which is shared with magichant-key)
  wellspring: string;
  // wellspring spell fields
  color: string;
  textColor: string;
  icon: string;
  // cooking fields - array of { effect: string } objects for object-list renderer
  cookingEffects: Array<{ effect: string }>;
  // magiseed garden fields
  growthClock: number;
  gardenDescription: string;
  currentMagiseed: { name: string; customName?: string } | null;
  magiseeds: Array<{
    key: string;
    customName?: string;
    description?: string;
    rangeStart?: number;
    rangeEnd?: number;
    effects?: Record<number, string>;
  }>;
  // magiseed seed fields (flat, used in Quick Create, packaged into magiseeds[0] by registry)
  rangeStart: number;
  rangeEnd: number;
  "effects.0": string;
  "effects.1": string;
  "effects.2": string;
  "effects.3": string;
  // meta fields
  "meta.book": string;
  "meta.page": number | undefined;
  "meta.bookName": string;
  "meta.isOfficial": boolean;
};
