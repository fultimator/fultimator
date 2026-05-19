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
  // pilot fields (pending schema rewrite)
  pilotSubtype: "frame" | "armor" | "weapon" | "support";
  vehicleFrame: string;
  moduleCost: number;
  moduleDef: number;
  moduleMdef: number;
  moduleMartial: boolean;
  moduleDamage: number;
  moduleRange: string;
  modulePrec: number;
  moduleDescription: string;
  weaponCategory: string;
  pilotDamageType: string;
  pilotAtt1: string;
  pilotAtt2: string;
  quality: string;
  qualityCost: number;
  isShield: boolean;
  moduleCumbersome: boolean;
  // meta fields
  "meta.book": string;
  "meta.page": number | undefined;
  "meta.bookName": string;
  "meta.isOfficial": boolean;
};
