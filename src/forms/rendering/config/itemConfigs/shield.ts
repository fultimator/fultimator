import type { GroupLabels, ItemFieldConfig, FieldConfig } from "../fieldConfig";
import { metaFieldConfigWithGroup } from "../metaFieldConfig";
import type { ShieldPersisted } from "../../../schema/itemSchemas/shield";
import shields from "../../../../libs/shields";
import allQualities from "../../../../libs/qualities";
const qualities = allQualities.filter((q) => q.filter?.includes("shield"));
import groupBy from "../../../../libs/groupby";
import type { SelectOption, SelectGroup } from "../../fieldRenderers";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
import {
  behaviorsTabField,
  PASSIVE_ITEM_TABS,
  BEHAVIOR_GROUPS,
} from "../shared/behaviorFields";

interface ShieldBase {
  name: string;
  cost: number;
  def: number;
  mdef: number;
  martial: boolean;
  init: number;
  category: string;
}

export type ShieldFormState = Omit<ShieldPersisted, "base"> & {
  base: ShieldBase | undefined;
  qualityApplicableTo: string[];
};
const SHIELD_LABEL_PREFIX = "shield";

export { PASSIVE_ITEM_TABS as shieldTabs };

const shieldOptions: SelectOption[] = (shields as ShieldBase[]).map((s) => ({
  value: s.name,
  label: s.name,
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

const qualityApplicableToOptions: SelectOption[] = [
  { value: "weapon", label: "Weapons" },
  { value: "customWeapon", label: "Custom Weapons" },
  { value: "armor", label: "Armor" },
  { value: "shield", label: "Shields" },
  { value: "accessory", label: "Accessories" },
];

const G = {
  base: "base",
  core: "core",
  quality: "quality",
  modifiers: "modifiers",
  meta: "meta",
  source: "source",
} as const;

export const shieldGroupLabels: GroupLabels = {
  quality: "section.quality",
  modifiers: "section.modifiers",
  [BEHAVIOR_GROUPS.selfEffects]: "behavior.effects",
};

export const shieldFieldConfig: ItemFieldConfig<ShieldFormState> = [
  {
    key: "base",
    kind: "form-state",
    label: prefixedLabel(SHIELD_LABEL_PREFIX, SHARED_LABEL_KEYS.base),
    component: "select",
    defaultValue: undefined,
    group: G.base,
    order: 0,
    gridSize: "grow",
    componentProps: { options: shieldOptions },
    format: (v) => (v as ShieldBase | undefined)?.name ?? "",
    parse: (v) => {
      return (
        (shields as ShieldBase[]).find((s) => s.name === v) ??
        (shields as ShieldBase[])[0]
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
    label: prefixedLabel(SHIELD_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(SHIELD_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
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
    label: prefixedLabel(SHIELD_LABEL_PREFIX, SHARED_LABEL_KEYS.martial),
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
  {
    key: "selectedQuality",
    kind: "form-state",
    label: "shared.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.quality,
    order: 10,
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
      qualityApplicableTo: (s) => {
        const q = qualities.find(
          (el: { name: string; filter?: string[] }) =>
            el.name === s.selectedQuality,
        );
        return Array.isArray(q?.filter) ? q.filter : s.qualityApplicableTo;
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
    fullWidth: true,
  },
  {
    key: "qualityApplicableTo",
    kind: "form-state",
    label: "quality.applicableTo",
    component: "autocomplete",
    defaultValue: ["shield"],
    group: G.quality,
    order: 13,
    fullWidth: true,
    componentProps: {
      options: qualityApplicableToOptions,
      multiple: true,
      freeSolo: false,
    },
  },
  {
    key: "defModifier",
    kind: "editable",
    label: "shared.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 20,
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
    order: 21,
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
    order: 22,
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
    order: 23,
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
    order: 24,
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
    order: 25,
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
    order: 26,
    onChangeEffects: {
      "modifiers.damageRanged": (s) => s.damageRangedModifier,
    },
  },
  {
    key: "cost",
    kind: "computed",
    label: prefixedLabel(SHIELD_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "readonly-number",
    group: G.meta,
    order: 30,
  },
  {
    key: "isEquipped",
    kind: "form-state",
    label: "shared.isEquipped",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 31,
  },
  ...(metaFieldConfigWithGroup(
    G.source,
  ) as unknown as ItemFieldConfig<ShieldFormState>),
  behaviorsTabField as unknown as FieldConfig<ShieldFormState>,
];
