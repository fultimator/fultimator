import { z } from "zod";
import { MetaSchema } from "../meta";
import { PassiveSchema, BehaviorSchema } from "../shared/behaviorSchemas";

export const NpcSpecialSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  effect: z.string().default(""),
  spCost: z.number().int().nonnegative().optional(),
  meta: MetaSchema.optional(),
  passives: z.array(PassiveSchema).optional(),
  behaviors: z.array(BehaviorSchema).optional(),
});

export type NpcSpecial = z.infer<typeof NpcSpecialSchema>;

export function validateNpcSpecial(
  data: unknown,
): ReturnType<typeof NpcSpecialSchema.safeParse> {
  return NpcSpecialSchema.safeParse(data);
}

export function normalizeNpcSpecial(data: unknown): NpcSpecial {
  return NpcSpecialSchema.parse(data);
}
