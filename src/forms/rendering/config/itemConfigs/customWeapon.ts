import type { ItemFieldConfig } from "../fieldConfig";
import { metaFieldConfigWithGroup } from "../metaFieldConfig";
import type { CustomWeaponPersisted } from "../../../schema/itemSchemas/customWeapon";
import { calculateCustomWeaponStats } from "../../../../components/player/common/playerCalculations";
import { Attributes, Elements } from "../../../../types/Misc";
import { categories } from "../../../../routes/equip/customWeapons/libs";
import type { SelectOption } from "../../fieldRenderers";
import { typeOptions } from "../typeOptions";

export type CustomWeaponFormState = CustomWeaponPersisted & {
  selectedCategory: string;
  selectedRange: "melee" | "ranged";
  selectedAccuracyCheck: { attr1: Attributes; attr2: Attributes };
  customDamageType: Elements;
  primaryHrZero: boolean;
  rareAccuracyBonus: boolean;
  rareDamageBonus: boolean;
  overrideDamageType: boolean;
  overrideAccuracyAttributes: boolean;
  precModifier: number;
  damageModifier: number;
  defModifier: number;
  mDefModifier: number;
  hasTransforming: boolean;
  secondWeaponName: string;
  secondSelectedCategory: string;
  secondSelectedRange: "melee" | "ranged";
  secondSelectedAccuracyCheck: { attr1: Attributes; attr2: Attributes };
  secondaryHrZero: boolean;
  secondOverrideDamageType: boolean;
  secondCustomDamageType: Elements;
  secondPrecModifier: number;
  secondDamageModifier: number;
  secondDefModifier: number;
  secondMDefModifier: number;
  isSlotsVariant: boolean;
  qualityName: string;
};

function calcCustomWeaponCost(s: CustomWeaponFormState): number {
  const singleAttributeCost =
    s.overrideAccuracyAttributes &&
    s.selectedAccuracyCheck.attr1 === s.selectedAccuracyCheck.attr2
      ? 50
      : 0;
  return (
    300 +
    (s.hasTransforming ? 100 : 0) +
    (Number(s.qualityCost) || 0) +
    (s.rareAccuracyBonus ? 100 : 0) +
    (s.rareDamageBonus ? 200 : 0) +
    (s.overrideDamageType ? 100 : 0) +
    singleAttributeCost
  );
}

const MARTIAL_CUSTOMIZATIONS = new Set([
  "weapon_customization_quick",
  "weapon_customization_magicdefenseboost",
  "weapon_customization_powerful",
]);

function calcIsMartial(s: CustomWeaponFormState): boolean {
  if ((s.customizations ?? []).some((c) => MARTIAL_CUSTOMIZATIONS.has(c.name)))
    return true;
  const { damage } = calculateCustomWeaponStats(
    {
      category: s.selectedCategory,
      customizations: s.customizations,
      rareAccuracyBonus: s.rareAccuracyBonus,
      rareDamageBonus: s.rareDamageBonus,
      damageModifier: s.damageModifier,
      precModifier: s.precModifier,
    },
    false,
  );
  if (damage >= 10) return true;
  if (!s.hasTransforming) return false;
  const { damage: secondaryDamage } = calculateCustomWeaponStats(
    {
      secondSelectedCategory: s.secondSelectedCategory,
      secondCurrentCustomizations: s.secondCustomizations,
      rareAccuracyBonus: s.rareAccuracyBonus,
      rareDamageBonus: s.rareDamageBonus,
      secondDamageModifier: s.secondDamageModifier,
      secondPrecModifier: s.secondPrecModifier,
    },
    true,
  );
  return secondaryDamage >= 10;
}

const RESTRICTED_CATEGORIES = ["arcane", "dagger"];

// Pre-built static option lists.
const categoryOptions: SelectOption[] = categories.map((c: string) => ({
  value: c,
  label: c,
}));

const rangeOptions: SelectOption[] = [
  { value: "melee", label: "weapon_range_melee" },
  { value: "ranged", label: "weapon_range_ranged" },
];

const G = {
  core: "core",
  accuracy: "accuracy",
  damage: "damage",
  modifiers: "modifiers",
  rare: "rare",
  quality: "quality",
  slots: "slots",
  secondary: "secondary",
  secondaryModifiers: "secondaryModifiers",
  meta: "meta",
  source: "source",
} as const;

export const customWeaponFieldConfig: ItemFieldConfig<CustomWeaponFormState> = [
  // Core
  {
    key: "name",
    kind: "editable",
    label: "customWeapon.name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 0,
    validationHints: { required: true },
  },
  {
    key: "selectedCategory",
    kind: "editable",
    label: "customWeapon.category",
    component: "select",
    defaultValue: categories[0],
    group: G.core,
    order: 1,
    componentProps: { options: categoryOptions },
    onChangeEffects: {
      category: (s) => s.selectedCategory,
      // "powerful" customization is not allowed on arcane/dagger.
      customizations: (s) =>
        RESTRICTED_CATEGORIES.some((r) =>
          s.selectedCategory.toLowerCase().includes(r),
        )
          ? (s.customizations ?? []).filter(
              (c) => c.name !== "weapon_customization_powerful",
            )
          : s.customizations,
    },
  },
  {
    key: "selectedRange",
    kind: "editable",
    label: "customWeapon.range",
    component: "select",
    defaultValue: "melee",
    group: G.core,
    order: 2,
    componentProps: { options: rangeOptions },
    onChangeEffects: {
      range: (s) => s.selectedRange,
    },
  },
  {
    key: "customizations",
    kind: "editable",
    label: "customWeapon.customizations",
    component: "customization-list",
    defaultValue: [],
    group: G.core,
    order: 5,
    fullWidth: true,
    // selectedCategory and rareAccuracyBonus flow in via extraProps at render time.
    onChangeEffects: {
      martial: calcIsMartial,
      cost: calcCustomWeaponCost,
      hasTransforming: (s) =>
        (s.customizations ?? []).some(
          (c) => c.name === "weapon_customization_transforming",
        ),
      secondCustomizations: (s) => {
        const hasTransforming = (s.customizations ?? []).some(
          (c) => c.name === "weapon_customization_transforming",
        );
        if (!hasTransforming) return [];
        if ((s.secondCustomizations ?? []).length > 0)
          return s.secondCustomizations;
        const transforming = (s.customizations ?? []).find(
          (c) => c.name === "weapon_customization_transforming",
        );
        return transforming ? [transforming] : [];
      },
    },
  },
  // Accuracy
  {
    key: "selectedAccuracyCheck",
    kind: "editable",
    label: "customWeapon.accuracy.attrs",
    component: "accuracy-check",
    defaultValue: { attr1: Attributes.Dexterity, attr2: Attributes.Insight },
    group: G.accuracy,
    order: 10,
    // Hidden when overrideAccuracyAttributes is active (individual pickers shown in rare instead).
    dependencies: (s) => s.overrideAccuracyAttributes !== true,
    onChangeEffects: {
      "accuracy.attr1": (s) => s.selectedAccuracyCheck.attr1,
      "accuracy.attr2": (s) => s.selectedAccuracyCheck.attr2,
      cost: calcCustomWeaponCost,
    },
  },
  // Damage
  {
    key: "customDamageType",
    kind: "editable",
    label: "customWeapon.damage.type",
    component: "type-select",
    defaultValue: Elements.Physical,
    group: G.damage,
    order: 20,
    componentProps: { options: typeOptions },
    dependencies: (s) =>
      s.overrideDamageType === true ||
      (s.customizations ?? []).some(
        (c) => c.name === "weapon_customization_elemental",
      ),
    onChangeEffects: {
      "damage.type": (s) => s.customDamageType,
    },
  },
  {
    key: "primaryHrZero",
    kind: "editable",
    label: "customWeapon.damage.hrZero",
    component: "checkbox",
    defaultValue: false,
    group: G.damage,
    order: 21,
    onChangeEffects: {
      "damage.hrZero": (s) => s.primaryHrZero,
    },
  },
  // Modifiers (accordion)
  {
    key: "precModifier",
    kind: "editable",
    label: "customWeapon.modifiers.accuracy",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 30,
    onChangeEffects: {
      "modifiers.accuracy": (s) => s.precModifier,
      "accuracy.value": (s) =>
        calculateCustomWeaponStats(
          {
            category: s.selectedCategory,
            customizations: s.customizations,
            rareAccuracyBonus: s.rareAccuracyBonus,
            rareDamageBonus: s.rareDamageBonus,
            damageModifier: s.damageModifier,
            precModifier: s.precModifier,
          },
          false,
        ).precision,
    },
  },
  {
    key: "damageModifier",
    kind: "editable",
    label: "customWeapon.modifiers.damage",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 31,
    onChangeEffects: {
      "modifiers.damage": (s) => s.damageModifier,
      "damage.value": (s) =>
        calculateCustomWeaponStats(
          {
            category: s.selectedCategory,
            customizations: s.customizations,
            rareAccuracyBonus: s.rareAccuracyBonus,
            rareDamageBonus: s.rareDamageBonus,
            damageModifier: s.damageModifier,
            precModifier: s.precModifier,
          },
          false,
        ).damage,
    },
  },
  {
    key: "defModifier",
    kind: "editable",
    label: "customWeapon.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 32,
    onChangeEffects: {
      "modifiers.def": (s) => s.defModifier,
    },
  },
  {
    key: "mDefModifier",
    kind: "editable",
    label: "customWeapon.modifiers.mdef",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 33,
    onChangeEffects: {
      "modifiers.mdef": (s) => s.mDefModifier,
    },
  },
  // Rare (within modifiers accordion)
  {
    key: "rareAccuracyBonus",
    kind: "editable",
    label: "customWeapon.rare.accuracyBonus",
    component: "checkbox",
    defaultValue: false,
    group: G.rare,
    order: 40,
    onChangeEffects: {
      "rare.accuracyBonus": (s) => s.rareAccuracyBonus,
      "accuracy.value": (s) =>
        calculateCustomWeaponStats(
          {
            category: s.selectedCategory,
            customizations: s.customizations,
            rareAccuracyBonus: s.rareAccuracyBonus,
            rareDamageBonus: s.rareDamageBonus,
            damageModifier: s.damageModifier,
            precModifier: s.precModifier,
          },
          false,
        ).precision,
      cost: calcCustomWeaponCost,
    },
  },
  {
    key: "rareDamageBonus",
    kind: "editable",
    label: "customWeapon.rare.damageBonus",
    component: "checkbox",
    defaultValue: false,
    group: G.rare,
    order: 41,
    onChangeEffects: {
      "rare.damageBonus": (s) => s.rareDamageBonus,
      "damage.value": (s) =>
        calculateCustomWeaponStats(
          {
            category: s.selectedCategory,
            customizations: s.customizations,
            rareAccuracyBonus: s.rareAccuracyBonus,
            rareDamageBonus: s.rareDamageBonus,
            damageModifier: s.damageModifier,
            precModifier: s.precModifier,
          },
          false,
        ).damage,
      cost: calcCustomWeaponCost,
    },
  },
  {
    key: "overrideDamageType",
    kind: "editable",
    label: "customWeapon.rare.overrideDamageType",
    component: "checkbox",
    defaultValue: false,
    group: G.rare,
    order: 42,
    onChangeEffects: {
      "rare.overrideDamageType": (s) => s.overrideDamageType,
      cost: calcCustomWeaponCost,
    },
  },
  {
    // Only rendered when overrideDamageType is true; elemental customization takes precedence.
    key: "customDamageType",
    kind: "editable",
    label: "customWeapon.rare.overrideDamageTypeValue",
    component: "type-select",
    defaultValue: Elements.Physical,
    group: G.rare,
    order: 44,
    componentProps: { options: typeOptions },
    dependencies: (s) =>
      s.overrideDamageType === true &&
      !(s.customizations ?? []).some(
        (c) => c.name === "weapon_customization_elemental",
      ),
    onChangeEffects: {
      "rare.overrideDamageTypeValue": (s) => s.customDamageType,
    },
  },
  {
    key: "overrideAccuracyAttributes",
    kind: "editable",
    label: "customWeapon.rare.overrideAccuracyAttributes",
    component: "checkbox",
    defaultValue: false,
    group: G.rare,
    order: 43,
    onChangeEffects: {
      "rare.overrideAccuracyAttributes": (s) => s.overrideAccuracyAttributes,
      cost: calcCustomWeaponCost,
    },
  },
  {
    key: "selectedAccuracyCheck",
    kind: "editable",
    label: "customWeapon.rare.overrideAccuracyAttrs",
    component: "accuracy-attr-pair",
    defaultValue: { attr1: Attributes.Dexterity, attr2: Attributes.Insight },
    group: G.rare,
    order: 45,
    fullWidth: true,
    dependencies: (s) => s.overrideAccuracyAttributes === true,
    onChangeEffects: {
      "accuracy.attr1": (s) => s.selectedAccuracyCheck.attr1,
      "accuracy.attr2": (s) => s.selectedAccuracyCheck.attr2,
      "rare.overrideAccuracyAttr1": (s) => s.selectedAccuracyCheck.attr1,
      "rare.overrideAccuracyAttr2": (s) => s.selectedAccuracyCheck.attr2,
      cost: calcCustomWeaponCost,
    },
  },
  // Quality
  {
    key: "selectedQuality",
    kind: "form-state",
    label: "customWeapon.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.quality,
    order: 50,
    dependencies: (s) => !s.isSlotsVariant,
    componentProps: { allowClear: true },
    // qualityGroups come in via extraProps at render time.
    onChangeEffects: {
      quality: (s) => {
        // Quality text/cost are resolved in the modal onChange wrapper.
        return s.selectedQuality ?? s.quality;
      },
    },
  },
  {
    key: "qualityName",
    kind: "editable",
    label: "customWeapon.quality.name",
    component: "text",
    defaultValue: "",
    group: G.quality,
    order: 51,
    dependencies: (s) => !s.isSlotsVariant,
  },
  {
    key: "qualityCost",
    kind: "editable",
    label: "customWeapon.quality.cost",
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 52,
    dependencies: (s) => !s.isSlotsVariant,
    fullWidth: true,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
    onChangeEffects: {
      cost: calcCustomWeaponCost,
    },
  },
  {
    key: "quality",
    kind: "editable",
    label: "customWeapon.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 53,
    dependencies: (s) => !s.isSlotsVariant,
    fullWidth: true,
  },
  // Slots (technospheres variant)
  {
    key: "slots",
    kind: "editable",
    label: "customWeapon.slots",
    component: "slot-tier-picker",
    defaultValue: "alpha",
    group: G.slots,
    order: 55,
    dependencies: (s) => s.isSlotsVariant === true,
    // isWeapon, isIntegrated, and slot trim logic flow via extraProps.
    onChangeEffects: {
      cost: calcCustomWeaponCost,
    },
  },
  {
    key: "slotted",
    kind: "editable",
    label: "customWeapon.slotted",
    component: "slot-editor",
    defaultValue: [],
    group: G.slots,
    order: 56,
    dependencies: (s) => s.isSlotsVariant === true,
    // player, onAddToBank, and slots (for item shape) flow via extraProps.
  },
  // Secondary weapon (transforming only)
  {
    key: "secondWeaponName",
    kind: "editable",
    label: "customWeapon.second.name",
    component: "text",
    defaultValue: "",
    group: G.secondary,
    order: 60,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      secondName: (s) => s.secondWeaponName,
    },
  },
  {
    key: "secondSelectedCategory",
    kind: "editable",
    label: "customWeapon.second.category",
    component: "select",
    defaultValue: categories[0],
    group: G.secondary,
    order: 61,
    componentProps: { options: categoryOptions },
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      secondCategory: (s) => s.secondSelectedCategory,
      secondCustomizations: (s) =>
        RESTRICTED_CATEGORIES.some((r) =>
          s.secondSelectedCategory.toLowerCase().includes(r),
        )
          ? (s.secondCustomizations ?? []).filter(
              (c) => c.name !== "weapon_customization_powerful",
            )
          : s.secondCustomizations,
    },
  },
  {
    key: "secondSelectedRange",
    kind: "editable",
    label: "customWeapon.second.range",
    component: "select",
    defaultValue: "melee",
    group: G.secondary,
    order: 62,
    componentProps: { options: rangeOptions },
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      secondRange: (s) => s.secondSelectedRange,
    },
  },
  {
    key: "secondSelectedAccuracyCheck",
    kind: "editable",
    label: "customWeapon.second.accuracy.attrs",
    component: "accuracy-check",
    defaultValue: { attr1: Attributes.Dexterity, attr2: Attributes.Insight },
    group: G.secondary,
    order: 63,
    dependencies: (s) =>
      s.hasTransforming === true && s.overrideAccuracyAttributes !== true,
    onChangeEffects: {
      "secondAccuracy.attr1": (s) => s.secondSelectedAccuracyCheck.attr1,
      "secondAccuracy.attr2": (s) => s.secondSelectedAccuracyCheck.attr2,
    },
  },
  {
    key: "secondaryHrZero",
    kind: "editable",
    label: "customWeapon.second.damage.hrZero",
    component: "checkbox",
    defaultValue: false,
    group: G.secondary,
    order: 64,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      "secondDamage.hrZero": (s) => s.secondaryHrZero,
    },
  },
  {
    key: "secondOverrideDamageType",
    kind: "editable",
    label: "customWeapon.second.rare.overrideDamageType",
    component: "checkbox",
    defaultValue: false,
    group: G.secondary,
    order: 65,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      "secondDamage.type": (s) =>
        s.secondOverrideDamageType
          ? s.secondCustomDamageType
          : Elements.Physical,
    },
  },
  {
    key: "secondCustomDamageType",
    kind: "editable",
    label: "customWeapon.second.rare.overrideDamageTypeValue",
    component: "type-select",
    defaultValue: Elements.Physical,
    group: G.secondary,
    order: 66,
    componentProps: { options: typeOptions },
    dependencies: (s) =>
      s.hasTransforming === true &&
      s.secondOverrideDamageType === true &&
      !(s.secondCustomizations ?? []).some(
        (c) => c.name === "weapon_customization_elemental",
      ),
    onChangeEffects: {
      "secondDamage.type": (s) => s.secondCustomDamageType,
    },
  },
  {
    key: "secondCustomizations",
    kind: "editable",
    label: "customWeapon.second.customizations",
    component: "customization-list",
    defaultValue: [],
    group: G.secondary,
    order: 67,
    dependencies: (s) => s.hasTransforming === true,
    // secondSelectedCategory and rareAccuracyBonus flow via extraProps, isSecondForm=true.
    onChangeEffects: {
      martial: calcIsMartial,
    },
  },
  {
    key: "secondPrecModifier",
    kind: "editable",
    label: "customWeapon.second.modifiers.accuracy",
    component: "number",
    defaultValue: 0,
    group: G.secondaryModifiers,
    order: 68,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      "secondModifiers.accuracy": (s) => s.secondPrecModifier,
      "secondAccuracy.value": (s) =>
        calculateCustomWeaponStats(
          {
            secondSelectedCategory: s.secondSelectedCategory,
            secondCurrentCustomizations: s.secondCustomizations,
            rareAccuracyBonus: s.rareAccuracyBonus,
            rareDamageBonus: s.rareDamageBonus,
            secondDamageModifier: s.secondDamageModifier,
            secondPrecModifier: s.secondPrecModifier,
          },
          true,
        ).precision,
    },
  },
  {
    key: "secondDamageModifier",
    kind: "editable",
    label: "customWeapon.second.modifiers.damage",
    component: "number",
    defaultValue: 0,
    group: G.secondaryModifiers,
    order: 69,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      "secondModifiers.damage": (s) => s.secondDamageModifier,
      "secondDamage.value": (s) =>
        calculateCustomWeaponStats(
          {
            secondSelectedCategory: s.secondSelectedCategory,
            secondCurrentCustomizations: s.secondCustomizations,
            rareAccuracyBonus: s.rareAccuracyBonus,
            rareDamageBonus: s.rareDamageBonus,
            secondDamageModifier: s.secondDamageModifier,
            secondPrecModifier: s.secondPrecModifier,
          },
          true,
        ).damage,
    },
  },
  {
    key: "secondDefModifier",
    kind: "editable",
    label: "customWeapon.second.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.secondaryModifiers,
    order: 70,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      "secondModifiers.def": (s) => s.secondDefModifier,
    },
  },
  {
    key: "secondMDefModifier",
    kind: "editable",
    label: "customWeapon.second.modifiers.mdef",
    component: "number",
    defaultValue: 0,
    group: G.secondaryModifiers,
    order: 71,
    dependencies: (s) => s.hasTransforming === true,
    onChangeEffects: {
      "secondModifiers.mdef": (s) => s.secondMDefModifier,
    },
  },
  // Computed / meta
  {
    key: "cost",
    kind: "computed",
    label: "customWeapon.cost",
    component: "readonly-number",
    group: G.meta,
    order: 80,
  },
  {
    key: "martial",
    kind: "computed",
    label: "customWeapon.martial",
    group: G.meta,
    order: 81,
  },
  {
    key: "hasTransforming",
    kind: "computed",
    label: "customWeapon.hasTransforming",
    group: G.meta,
    order: 82,
  },
  ...(metaFieldConfigWithGroup(
    G.source,
  ) as unknown as ItemFieldConfig<CustomWeaponFormState>),
];
