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

export interface AppliesEffect {
  label: string;
  target: "single" | "all";
  duration: EffectDuration;
  changes?: EffectChange[];
  grants?: GrantData[];
  predicate?: EffectPredicate;
}
