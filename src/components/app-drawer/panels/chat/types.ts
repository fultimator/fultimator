export type DieSides = 4 | 6 | 8 | 10 | 12 | 20;
export type ResultSides = DieSides | 100;

export type RollResult = {
  sides: ResultSides;
  value: number;
};

export type RollData = {
  counts: Partial<Record<DieSides, number>>;
  results: RollResult[];
  modifier: number;
  total: number;
};

export type TextMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "text";
  text: string;
};

export type RollMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "generic";
  roll: RollData;
};

export type ActionMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "action";
  action: string; // e.g. "guard", "spell"
  weapon?: string; // display name, only present for "attack"
};

export type AccuracyCheckIntent = {
  id: string;
  primary: Attribute;
  secondary: Attribute;
  modifiers: CheckModifier[]; // accuracy modifiers (prec bonus, etc.)
  critThreshold: number;
  weaponName: string;
  baseDamage: number;
  damageType: string;
  hands?: 1 | 2;
  category?: string;
  range?: "melee" | "ranged" | string;
};

export type AccuracyCheckResult = {
  intent: AccuracyCheckIntent;
  speaker?: string;
  primary: CheckDieResult;
  secondary: CheckDieResult;
  highRoll: number;
  modifierTotal: number; // sum of accuracy modifiers
  accuracyTotal: number; // HR + LR + modifierTotal
  damage: number; // HR + baseDamage
  critical: boolean;
  fumble: boolean;
};

export type AccuracyCheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "accuracy";
  check: AccuracyCheckResult;
};

export type ChatMessage =
  | TextMessage
  | RollMessage
  | CheckMessage
  | ActionMessage
  | AccuracyCheckMessage;

export type Attribute = "dex" | "ins" | "mig" | "wlp";

export type CheckModifier = { label: string; value: number };

export const DIFFICULTY_PRESETS: { label: string; value: number }[] = [
  { label: "Easy", value: 7 },
  { label: "Normal", value: 10 },
  { label: "Hard", value: 13 },
  { label: "Very Hard", value: 16 },
];

export type CheckIntent = {
  id: string;
  primary: Attribute;
  secondary: Attribute;
  modifiers: CheckModifier[];
  critThreshold: number;
  difficulty?: number;
  additionalData: Record<string, unknown>;
};

export type CheckDieResult = {
  attribute: Attribute;
  die: number;
  result: number;
};

export type CheckResult = {
  intent: CheckIntent;
  speaker?: string;
  primary: CheckDieResult;
  secondary: CheckDieResult;
  highRoll: number;
  modifierTotal: number;
  result: number;
  passed?: boolean;
  critical: boolean;
  fumble: boolean;
  additionalData: Record<string, unknown>;
};

export type CheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "check";
  check: CheckResult;
};
