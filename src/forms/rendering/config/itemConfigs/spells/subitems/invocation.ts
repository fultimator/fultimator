import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  makePassivesTabField,
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { SPELL_SUBITEM_SCOPED_KEYS } from "../../../shared/itemScopedKeys";

export type InvocationItemState = {
  key: string;
  wellspring: string;
  type: string;
  customName: string;
  effect: string;
  passives?: unknown[];
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
  makePassivesTabField(SPELL_SUBITEM_SCOPED_KEYS.invocation),
  behaviorsTabField,
];
