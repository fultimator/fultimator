import type { ItemFieldConfig } from "../fieldConfig";
import type { OptionalItem } from "../../../schema/itemSchemas/optional";

type OptionalFormStateShape = {
  subtype:
    | "quirk"
    | "camp-activities"
    | "zero-trigger"
    | "zero-effect"
    | "zero-power"
    | "other";
  name: string;
  fuid?: string;
  meta?: OptionalItem extends { meta?: infer M } ? M : never;
  description?: string;
  effect?: string;
  clock?: { sections: number };
  zeroTriggerRef?: string;
  zeroEffectRef?: string;
  zeroTrigger?: { name: string; description: string } | "";
  zeroEffect?: { name: string; description: string } | "";
};

export type OptionalFormState = OptionalFormStateShape;

const G = {
  core: "core",
  body: "body",
  zero: "zero",
} as const;

export const optionalFieldConfig: ItemFieldConfig<OptionalFormState> = [
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
    key: "subtype",
    kind: "editable",
    label: "Subtype",
    component: "select",
    defaultValue: "quirk",
    group: G.core,
    order: 0,
    componentProps: {
      options: [
        { value: "quirk", label: "Quirk" },
        { value: "camp-activities", label: "Camp Activities" },
        { value: "zero-trigger", label: "Zero Trigger" },
        { value: "zero-effect", label: "Zero Effect" },
        { value: "zero-power", label: "Zero Power" },
        { value: "other", label: "Other" },
      ],
    },
  },
  {
    key: "name",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
    fullWidth: true,
  },
  {
    key: "description",
    kind: "editable",
    label: "Description",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 2,
    fullWidth: true,
  },
  {
    key: "effect",
    kind: "editable",
    label: "Effect",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 3,
    fullWidth: true,
  },
  {
    key: "clock",
    kind: "editable",
    label: "Clock",
    component: "readonly-number",
    defaultValue: { sections: 4 },
    group: G.body,
    order: 4,
  },
  {
    key: "zeroTriggerRef",
    kind: "editable",
    label: "Zero Trigger Ref",
    component: "text",
    defaultValue: "",
    group: G.zero,
    order: 5,
  },
  {
    key: "zeroEffectRef",
    kind: "editable",
    label: "Zero Effect Ref",
    component: "text",
    defaultValue: "",
    group: G.zero,
    order: 6,
  },
  {
    key: "zeroTrigger",
    kind: "editable",
    label: "Zero Trigger",
    component: "textarea",
    defaultValue: "",
    group: G.zero,
    order: 7,
    fullWidth: true,
  },
  {
    key: "zeroEffect",
    kind: "editable",
    label: "Zero Effect",
    component: "textarea",
    defaultValue: "",
    group: G.zero,
    order: 8,
    fullWidth: true,
  },
];
