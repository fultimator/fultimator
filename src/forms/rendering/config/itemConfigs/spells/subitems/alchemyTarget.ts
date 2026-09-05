import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";

export type AlchemyTargetItemState = {
  rangeFrom: number;
  rangeTo: number;
  effect: string;
  behaviors?: unknown[];
};

const dieFaceOptions = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const alchemyTargetItemFields: ItemFieldConfig<AlchemyTargetItemState> =
  [
    {
      key: "rangeFrom",
      kind: "editable",
      label: "Range From",
      component: "select",
      defaultValue: 1,
      group: "",
      order: 0,
      gridSize: { xs: 12, sm: 6 },
      parse: (v) => Number(v) || 1,
      componentProps: { options: dieFaceOptions },
    },
    {
      key: "rangeTo",
      kind: "editable",
      label: "Range To",
      component: "select",
      defaultValue: 20,
      group: "",
      order: 1,
      gridSize: { xs: 12, sm: 6 },
      parse: (v) => Number(v) || 20,
      componentProps: { options: dieFaceOptions },
    },
    {
      key: "effect",
      kind: "editable",
      label: "Effect",
      component: "textarea",
      defaultValue: "",
      group: "",
      order: 2,
      fullWidth: true,
    },
    behaviorsTabField,
  ];
