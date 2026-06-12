import { z } from "zod";
import { Attributes, Elements } from "../../../types/Misc";
import { MetaSchema } from "../meta";
import allWeapons from "../../../libs/weapons";
import { BehaviorSchema } from "../shared/behaviorSchemas";
import {
  getWeaponAttr1,
  getWeaponAttr2,
  getWeaponRange,
  getWeaponType,
  normalizeWeaponLike,
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
} from "../../../libs/weaponNormalization";

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
  description: z.string().optional(),
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
  meta: MetaSchema.optional(),
});

export type Weapon = z.infer<typeof WeaponSchema>;

// Persisted alongside the canonical shape so the modal can reconstruct edit state on reopen.
export const WeaponFormStateSchema = z.object({
  base: z.unknown().optional(),
  fuid: z.string().optional(),
  behaviors: z.array(BehaviorSchema).optional(),
  att1: z.string().optional(),
  att2: z.string().optional(),
  type: z.string().optional(),
  damageHrZero: z.boolean().default(false),
  rareBonuses: z
    .object({
      precBonus: z.boolean().default(false),
      damageBonus: z.boolean().default(false),
      damageReworkBonus: z.boolean().default(false),
    })
    .optional(),
  precModifier: z.number().int().default(0),
  damageModifier: z.number().int().default(0),
  defModifier: z.number().int().default(0),
  mDefModifier: z.number().int().default(0),
  damageBonus: z.boolean().default(false),
  damageReworkBonus: z.boolean().default(false),
  precBonus: z.boolean().default(false),
  rework: z.boolean().default(false),
  qualityCost: z.coerce.number().int().nonnegative().default(0),
  totalBonus: z.number().int().default(0),
  selectedQuality: z.string().optional(),
  qualityName: z.string().optional(),
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

export type WeaponCtx = Record<string, never>;

export function buildWeaponFormState(
  item?: Partial<WeaponPersisted> | null,
): WeaponPersisted {
  const acc: Partial<z.infer<typeof WeaponAccuracySchema>> =
    item?.accuracy ?? {};
  const dmg: Partial<z.infer<typeof WeaponDamageSchema>> =
    item?.damage && typeof item.damage === "object" ? item.damage : {};
  const base =
    (item?.base as (typeof allWeapons)[0] | undefined) ?? allWeapons[0];
  const att1 = acc.attr1 ?? item?.att1 ?? getWeaponAttr1(allWeapons[0]);
  const att2 = acc.attr2 ?? item?.att2 ?? getWeaponAttr2(allWeapons[0]);
  const type = dmg.type ?? item?.type ?? getWeaponType(allWeapons[0]);
  const damageHrZero = dmg.hrZero === true;
  const precBonus = item?.precBonus ?? false;
  const damageBonus = item?.damageBonus ?? false;
  const damageReworkBonus = item?.damageReworkBonus ?? false;
  return {
    base,
    fuid: item?.fuid,
    name: item?.name ?? allWeapons[0].name,
    category: item?.category ?? "",
    type,
    hands: item?.hands ?? allWeapons[0].hands,
    att1,
    att2,
    martial: item?.martial ?? false,
    damageHrZero,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rareBonuses: { precBonus, damageBonus, damageReworkBonus },
    rework: item?.rework ?? false,
    quality: item?.quality ?? "",
    range: item?.range ?? getWeaponRange(base),
    qualityName: item?.qualityName ?? item?.selectedQuality ?? "",
    qualityCost: item?.qualityCost ?? 0,
    totalBonus: item?.totalBonus ?? 0,
    selectedQuality: item?.selectedQuality ?? "",
    precModifier: item?.modifiers?.accuracy ?? item?.precModifier ?? 0,
    damageModifier: item?.modifiers?.damage ?? item?.damageModifier ?? 0,
    defModifier: item?.modifiers?.def ?? item?.defModifier ?? 0,
    mDefModifier: item?.modifiers?.mdef ?? item?.mDefModifier ?? 0,
    isEquipped: item?.isEquipped ?? false,
    // Populate nested objects so WeaponPersistedSchema validation passes.
    accuracy: {
      attr1: att1,
      attr2: att2,
      value: acc.value ?? 0,
      defense: acc.defense ?? "def",
    },
    damage: { value: dmg.value ?? 0, type, hrZero: damageHrZero },
    itemType: "weapon",
    meta: {
      isOfficial: false,
      ...(item?.meta ?? {}),
      book: item?.meta?.book ?? (item as { book?: string })?.book ?? "homebrew",
    },
  } as WeaponPersisted;
}

export function buildWeaponSavePayload(
  formState: WeaponPersisted,
  originalItem?: Partial<WeaponPersisted> | null,
): WeaponPersisted {
  const {
    base,
    name,
    category,
    type,
    hands,
    att1,
    att2,
    martial,
    damageHrZero,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityName,
    qualityCost,
    totalBonus,
    selectedQuality,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
    isEquipped,
    fuid,
  } = formState;

  const savedCost = calcWeaponCost({
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
  });
  const savedDamage = calcWeaponDamage({
    base,
    hands,
    rework,
    damageBonus,
    damageReworkBonus,
    damageModifier,
    cost: savedCost,
  });
  const savedPrec = calcWeaponPrec({ base, rework, precBonus, precModifier });

  return normalizeWeaponLike({
    base,
    name,
    category,
    fuid,
    range: getWeaponRange(base),
    type,
    hands,
    att1,
    att2,
    martial,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityName,
    qualityCost,
    totalBonus,
    selectedQuality,
    cost: savedCost,
    damage: { value: savedDamage, type, hrZero: damageHrZero },
    prec: savedPrec,
    defModifier: parseInt(String(defModifier)),
    mDefModifier: parseInt(String(mDefModifier)),
    precModifier: parseInt(String(precModifier)),
    damageModifier: parseInt(String(damageModifier)),
    isEquipped:
      (originalItem?.hands ?? allWeapons[0].hands) !== hands ||
      (originalItem?.martial ?? false) !== martial
        ? false
        : isEquipped,
  }) as WeaponPersisted;
}

export function calcWeaponPreview(formState: WeaponPersisted) {
  const {
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
    hands,
    damageReworkBonus,
    damageModifier,
    precModifier,
  } = formState;
  const cost = calcWeaponCost({
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
  });
  const damage = calcWeaponDamage({
    base,
    hands,
    rework,
    damageBonus,
    damageReworkBonus,
    damageModifier,
    cost,
  });
  const prec = calcWeaponPrec({ base, rework, precBonus, precModifier });
  return { cost, damage, prec };
}
