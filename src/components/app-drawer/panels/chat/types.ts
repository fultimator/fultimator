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
  description?: string;
  baseDamage: number;
  damageSituationalBonus?: number;
  damageType: string;
  defense?: "def" | "mdef" | string;
  hands?: 1 | 2;
  category?: string;
  range?: "melee" | "ranged" | string;
  isWeaponModule?: boolean;
  hrZero?: boolean;
  extraTags?: string[];
};

export type AccuracyCheckResult = {
  intent: AccuracyCheckIntent;
  speaker?: string;
  primary: CheckDieResult;
  secondary: CheckDieResult;
  highRoll: number;
  damageHighRoll: number;
  modifierTotal: number; // sum of accuracy modifiers
  accuracyTotal: number; // HR + LR + modifierTotal
  damage: number; // damageHR + baseDamage
  critical: boolean;
  fumble: boolean;
  targetsSnapshot?: DamagePipelineTarget[];
  retargetSuperseded?: boolean;
};

export type AccuracyCheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "accuracy";
  check: AccuracyCheckResult;
};

export type MagicCheckIntent = {
  id: string;
  primary: Attribute;
  secondary: Attribute;
  modifiers: CheckModifier[];
  critThreshold: number;
  spellName: string;
  spellType?: string;
  description?: string;
  baseDamage: number;
  damageType: string;
  defense?: "def" | "mdef" | string;
  hrZero?: boolean;
  extraTags?: string[];
};

export type MagicCheckResult = {
  intent: MagicCheckIntent;
  speaker?: string;
  primary: CheckDieResult;
  secondary: CheckDieResult;
  highRoll: number;
  damageHighRoll: number;
  modifierTotal: number;
  accuracyTotal: number;
  damage: number;
  critical: boolean;
  fumble: boolean;
  targetsSnapshot?: DamagePipelineTarget[];
  retargetSuperseded?: boolean;
};

export type DamagePipelineTarget = {
  combatId: string;
  name: string;
  source: "npc" | "pc";
};

export type MagicCheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "magic";
  check: MagicCheckResult;
};

export type DisplayMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "display";
  itemType: "spell" | "weapon" | "item" | string;
  name: string;
  tags: string[];
  description?: string;
  effect?: string;
  cost?: {
    resource: "hp" | "mp" | "ip" | "fp" | "up";
    amount: number;
    perTarget?: boolean;
  };
  clock?: {
    sections: number;
    state?: boolean[];
    name?: string;
  };
};

export type Attribute = "dex" | "ins" | "mig" | "wlp";

export type AttackOverrideDraft = {
  attr1: Attribute;
  attr2: Attribute;
  accuracyDelta: number;
  damageDelta: number;
  range: "melee" | "ranged";
  defense: "def" | "mdef";
  hrZero: boolean;
};

export type AttackOverrides = Partial<AttackOverrideDraft>;

export type SpellOverrideDraft = {
  attr1: Attribute;
  attr2: Attribute;
  accuracyDelta: number;
  damageDelta: number;
  hrZero: boolean;
};

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

export type AttributeCheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "attribute";
  check: CheckResult;
};

export type OpenCheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "open";
  check: CheckResult;
};

export type OpposedCheckResult = CheckResult & {
  opposedToId: string;
  opposedToResult: number;
  opposedToSpeaker?: string;
  opposedToCritical?: boolean;
  opposedToFumble?: boolean;
};

export type OpposedCheckMessage = {
  id: string;
  createdAt: number;
  speaker?: string;
  kind: "opposed";
  check: OpposedCheckResult;
};

export type CombatLogEvent =
  // system events (no actor)
  | { type: "round-change"; round: number; direction: "up" | "down" | "new" }
  | { type: "clock-added"; clockName: string }
  | { type: "clock-updated"; clockName: string; progress: number; max: number }
  | { type: "clock-state"; clockName: string; progress: number; max: number }
  | { type: "clock-reset"; clockName: string }
  | { type: "clock-removed"; clockName: string }
  | { type: "encounter-renamed"; newName: string }
  // actor events
  | { type: "actor-added"; name: string }
  | { type: "actor-removed"; name: string }
  | { type: "fainted"; targetName: string }
  | { type: "turn-checked"; actorName: string }
  | { type: "status-added"; targetName: string; status: string }
  | { type: "status-removed"; targetName: string; status: string }
  // pipeline-sourced resource events
  | {
      type: "damage";
      actorName: string;
      targetName: string;
      amount: number;
      damageType: string;
      affinity?: "vu" | "rs" | "ab" | "im" | null;
    }
  | {
      type: "heal";
      actorName: string;
      targetName: string;
      amount: number;
      resource: "hp" | "mp" | "ip";
    }
  | {
      type: "resource-loss";
      actorName: string;
      targetName: string;
      amount: number;
      resource: "mp" | "ip";
    }
  | {
      type: "expenditure";
      actorName: string;
      amount: number;
      resource: "hp" | "mp" | "ip" | "fp";
    }
  | { type: "ultima-used"; actorName: string }
  // pipeline-sourced check events
  | {
      type: "accuracy-check";
      actorName: string;
      weaponName: string;
      isCrit: boolean;
      isFumble: boolean;
    }
  | {
      type: "magic-check";
      actorName: string;
      spellName: string;
      isCrit: boolean;
      isFumble: boolean;
    }
  | { type: "spell-use"; actorName: string; spellName: string }
  | { type: "generic-roll"; actorName: string; label: string }
  | { type: "crit-success"; actorName: string }
  | { type: "crit-failure"; actorName: string }
  // fallback
  | { type: "text"; text: string };

export type LogMessage = {
  id: string;
  createdAt: number;
  kind: "log";
  channelId: string;
  event: CombatLogEvent;
};

type WithChannel = { channelId?: string };

export type ChatMessage = (
  | TextMessage
  | RollMessage
  | AttributeCheckMessage
  | OpenCheckMessage
  | OpposedCheckMessage
  | ActionMessage
  | AccuracyCheckMessage
  | MagicCheckMessage
  | DisplayMessage
  | LogMessage
) &
  WithChannel;
