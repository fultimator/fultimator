import type { ItemFieldConfig } from "../fieldConfig";
import type { Quality } from "../../../schema/itemSchemas/quality";
import type { SelectOption } from "../../fieldRenderers";
import { metaFieldConfig } from "../metaFieldConfig";

export type QualityFormState = Quality;

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

export const qualityFieldConfig: ItemFieldConfig<QualityFormState> = [
  {
    key: "name",
    kind: "editable",
    label: "Name",
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
    label: "Category",
    component: "select",
    defaultValue: QUALITY_CATEGORIES[0],
    group: G.core,
    order: 1,
    componentProps: { options: categoryOptions },
  },
  {
    key: "cost",
    kind: "editable",
    label: "Cost",
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
    label: "Quality Effect",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 3,
    fullWidth: true,
  },
  {
    key: "filter",
    kind: "editable",
    label: "Applicable To",
    component: "select",
    defaultValue: [],
    group: G.meta,
    order: 4,
    fullWidth: true,
    componentProps: { options: FILTER_OPTIONS, multiple: true },
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<QualityFormState>),
];
