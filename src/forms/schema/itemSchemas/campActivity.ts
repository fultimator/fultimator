import { z } from "zod";
import { CampActivityTargetSchema } from "./optional";

export const CampActivitySchema = z.object({
  itemType: z.literal("campActivity").default("campActivity"),
  name: z.string().default(""),
  description: CampActivityTargetSchema.default("choice"),
  targetDescription: z.string().default(""),
  effect: z.string().default(""),
});

export type CampActivity = z.infer<typeof CampActivitySchema>;

export function validateCampActivity(data: unknown) {
  return CampActivitySchema.safeParse(data);
}

export function normalizeCampActivity(data: unknown): CampActivity {
  return CampActivitySchema.parse(data);
}

export function buildCampActivityFormState(
  item?: Partial<CampActivity> | null,
): CampActivity {
  return {
    itemType: "campActivity",
    name: item?.name ?? "",
    description: item?.description ?? "choice",
    targetDescription: item?.targetDescription ?? "",
    effect: item?.effect ?? "",
  };
}

export function buildCampActivitySavePayload(
  formState: CampActivity,
): CampActivity {
  return { ...formState };
}
