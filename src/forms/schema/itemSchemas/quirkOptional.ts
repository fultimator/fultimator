import { z } from "zod";

export const QuirkOptionalSchema = z.object({
  itemType: z.literal("quirkOptional").default("quirkOptional"),
  name: z.string().default(""),
  description: z.string().default(""),
  effect: z.string().default(""),
  clock: z.object({ sections: z.number().int().min(2).max(12) }).optional(),
});

export type QuirkOptional = z.infer<typeof QuirkOptionalSchema>;

export function validateQuirkOptional(data: unknown) {
  return QuirkOptionalSchema.safeParse(data);
}

export function normalizeQuirkOptional(data: unknown): QuirkOptional {
  return QuirkOptionalSchema.parse(data);
}

export function buildQuirkOptionalFormState(
  item?: Partial<QuirkOptional> | null,
): QuirkOptional & { hasClock: boolean; clockSections: number } {
  return {
    itemType: "quirkOptional",
    name: item?.name ?? "",
    description: item?.description ?? "",
    effect: item?.effect ?? "",
    clock: item?.clock,
    hasClock: !!item?.clock,
    clockSections: item?.clock?.sections ?? 6,
  };
}

export function buildQuirkOptionalSavePayload(
  formState: QuirkOptional & { hasClock?: boolean; clockSections?: number },
): QuirkOptional {
  const { hasClock, clockSections, ...rest } = formState as QuirkOptional & {
    hasClock?: boolean;
    clockSections?: number;
  };
  return {
    ...rest,
    clock: hasClock ? { sections: clockSections ?? 6 } : undefined,
  };
}
