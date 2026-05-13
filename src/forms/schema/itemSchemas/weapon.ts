import { z } from "zod";
import { Attributes, Elements } from "../../../types/Misc";

const AttributeValues = Object.values(Attributes) as [string, ...string[]];
const ElementValues = Object.values(Elements) as [string, ...string[]];

export const WeaponAccuracySchema = z.object({
  attr1: z.enum(AttributeValues as [Attributes, ...Attributes[]]),
  attr2: z.enum(AttributeValues as [Attributes, ...Attributes[]]),
  value: z.number().int(),
  defense: z.enum(["def", "mdef"]).default("def"),
});

export const WeaponDamageSchema = z.object({
  value: z.number().int(),
  type: z
    .enum(ElementValues as [Elements, ...Elements[]])
    .default(Elements.Physical),
  hrZero: z.boolean().default(false),
});

export const WeaponModifiersSchema = z.object({
  damage: z.number().int().default(0),
  accuracy: z.number().int().default(0),
  def: z.number().int().default(0),
  mdef: z.number().int().default(0),
});

export const WeaponRareSchema = z.object({
  accuracyBonus: z.boolean().default(false),
  damageBonus: z.boolean().default(false),
});

export const WeaponSchema = z.object({
  itemType: z.literal("weapon"),
  name: z.string().min(1),
  category: z.string(),
  range: z.enum(["melee", "ranged"]),
  hands: z.union([z.literal(1), z.literal(2)]),
  martial: z.boolean().default(false),
  accuracy: WeaponAccuracySchema,
  damage: WeaponDamageSchema,
  modifiers: WeaponModifiersSchema.optional(),
  rare: WeaponRareSchema.optional(),
  quality: z.string().optional(),
  cost: z.number().int().nonnegative().optional(),
  special: z.array(z.string()).optional(),
});

export type Weapon = z.infer<typeof WeaponSchema>;

// Persisted alongside the canonical shape so the modal can reconstruct edit state on reopen.
export const WeaponFormStateSchema = z.object({
  base: z.unknown().optional(),
  damageBonus: z.boolean().default(false),
  damageReworkBonus: z.boolean().default(false),
  precBonus: z.boolean().default(false),
  rework: z.boolean().default(false),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  totalBonus: z.number().int().default(0),
  selectedQuality: z.string().optional(),
  isEquipped: z.boolean().optional(),
});

export const WeaponPersistedSchema = WeaponSchema.extend(
  WeaponFormStateSchema.shape,
);
export type WeaponPersisted = z.infer<typeof WeaponPersistedSchema>;

export function validateWeapon(
  data: unknown,
): ReturnType<typeof WeaponSchema.safeParse> {
  return WeaponSchema.safeParse(data);
}

export function validateWeaponPersisted(
  data: unknown,
): ReturnType<typeof WeaponPersistedSchema.safeParse> {
  return WeaponPersistedSchema.safeParse(data);
}

export function normalizeWeapon(data: unknown): Weapon {
  return WeaponSchema.parse(data);
}
