import type { ItemFieldConfig, GroupLabels } from "../fieldConfig";
import type { ZeroPowerOptional } from "../../../schema/itemSchemas/zeroPowerOptional";

export type ZeroPowerOptionalFormState = ZeroPowerOptional;

const G = {
  core: "core",
  trigger: "trigger",
  effect: "effect",
} as const;

export const zeroPowerOptionalGroupLabels: GroupLabels = {
  core: "Zero Power",
  trigger: "Trigger",
  effect: "Effect",
};

export const zeroPowerOptionalFieldConfig: ItemFieldConfig<ZeroPowerOptionalFormState> = [
  {
    key: "name",
    kind: "editable",
    label: "Zero Power Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    fullWidth: true,
  },
  {
    key: "clockSections",
    kind: "editable",
    label: "Clock Sections",
    component: "number",
    defaultValue: 6,
    group: G.core,
    order: 2,
    parse: (v) => Number(v) || 6,
    validationHints: { min: 2, max: 12 },
  },
  {
    key: "triggerName",
    kind: "editable",
    label: "Trigger Name",
    component: "text",
    defaultValue: "",
    group: G.trigger,
    order: 3,
    fullWidth: true,
  },
  {
    key: "triggerDescription",
    kind: "editable",
    label: "Trigger Description",
    component: "textarea",
    defaultValue: "",
    group: G.trigger,
    order: 4,
    fullWidth: true,
  },
  {
    key: "effectName",
    kind: "editable",
    label: "Effect Name",
    component: "text",
    defaultValue: "",
    group: G.effect,
    order: 5,
    fullWidth: true,
  },
  {
    key: "effectDescription",
    kind: "editable",
    label: "Effect Description",
    component: "textarea",
    defaultValue: "",
    group: G.effect,
    order: 6,
    fullWidth: true,
  },
];
