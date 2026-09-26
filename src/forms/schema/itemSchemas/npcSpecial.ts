import { z } from "zod";
import { MetaSchema } from "../meta";
import { BehaviorSchema } from "../shared/behaviorSchemas";

export const NPC_SPECIAL_SUBTYPES = [
  "roleSkill",
  "negativeSkill",
  "bossSkill",
  "speciesSkill",
] as const;

export const NpcSpecialSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  effect: z.string().default(""),
  spCost: z.number().int().nonnegative().optional(),
  subtype: z.enum(NPC_SPECIAL_SUBTYPES).optional(),
  meta: MetaSchema.optional(),
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
