import type { ItemFieldConfig, GroupLabels } from "../fieldConfig";
import type { OtherOptional } from "../../../schema/itemSchemas/otherOptional";

export type OtherOptionalFormState = OtherOptional;

const G = {
  core: "core",
  clock: "clock",
} as const;

export const otherOptionalGroupLabels: GroupLabels = {
  core: "Optional",
  clock: "Clock",
};

export const otherOptionalFieldConfig: ItemFieldConfig<OtherOptionalFormState> = [
  {
    key: "name",
    kind: "editable",
    label: "Name",
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
  {
    key: "clockEnabled",
    kind: "editable",
    label: "Clock",
    component: "checkbox",
    defaultValue: false,
    group: G.clock,
    order: 4,
  },
  {
    key: "clockSections",
    kind: "editable",
    label: "Clock Sections",
    component: "number",
    defaultValue: 6,
    group: G.clock,
    order: 5,
    dependencies: (s) => Boolean(s.clockEnabled),
    parse: (v) => Number(v) || 6,
    validationHints: { min: 2, max: 12 },
  },
];
