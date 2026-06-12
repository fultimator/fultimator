import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableTherioforms } from "../../../../../../libs/player/spellOptionData";

export type TherioformItemState = {
  name: string;
  customName: string;
  genoclepsis: string;
  description: string;
  behaviors?: unknown[];
};

const THERIOFORM_OPTIONS = availableTherioforms.map((t: { name: string }) => ({
  value: t.name,
  label: t.name,
}));

const isCustom = (s: TherioformItemState) =>
  s.name === "mutant_therioform_custom" ||
  s.name === "mutant_therioform_custom_name";

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const therioformItemFields: ItemFieldConfig<TherioformItemState> = [
  {
    key: "name",
    kind: "editable",
    label: "mutant_therioform",
    component: "select",
    defaultValue: "mutant_therioform_custom_name",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 6 },
    componentProps: { options: THERIOFORM_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 6 },
    dependencies: isCustom,
  },
  {
    key: "genoclepsis",
    kind: "editable",
    label: "spell.therioform.genoclepsis",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 2,
    fullWidth: true,
    componentProps: (s) => ({ disabled: !isCustom(s as TherioformItemState) }),
  },
  {
    key: "description",
    kind: "editable",
    label: "Description",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 3,
    fullWidth: true,
    componentProps: (s) => ({ disabled: !isCustom(s as TherioformItemState) }),
  },
  behaviorsTabField,
];
