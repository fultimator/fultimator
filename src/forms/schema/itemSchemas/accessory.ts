import { z } from "zod";

export const AccessoryModifiersSchema = z.object({
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  magic: z.number().int().default(0),
  prec: z.number().int().default(0),
  damageMelee: z.number().int().default(0),
  damageRanged: z.number().int().default(0),
});

export const AccessorySchema = z.object({
  itemType: z.literal("accessory"),
  name: z.string().min(1),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
});

export type Accessory = z.infer<typeof AccessorySchema>;

export const AccessoryFormStateSchema = z.object({
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  selectedQuality: z.string().optional(),
  modifiers: AccessoryModifiersSchema.optional(),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  initModifier: z.number().int().default(0),
  magicModifier: z.number().int().default(0),
  precModifier: z.number().int().default(0),
  damageMeleeModifier: z.number().int().default(0),
  damageRangedModifier: z.number().int().default(0),
  isEquipped: z.boolean().optional(),
});

export const AccessoryPersistedSchema = AccessorySchema.extend(
  AccessoryFormStateSchema.shape,
);
export type AccessoryPersisted = z.infer<typeof AccessoryPersistedSchema>;

export function validateAccessory(
  data: unknown,
): ReturnType<typeof AccessorySchema.safeParse> {
  return AccessorySchema.safeParse(data);
}

export function validateAccessoryPersisted(
  data: unknown,
): ReturnType<typeof AccessoryPersistedSchema.safeParse> {
  return AccessoryPersistedSchema.safeParse(data);
}

export function normalizeAccessory(data: unknown): Accessory {
  return AccessorySchema.parse(data);
}
