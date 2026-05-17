import { z } from "zod";

export const NpcActionSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  book: z.string().default("homebrew"),
  effect: z.string().default(""),
  spCost: z.number().int().nonnegative().optional(),
});

export type NpcAction = z.infer<typeof NpcActionSchema>;

export function validateNpcAction(
  data: unknown,
): ReturnType<typeof NpcActionSchema.safeParse> {
  return NpcActionSchema.safeParse(data);
}

export function normalizeNpcAction(data: unknown): NpcAction {
  return NpcActionSchema.parse(data);
}
