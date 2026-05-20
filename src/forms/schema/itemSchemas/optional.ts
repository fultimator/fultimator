import { z } from "zod";
import { MetaSchema } from "../meta";

export const OptionalSubtypeSchema = z.enum([
  "quirk",
  "camp-activities",
  "zero-trigger",
  "zero-effect",
  "zero-power",
  "other",
]);

const OptionalSharedSchema = z.object({
  name: z.string().min(1),
  fuid: z.string().optional(),
  meta: MetaSchema.optional(),
});

const ClockSchema = z.object({ sections: z.number().int().min(2) });
const ZeroRefSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const OptionalQuirkSchema = OptionalSharedSchema.extend({
  subtype: z.literal("quirk"),
  description: z.string(),
  effect: z.string(),
  clock: ClockSchema.optional(),
});

export const OptionalCampActivitiesSchema = OptionalSharedSchema.extend({
  subtype: z.literal("camp-activities"),
  description: z.string(),
  effect: z.string(),
  clock: ClockSchema.optional(),
});

export const OptionalZeroTriggerSchema = OptionalSharedSchema.extend({
  subtype: z.literal("zero-trigger"),
  description: z.string(),
});

export const OptionalZeroEffectSchema = OptionalSharedSchema.extend({
  subtype: z.literal("zero-effect"),
  description: z.string(),
});

export const OptionalZeroPowerSchema = OptionalSharedSchema.extend({
  subtype: z.literal("zero-power"),
  description: z.string().optional(),
  zeroTriggerRef: z.string(),
  zeroEffectRef: z.string(),
  zeroTrigger: z.union([ZeroRefSchema, z.literal("")]),
  zeroEffect: z.union([ZeroRefSchema, z.literal("")]),
  clock: ClockSchema,
});

export const OptionalOtherSchema = OptionalSharedSchema.extend({
  subtype: z.literal("other"),
  description: z.string(),
  effect: z.string(),
  clock: ClockSchema.optional(),
});

export const OptionalSubtypeSchemas = {
  quirk: OptionalQuirkSchema,
  "camp-activities": OptionalCampActivitiesSchema,
  "zero-trigger": OptionalZeroTriggerSchema,
  "zero-effect": OptionalZeroEffectSchema,
  "zero-power": OptionalZeroPowerSchema,
  other: OptionalOtherSchema,
} as const;

export const OptionalSchema = z.union(
  Object.values(OptionalSubtypeSchemas) as [
    (typeof OptionalSubtypeSchemas)[keyof typeof OptionalSubtypeSchemas],
    ...(typeof OptionalSubtypeSchemas)[keyof typeof OptionalSubtypeSchemas][],
  ],
);

export type OptionalItem = z.infer<typeof OptionalSchema>;
