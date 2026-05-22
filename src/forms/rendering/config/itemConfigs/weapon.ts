import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import { metaFieldConfigWithGroup } from "../metaFieldConfig";
import type { WeaponPersisted } from "../../../schema/itemSchemas/weapon";
import {
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
  getWeaponAttr1,
  getWeaponAttr2,
  getWeaponRange,
  getWeaponType,
} from "../../../../libs/weaponNormalization";
import { Attributes, Elements } from "../../../../types/Misc";
import weapons from "../../../../libs/weapons";
import weaponCategories from "../../../../libs/weaponCategories";
import attributes from "../../../../libs/attributes";
import { typeOptions } from "../typeOptions";
import allQualities from "../../../../libs/qualities";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
const qualities = allQualities.filter((q) => q.filter?.includes("weapon"));
import groupBy from "../../../../libs/groupby";
import type { SelectOption, SelectGroup } from "../../fieldRenderers";

// Full definition lives in libs/weapons.js (untyped).
interface WeaponBase {
  name: string;
  category: string;
  martial: boolean;
  hands: 1 | 2;
  cost: number;
  accuracy?: { attr1: string; attr2: string; value: number };
  damage?: { value: number; type: string } | number;
  range?: string;
  ranged?: boolean;
  att1?: string;
  att2?: string;
  prec?: number;
  dmg?: number;
  type?: string;
}

export interface WeaponRareBonuses {
  precBonus: boolean;
  damageBonus: boolean;
  damageReworkBonus: boolean;
}

export type WeaponFormState = Omit<WeaponPersisted, "base"> & {
  base: WeaponBase | undefined;
  att1: Attributes;
  att2: Attributes;
  type: Elements;
  damageHrZero: boolean;
  precModifier: number;
  damageModifier: number;
  defModifier: number;
  mDefModifier: number;
  qualityName: string;
  rareBonuses: WeaponRareBonuses;
};
const WEAPON_LABEL_PREFIX = "weapon";

// Option lists built once at module load.
const weaponGroups: SelectGroup[] = Object.entries(
  groupBy(weapons, "category") as Record<string, typeof weapons>,
).map(([category, ws]) => ({
  header: category,
  options: ws.map((w) => ({ value: w.name, label: w.name })),
}));

const categoryOptions: SelectOption[] = weaponCategories.map((c: string) => ({
  value: c,
  label: c,
}));

const attributeOptions: SelectOption[] = Object.entries(
  attributes as Record<string, { shortcaps: string }>,
).map(([key, val]) => ({ value: key, label: val.shortcaps }));

const handsOptions: SelectOption[] = [
  { value: 1, label: "One Hand" },
  { value: 2, label: "Two Hand" },
];

const qualityGroups: SelectGroup[] = Object.entries(
  groupBy(qualities, "category") as Record<
    string,
    { name: string; cost: number; quality: string; category: string }[]
  >,
).map(([category, qs]) => ({
  header: category,
  options: qs.map((q) => ({ value: q.name, label: `${q.name} (${q.cost}z)` })),
}));

// Section keys - control rendering order.
const G = {
  base: "base",
  core: "core",
  accuracy: "accuracy",
  damage: "damage",
  modifiers: "modifiers",
  rare: "rare",
  rareBonus: "rareBonus",
  quality: "quality",
  meta: "meta",
  source: "source",
} as const;

export const weaponGroupLabels: GroupLabels = {
  core: "section.core",
  accuracy: "section.accuracy",
  damage: "section.damage",
  quality: "section.quality",
  rareBonus: "section.rareBonus",
  modifiers: "section.modifiers",
};

export const weaponFieldConfig: ItemFieldConfig<WeaponFormState> = [
  // Core
  {
    key: "base",
    kind: "form-state",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.base),
    component: "grouped-select",
    defaultValue: undefined,
    group: G.base,
    order: 0,
    gridSize: "grow",
    componentProps: { groups: weaponGroups },
    format: (v) => (v as WeaponBase | undefined)?.name ?? "",
    parse: (v) => {
      const w = weapons.find((w) => w.name === v) ?? weapons[0];
      return { ...w, hands: w.hands as 1 | 2 } as WeaponBase;
    },
    onChangeEffects: {
      name: (s) => s.base?.name ?? s.name,
      category: (s) => s.base?.category ?? s.category,
      martial: (s) => s.base?.martial ?? s.martial,
      hands: (s) => s.base?.hands ?? s.hands,
      att1: (s) => getWeaponAttr1(s.base) ?? s.att1,
      att2: (s) => getWeaponAttr2(s.base) ?? s.att2,
      type: (s) => getWeaponType(s.base) ?? s.type,
      range: (s) => getWeaponRange(s.base) ?? s.range,
      // Reset bonuses when base changes.
      damageBonus: () => false,
      damageReworkBonus: () => false,
      precBonus: () => false,
    },
  },
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
    gridSize: { xs: 12, md: 10 },
  },
  {
    key: "martial",
    kind: "editable",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.martial),
    component: "martial-toggle",
    defaultValue: false,
    group: G.core,
    order: 2,
    gridSize: { xs: 12, md: 2 },
  },
  {
    key: "category",
    kind: "editable",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.category),
    component: "select",
    defaultValue: "Sword",
    group: G.core,
    order: 3,
    gridSize: 4,
    componentProps: { options: categoryOptions },
  },
  {
    key: "hands",
    kind: "editable",
    label: "shared.hands",
    component: "select",
    defaultValue: 1,
    group: G.core,
    order: 4,
    gridSize: 4,
    componentProps: { options: handsOptions },
    parse: (v) => Number(v) as 1 | 2,
    onChangeEffects: {
      "damage.value": (s) =>
        calcWeaponDamage({
          base: s.base,
          hands: s.hands,
          rework: s.rework,
          damageBonus: s.damageBonus,
          damageReworkBonus: s.damageReworkBonus,
          damageModifier: s.damageModifier,
          cost: calcWeaponCost({
            base: s.base,
            type: s.type,
            att1: s.att1,
            att2: s.att2,
            rework: s.rework,
            damageBonus: s.damageBonus,
            precBonus: s.precBonus,
            qualityCost: s.qualityCost,
          }),
        }),
    },
  },
  {
    key: "range",
    kind: "editable",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.range),
    component: "select",
    defaultValue: "melee",
    group: G.core,
    order: 5,
    gridSize: 4,
    componentProps: {
      options: [
        { value: "melee", label: "weapon_range_melee" },
        { value: "ranged", label: "weapon_range_ranged" },
      ],
      disabled: true,
    },
  },
  // Accuracy
  {
    key: "att1",
    kind: "editable",
    label: "shared.accuracy.attr1",
    component: "select",
    defaultValue: Attributes.Dexterity,
    group: G.accuracy,
    order: 10,
    componentProps: { options: attributeOptions },
    onChangeEffects: {
      "accuracy.attr1": (s) => s.att1,
      cost: (s) =>
        calcWeaponCost({
          base: s.base,
          type: s.type,
          att1: s.att1,
          att2: s.att2,
          rework: s.rework,
          damageBonus: s.damageBonus,
          precBonus: s.precBonus,
          qualityCost: s.qualityCost,
        }),
    },
  },
  {
    key: "att2",
    kind: "editable",
    label: "shared.accuracy.attr2",
    component: "select",
    defaultValue: Attributes.Insight,
    group: G.accuracy,
    order: 11,
    componentProps: { options: attributeOptions },
    onChangeEffects: {
      "accuracy.attr2": (s) => s.att2,
      cost: (s) =>
        calcWeaponCost({
          base: s.base,
          type: s.type,
          att1: s.att1,
          att2: s.att2,
          rework: s.rework,
          damageBonus: s.damageBonus,
          precBonus: s.precBonus,
          qualityCost: s.qualityCost,
        }),
    },
  },
  {
    key: "accuracy",
    kind: "computed",
    label: "weapon.accuracy",
    group: G.accuracy,
    order: 12,
  },
  // Damage
  {
    key: "type",
    kind: "editable",
    label: "shared.damage.type",
    component: "type-select",
    defaultValue: Elements.Physical,
    group: G.damage,
    order: 20,
    componentProps: { options: typeOptions },
    onChangeEffects: {
      "damage.type": (s) => s.type,
      cost: (s) =>
        calcWeaponCost({
          base: s.base,
          type: s.type,
          att1: s.att1,
          att2: s.att2,
          rework: s.rework,
          damageBonus: s.damageBonus,
          precBonus: s.precBonus,
          qualityCost: s.qualityCost,
        }),
    },
  },
  {
    key: "damage",
    kind: "computed",
    label: "weapon.damage",
    group: G.damage,
    order: 21,
  },
  {
    key: "damageHrZero",
    kind: "editable",
    label: "shared.damage.hrZero",
    component: "checkbox",
    defaultValue: false,
    group: G.damage,
    order: 22,
    onChangeEffects: {
      "damage.hrZero": (s) => s.damageHrZero,
    },
  },
  //  Modifiers
  {
    key: "precModifier",
    kind: "editable",
    label: "shared.modifiers.accuracy",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 30,
    onChangeEffects: {
      "modifiers.accuracy": (s) => s.precModifier,
      "accuracy.value": (s) =>
        calcWeaponPrec({
          base: s.base,
          rework: s.rework,
          precBonus: s.precBonus,
          precModifier: s.precModifier,
        }),
    },
  },
  {
    key: "damageModifier",
    kind: "editable",
    label: "shared.modifiers.damage",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 31,
    onChangeEffects: {
      "modifiers.damage": (s) => s.damageModifier,
      "damage.value": (s) =>
        calcWeaponDamage({
          base: s.base,
          hands: s.hands,
          rework: s.rework,
          damageBonus: s.damageBonus,
          damageReworkBonus: s.damageReworkBonus,
          damageModifier: s.damageModifier,
          cost: s.cost ?? 0,
        }),
    },
  },
  {
    key: "defModifier",
    kind: "editable",
    label: "shared.modifiers.def",
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
    label: "shared.modifiers.mdef",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 33,
    onChangeEffects: {
      "modifiers.mdef": (s) => s.mDefModifier,
    },
  },
  {
    key: "rework",
    kind: "form-state",
    label: "shared.rework",
    component: "checkbox",
    defaultValue: false,
    group: G.rare,
    order: 43,
    onChangeEffects: {
      cost: (s) =>
        calcWeaponCost({
          base: s.base,
          type: s.type,
          att1: s.att1,
          att2: s.att2,
          rework: s.rework,
          damageBonus: s.damageBonus,
          precBonus: s.precBonus,
          qualityCost: s.qualityCost,
        }),
      totalBonus: (s) =>
        Math.floor(
          calcWeaponCost({
            base: s.base,
            type: s.type,
            att1: s.att1,
            att2: s.att2,
            rework: s.rework,
            damageBonus: s.damageBonus,
            precBonus: s.precBonus,
            qualityCost: s.qualityCost,
          }) / 1000,
        ) * 2,
    },
  },
  {
    key: "rareBonuses",
    kind: "form-state",
    label: "weapon.rare.bonuses",
    component: "rare-bonus-block",
    defaultValue: {
      precBonus: false,
      damageBonus: false,
      damageReworkBonus: false,
    },
    group: G.rareBonus,
    order: 40,
    fullWidth: true,
    onChangeEffects: {
      precBonus: (s) => (s.rareBonuses as WeaponRareBonuses).precBonus,
      damageBonus: (s) => (s.rareBonuses as WeaponRareBonuses).damageBonus,
      damageReworkBonus: (s) =>
        (s.rareBonuses as WeaponRareBonuses).damageReworkBonus,
      "rare.accuracyBonus": (s) =>
        (s.rareBonuses as WeaponRareBonuses).precBonus,
      "rare.damageBonus": (s) =>
        (s.rareBonuses as WeaponRareBonuses).damageBonus,
      "accuracy.value": (s) =>
        calcWeaponPrec({
          base: s.base,
          rework: s.rework,
          precBonus: (s.rareBonuses as WeaponRareBonuses).precBonus,
          precModifier: s.precModifier,
        }),
      "damage.value": (s) =>
        calcWeaponDamage({
          base: s.base,
          hands: s.hands,
          rework: s.rework,
          damageBonus: (s.rareBonuses as WeaponRareBonuses).damageBonus,
          damageReworkBonus: (s.rareBonuses as WeaponRareBonuses)
            .damageReworkBonus,
          damageModifier: s.damageModifier,
          cost: calcWeaponCost({
            base: s.base,
            type: s.type,
            att1: s.att1,
            att2: s.att2,
            rework: s.rework,
            damageBonus: (s.rareBonuses as WeaponRareBonuses).damageBonus,
            precBonus: (s.rareBonuses as WeaponRareBonuses).precBonus,
            qualityCost: s.qualityCost,
          }),
        }),
      cost: (s) =>
        calcWeaponCost({
          base: s.base,
          type: s.type,
          att1: s.att1,
          att2: s.att2,
          rework: s.rework,
          damageBonus: (s.rareBonuses as WeaponRareBonuses).damageBonus,
          precBonus: (s.rareBonuses as WeaponRareBonuses).precBonus,
          qualityCost: s.qualityCost,
        }),
    },
  },

  {
    key: "selectedQuality",
    kind: "form-state",
    label: "shared.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.quality,
    order: 50,
    componentProps: { groups: qualityGroups, allowClear: true },
    onChangeEffects: {
      qualityName: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        return q?.name ?? s.qualityName;
      },
      quality: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        return q?.quality ?? s.quality;
      },
      qualityCost: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        return q?.cost ?? s.qualityCost;
      },
    },
  },
  {
    key: "qualityName",
    kind: "editable",
    label: "weapon.quality.name",
    component: "text",
    defaultValue: "",
    group: G.quality,
    order: 51,
  },
  {
    key: "qualityCost",
    kind: "form-state",
    label: "shared.quality.cost",
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 52,
    fullWidth: true,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
    onChangeEffects: {
      cost: (s) =>
        calcWeaponCost({
          base: s.base,
          type: s.type,
          att1: s.att1,
          att2: s.att2,
          rework: s.rework,
          damageBonus: s.damageBonus,
          precBonus: s.precBonus,
          qualityCost: s.qualityCost,
        }),
    },
  },
  {
    key: "quality",
    kind: "editable",
    label: "shared.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 53,
    fullWidth: true,
  },
  // Computed / meta
  {
    key: "cost",
    kind: "computed",
    label: prefixedLabel(WEAPON_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "readonly-number",
    group: G.meta,
    order: 60,
  },
  {
    key: "totalBonus",
    kind: "computed",
    label: "weapon.totalBonus",
    group: G.meta,
    order: 61,
  },
  {
    key: "isEquipped",
    kind: "form-state",
    label: "shared.isEquipped",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 62,
  },
  ...(metaFieldConfigWithGroup(
    G.source,
  ) as unknown as ItemFieldConfig<WeaponFormState>),
];
