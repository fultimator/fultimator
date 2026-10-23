import type { ItemFieldConfig } from "./fieldConfig";
import type { SelectOption } from "../fieldRenderers";

export const META_GROUP = "meta";

const BOOK_OPTIONS: SelectOption[] = [
  { value: "", label: "None" },
  { value: "core", label: "core" },
  { value: "rework", label: "rework" },
  { value: "bonus", label: "bonus" },
  { value: "high", label: "high" },
  { value: "techno", label: "techno" },
  { value: "natural", label: "natural" },
  { value: "homebrew", label: "homebrew" },
];

const UNOFFICIAL_BOOKS = new Set(["", "homebrew"]);

export function deriveIsOfficial(book: string | undefined): boolean {
  return !UNOFFICIAL_BOOKS.has(book ?? "");
}

export interface WithMeta {
  meta?: {
    book?: string;
    page?: number;
    bookName?: string;
    isOfficial?: boolean;
  };
}

export const metaFieldConfig: ItemFieldConfig<Record<string, unknown>> = [
  {
    key: "meta.book",
    kind: "editable",
    label: "meta.book",
    component: "select",
    defaultValue: "",
    group: META_GROUP,
    order: 100,
    gridSize: 8,
    componentProps: { options: BOOK_OPTIONS },
    onChangeEffects: {
      "meta.isOfficial": (s) => {
        const book = (s.meta as WithMeta["meta"] | undefined)?.book ?? "";
        return deriveIsOfficial(book);
      },
      "meta.bookName": (s) => {
        const book = (s.meta as WithMeta["meta"] | undefined)?.book ?? "";
        return book === "homebrew"
          ? ((s.meta as WithMeta["meta"] | undefined)?.bookName ?? "")
          : "";
      },
    },
  },
  {
    key: "meta.page",
    kind: "editable",
    label: "meta.page",
    component: "number",
    defaultValue: "",
    group: META_GROUP,
    order: 101,
    gridSize: 4,
    parse: (v) => (v === "" || v == null ? undefined : Number(v)),
  },
  {
    key: "meta.bookName",
    kind: "editable",
    label: "meta.bookName",
    component: "text",
    defaultValue: "",
    group: META_GROUP,
    order: 102,
    fullWidth: true,
    dependencies: (s) =>
      (s.meta as WithMeta["meta"] | undefined)?.book === "homebrew",
  },
  {
    key: "meta.isOfficial",
    kind: "computed",
    label: "meta.isOfficial",
    defaultValue: false,
    group: META_GROUP,
    order: 103,
  },
];

export function metaFieldConfigWithGroup(
  group: string,
): ItemFieldConfig<Record<string, unknown>> {
  return metaFieldConfig.map((f) => ({ ...f, group }));
}
