import type { ItemFieldConfig, GroupLabels } from "../fieldConfig";
import type { Consumable } from "../../../schema/itemSchemas/consumable";
import { SHARED_LABEL_KEYS } from "./sharedLabelKeys";

export type ConsumableFormState = Consumable;

const G = { core: "core" } as const;

export const consumableGroupLabels: GroupLabels = {
  core: "section.core",
};

export const consumableFieldConfig: ItemFieldConfig<ConsumableFormState> = [
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
    gridSize: 8,
    componentProps: { maxLength: 100, autoFocus: true },
    validationHints: { required: false },
  },
  {
    key: "ipCost",
    kind: "editable",
    label: SHARED_LABEL_KEYS.ipCost,
    component: "number",
    defaultValue: 0,
    group: G.core,
    order: 2,
    gridSize: 4,
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
    order: 3,
    gridSize: 12,
    componentProps: { maxLength: 1500 },
  },
];
