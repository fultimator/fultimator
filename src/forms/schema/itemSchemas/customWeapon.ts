import { z } from "zod";
import { Attributes, Elements } from "../../../types/Misc";
import { MetaSchema } from "../meta";
import { BehaviorSchema } from "../shared/behaviorSchemas";
import {
  categories,
  accuracyChecks,
} from "../../../routes/equip/customWeapons/libs";
import { calculateCustomWeaponStats } from "../../../libs/playerCalculations";
import { SLOT_TIERS } from "../../../libs/player/slotTiers";
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
  id: z.string().optional(),
  itemType: z.literal("customWeapon"),
  name: z.string().min(1),
  description: z.string().optional(),
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
  behaviors: z.array(BehaviorSchema).optional(),
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

function normalizeAccuracyCheck(
  value: unknown,
  fallback = {
    attr1: accuracyChecks[0].att1 as Attributes,
    attr2: accuracyChecks[0].att2 as Attributes,
  },
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = value as any;
  const attr1 = Array.isArray(v)
    ? v[0]
    : (v?.accuracy?.attr1 ?? v?.attr1 ?? v?.att1 ?? v?.accuracy?.att1);
  const attr2 = Array.isArray(v)
    ? v[1]
    : (v?.accuracy?.attr2 ?? v?.attr2 ?? v?.att2 ?? v?.accuracy?.att2);
  const validAttrs = ["dexterity", "insight", "might", "will"];
  if (validAttrs.includes(attr1) && validAttrs.includes(attr2))
    return { attr1, attr2 };
  return fallback;
}

export interface PlayerShape {
  settings?: {
    optionalRules?: { technospheres?: boolean; technospheresVariant?: string };
  };
  info?: { zenit?: number };
  equipment?: Array<{
    hoplospheres?: Array<{ id: string; requiredSlots?: number }>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface CustomWeaponCtx {
  player?: PlayerShape;
  setPlayer?: (fn: (prev: PlayerShape) => PlayerShape) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomWeaponFormStateLoose = Record<string, any>;

export function buildCustomWeaponFormState(
  item?: Partial<CustomWeaponPersisted> | null,
  ctx?: CustomWeaponCtx,
): CustomWeaponFormStateLoose {
  const isTechnospheres =
    ctx?.player?.settings?.optionalRules?.technospheres ?? false;
  const technospheresVariant =
    ctx?.player?.settings?.optionalRules?.technospheresVariant ?? "standard";
  const isSlotsVariant =
    isTechnospheres && technospheresVariant !== "mnemospheres";
  const isIntegrated =
    isTechnospheres &&
    (technospheresVariant === "integrated" ||
      technospheresVariant === "hoplospheres");

  if (!item) {
    return {
      itemType: "customWeapon",
      name: "",
      description: "",
      category: categories[0],
      range: "melee",
      hands: 2,
      martial: false,
      accuracy: {
        attr1: "dexterity",
        attr2: "insight",
        value: 0,
        defense: "def",
      },
      damage: { value: 0, type: "physical", hrZero: false },
      modifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
      rare: {
        accuracyBonus: false,
        damageBonus: false,
        overrideDamageType: false,
        overrideAccuracyAttributes: false,
      },
      customizations: [],
      quality: "",
      qualityCost: 0,
      cost: 300,
      slots: "alpha",
      slotted: [],
      secondName: "",
      secondCategory: categories[0],
      secondRange: "melee",
      secondAccuracy: undefined,
      secondDamage: undefined,
      secondModifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
      secondCustomizations: [],
      dataType: "weapon",
      selectedQuality: "",
      qualityName: "",
      isEquipped: false,
      selectedCategory: categories[0],
      selectedRange: "melee",
      selectedAccuracyCheck: {
        attr1: accuracyChecks[0].att1,
        attr2: accuracyChecks[0].att2,
      },
      customDamageType: "physical",
      primaryHrZero: false,
      rareAccuracyBonus: false,
      rareDamageBonus: false,
      overrideDamageType: false,
      overrideAccuracyAttributes: false,
      precModifier: 0,
      damageModifier: 0,
      defModifier: 0,
      mDefModifier: 0,
      hasTransforming: false,
      secondWeaponName: "",
      secondSelectedCategory: categories[0],
      secondSelectedRange: "melee",
      secondSelectedAccuracyCheck: {
        attr1: accuracyChecks[0].att1,
        attr2: accuracyChecks[0].att2,
      },
      secondaryHrZero: false,
      secondOverrideDamageType: false,
      secondCustomDamageType: "physical",
      secondPrecModifier: 0,
      secondDamageModifier: 0,
      secondDefModifier: 0,
      secondMDefModifier: 0,
      isSlotsVariant,
      isIntegrated,
    };
  }

  const rare = item.rare;
  const overrideAccuracyAttributes = rare?.overrideAccuracyAttributes ?? false;
  const ac = item.accuracy;
  const selectedAccuracyCheck = overrideAccuracyAttributes
    ? normalizeAccuracyCheck(ac)
    : (() => {
        const found =
          accuracyChecks.find(
            (c) => c.att1 === ac?.attr1 && c.att2 === ac?.attr2,
          ) ?? accuracyChecks[0];
        return { attr1: found.att1, attr2: found.att2 };
      })();

  const secondAc = item.secondAccuracy;
  const secondSelectedAccuracyCheck = (() => {
    const found =
      accuracyChecks.find(
        (c) => c.att1 === secondAc?.attr1 && c.att2 === secondAc?.attr2,
      ) ?? accuracyChecks[0];
    return { attr1: found.att1, attr2: found.att2 };
  })();

  const overrideDamageType = rare?.overrideDamageType ?? false;
  const customDamageType =
    rare?.overrideDamageTypeValue ?? item.damage?.type ?? "physical";
  const currentCustomizations = item.customizations ?? [];
  const hasTransforming = currentCustomizations.some(
    (c) => c.name === "weapon_customization_transforming",
  );

  return {
    itemType: "customWeapon",
    id: item.id,
    name: item.name ?? "",
    description: item.description ?? "",
    category: item.category ?? categories[0],
    range: item.range ?? "melee",
    hands: item.hands ?? 2,
    martial: item.martial ?? false,
    accuracy: item.accuracy ?? {
      attr1: "dexterity",
      attr2: "insight",
      value: 0,
      defense: "def",
    },
    damage: item.damage ?? { value: 0, type: "physical", hrZero: false },
    modifiers: item.modifiers ?? { damage: 0, accuracy: 0, def: 0, mdef: 0 },
    rare: {
      accuracyBonus: rare?.accuracyBonus ?? false,
      damageBonus: rare?.damageBonus ?? false,
      overrideDamageType,
      overrideAccuracyAttributes,
      overrideDamageTypeValue: customDamageType,
      overrideAccuracyAttr1: selectedAccuracyCheck.attr1,
      overrideAccuracyAttr2: selectedAccuracyCheck.attr2,
    },
    customizations: currentCustomizations,
    quality: item.quality ?? "",
    qualityCost: item.qualityCost ?? 0,
    cost: item.cost ?? 300,
    slots: item.slots ?? "alpha",
    slotted: item.slotted ?? [],
    secondName: item.secondName ?? "",
    secondCategory: item.secondCategory ?? categories[0],
    secondRange: item.secondRange ?? "melee",
    secondAccuracy: item.secondAccuracy,
    secondDamage: item.secondDamage,
    secondModifiers: item.secondModifiers ?? {
      damage: 0,
      accuracy: 0,
      def: 0,
      mdef: 0,
    },
    secondCustomizations: item.secondCustomizations ?? [],
    dataType: "weapon",
    selectedQuality: item.selectedQuality ?? "",
    qualityName: item.qualityName ?? "",
    isEquipped: item.isEquipped ?? false,
    selectedCategory: item.category ?? categories[0],
    selectedRange: item.range ?? "melee",
    selectedAccuracyCheck,
    customDamageType,
    primaryHrZero: item.damage?.hrZero === true,
    rareAccuracyBonus: rare?.accuracyBonus ?? false,
    rareDamageBonus: rare?.damageBonus ?? false,
    overrideDamageType,
    overrideAccuracyAttributes,
    precModifier: item.modifiers?.accuracy ?? 0,
    damageModifier: item.modifiers?.damage ?? 0,
    defModifier: item.modifiers?.def ?? 0,
    mDefModifier: item.modifiers?.mdef ?? 0,
    hasTransforming,
    secondWeaponName: item.secondName ?? "",
    secondSelectedCategory: item.secondCategory ?? categories[0],
    secondSelectedRange: item.secondRange ?? "melee",
    secondSelectedAccuracyCheck,
    secondaryHrZero: item.secondDamage?.hrZero === true,
    secondOverrideDamageType: !!(
      item.secondDamage?.type && item.secondDamage.type !== "physical"
    ),
    secondCustomDamageType: item.secondDamage?.type ?? "physical",
    secondPrecModifier: item.secondModifiers?.accuracy ?? 0,
    secondDamageModifier: item.secondModifiers?.damage ?? 0,
    secondDefModifier: item.secondModifiers?.def ?? 0,
    secondMDefModifier: item.secondModifiers?.mdef ?? 0,
    isSlotsVariant,
    isIntegrated,
  };
}

export function buildCustomWeaponSavePayload(
  formState: CustomWeaponFormStateLoose,
  originalItem?: CustomWeaponFormStateLoose | null,
): CustomWeaponFormStateLoose {
  const { precision, damage: dmgVal } = calculateCustomWeaponStats(
    {
      category: formState.selectedCategory,
      customizations: formState.customizations,
      rareAccuracyBonus: formState.rareAccuracyBonus,
      rareDamageBonus: formState.rareDamageBonus,
      damageModifier: parseInt(formState.damageModifier) || 0,
      precModifier: parseInt(formState.precModifier) || 0,
    },
    false,
  );

  const hasElemental = (formState.customizations ?? []).some(
    (c: { name: string }) => c.name === "weapon_customization_elemental",
  );
  const resolvedDamageType = hasElemental
    ? formState.customDamageType
    : formState.overrideDamageType
      ? formState.customDamageType
      : "physical";

  let secondAccuracy:
    | { attr1: string; attr2: string; value: number; defense: string }
    | undefined;
  let secondDamage:
    | { value: number; type: string; hrZero: boolean }
    | undefined;
  if (formState.hasTransforming) {
    const { precision: s2prec, damage: s2dmg } = calculateCustomWeaponStats(
      {
        secondSelectedCategory: formState.secondSelectedCategory,
        secondCurrentCustomizations: formState.secondCustomizations,
        rareAccuracyBonus: formState.rareAccuracyBonus,
        rareDamageBonus: formState.rareDamageBonus,
        secondDamageModifier: parseInt(formState.secondDamageModifier) || 0,
        secondPrecModifier: parseInt(formState.secondPrecModifier) || 0,
      },
      true,
    );
    const s2HasElemental = (formState.secondCustomizations ?? []).some(
      (c: { name: string }) => c.name === "weapon_customization_elemental",
    );
    const s2DamageType = s2HasElemental
      ? formState.secondCustomDamageType
      : formState.secondOverrideDamageType
        ? formState.secondCustomDamageType
        : "physical";
    secondAccuracy = {
      attr1: formState.secondSelectedAccuracyCheck.attr1,
      attr2: formState.secondSelectedAccuracyCheck.attr2,
      value: s2prec,
      defense: "def",
    };
    secondDamage = {
      value: s2dmg,
      type: s2DamageType,
      hrZero: formState.secondaryHrZero,
    };
  }

  return {
    itemType: "customWeapon",
    id: formState.id,
    name: formState.name,
    description: formState.description ?? "",
    category: formState.selectedCategory,
    range: formState.selectedRange,
    accuracy: {
      attr1: formState.selectedAccuracyCheck.attr1,
      attr2: formState.selectedAccuracyCheck.attr2,
      value: precision,
      defense: "def",
    },
    damage: {
      value: dmgVal,
      type: resolvedDamageType,
      hrZero: formState.primaryHrZero,
    },
    modifiers: {
      damage: parseInt(formState.damageModifier) || 0,
      accuracy: parseInt(formState.precModifier) || 0,
      def: parseInt(formState.defModifier) || 0,
      mdef: parseInt(formState.mDefModifier) || 0,
    },
    rare: {
      accuracyBonus: formState.rareAccuracyBonus,
      damageBonus: formState.rareDamageBonus,
      overrideDamageType: formState.overrideDamageType,
      overrideAccuracyAttributes: formState.overrideAccuracyAttributes,
      overrideDamageTypeValue: formState.customDamageType,
      overrideAccuracyAttr1: formState.selectedAccuracyCheck.attr1,
      overrideAccuracyAttr2: formState.selectedAccuracyCheck.attr2,
    },
    customizations: formState.customizations ?? [],
    selectedQuality: formState.selectedQuality,
    qualityName: formState.qualityName,
    quality: formState.quality,
    qualityCost: parseInt(formState.qualityCost) || 0,
    cost: formState.cost ?? 300,
    hands: formState.hands ?? 2,
    martial: formState.martial,
    isEquipped: originalItem != null ? formState.isEquipped : false,
    secondName: formState.secondWeaponName,
    secondCategory: formState.secondSelectedCategory,
    secondRange: formState.secondSelectedRange,
    secondCustomizations: formState.secondCustomizations ?? [],
    secondModifiers: {
      damage: parseInt(formState.secondDamageModifier) || 0,
      accuracy: parseInt(formState.secondPrecModifier) || 0,
      def: parseInt(formState.secondDefModifier) || 0,
      mdef: parseInt(formState.secondMDefModifier) || 0,
    },
    ...(formState.hasTransforming ? { secondAccuracy, secondDamage } : {}),
    dataType: "weapon",
    ...(formState.isSlotsVariant || originalItem?.slots || originalItem?.slotted
      ? { slots: formState.slots, slotted: formState.slotted }
      : {}),
  };
}

export function getCustomWeaponSlotCostInfo(
  formState: CustomWeaponFormStateLoose,
  originalItem?: CustomWeaponFormStateLoose | null,
  ctx?: CustomWeaponCtx,
): { delta: number; currentZenit: number; cannotAfford: boolean } | null {
  if (!formState.isSlotsVariant) return null;
  const paidSlots = originalItem?.slots ?? "alpha";
  const paidTier =
    SLOT_TIERS.find((t) => t.value === paidSlots) ?? SLOT_TIERS[0];
  const selectedTier =
    SLOT_TIERS.find((t) => t.value === formState.slots) ?? SLOT_TIERS[0];
  const delta = selectedTier.cost - paidTier.cost;
  const currentZenit = ctx?.player?.info?.zenit ?? 0;
  return { delta, currentZenit, cannotAfford: delta > currentZenit };
}

export function applyCustomWeaponSlotTierChange(
  formState: CustomWeaponFormStateLoose,
  newTier: string,
  ctx?: CustomWeaponCtx,
): CustomWeaponFormStateLoose {
  const tier = SLOT_TIERS.find((t) => t.value === newTier);
  const hoplospheres = ctx?.player?.equipment?.[0]?.hoplospheres ?? [];
  const kept: string[] = [];
  let used = 0;
  for (const id of (formState.slotted as string[]) ?? []) {
    const hoplo = hoplospheres.find((h) => h.id === id);
    const slotCost = hoplo?.requiredSlots ?? 1;
    if (used + slotCost <= (tier?.slots ?? 1)) {
      kept.push(id);
      used += slotCost;
    }
  }
  return { ...formState, slots: newTier, slotted: kept };
}

export function applyCustomWeaponZenitSideEffect(
  formState: CustomWeaponFormStateLoose,
  originalItem?: CustomWeaponFormStateLoose | null,
  ctx?: CustomWeaponCtx,
): void {
  const info = getCustomWeaponSlotCostInfo(formState, originalItem, ctx);
  if (!info || info.delta === 0 || !ctx?.setPlayer) return;
  ctx.setPlayer((prev) => ({
    ...prev,
    info: {
      ...(prev.info ?? {}),
      zenit: Math.max(0, (prev.info?.zenit ?? 0) - info.delta),
    },
  }));
}
