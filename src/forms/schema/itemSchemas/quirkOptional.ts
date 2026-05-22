import { z } from "zod";

export const QuirkOptionalSchema = z.object({
  itemType: z.literal("quirkOptional").default("quirkOptional"),
  name: z.string().default(""),
  description: z.string().default(""),
  effect: z.string().default(""),
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
): QuirkOptional {
  return {
    itemType: "quirkOptional",
    name: item?.name ?? "",
    description: item?.description ?? "",
    effect: item?.effect ?? "",
  };
}

export function buildQuirkOptionalSavePayload(
  formState: QuirkOptional,
): QuirkOptional {
  return { ...formState };
}
