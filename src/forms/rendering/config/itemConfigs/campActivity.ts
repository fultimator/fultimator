import type { ItemFieldConfig, GroupLabels } from "../fieldConfig";
import type { CampActivity } from "../../../schema/itemSchemas/campActivity";

export type CampActivityFormState = CampActivity;

const G = { core: "core" } as const;

export const campActivityGroupLabels: GroupLabels = {
  core: "Camp Activity",
};

export const campActivityFieldConfig: ItemFieldConfig<CampActivityFormState> = [
  {
    key: "name",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    fullWidth: true,
  },
  {
    key: "description",
    kind: "editable",
    label: "Target",
    component: "select",
    defaultValue: "",
    group: G.core,
    order: 2,
    fullWidth: true,
    componentProps: {
      options: [
        { value: "yourself", label: "Yourself" },
        { value: "ally", label: "One ally" },
        { value: "choice", label: "Special" },
      ],
    },
  },
  {
    key: "targetDescription",
    kind: "editable",
    label: "Target Description",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 2.5,
    fullWidth: true,
    dependencies: (s) => s.description === "choice",
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
];
