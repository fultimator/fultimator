import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import { metaFieldConfigWithGroup } from "../metaFieldConfig";
import type { ArmorPersisted } from "../../../schema/itemSchemas/armor";
import armor from "../../../../libs/armor";
import allQualities from "../../../../libs/qualities";
const qualities = allQualities.filter((q) => q.filter?.includes("armor"));
import groupBy from "../../../../libs/groupby";
import type { SelectOption, SelectGroup } from "../../fieldRenderers";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

interface ArmorBase {
  name: string;
  cost: number;
  def: number;
  mdef: number;
  martial: boolean;
  init: number;
  category: string;
}

export type ArmorFormState = Omit<ArmorPersisted, "base"> & {
  base: ArmorBase | undefined;
};
const ARMOR_LABEL_PREFIX = "armor";

const armorOptions: SelectOption[] = (armor as ArmorBase[]).map((a) => ({
  value: a.name,
  label: a.name,
}));

const qualityGroups: SelectGroup[] = Object.entries(
  groupBy(qualities, "category") as Record<
    string,
    { name: string; cost: number; quality: string; category: string }[]
  >,
).map(([category, qs]) => ({
  header: category,
  options: qs.map((q) => ({ value: q.name, label: `${q.name} (${q.cost}z)` })),
}));

const G = {
  base: "base",
  core: "core",
  quality: "quality",
  slots: "slots",
  modifiers: "modifiers",
  meta: "meta",
  source: "source",
} as const;

export const armorGroupLabels: GroupLabels = {
  quality: "section.quality",
  slots: "section.slots",
  modifiers: "section.modifiers",
};

export const armorFieldConfig: ItemFieldConfig<ArmorFormState> = [
  {
    key: "base",
    kind: "form-state",
    label: prefixedLabel(ARMOR_LABEL_PREFIX, SHARED_LABEL_KEYS.base),
    component: "select",
    defaultValue: undefined,
    group: G.base,
    order: 0,
    gridSize: "grow",
    componentProps: { options: armorOptions },
    format: (v) => (v as ArmorBase | undefined)?.name ?? "",
    parse: (v) => {
      return (
        (armor as ArmorBase[]).find((a) => a.name === v) ??
        (armor as ArmorBase[])[0]
      );
    },
    onChangeEffects: {
      name: (s) => s.base?.name ?? s.name,
      martial: (s) => s.base?.martial ?? s.martial,
      def: (s) => s.base?.def ?? s.def,
      mdef: (s) => s.base?.mdef ?? s.mdef,
      init: (s) => s.base?.init ?? s.init,
      cost: (s) => (s.base?.cost ?? 0) + (Number(s.qualityCost) || 0),
    },
  },
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(ARMOR_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(ARMOR_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
    gridSize: "grow",
  },
  {
    key: "martial",
    kind: "editable",
    label: prefixedLabel(ARMOR_LABEL_PREFIX, SHARED_LABEL_KEYS.martial),
    component: "martial-toggle",
    defaultValue: false,
    group: G.core,
    order: 2,
    gridSize: "auto",
  },
  {
    key: "rework",
    kind: "editable",
    label: "shared.rework",
    component: "checkbox",
    defaultValue: false,
    group: G.modifiers,
    order: 3,
  },
  // Quality - hidden when technospheres slots variant is active
  {
    key: "selectedQuality",
    kind: "form-state",
    label: "shared.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.quality,
    order: 10,
    dependencies: (s) => !s.isSlotsVariant,
    componentProps: { groups: qualityGroups, allowClear: true },
    onChangeEffects: {
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
      cost: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        const qCost = q?.cost ?? s.qualityCost;
        return (s.base?.cost ?? 0) + (Number(qCost) || 0);
      },
    },
  },
  {
    key: "qualityCost",
    kind: "form-state",
    label: "shared.quality.cost",
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 11,
    dependencies: (s) => !s.isSlotsVariant,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
    onChangeEffects: {
      cost: (s) => (s.base?.cost ?? 0) + (Number(s.qualityCost) || 0),
    },
  },
  {
    key: "quality",
    kind: "editable",
    label: "shared.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 12,
    dependencies: (s) => !s.isSlotsVariant,
    fullWidth: true,
  },
  // Slots - shown only when technospheres slots variant is active
  {
    key: "slots",
    kind: "editable",
    label: "armor.slots",
    component: "slot-tier-picker",
    defaultValue: "alpha",
    group: G.slots,
    order: 20,
    dependencies: (s) => s.isSlotsVariant === true,
    componentProps: { isWeapon: false },
  },
  {
    key: "slotted",
    kind: "editable",
    label: "armor.slotted",
    component: "slot-editor",
    defaultValue: [],
    group: G.slots,
    order: 21,
    dependencies: (s) => s.isSlotsVariant === true,
    fullWidth: true,
  },
  {
    key: "defModifier",
    kind: "editable",
    label: "shared.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 30,
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
    order: 31,
    onChangeEffects: {
      "modifiers.mdef": (s) => s.mDefModifier,
    },
  },
  {
    key: "initModifier",
    kind: "editable",
    label: "shared.modifiers.init",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 32,
    onChangeEffects: {
      "modifiers.init": (s) => s.initModifier,
    },
  },
  {
    key: "magicModifier",
    kind: "editable",
    label: "shared.modifiers.magic",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 33,
    onChangeEffects: {
      "modifiers.magic": (s) => s.magicModifier,
    },
  },
  {
    key: "precModifier",
    kind: "editable",
    label: "shared.modifiers.accuracy",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 34,
    onChangeEffects: {
      "modifiers.accuracy": (s) => s.precModifier,
    },
  },
  {
    key: "damageMeleeModifier",
    kind: "editable",
    label: "shared.modifiers.damageMelee",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 35,
    onChangeEffects: {
      "modifiers.damageMelee": (s) => s.damageMeleeModifier,
    },
  },
  {
    key: "damageRangedModifier",
    kind: "editable",
    label: "shared.modifiers.damageRanged",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 36,
    onChangeEffects: {
      "modifiers.damageRanged": (s) => s.damageRangedModifier,
    },
  },
  {
    key: "cost",
    kind: "computed",
    label: prefixedLabel(ARMOR_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "readonly-number",
    group: G.meta,
    order: 40,
  },
  {
    key: "isSlotsVariant",
    kind: "form-state",
    label: "armor.isSlotsVariant",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 41,
  },
  {
    key: "isEquipped",
    kind: "form-state",
    label: "shared.isEquipped",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 42,
  },
  ...(metaFieldConfigWithGroup(
    G.source,
  ) as unknown as ItemFieldConfig<ArmorFormState>),
];
