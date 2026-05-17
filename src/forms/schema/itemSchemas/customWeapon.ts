import { z } from "zod";
import { Attributes, Elements } from "../../../types/Misc";
import { MetaSchema } from "../meta";
import {
  WeaponAccuracySchema,
  WeaponDamageSchema,
  WeaponModifiersSchema,
} from "./weapon";

const AttributeValues = Object.values(Attributes) as [
  Attributes,
  ...Attributes[],
];
const ElementValues = Object.values(Elements) as [Elements, ...Elements[]];
const SlotTierValues = ["alpha", "beta", "gamma", "delta"] as const;

export const CustomWeaponCustomizationSchema = z.object({
  name: z.string(),
  effect: z.string(),
  martial: z.boolean(),
  customCost: z.number().int(),
});

export const CustomWeaponRareSchema = z.object({
  accuracyBonus: z.boolean().default(false),
  damageBonus: z.boolean().default(false),
  overrideDamageType: z.boolean().default(false),
  overrideAccuracyAttributes: z.boolean().default(false),
  overrideDamageTypeValue: z.enum(ElementValues).optional(),
  overrideAccuracyAttr1: z.enum(AttributeValues).optional(),
  overrideAccuracyAttr2: z.enum(AttributeValues).optional(),
});

export const CustomWeaponSchema = z.object({
  itemType: z.literal("customWeapon"),
  name: z.string().min(1),
  description: z.string().optional(),
  book: z.string().default("homebrew"),
  category: z.string(),
  range: z.enum(["melee", "ranged"]),
  hands: z.union([z.literal(1), z.literal(2)]),
  martial: z.boolean().default(false),
  accuracy: WeaponAccuracySchema,
  damage: WeaponDamageSchema,
  modifiers: WeaponModifiersSchema.optional(),
  rare: CustomWeaponRareSchema.optional(),
  customizations: z.array(CustomWeaponCustomizationSchema).default([]),
  quality: z.string().optional(),
  qualityName: z.string().optional(),
  qualityCost: z.coerce.number().int().nonnegative().optional(),
  cost: z.number().int().nonnegative().optional(),
  slots: z.enum(SlotTierValues).optional(),
  slotted: z.array(z.string()).optional(),
  secondName: z.string().optional(),
  secondCategory: z.string().optional(),
  secondRange: z.enum(["melee", "ranged"]).optional(),
  secondAccuracy: WeaponAccuracySchema.optional(),
  secondDamage: WeaponDamageSchema.optional(),
  secondModifiers: WeaponModifiersSchema.optional(),
  secondCustomizations: z.array(CustomWeaponCustomizationSchema).optional(),
  meta: MetaSchema.optional(),
});

export type CustomWeapon = z.infer<typeof CustomWeaponSchema>;

// Persisted alongside the canonical shape so the modal can reconstruct edit state on reopen.
export const CustomWeaponFormStateSchema = z.object({
  selectedQuality: z.string().optional(),
  isEquipped: z.boolean().optional(),
  dataType: z.string().optional(),
});

export const CustomWeaponPersistedSchema = CustomWeaponSchema.extend(
  CustomWeaponFormStateSchema.shape,
);
export type CustomWeaponPersisted = z.infer<typeof CustomWeaponPersistedSchema>;

export function validateCustomWeapon(
  data: unknown,
): ReturnType<typeof CustomWeaponSchema.safeParse> {
  return CustomWeaponSchema.safeParse(data);
}

export function validateCustomWeaponPersisted(
  data: unknown,
): ReturnType<typeof CustomWeaponPersistedSchema.safeParse> {
  return CustomWeaponPersistedSchema.safeParse(data);
}

export function normalizeCustomWeapon(data: unknown): CustomWeapon {
  return CustomWeaponSchema.parse(data);
}
