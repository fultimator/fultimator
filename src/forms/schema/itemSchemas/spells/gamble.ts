import { z } from "zod";
import { PlayerSpellNonStaticBaseSchema, CostSchema } from "./shared";

const GambleSecondEffectSchema = z.object({
  rangeFrom: z.number().int(),
  rangeTo: z.number().int(),
  effect: z.string().default(""),
});

const GambleTargetSchema = z.object({
  rangeFrom: z.number().int(),
  rangeTo: z.number().int(),
  effect: z.string().default(""),
  secondRoll: z.boolean().default(false),
  secondEffects: z.array(GambleSecondEffectSchema).default([]),
});

export const PlayerSpellGambleSchema = PlayerSpellNonStaticBaseSchema.extend({
  spellType: z.literal("gamble"),
  spellName: z.string().default("New Gamble"),
  cost: CostSchema,
  maxTargets: z.number().int().default(2),
  targetDescription: z.string().default("Special"),
  duration: z.string().default("Instantaneous"),
  attr: z.string().default("will"),
  targets: z.array(GambleTargetSchema).default([]),
});
