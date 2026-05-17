import type { ItemFieldConfig } from "../fieldConfig";
import type { Heroic } from "../../../schema/itemSchemas/heroic";
import classList from "../../../../libs/classes";
import type { SelectOption } from "../../fieldRenderers";

export type HeroicFormState = Heroic;

const HEROIC_BOOK_OPTIONS = [
  "core",
  "rework",
  "bonus",
  "high",
  "techno",
  "natural",
  "homebrew",
];

const bookOptions: SelectOption[] = [
  { value: "", label: "None" },
  ...HEROIC_BOOK_OPTIONS.map((b) => ({ value: b, label: b })),
];

const classOptions: SelectOption[] = (classList as { name: string }[]).map(
  (c) => ({ value: c.name, label: c.name }),
);

const G = {
  core: "core",
  body: "body",
  meta: "meta",
} as const;

export const heroicFieldConfig: ItemFieldConfig<HeroicFormState> = [
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
  {
    key: "book",
    kind: "editable",
    label: "Book",
    component: "select",
    defaultValue: "",
    group: G.meta,
    order: 5,
    gridSize: 6,
    componentProps: { options: bookOptions },
  },
  {
    key: "page",
    kind: "editable",
    label: "Page",
    component: "number",
    defaultValue: undefined,
    group: G.meta,
    order: 6,
    gridSize: 6,
    parse: (v) => (v === "" || v == null ? undefined : Number(v)),
  },
  {
    key: "bookName",
    kind: "editable",
    label: "Book Name",
    component: "text",
    defaultValue: "",
    group: G.meta,
    order: 7,
    fullWidth: true,
    dependencies: (s) => s.book === "homebrew",
  },
];
