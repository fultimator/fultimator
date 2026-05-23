// ACTIVE_EFFECT_MODES: 0=override 1=multiply 2=add 3=downgrade 4=upgrade 5=custom
export type EffectMode = 0 | 1 | 2 | 3 | 4 | 5;

export interface EffectChange {
  key: string;
  mode: EffectMode;
  value: string;
  priority?: number | null;
}

export interface GrantData {
  type: string;
  ref?: string;
  payload?: Record<string, unknown>;
}

export type EffectDurationEvent =
  | "none"
  | "start-of-turn"
  | "end-of-turn"
  | "end-of-round"
  | "end-of-scene"
  | "rest";

export type EffectTracking = "self" | "source";

export type EffectDuration =
  | { event: "none" }
  | { event: "rest" }
  | { event: "end-of-scene" }
  | {
      event: "start-of-turn" | "end-of-turn" | "end-of-round";
      tracking: EffectTracking;
    };

export type CrisisInteraction = "none" | "active" | "inactive";

export interface EffectPredicate {
  crisisInteraction?: CrisisInteraction;
}

export interface ItemEffect {
  id: string;
  name: string;
  disabled?: boolean;
  transfer?: boolean;
  changes?: EffectChange[];
  grants?: GrantData[];
  duration?: EffectDuration;
  predicate?: EffectPredicate;
}

export interface ActorEffect {
  id: string;
  name: string;
  disabled?: boolean;
  origin?: string;
  changes?: EffectChange[];
  grants?: GrantData[];
  duration?: EffectDuration;
  predicate?: EffectPredicate;
}

// AppliesEffect 

export type AppliesEffectTarget = "single" | "all" | "self" | "cover-target";

export interface AppliesEffect {
  label: string;
  target: AppliesEffectTarget;
  duration: EffectDuration;
  changes?: EffectChange[];
  grants?: GrantData[];
  predicate?: EffectPredicate;
}

// AppliedEffect (runtime - lives on RuntimeActor) 

export interface AppliedEffect {
  id: string;
  origin?: string;            // source item fuid; same-origin recasts replace
  changesFingerprint: string; // stable JSON of sorted changes[]; identical effects do not stack
  changes?: EffectChange[];
  grants?: GrantData[];
  duration: EffectDuration;
  predicate?: EffectPredicate;
}

// AfterEffect 

export type AfterEffectAmount = number | "half-damage" | "half-loss";

export type AfterEffectTarget = "self" | "targets" | "cover-target";

export interface AfterEffect {
  resource: "hp" | "mp" | "ip";
  direction: "loss" | "recovery";
  amount: AfterEffectAmount;
  target: AfterEffectTarget;
  predicate?: EffectPredicate;
}

// ActionTrigger 

export type TriggerAction = "guard" | "attack" | "spell" | "equipment";

export type GuardVariant = "cover" | "no-cover";

export interface TriggerCondition {
  guardVariant?: GuardVariant;
}

export interface OnHitCondition {
  singleTarget?: boolean;
  targetHasStatusEffects?: boolean;
}

export type CooldownDuration = "until-next-turn" | "until-next-round";

export type ActionTrigger =
  | { kind: "active" }
  | { kind: "chat-action"; action: TriggerAction; condition?: TriggerCondition }
  | { kind: "reactive"; event: "ally-targeted"; cooldown?: CooldownDuration }
  | { kind: "combat-start" }
  | { kind: "on-hit"; condition?: OnHitCondition }
  | { kind: "on-damage-taken" };

// ActionBehavior - groups all execution-time behavior on an item.
// Execution order: trigger -> effects -> appliesEffect -> afterEffects

export interface ActionBehavior {
  trigger?: ActionTrigger;
  effects?: ItemEffect[];
  appliesEffect?: AppliesEffect;
  afterEffects?: AfterEffect[];
}
