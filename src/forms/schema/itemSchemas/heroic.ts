import { z } from "zod";
import { MetaSchema } from "../meta";

export const HeroicSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  quote: z.string().default(""),
  description: z.string().default(""),
  applicableTo: z.array(z.string()).default([]),
  meta: MetaSchema.optional(),
});

export type Heroic = z.infer<typeof HeroicSchema>;

export function validateHeroic(
  data: unknown,
): ReturnType<typeof HeroicSchema.safeParse> {
  return HeroicSchema.safeParse(data);
}

export function normalizeHeroic(data: unknown): Heroic {
  return HeroicSchema.parse(data);
}
