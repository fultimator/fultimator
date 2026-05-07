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

export type ChatMessage = TextMessage | RollMessage | CheckMessage;

export type Attribute = "dex" | "ins" | "mig" | "wlp";

export type CheckModifier = { label: string; value: number };

export type CheckIntent = {
  id: string;
  primary: Attribute;
  secondary: Attribute;
  modifiers: CheckModifier[];
  critThreshold: number;
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
