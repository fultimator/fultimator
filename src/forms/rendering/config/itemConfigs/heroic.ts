import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import type { Heroic } from "../../../schema/itemSchemas/heroic";
import classList from "../../../../libs/classes";
import type { SelectOption } from "../../fieldRenderers";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

export type HeroicFormState = Heroic;
const HEROIC_LABEL_PREFIX = "heroic";

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
];
