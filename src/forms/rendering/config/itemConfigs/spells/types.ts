export type PlayerSpellUiType =
  | "default"
  | "gift"
  | "dance"
  | "therioform"
  | "magichant-key"
  | "magichant"
  | "symbol"
  | "invocation"
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
  // gift fields
  event: string;
  // therioform fields
  genoclepsis: string;
  // magichant-key fields
  keyType: string;
  keyStatus: string;
  keyAttribute: string;
  keyRecovery: string;
  // magichant tone / dance / symbol / gift effect
  effect: string;
  // invocation fields
  wellspring: string;
  invType: string;
  // cooking fields - array of { effect: string } objects for object-list renderer
  cookingEffects: Array<{ effect: string }>;
  // magiseed fields
  seedDescription: string;
  seedRangeStart: number;
  seedRangeEnd: number;
  // meta fields
  "meta.book": string;
  "meta.page": number | undefined;
  "meta.bookName": string;
  "meta.isOfficial": boolean;
};
