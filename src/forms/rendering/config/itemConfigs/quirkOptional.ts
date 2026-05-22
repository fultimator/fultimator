import type { ItemFieldConfig, GroupLabels } from "../fieldConfig";
import type { QuirkOptional } from "../../../schema/itemSchemas/quirkOptional";

export type QuirkOptionalFormState = QuirkOptional;

const G = { core: "core" } as const;

export const quirkOptionalGroupLabels: GroupLabels = {
  core: "Quirk",
};

export const quirkOptionalFieldConfig: ItemFieldConfig<QuirkOptionalFormState> = [
  {
    key: "name",
    kind: "editable",
    label: "Quirk Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    fullWidth: true,
  },
  {
    key: "description",
    kind: "editable",
    label: "Description",
    component: "textarea",
    defaultValue: "",
    group: G.core,
    order: 2,
    fullWidth: true,
  },
  {
    key: "effect",
    kind: "editable",
    label: "Effect",
    component: "textarea",
    defaultValue: "",
    group: G.core,
    order: 3,
    fullWidth: true,
  },
];
