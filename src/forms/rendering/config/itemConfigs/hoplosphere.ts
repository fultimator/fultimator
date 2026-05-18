import type { ItemFieldConfig } from "../fieldConfig";
import type { Hoplosphere } from "../../../schema/itemSchemas/hoplosphere";

export type HoplosphereFormState = Hoplosphere;

const G = {
  core: "core",
  body: "body",
} as const;

export const hoplosphereFieldConfig: ItemFieldConfig<HoplosphereFormState> = [
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
    key: "requiredSlots",
    kind: "editable",
    label: "Required Slots",
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
    label: "Socketable",
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
    label: "Cost",
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
    label: "Description",
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 4,
    fullWidth: true,
  },
  {
    key: "coagEffects",
    kind: "editable",
    label: "Coagulation Effects",
    component: "textarea",
    defaultValue: {},
    group: G.body,
    order: 5,
    fullWidth: true,
    parse: (v) => {
      if (typeof v === "object" && v !== null) return v as Record<string, string>;
      if (typeof v !== "string" || v.trim() === "") return {};
      try {
        const parsed = JSON.parse(v);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    },
  },
];
