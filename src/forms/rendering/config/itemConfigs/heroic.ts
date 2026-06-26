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
} as const;

export const heroicGroupLabels: GroupLabels = {
  core: "section.core",
  body: "section.body",
  ...behaviorGroupLabels,
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
  ...(metaFieldConfig as unknown as ItemFieldConfig<HeroicFormState>),
  behaviorsTabField as unknown as FieldConfig<HeroicFormState>,
];
