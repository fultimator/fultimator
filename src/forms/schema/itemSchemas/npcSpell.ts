import { z } from "zod";
import { MetaSchema } from "../meta";
import { BehaviorSchema } from "../shared/behaviorSchemas";

const AccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]).default("mdef"),
});

const DamageSchema = z.object({
  value: z.number().int(),
  type: z.string(),
  hrZero: z.boolean().default(false),
});

const CostSchema = z.object({
  resource: z.literal("mp"),
  amount: z.number().int().nonnegative(),
  perTarget: z.boolean().default(false),
});

export const NpcSpellSchema = z.object({
  id: z.string().optional(),
  itemType: z.literal("spell"),
  name: z.string().min(1),
  fuid: z.string().optional(),
  isOffensive: z.boolean().default(false),
  damage: DamageSchema,
  cost: CostSchema,
  maxTargets: z.number().int().optional(),
  duration: z.string().optional(),
  targetDescription: z.string().optional(),
  range: z.enum(["melee", "ranged"]),
  accuracy: AccuracySchema,
  effect: z.string().default(""),
  meta: MetaSchema.optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export type NpcSpell = z.infer<typeof NpcSpellSchema>;
