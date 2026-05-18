import type { ItemFieldConfig } from "../fieldConfig";
import type { Mnemosphere } from "../../../schema/itemSchemas/mnemosphere";

export type MnemosphereFormState = Mnemosphere;

const G = {
  core: "core",
  details: "details",
} as const;

export const mnemosphereFieldConfig: ItemFieldConfig<MnemosphereFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: "ID",
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
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
    key: "class",
    kind: "editable",
    label: "Class",
    component: "text",
    defaultValue: "",
    group: G.details,
    order: 1,
  },
  {
    key: "lvl",
    kind: "editable",
    label: "Level",
    component: "number",
    defaultValue: 1,
    group: G.details,
    order: 2,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
  {
    key: "cost",
    kind: "editable",
    label: "Cost",
    component: "number",
    defaultValue: 0,
    group: G.details,
    order: 3,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
];
