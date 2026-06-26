import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";

export type InvocationItemState = {
  key: string;
  wellspring: string;
  type: string;
  customName: string;
  effect: string;
  behaviors?: unknown[];
};

const INVOCATION_TYPE_OPTIONS = [
  { value: "Blast", label: "Blast" },
  { value: "Hex", label: "Hex" },
  { value: "Utility", label: "Utility" },
];

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const invocationItemFields: ItemFieldConfig<InvocationItemState> = [
  {
    key: "wellspring",
    kind: "editable",
    label: "spell.invocation.wellspring",
    component: "text",
    defaultValue: "",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 4 },
  },
  {
    key: "type",
    kind: "editable",
    label: "spell.invocation.type",
    component: "select",
    defaultValue: "Blast",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 4 },
    componentProps: { options: INVOCATION_TYPE_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "spell.invocation.customName",
    component: "text",
    defaultValue: "",
    group: "",
    order: 2,
    gridSize: { xs: 12, sm: 4 },
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.invocation.effect",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 3,
    fullWidth: true,
  },
  behaviorsTabField,
];
