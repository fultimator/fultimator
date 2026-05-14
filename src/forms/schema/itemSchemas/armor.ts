import { z } from "zod";

const SlotTierValues = ["alpha", "beta", "gamma", "delta"] as const;

export const ArmorModifiersSchema = z.object({
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  magic: z.number().int().default(0),
  prec: z.number().int().default(0),
  damageMelee: z.number().int().default(0),
  damageRanged: z.number().int().default(0),
});

export const ArmorSchema = z.object({
  itemType: z.literal("armor"),
  name: z.string().min(1),
  martial: z.boolean().default(false),
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  rework: z.boolean().default(false),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
  modifiers: ArmorModifiersSchema.optional(),
  slots: z.enum(SlotTierValues).optional(),
  slotted: z.array(z.string()).optional(),
});

export type Armor = z.infer<typeof ArmorSchema>;

export const ArmorFormStateSchema = z.object({
  base: z.unknown().optional(),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  selectedQuality: z.string().optional(),
  isSlotsVariant: z.boolean().default(false),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  initModifier: z.number().int().default(0),
  magicModifier: z.number().int().default(0),
  precModifier: z.number().int().default(0),
  damageMeleeModifier: z.number().int().default(0),
  damageRangedModifier: z.number().int().default(0),
  isEquipped: z.boolean().optional(),
});

export const ArmorPersistedSchema = ArmorSchema.extend(
  ArmorFormStateSchema.shape,
);
export type ArmorPersisted = z.infer<typeof ArmorPersistedSchema>;

export function validateArmor(
  data: unknown,
): ReturnType<typeof ArmorSchema.safeParse> {
  return ArmorSchema.safeParse(data);
}

export function validateArmorPersisted(
  data: unknown,
): ReturnType<typeof ArmorPersistedSchema.safeParse> {
  return ArmorPersistedSchema.safeParse(data);
}

export function normalizeArmor(data: unknown): Armor {
  return ArmorSchema.parse(data);
}
