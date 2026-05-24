import { z } from "zod";
import { MetaSchema } from "../../meta";
import { AccuracySchema, CostSchema, DamageSchema } from "./shared";
import { PassiveSchema, BehaviorSchema } from "../../shared/behaviorSchemas";

export const PlayerSpellDefaultSchema = z.object({
  class: z.string(),
  name: z.string().min(1),
  fuid: z.string().optional(),
  meta: MetaSchema.optional(),
  description: z.string(),
  isOffensive: z.boolean(),
  cost: CostSchema,
  maxTargets: z.number().int(),
  targetDescription: z.string(),
  duration: z.string(),
  accuracy: AccuracySchema,
  damage: DamageSchema,
  spellType: z.literal("default"),
  passives: z.array(PassiveSchema).optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});
