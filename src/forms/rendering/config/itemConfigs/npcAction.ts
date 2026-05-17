import type { ItemFieldConfig } from "../fieldConfig";
import type { NpcAction } from "../../../schema/itemSchemas/npcAction";

export type NpcActionFormState = NpcAction;

const G = {
  core: "core",
  body: "body",
} as const;

export const npcActionFieldConfig: ItemFieldConfig<NpcActionFormState> = [
  {
    key: "name",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 0,
    validationHints: { required: true },
    gridSize: "grow",
  },
  {
    key: "spCost",
    kind: "editable",
    label: "SP Cost",
    component: "number",
    defaultValue: 1,
    group: G.core,
    order: 1,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
  {
    key: "effect",
    kind: "editable",
    label: "Effect",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 2,
    fullWidth: true,
  },
];
