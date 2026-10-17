import { z } from "zod";
import { MetaSchema } from "../meta";
import { BehaviorSchema } from "../shared/behaviorSchemas";

export const ConsumableSchema = z.object({
  id: z.string().optional(),
  fuid: z.string().optional(),
  itemType: z.literal("consumable").optional(),
  name: z.string(),
  description: z.string().default(""),
  ipCost: z.number().int().default(0),
  behaviors: z.array(BehaviorSchema).optional(),
  meta: MetaSchema.optional(),
});

export type Consumable = z.infer<typeof ConsumableSchema>;

export function validateConsumable(
  data: unknown,
): ReturnType<typeof ConsumableSchema.safeParse> {
  return ConsumableSchema.safeParse(data);
}

export function normalizeConsumable(data: unknown): Consumable {
  return ConsumableSchema.parse(data);
}

export function buildConsumableFormState(
  item?: Partial<Consumable> | null,
): Consumable {
  return {
    itemType: "consumable",
    id: item?.id,
    fuid: item?.fuid,
    meta: {
      isOfficial: false,
      ...(item?.meta ?? {}),
      book: item?.meta?.book ?? (item as { book?: string })?.book ?? "homebrew",
    },
    name: item?.name ?? "",
    description: item?.description ?? "",
    ipCost: item?.ipCost ?? 0,
    behaviors: item?.behaviors ?? [],
  };
}

export function buildConsumableSavePayload(formState: Consumable): Consumable {
  return {
    ...formState,
    ipCost: Math.max(0, parseInt(String(formState.ipCost)) || 0),
  };
}
