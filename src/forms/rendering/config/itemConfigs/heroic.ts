import type { GroupLabels, ItemFieldConfig, FieldConfig } from "../fieldConfig";
import type { Heroic } from "../../../schema/itemSchemas/heroic";
import classList from "../../../../libs/classes";
import type { SelectOption } from "../../fieldRenderers";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
import {
  behaviorsTabField,
  behaviorGroupLabels,
  DEFAULT_ITEM_TABS,
} from "../shared/behaviorFields";

export type HeroicFormState = Heroic & Record<string, unknown>;
const HEROIC_LABEL_PREFIX = "heroic";

export { DEFAULT_ITEM_TABS as heroicTabs };

const classOptions: SelectOption[] = (classList as { name: string }[]).map(
  (c) => ({ value: c.name, label: c.name }),
);

const G = {
  core: "core",
  body: "body",
  resource: "resource",
} as const;

export const heroicGroupLabels: GroupLabels = {
  core: "section.core",
  body: "section.body",
  resource: "section.resource",
  ...behaviorGroupLabels,
};

type ResourceState = {
  resource?: { enabled?: boolean; maxScalesWithLevel?: boolean };
};

export const heroicFieldConfig: ItemFieldConfig<HeroicFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(HEROIC_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(HEROIC_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 0,
    validationHints: { required: true },
    fullWidth: true,
  },
  {
    key: "applicableTo",
    kind: "editable",
    label: "heroic.applicableTo",
    component: "autocomplete",
    defaultValue: [],
    group: G.core,
    order: 2,
    fullWidth: true,
    componentProps: { options: classOptions, freeSolo: true },
  },
  {
    key: "quote",
    kind: "editable",
    label: "heroic.quote",
    component: "text",
    defaultValue: "",
    group: G.body,
    order: 3,
    fullWidth: true,
  },
  {
    key: "description",
    kind: "editable",
    label: "heroic.description",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 4,
    fullWidth: true,
  },
  {
    key: "resource.enabled",
    kind: "editable",
    label: "class_skill_resource_enabled",
    component: "checkbox",
    defaultValue: false,
    group: G.resource,
    order: 0,
    gridSize: 12,
  },
  {
    key: "resource.name",
    kind: "editable",
    label: "class_skill_resource_name",
    component: "text",
    defaultValue: "",
    group: G.resource,
    order: 1,
    gridSize: { xs: 12, sm: 6 },
    componentProps: { maxLength: 50 },
    dependencies: (s) => !!(s as ResourceState).resource?.enabled,
  },
  {
    key: "resource.step",
    kind: "editable",
    label: "class_skill_resource_step",
    component: "number",
    defaultValue: 1,
    group: G.resource,
    order: 2,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => Math.max(1, Number(v) || 1),
    validationHints: { min: 1 },
    dependencies: (s) => !!(s as ResourceState).resource?.enabled,
  },
  {
    key: "resource.maxScalesWithLevel",
    kind: "editable",
    label: "class_skill_resource_max_scales_with_level",
    component: "checkbox",
    defaultValue: false,
    group: G.resource,
    order: 3,
    gridSize: 12,
    dependencies: (s) => !!(s as ResourceState).resource?.enabled,
  },
  {
    key: "resource.max",
    kind: "editable",
    label: "class_skill_resource_max",
    component: "number",
    defaultValue: 0,
    group: G.resource,
    order: 4,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => Math.max(0, Number(v) || 0),
    validationHints: { min: 0 },
    dependencies: (s) => {
      const r = (s as ResourceState).resource;
      return !!r?.enabled && !r?.maxScalesWithLevel;
    },
  },
  {
    key: "resource.maxLevelBonus",
    kind: "editable",
    label: "class_skill_resource_max_level_bonus",
    component: "number",
    defaultValue: 0,
    group: G.resource,
    order: 5,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => Number(v) || 0,
    dependencies: (s) => {
      const r = (s as ResourceState).resource;
      return !!r?.enabled && !!r?.maxScalesWithLevel;
    },
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<HeroicFormState>),
  behaviorsTabField as unknown as FieldConfig<HeroicFormState>,
];
