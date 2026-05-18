import type { ItemFieldConfig } from "../fieldConfig";
import type { Heroic } from "../../../schema/itemSchemas/heroic";
import classList from "../../../../libs/classes";
import type { SelectOption } from "../../fieldRenderers";
import { metaFieldConfig } from "../metaFieldConfig";

export type HeroicFormState = Heroic;

const classOptions: SelectOption[] = (classList as { name: string }[]).map(
  (c) => ({ value: c.name, label: c.name }),
);

const G = {
  core: "core",
  body: "body",
} as const;

export const heroicFieldConfig: ItemFieldConfig<HeroicFormState> = [
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
    key: "name",
    kind: "editable",
    label: "Name",
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
    label: "Applicable To",
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
    label: "Quote",
    component: "text",
    defaultValue: "",
    group: G.body,
    order: 3,
    fullWidth: true,
  },
  {
    key: "description",
    kind: "editable",
    label: "Description",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 4,
    fullWidth: true,
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<HeroicFormState>),
];
