import { z } from "zod";
import { MetaSchema } from "../meta";

export const HeroicSchema = z.object({
  itemType: z.literal("heroic").default("heroic"),
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

export function buildHeroicFormState(item?: Partial<Heroic> | null): Heroic {
  return {
    itemType: "heroic",
    fuid: item?.fuid,
    name: item?.name ?? "",
    quote: item?.quote ?? "",
    description: item?.description ?? "",
    applicableTo: item?.applicableTo ?? [],
    meta: item?.meta,
  };
}

export function buildHeroicSavePayload(formState: Heroic): Heroic {
  return { ...formState };
}
