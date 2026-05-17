import { z } from "zod";

export const NpcSpecialSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  book: z.string().default("homebrew"),
  effect: z.string().default(""),
  spCost: z.number().int().nonnegative().optional(),
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
