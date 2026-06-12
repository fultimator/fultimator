import type {
  EffectChange,
  GrantData,
  EffectDuration,
  EffectPredicate,
  ExprValue,
  AfterEffect,
  AppliesEffect,
  ActionTrigger,
  EffectBranch,
  ManualBehavior,
  Behavior,
} from "../forms/schema/shared/behaviorSchemas";

export type {
  EffectChange,
  GrantData,
  EffectDuration,
  EffectPredicate,
  ExprValue,
  AfterEffect,
  AppliesEffect,
  ActionTrigger,
  EffectBranch,
  ManualBehavior,
  Behavior,
};

export type EffectMode = NonNullable<EffectChange["mode"]>;

export interface ActorEffect {
  id: string;
  name: string;
  disabled?: boolean;
  origin?: string;
  behaviors?: Behavior[];
}

export interface AppliedEffect {
  id: string;
  origin?: string;
  changesFingerprint: string;
  changes?: EffectChange[];
  grants?: GrantData[];
  duration: EffectDuration;
  predicate?: EffectPredicate;
}

export type AfterEffectAmount = NonNullable<AfterEffect["amount"]>;
export type AfterEffectTarget = NonNullable<AfterEffect["target"]>;
export type AppliesEffectTarget = NonNullable<AppliesEffect["target"]>;

export type TriggerAction = Extract<
  ActionTrigger,
  { kind: "chat-action" }
>["action"];

export type GuardVariant = NonNullable<
  Extract<ActionTrigger, { kind: "chat-action" }>["condition"]
>["guardVariant"];

export type CooldownDuration = Extract<
  ActionTrigger,
  { kind: "reactive" }
>["cooldown"];
