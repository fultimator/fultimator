import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import type { Quality } from "../../../schema/itemSchemas/quality";
import type { SelectOption } from "../../fieldRenderers";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

export type QualityFormState = Quality;
const QUALITY_LABEL_PREFIX = "quality";

const QUALITY_CATEGORIES = ["Offensive", "Defensive", "Enhancement"];

const FILTER_OPTIONS: SelectOption[] = [
  { value: "weapon", label: "Weapons" },
  { value: "customWeapon", label: "Custom Weapons" },
  { value: "armor", label: "Armor" },
  { value: "shield", label: "Shields" },
  { value: "accessory", label: "Accessories" },
];

const categoryOptions: SelectOption[] = QUALITY_CATEGORIES.map((c) => ({
  value: c,
  label: c,
}));

const G = {
  core: "core",
  body: "body",
  meta: "meta",
} as const;

export const qualityGroupLabels: GroupLabels = {
  core: "section.core",
  body: "section.body",
  meta: "section.meta",
};

export const qualityFieldConfig: ItemFieldConfig<QualityFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(QUALITY_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(QUALITY_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 0,
    validationHints: { required: true },
    fullWidth: true,
  },
  {
    key: "category",
    kind: "editable",
    label: prefixedLabel(QUALITY_LABEL_PREFIX, SHARED_LABEL_KEYS.category),
    component: "select",
    defaultValue: QUALITY_CATEGORIES[0],
    group: G.core,
    order: 1,
    componentProps: { options: categoryOptions },
  },
  {
    key: "cost",
    kind: "editable",
    label: prefixedLabel(QUALITY_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "number",
    defaultValue: 0,
    group: G.core,
    order: 2,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
  {
    key: "quality",
    kind: "editable",
    label: "quality.effect",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 3,
    fullWidth: true,
  },
  {
    key: "filter",
    kind: "editable",
    label: "quality.applicableTo",
    component: "select",
    defaultValue: [],
    group: G.meta,
    order: 4,
    fullWidth: true,
    componentProps: { options: FILTER_OPTIONS, multiple: true },
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<QualityFormState>),
];
