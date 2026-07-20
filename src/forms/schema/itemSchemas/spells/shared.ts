import { z } from "zod";
import { MetaSchema } from "../../meta";
import { BehaviorSchema } from "../../shared/behaviorSchemas";

export const AccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]),
});

export const DamageSchema = z.object({
  value: z.number().int(),
  type: z.string(),
  hrZero: z.boolean(),
});

export const WeaponModuleAccuracySchema = z.object({
  attr1: z.string(),
  attr2: z.string(),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]),
});

export const WeaponModuleDamageSchema = z.object({
  value: z.number().int(),
  type: z.string(),
  hrZero: z.boolean(),
});

export const CostSchema = z.object({
  resource: z.literal("mp"),
  amount: z.number().int().nonnegative(),
  perTarget: z.boolean(),
});

export const PlayerSpellNonStaticBaseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  fuid: z.string().optional(),
  meta: MetaSchema.optional(),
  description: z.string().optional(),
  showInPlayerSheet: z.boolean().default(true),
  behaviors: z.array(BehaviorSchema).optional(),
  spellType: z.enum([
    "default",
    "gift",
    "dance",
    "therioform",
    "magichant",
    "symbol",
    "invocation",
    "wellspring",
    "arcanist",
    "arcanist-rework",
    "tinkerer-alchemy",
    "tinkerer-infusion",
    "tinkerer-magitech",
    "cooking",
    "magiseed",
    "pilot-vehicle",
    "gamble",
    "deck",
  ]),
});
