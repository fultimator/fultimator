import { z } from "zod";

export const ShieldModifiersSchema = z.object({
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  magic: z.number().int().default(0),
  accuracy: z.number().int().default(0),
  damageMelee: z.number().int().default(0),
  damageRanged: z.number().int().default(0),
});

export const ShieldSchema = z.object({
  itemType: z.literal("shield"),
  name: z.string().min(1),
  description: z.string().optional(),
  book: z.string().default("homebrew"),
  martial: z.boolean().default(false),
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
  init: z.number().int().default(0),
  rework: z.boolean().default(false),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
  modifiers: ShieldModifiersSchema.optional(),
});

export type Shield = z.infer<typeof ShieldSchema>;

export const ShieldFormStateSchema = z.object({
  base: z.unknown().optional(),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  selectedQuality: z.string().optional(),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  initModifier: z.number().int().default(0),
  magicModifier: z.number().int().default(0),
  precModifier: z.number().int().default(0),
  damageMeleeModifier: z.number().int().default(0),
  damageRangedModifier: z.number().int().default(0),
  isEquipped: z.boolean().optional(),
});

export const ShieldPersistedSchema = ShieldSchema.extend(
  ShieldFormStateSchema.shape,
);
export type ShieldPersisted = z.infer<typeof ShieldPersistedSchema>;

export function validateShield(
  data: unknown,
): ReturnType<typeof ShieldSchema.safeParse> {
  return ShieldSchema.safeParse(data);
}

export function validateShieldPersisted(
  data: unknown,
): ReturnType<typeof ShieldPersistedSchema.safeParse> {
  return ShieldPersistedSchema.safeParse(data);
}

export function normalizeShield(data: unknown): Shield {
  return ShieldSchema.parse(data);
}
