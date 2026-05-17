import { z } from "zod";

export const HeroicSchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  book: z.string().default(""),
  bookName: z.string().optional(),
  page: z.number().optional(),
  quote: z.string().default(""),
  description: z.string().default(""),
  applicableTo: z.array(z.string()).default([]),
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
