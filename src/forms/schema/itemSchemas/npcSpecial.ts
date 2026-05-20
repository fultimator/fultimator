import { z } from "zod";
import { MetaSchema } from "../meta";

export const NpcSpecialSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  effect: z.string().default(""),
  spCost: z.number().int().nonnegative().optional(),
  meta: MetaSchema.optional(),
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
