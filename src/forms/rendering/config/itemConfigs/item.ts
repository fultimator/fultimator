import type { ItemFieldConfig, GroupLabels, FieldConfig } from "../fieldConfig";
import type { Item } from "../../../schema/itemSchemas/item";
import { SHARED_LABEL_KEYS } from "./sharedLabelKeys";
import {
  makePassivesTabField,
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../shared/behaviorFields";

export type ItemFormState = Item;

const G = { core: "core" } as const;

export { DEFAULT_ITEM_TABS as itemTabs };

export const itemGroupLabels: GroupLabels = {
  core: "section.core",
};

export const itemFieldConfig: ItemFieldConfig<ItemFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: SHARED_LABEL_KEYS.fuid,
    component: "fuid",
    defaultValue: undefined,
    group: G.core,
    order: 0,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: SHARED_LABEL_KEYS.name,
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    gridSize: 12,
    componentProps: { maxLength: 100, autoFocus: true },
    validationHints: { required: false },
  },
  {
    key: "value",
    kind: "editable",
    label: SHARED_LABEL_KEYS.value,
    component: "number",
    defaultValue: 0,
    group: G.core,
    order: 2,
    gridSize: 6,
    parse: (v) => Math.max(0, Number(v) || 0),
    validationHints: { min: 0 },
  },
  {
    key: "quantity",
    kind: "editable",
    label: SHARED_LABEL_KEYS.quantity,
    component: "number",
    defaultValue: 0,
    group: G.core,
    order: 3,
    gridSize: 6,
    parse: (v) => Math.max(0, Number(v) || 0),
    validationHints: { min: 0 },
  },
  {
    key: "description",
    kind: "editable",
    label: SHARED_LABEL_KEYS.description,
    component: "textarea",
    defaultValue: "",
    group: G.core,
    order: 4,
    gridSize: 12,
    componentProps: { maxLength: 1500 },
  },
  makePassivesTabField([]) as unknown as FieldConfig<ItemFormState>,
  behaviorsTabField as unknown as FieldConfig<ItemFormState>,
];
