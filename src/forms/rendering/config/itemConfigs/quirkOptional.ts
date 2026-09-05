import type { ItemFieldConfig, GroupLabels } from "../fieldConfig";
import type { QuirkOptional } from "../../../schema/itemSchemas/quirkOptional";

export type QuirkOptionalFormState = QuirkOptional & {
  hasClock?: boolean;
  clockSections?: number;
};

const G = { core: "core", clock: "clock" } as const;

export const quirkOptionalGroupLabels: GroupLabels = {
  core: "Quirk",
  clock: "Clock",
};

export const quirkOptionalFieldConfig: ItemFieldConfig<QuirkOptionalFormState> =
  [
    {
      key: "name",
      kind: "editable",
      label: "Quirk Name",
      component: "text",
      defaultValue: "",
      group: G.core,
      order: 1,
      fullWidth: true,
    },
    {
      key: "description",
      kind: "editable",
      label: "Description",
      component: "textarea",
      defaultValue: "",
      group: G.core,
      order: 2,
      fullWidth: true,
    },
    {
      key: "effect",
      kind: "editable",
      label: "Effect",
      component: "textarea",
      defaultValue: "",
      group: G.core,
      order: 3,
      fullWidth: true,
    },
    {
      key: "hasClock",
      kind: "editable",
      label: "Has Clock",
      component: "select",
      defaultValue: false,
      group: G.clock,
      order: 4,
      componentProps: {
        options: [
          { value: false, label: "No Clock" },
          { value: true, label: "With Clock" },
        ],
      },
      parse: (v) => v === true || v === "true",
    },
    {
      key: "clockSections",
      kind: "editable",
      label: "Clock Sections",
      component: "number",
      defaultValue: 6,
      group: G.clock,
      order: 5,
      dependencies: (s) => !!s.hasClock,
      validationHints: { min: 2, max: 12 },
      parse: (v) => Number(v) || 6,
    },
  ];
