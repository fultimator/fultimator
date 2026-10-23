import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import type { Mnemosphere } from "../../../schema/itemSchemas/mnemosphere";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

export type MnemosphereFormState = Mnemosphere;
const MNEMOSPHERE_LABEL_PREFIX = "mnemosphere";

const G = {
  core: "core",
  details: "details",
} as const;

export const mnemosphereGroupLabels: GroupLabels = {
  core: "section.core",
  details: "section.details",
};

export const mnemosphereFieldConfig: ItemFieldConfig<MnemosphereFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(MNEMOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(MNEMOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
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
    label: prefixedLabel(MNEMOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.class),
    component: "text",
    defaultValue: "",
    group: G.details,
    order: 1,
  },
  {
    key: "lvl",
    kind: "editable",
    label: "mnemosphere.level",
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
    label: prefixedLabel(MNEMOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "number",
    defaultValue: 0,
    group: G.details,
    order: 3,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
];
