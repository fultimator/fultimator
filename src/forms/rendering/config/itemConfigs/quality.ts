import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import allQualities from "../../../../libs/qualities";
import groupBy from "../../../../libs/groupby";
import type { SelectGroup } from "../../fieldRenderers";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

export type QualityFormState = {
  name: string;
  category: string;
  quality: string;
  cost: number;
  filter: string[];
  selectedBase: string;
};

const QUALITY_LABEL_PREFIX = "quality";

const baseGroups: SelectGroup[] = Object.entries(
  groupBy(allQualities, "category") as Record<
    string,
    {
      name: string;
      cost: number;
      quality: string;
      category: string;
      filter?: string[];
    }[]
  >,
).map(([category, qs]) => ({
  header: category,
  options: qs.map((q) => ({ value: q.name, label: `${q.name} (${q.cost}z)` })),
}));

const categoryOptions = [
  { value: "Offensive", label: "Offensive" },
  { value: "Defensive", label: "Defensive" },
  { value: "Enhancement", label: "Enhancement" },
];

const filterOptions = [
  { value: "weapon", label: "Weapons" },
  { value: "customWeapon", label: "Custom Weapons" },
  { value: "armor", label: "Armor" },
  { value: "shield", label: "Shields" },
  { value: "accessory", label: "Accessories" },
];

const G = {
  core: "core",
  quality: "quality",
} as const;

export const qualityGroupLabels: GroupLabels = {
  quality: "section.quality",
};

export const qualityFieldConfig: ItemFieldConfig<QualityFormState> = [
  {
    key: "selectedBase",
    kind: "form-state",
    label: "shared.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.core,
    order: 0,
    componentProps: { groups: baseGroups, allowClear: true },
    onChangeEffects: {
      name: (s) => {
        const q = allQualities.find(
          (el: { name: string }) => el.name === s.selectedBase,
        );
        return q ? q.name : s.name;
      },
      category: (s) => {
        const q = allQualities.find(
          (el: { name: string }) => el.name === s.selectedBase,
        );
        return q ? q.category : s.category;
      },
      quality: (s) => {
        const q = allQualities.find(
          (el: { name: string }) => el.name === s.selectedBase,
        );
        return q ? q.quality : s.quality;
      },
      cost: (s) => {
        const q = allQualities.find(
          (el: { name: string }) => el.name === s.selectedBase,
        );
        return q ? q.cost : s.cost;
      },
      filter: (s) => {
        const q = allQualities.find(
          (el: { name: string; filter?: string[] }) =>
            el.name === s.selectedBase,
        );
        return Array.isArray(q?.filter) ? q.filter : s.filter;
      },
    },
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(QUALITY_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
  },
  {
    key: "category",
    kind: "editable",
    label: "quality.category",
    component: "select",
    defaultValue: "Offensive",
    group: G.core,
    order: 2,
    componentProps: { options: categoryOptions },
  },
  {
    key: "quality",
    kind: "editable",
    label: "shared.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 10,
    fullWidth: true,
  },
  {
    key: "cost",
    kind: "editable",
    label: prefixedLabel(QUALITY_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 11,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
  {
    key: "filter",
    kind: "editable",
    label: "quality.applicableTo",
    component: "autocomplete",
    defaultValue: [],
    group: G.quality,
    order: 12,
    fullWidth: true,
    componentProps: {
      options: filterOptions,
      multiple: true,
      freeSolo: false,
    },
  },
];
