import { z } from "zod";

// EffectChange

export const EffectChangeSchema = z.object({
  key: z.string(),
  mode: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  value: z.string().default("0"),
  priority: z.number().nullable().optional(),
});

// GrantData

export const GrantDataSchema = z.object({
  type: z.string(),
  ref: z.string().optional(),
});

// EffectDuration

export const EffectDurationSchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("none") }),
  z.object({ event: z.literal("rest") }),
  z.object({ event: z.literal("end-of-scene") }),
  z.object({
    event: z.union([
      z.literal("start-of-turn"),
      z.literal("end-of-turn"),
      z.literal("end-of-round"),
    ]),
    tracking: z.union([z.literal("self"), z.literal("source")]),
  }),
]);

// EffectPredicate

export const EffectPredicateSchema = z.object({
  crisisInteraction: z
    .union([z.literal("none"), z.literal("active"), z.literal("inactive")])
    .optional(),
});

// ExprValue

export const ExprValueSchema = z.object({
  expr: z.string(),
});

// AfterEffect

export const AfterEffectAmountSchema = z.union([
  z.number(),
  z.literal("half-damage"),
  z.literal("half-loss"),
  ExprValueSchema,
]);

export const AfterEffectSchema = z.object({
  resource: z.union([z.literal("hp"), z.literal("mp"), z.literal("ip")]),
  direction: z.union([z.literal("loss"), z.literal("recovery")]),
  amount: AfterEffectAmountSchema,
  target: z.union([
    z.literal("self"),
    z.literal("targets"),
    z.literal("cover-target"),
  ]),
  predicate: EffectPredicateSchema.optional(),
});

// AppliesEffect

export const AppliesEffectSchema = z.object({
  label: z.string().default(""),
  target: z.union([
    z.literal("single"),
    z.literal("all"),
    z.literal("self"),
    z.literal("cover-target"),
  ]),
  duration: EffectDurationSchema,
  changes: z.array(EffectChangeSchema).optional(),
  grants: z.array(GrantDataSchema).optional(),
  predicate: EffectPredicateSchema.optional(),
});

// ActionTrigger

export const ActionTriggerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("passive") }),
  z.object({ kind: z.literal("active") }),
  z.object({
    kind: z.literal("chat-action"),
    action: z.union([
      z.literal("guard"),
      z.literal("attack"),
      z.literal("spell"),
      z.literal("equipment"),
    ]),
    condition: z
      .object({
        guardVariant: z
          .union([z.literal("cover"), z.literal("no-cover")])
          .optional(),
      })
      .optional(),
  }),
  z.object({
    kind: z.literal("reactive"),
    event: z.literal("ally-targeted"),
    cooldown: z
      .union([z.literal("until-next-turn"), z.literal("until-next-round")])
      .optional(),
  }),
  z.object({ kind: z.literal("combat-start") }),
  z.object({ kind: z.literal("combat-end") }),
  z.object({
    kind: z.literal("on-hit"),
    condition: z
      .object({
        singleTarget: z.boolean().optional(),
        targetHasStatusEffects: z.boolean().optional(),
      })
      .optional(),
  }),
  z.object({ kind: z.literal("on-damage-taken") }),
]);

// EffectBranch

export const EffectBranchSchema = z.object({
  label: z.string().default(""),
  appliesEffect: AppliesEffectSchema.optional(),
  afterEffects: z.array(AfterEffectSchema).optional(),
});

// ManualBehavior

export const ManualReasonSchema = z.union([
  z.literal("prompt-required"),
  z.literal("free-attack"),
  z.literal("future-effect"),
  z.literal("other"),
]);

export const ManualBehaviorSchema = z.object({
  reason: ManualReasonSchema.optional(),
  hint: z.string().optional(),
});

// Behavior

export const BehaviorSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  trigger: ActionTriggerSchema.default({ kind: "passive" }),
  predicate: EffectPredicateSchema.optional(),
  transfer: z.boolean().optional(),
  changes: z.array(EffectChangeSchema).optional(),
  grants: z.array(GrantDataSchema).optional(),
  voluntaryNoDamage: z.boolean().optional(),
  appliesEffect: AppliesEffectSchema.optional(),
  afterEffects: z.array(AfterEffectSchema).optional(),
  branches: z.array(EffectBranchSchema).optional(),
  manual: ManualBehaviorSchema.optional(),
  chatOutput: z.object({ text: z.string() }).optional(),
});

export type EffectChange = z.infer<typeof EffectChangeSchema>;
export type GrantData = z.infer<typeof GrantDataSchema>;
export type EffectDuration = z.infer<typeof EffectDurationSchema>;
export type EffectPredicate = z.infer<typeof EffectPredicateSchema>;
export type ExprValue = z.infer<typeof ExprValueSchema>;
export type AfterEffect = z.infer<typeof AfterEffectSchema>;
export type AppliesEffect = z.infer<typeof AppliesEffectSchema>;
export type ActionTrigger = z.infer<typeof ActionTriggerSchema>;
export type EffectBranch = z.infer<typeof EffectBranchSchema>;
export type ManualBehavior = z.infer<typeof ManualBehaviorSchema>;
export type Behavior = z.infer<typeof BehaviorSchema>;
