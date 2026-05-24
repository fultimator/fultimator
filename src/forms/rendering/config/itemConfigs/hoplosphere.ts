import type { GroupLabels, ItemFieldConfig, FieldConfig } from "../fieldConfig";
import type { Hoplosphere } from "../../../schema/itemSchemas/hoplosphere";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
import {
  makePassivesTabField,
  behaviorsTabField,
  PASSIVE_ITEM_TABS,
  BEHAVIOR_GROUPS,
} from "../shared/behaviorFields";
import { ITEM_SCOPED_KEYS } from "../shared/itemScopedKeys";

export type HoplosphereFormState = Hoplosphere & Record<string, unknown>;
const HOPLOSPHERE_LABEL_PREFIX = "hoplosphere";

export { PASSIVE_ITEM_TABS as hoplosphereTabs };

const G = {
  core: "core",
  body: "body",
  coag: "coag",
  meta: "meta",
} as const;

export const hoplosphereGroupLabels: GroupLabels = {
  core: "section.core",
  body: "section.body",
  meta: "section.meta",
  [BEHAVIOR_GROUPS.selfEffects]: "behavior.effects",
};

export const hoplosphereFieldConfig: ItemFieldConfig<HoplosphereFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(HOPLOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(HOPLOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 0,
    validationHints: { required: true },
    fullWidth: true,
  },
  {
    key: "requiredSlots",
    kind: "editable",
    label: "hoplosphere.requiredSlots",
    component: "select",
    defaultValue: 1,
    group: G.core,
    order: 1,
    componentProps: {
      options: [
        { value: 1, label: "1" },
        { value: 2, label: "2" },
      ],
    },
    parse: (v) => Number(v) as 1 | 2,
  },
  {
    key: "socketable",
    kind: "editable",
    label: "hoplosphere.socketable",
    component: "select",
    defaultValue: "all",
    group: G.core,
    order: 2,
    componentProps: {
      options: [
        { value: "all", label: "All" },
        { value: "weapon", label: "Weapon" },
      ],
    },
  },
  {
    key: "cost",
    kind: "editable",
    label: prefixedLabel(HOPLOSPHERE_LABEL_PREFIX, SHARED_LABEL_KEYS.cost),
    component: "number",
    defaultValue: 0,
    group: G.core,
    order: 3,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
  {
    key: "description",
    kind: "editable",
    label: prefixedLabel(
      HOPLOSPHERE_LABEL_PREFIX,
      SHARED_LABEL_KEYS.description,
    ),
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 4,
    fullWidth: true,
  },
  {
    key: "coagEffects",
    kind: "editable",
    label: "hoplosphere.coagulationEffects",
    component: "textarea",
    defaultValue: {},
    group: G.coag,
    order: 5,
    fullWidth: true,
    parse: (v) => {
      if (typeof v === "object" && v !== null)
        return v as Record<string, string>;
      if (typeof v !== "string" || v.trim() === "") return {};
      try {
        const parsed = JSON.parse(v);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    },
  },
  ...metaFieldConfig.map((f) => ({ ...f, group: G.meta })),
  makePassivesTabField(
    ITEM_SCOPED_KEYS.hoplosphere,
  ) as unknown as FieldConfig<HoplosphereFormState>,
  behaviorsTabField as unknown as FieldConfig<HoplosphereFormState>,
];
