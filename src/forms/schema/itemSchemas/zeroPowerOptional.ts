import { z } from "zod";

export const ZeroPowerOptionalSchema = z.object({
  itemType: z.literal("zeroPowerOptional").default("zeroPowerOptional"),
  name: z.string().default(""),
  clockSections: z.coerce.number().int().min(2).max(12).default(6),
  triggerName: z.string().default(""),
  triggerDescription: z.string().default(""),
  effectName: z.string().default(""),
  effectDescription: z.string().default(""),
});

export type ZeroPowerOptional = z.infer<typeof ZeroPowerOptionalSchema>;

export function validateZeroPowerOptional(data: unknown) {
  return ZeroPowerOptionalSchema.safeParse(data);
}

export function normalizeZeroPowerOptional(data: unknown): ZeroPowerOptional {
  return ZeroPowerOptionalSchema.parse(data);
}

export function buildZeroPowerOptionalFormState(
  item?: Partial<ZeroPowerOptional> | null,
): ZeroPowerOptional {
  return {
    itemType: "zeroPowerOptional",
    name: item?.name ?? "",
    clockSections: item?.clockSections ?? 6,
    triggerName: item?.triggerName ?? "",
    triggerDescription: item?.triggerDescription ?? "",
    effectName: item?.effectName ?? "",
    effectDescription: item?.effectDescription ?? "",
  };
}

export function buildZeroPowerOptionalSavePayload(
  formState: ZeroPowerOptional,
): ZeroPowerOptional {
  return { ...formState };
}
