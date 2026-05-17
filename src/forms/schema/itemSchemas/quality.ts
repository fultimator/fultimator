import { z } from "zod";
import { MetaSchema } from "../meta";

export const QualitySchema = z.object({
  fuid: z.string().optional(),
  name: z.string().min(1),
  category: z.string().default("misc"),
  quality: z.string().default(""),
  cost: z.number().int().nonnegative().default(0),
  filter: z.array(z.string()).default([]),
  meta: MetaSchema.optional(),
});

export type Quality = z.infer<typeof QualitySchema>;

export function validateQuality(
  data: unknown,
): ReturnType<typeof QualitySchema.safeParse> {
  return QualitySchema.safeParse(data);
}

export function normalizeQuality(data: unknown): Quality {
  return QualitySchema.parse(data);
}
