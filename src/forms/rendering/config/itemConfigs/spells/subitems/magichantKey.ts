import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableMagichantKeys } from "../../../../../../libs/player/spellOptionData";

export type MagichantKeyItemState = {
  key: string;
  customName: string;
  type: string;
  status: string;
  attribute: string;
  recovery: string;
  behaviors?: unknown[];
};

const KEY_OPTIONS = availableMagichantKeys.map((k: { name: string }) => ({
  value: k.name,
  label: k.name,
}));

const isCustom = (s: MagichantKeyItemState) =>
  s.key === "magichant_custom_name";

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const magichantKeyItemFields: ItemFieldConfig<MagichantKeyItemState> = [
  {
    key: "key",
    kind: "editable",
    label: "magichant_key",
    component: "select",
    defaultValue: "magichant_custom_name",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 5 },
    componentProps: { options: KEY_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "magichant_name",
    component: "text",
    defaultValue: "",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 7 },
    dependencies: isCustom,
  },
  {
    key: "type",
    kind: "editable",
    label: "magichant_type",
    component: "text",
    defaultValue: "",
    group: "",
    order: 2,
    gridSize: { xs: 12, sm: 6, md: 3 },
    componentProps: (s) => ({
      disabled: !isCustom(s as MagichantKeyItemState),
    }),
  },
  {
    key: "status",
    kind: "editable",
    label: "magichant_status_effect",
    component: "text",
    defaultValue: "",
    group: "",
    order: 3,
    gridSize: { xs: 12, sm: 6, md: 3 },
    componentProps: (s) => ({
      disabled: !isCustom(s as MagichantKeyItemState),
    }),
  },
  {
    key: "attribute",
    kind: "editable",
    label: "magichant_attribute",
    component: "text",
    defaultValue: "",
    group: "",
    order: 4,
    gridSize: { xs: 12, sm: 6, md: 3 },
    componentProps: (s) => ({
      disabled: !isCustom(s as MagichantKeyItemState),
    }),
  },
  {
    key: "recovery",
    kind: "editable",
    label: "magichant_recovery",
    component: "text",
    defaultValue: "",
    group: "",
    order: 5,
    gridSize: { xs: 12, sm: 6, md: 3 },
    componentProps: (s) => ({
      disabled: !isCustom(s as MagichantKeyItemState),
    }),
  },
  behaviorsTabField,
];
