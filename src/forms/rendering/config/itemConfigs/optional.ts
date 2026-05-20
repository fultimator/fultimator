import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import type { OptionalItem } from "../../../schema/itemSchemas/optional";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

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
  showClock?: boolean;
  clockSections?: number;
  zeroTriggerRef?: string;
  zeroEffectRef?: string;
  zeroTrigger?: { name: string; description: string } | "";
  zeroEffect?: { name: string; description: string } | "";
};

export type OptionalFormState = OptionalFormStateShape;
const OPTIONAL_LABEL_PREFIX = "optional";

const G = {
  core: "core",
  body: "body",
  clock: "clock",
  zero: "zero",
} as const;

const hasDescription = (s: OptionalFormState) =>
  s.subtype === "quirk" ||
  s.subtype === "zero-trigger" ||
  s.subtype === "zero-effect" ||
  s.subtype === "zero-power" ||
  s.subtype === "other";

const hasEffect = (s: OptionalFormState) =>
  s.subtype === "quirk" ||
  s.subtype === "camp-activities" ||
  s.subtype === "other";

const hasCampTarget = (s: OptionalFormState) => s.subtype === "camp-activities";

const isOther = (s: OptionalFormState) => s.subtype === "other";

const isZeroPower = (s: OptionalFormState) => s.subtype === "zero-power";

export const optionalGroupLabels: GroupLabels = {
  core: "section.core",
  body: "section.body",
  clock: "section.clock",
  zero: "section.zero",
};

export const optionalFieldConfig: ItemFieldConfig<OptionalFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(OPTIONAL_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "subtype",
    kind: "editable",
    label: "optional.subtype",
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
    label: prefixedLabel(OPTIONAL_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
    fullWidth: true,
  },
  // body: description (quirk, zero-trigger, zero-effect, other)
  {
    key: "description",
    kind: "editable",
    label: prefixedLabel(OPTIONAL_LABEL_PREFIX, SHARED_LABEL_KEYS.description),
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 2,
    fullWidth: true,
    dependencies: hasDescription,
  },
  // body: target (camp-activities — maps to description in output)
  {
    key: "description",
    kind: "editable",
    label: prefixedLabel(OPTIONAL_LABEL_PREFIX, SHARED_LABEL_KEYS.target),
    component: "autocomplete",
    defaultValue: "",
    group: G.body,
    order: 2,
    fullWidth: true,
    dependencies: hasCampTarget,
    componentProps: {
      freeSolo: true,
      options: ["Yourself", "One ally", "Yourself or one ally"],
    },
  },
  // body: effect (quirk, camp-activities, other)
  {
    key: "effect",
    kind: "editable",
    label: prefixedLabel(OPTIONAL_LABEL_PREFIX, SHARED_LABEL_KEYS.effect),
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 3,
    fullWidth: true,
    dependencies: hasEffect,
  },
  // clock toggle - quirk, camp-activities, other; zero-power always has clock; zero-trigger/effect have none
  {
    key: "showClock",
    kind: "editable",
    label: "optional.showClock",
    component: "select",
    defaultValue: false,
    group: G.clock,
    order: 4,
    dependencies: (s) =>
      s.subtype === "quirk" || s.subtype === "camp-activities" || isOther(s),
    componentProps: {
      options: [
        { value: false, label: "No Clock" },
        { value: true, label: "With Clock" },
      ],
    },
    parse: (v) => v === true || v === "true",
  },
  // clock sections - shown when toggled on, or always for zero-power
  {
    key: "clockSections",
    kind: "editable",
    label: "optional.clockSections",
    component: "number",
    defaultValue: 6,
    group: G.clock,
    order: 5,
    dependencies: (s) => !!s.showClock || isZeroPower(s),
    validationHints: { min: 2, max: 12 },
    parse: (v) => Number(v) || 6,
  },
  // zero group: zeroTriggerRef / zeroEffectRef are hidden form-state (written by Autocomplete in panel)
  {
    key: "zeroTriggerRef",
    kind: "form-state",
    label: "optional.zeroTriggerRef",
    defaultValue: "",
    group: G.zero,
    order: 6,
  },
  {
    key: "zeroEffectRef",
    kind: "form-state",
    label: "optional.zeroEffectRef",
    defaultValue: "",
    group: G.zero,
    order: 7,
  },
];
