import { z } from "zod";

export const OtherOptionalSchema = z.object({
  itemType: z.literal("otherOptional").default("otherOptional"),
  name: z.string().default(""),
  description: z.string().default(""),
  effect: z.string().default(""),
  clockEnabled: z.boolean().default(false),
  clockSections: z.coerce.number().int().min(2).max(12).default(6),
});

export type OtherOptional = z.infer<typeof OtherOptionalSchema>;

export function validateOtherOptional(data: unknown) {
  return OtherOptionalSchema.safeParse(data);
}

export function normalizeOtherOptional(data: unknown): OtherOptional {
  return OtherOptionalSchema.parse(data);
}

export function buildOtherOptionalFormState(
  item?: Partial<OtherOptional> | null,
): OtherOptional {
  return {
    itemType: "otherOptional",
    name: item?.name ?? "",
    description: item?.description ?? "",
    effect: item?.effect ?? "",
    clockEnabled: item?.clockEnabled ?? false,
    clockSections: item?.clockSections ?? 6,
  };
}

export function buildOtherOptionalSavePayload(
  formState: OtherOptional,
): OtherOptional {
  return { ...formState };
}
